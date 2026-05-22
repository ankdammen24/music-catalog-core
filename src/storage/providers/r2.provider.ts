import { DeleteObjectCommand, GetObjectCommand, HeadBucketCommand, HeadObjectCommand, ListObjectsV2Command, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import type { StorageProvider } from "../types.js";

export class R2Provider implements StorageProvider {
  constructor(private readonly client: S3Client, private readonly bucket: string) {}

  async uploadObject(input: Parameters<StorageProvider["uploadObject"]>[0]) { const out = await this.client.send(new PutObjectCommand({ Bucket: this.bucket, Key: input.key, Body: input.body, ContentType: input.contentType, Metadata: input.metadata })); return { key: input.key, etag: out.ETag }; }
  async getObject(input: Parameters<StorageProvider["getObject"]>[0]) { const out = await this.client.send(new GetObjectCommand({ Bucket: this.bucket, Key: input.key })); const body = out.Body ? new Uint8Array(await out.Body.transformToByteArray()) : undefined; return { body, contentType: out.ContentType, etag: out.ETag }; }
  async deleteObject(input: Parameters<StorageProvider["deleteObject"]>[0]) { await this.client.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: input.key })); }
  async listObjects(input: Parameters<StorageProvider["listObjects"]>[0]) { const out = await this.client.send(new ListObjectsV2Command({ Bucket: this.bucket, Prefix: input.prefix, MaxKeys: input.maxKeys })); return (out.Contents ?? []).map((v) => ({ key: v.Key ?? "", size: v.Size, etag: v.ETag, lastModified: v.LastModified })).filter((v) => v.key); }
  async objectExists(input: Parameters<StorageProvider["objectExists"]>[0]) { try { await this.client.send(new HeadObjectCommand({ Bucket: this.bucket, Key: input.key })); return true; } catch { return false; } }
  async getSignedUploadUrl(input: Parameters<StorageProvider["getSignedUploadUrl"]>[0]) { return getSignedUrl(this.client, new PutObjectCommand({ Bucket: this.bucket, Key: input.key, ContentType: input.contentType }), { expiresIn: input.expiresInSeconds ?? 900 }); }
  async getSignedDownloadUrl(input: Parameters<StorageProvider["getSignedDownloadUrl"]>[0]) { return getSignedUrl(this.client, new GetObjectCommand({ Bucket: this.bucket, Key: input.key }), { expiresIn: input.expiresInSeconds ?? 300 }); }
  async bucketExists() { try { await this.client.send(new HeadBucketCommand({ Bucket: this.bucket })); return true; } catch { return false; } }
}
