import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { r2, R2_BUCKETS } from '../lib/r2.js';
import { supabase } from '../lib/supabase.js';

export const uploadsService = {
  buildObjectKey(input: { bucketType: string; entityType: string; entityId: string; fileName: string }) {
    const id = input.entityId;
    if (input.bucketType === 'masters') return `masters/${id}/${id}/${input.fileName}`;
    if (input.bucketType === 'previews') return `previews/${id}/${input.fileName}`;
    if (input.bucketType === 'normalized') return `normalized/radio/${id}/${input.fileName}`;
    if (input.bucketType === 'exports') return `exports/${id}/${input.fileName}`;
    if (input.entityType === 'artist') return `artwork/artists/${id}/${input.fileName}`;
    if (input.entityType === 'album') return `artwork/albums/${id}/${input.fileName}`;
    return `artwork/tracks/${id}/${input.fileName}`;
  },
  async presign(bucketType: keyof typeof R2_BUCKETS, key: string, contentType: string) {
    const bucket = R2_BUCKETS[bucketType];
    const uploadUrl = await getSignedUrl(r2, new PutObjectCommand({ Bucket: bucket, Key: key, ContentType: contentType }), { expiresIn: 900 });
    return { uploadUrl, objectKey: key, bucket, expiresIn: 900 };
  },
  async complete(input: { bucketType: string; entityType: string; entityId: string; objectKey: string; createProcessingJob?: boolean }) {
    if (input.entityType === 'track') {
      const update: Record<string, unknown> = {};
      if (input.bucketType === 'masters') { update.master_file_key = input.objectKey; update.status = 'uploaded'; }
      if (input.bucketType === 'previews') update.preview_file_key = input.objectKey;
      if (input.bucketType === 'normalized') update.normalized_file_key = input.objectKey;
      if (input.bucketType === 'artwork') update.artwork_key = input.objectKey;
      await supabase.from('tracks').update(update).eq('id', input.entityId);
      if (input.bucketType === 'masters' && input.createProcessingJob !== false) {
        await supabase.from('processing_jobs').insert({ track_id: input.entityId, job_type: 'audio_normalize', status: 'queued', message: 'Queued from upload complete' });
      }
    }
  }
};
