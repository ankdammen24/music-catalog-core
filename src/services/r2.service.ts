import { S3Client, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "../config/env";
export const r2 = new S3Client({ region: "auto", endpoint: env.R2_ENDPOINT, credentials: { accessKeyId: env.R2_ACCESS_KEY_ID, secretAccessKey: env.R2_SECRET_ACCESS_KEY } });
export const createUploadUrl = (key:string, contentType:string) => getSignedUrl(r2, new PutObjectCommand({ Bucket: env.R2_BUCKET, Key: key, ContentType: contentType }), { expiresIn: 900 });
export const createDownloadUrl = (key:string) => getSignedUrl(r2, new GetObjectCommand({ Bucket: env.R2_BUCKET, Key: key }), { expiresIn: 300 });
