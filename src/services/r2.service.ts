import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "../config/env.js";

const endpoint = `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;
const client = new S3Client({ region: env.R2_REGION, endpoint, forcePathStyle: true, credentials: { accessKeyId: env.R2_ACCESS_KEY_ID!, secretAccessKey: env.R2_SECRET_ACCESS_KEY! } });
export const buildStagingKey = (org: string, track: string, filename: string) => `staging/uploads/${org}/${track}/${filename}`;
export const buildFlacKey = (org: string, track: string) => `masters/flac/${org}/${track}/${track}.flac`;
export async function signUpload(key: string, contentType: string) { return getSignedUrl(client, new PutObjectCommand({ Bucket: env.R2_BUCKET!, Key: key, ContentType: contentType }), { expiresIn: 900 }); }
export async function signDownload(key: string) { return getSignedUrl(client, new GetObjectCommand({ Bucket: env.R2_BUCKET!, Key: key }), { expiresIn: 300 }); }
export { client as r2Client };
