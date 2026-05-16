import { S3Client } from '@aws-sdk/client-s3';
import { env } from '../config/env.js';

export const r2 = new S3Client({
  region: 'auto',
  endpoint: env.R2_ENDPOINT,
  credentials: {
    accessKeyId: env.R2_ACCESS_KEY_ID,
    secretAccessKey: env.R2_SECRET_ACCESS_KEY
  }
});

export const R2_BUCKETS = {
  masters: env.R2_BUCKET_MASTERS,
  previews: env.R2_BUCKET_PREVIEWS,
  normalized: env.R2_BUCKET_NORMALIZED,
  artwork: env.R2_BUCKET_ARTWORK,
  exports: env.R2_BUCKET_EXPORTS
} as const;
