import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { r2, R2_BUCKETS } from '../lib/r2.js';
import { supabase } from '../lib/supabase.js';

type BucketType = keyof typeof R2_BUCKETS;

type BuildObjectKeyInput = {
  bucketType: BucketType;
  entityType: 'track' | 'artist' | 'album' | 'release';
  entityId: string;
  fileName: string;
  artistId?: string;
};

const AUDIO_CONTENT_TYPE_PREFIX = 'audio/';

function sanitizeFileName(fileName: string): string {
  const baseName = fileName.split(/[\\/]/).pop() ?? '';
  const safe = baseName
    .normalize('NFKC')
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^[-.]+|[-.]+$/g, '');

  if (!safe || safe === '.' || safe === '..') {
    throw new Error('Invalid fileName');
  }

  return safe;
}

export const uploadsService = {
  buildObjectKey(input: BuildObjectKeyInput) {
    const safeFileName = sanitizeFileName(input.fileName);
    const id = input.entityId;

    if (input.bucketType === 'staging') {
      if (input.entityType !== 'track') {
        throw new Error('staging uploads only support tracks');
      }
      return `staging/uploads/${id}/${safeFileName}`;
    }

    if (input.bucketType === 'masters') {
      const artistId = input.artistId;
      if (!artistId || input.entityType !== 'track') {
        throw new Error('masters uploads require track entityType and artistId');
      }
      return `masters/${artistId}/${id}/original/${safeFileName}`;
    }

    if (input.bucketType === 'previews') {
      if (input.entityType !== 'track') throw new Error('preview uploads only support tracks');
      return `previews/${id}/preview.mp3`;
    }

    if (input.bucketType === 'normalized') {
      if (input.entityType !== 'track') throw new Error('normalized uploads only support tracks');
      return `streaming/${id}/master.flac`;
    }

    if (input.bucketType === 'exports') {
      if (input.entityType !== 'release') throw new Error('exports uploads only support releases');
      return `releases/${id}/${safeFileName}`;
    }

    if (input.entityType === 'artist') return `artists/${id}/${safeFileName}`;
    if (input.entityType === 'album') return `albums/${id}/${safeFileName}`;
    return `tracks/${id}/${safeFileName}`;
  },

  resolveBucketType(input: { bucketType?: BucketType; contentType: string; entityType: string }): BucketType {
    if (input.bucketType) return input.bucketType;
    if (input.contentType.startsWith(AUDIO_CONTENT_TYPE_PREFIX) && input.entityType === 'track') return 'staging';
    return 'artwork';
  },

  async presign(bucketType: BucketType, key: string, contentType: string) {
    const bucket = R2_BUCKETS[bucketType];
    const uploadUrl = await getSignedUrl(
      r2,
      new PutObjectCommand({ Bucket: bucket, Key: key, ContentType: contentType }),
      { expiresIn: 900 }
    );
    return { uploadUrl, objectKey: key, bucket, expiresIn: 900, bucketType };
  },

  async complete(input: { bucketType: BucketType; entityType: string; entityId: string; objectKey: string; createProcessingJob?: boolean }) {
    if (input.entityType === 'track') {
      const update: Record<string, unknown> = {};
      if (input.bucketType === 'staging') {
        update.staged_file_key = input.objectKey;
        update.original_file_key = input.objectKey;
        update.status = 'staged';
        update.processing_status = 'queued';
      }
      if (input.bucketType === 'masters') {
        update.original_file_key = input.objectKey;
      }
      if (input.bucketType === 'previews') update.preview_file_key = input.objectKey;
      if (input.bucketType === 'normalized') update.streaming_file_key = input.objectKey;
      if (input.bucketType === 'artwork') update.artwork_key = input.objectKey;

      await supabase.from('tracks').update(update).eq('id', input.entityId);

      if (input.bucketType === 'staging' && input.createProcessingJob !== false) {
        await supabase
          .from('processing_jobs')
          .insert({ track_id: input.entityId, job_type: 'audio_ingest', status: 'queued', message: 'Queued from staging upload complete' });
      }
    }
  }
};
