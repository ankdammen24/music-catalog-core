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
  staging: env.R2_BUCKET_NAME,
  masters: env.R2_BUCKET_NAME,
  previews: env.R2_BUCKET_NAME,
  normalized: env.R2_BUCKET_NAME,
  artwork: env.R2_BUCKET_NAME,
  exports: env.R2_BUCKET_NAME
} as const;
