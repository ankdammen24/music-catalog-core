export const STORAGE_AREAS = [
  "masters",
  "staging/uploads",
  "processing",
  "normalized",
  "artwork",
  "previews",
  "exports",
  "public"
] as const;

export type StorageArea = (typeof STORAGE_AREAS)[number];
export type StorageProviderName = "r2" | "s3" | "azure";

export interface UploadObjectInput {
  key: string;
  body: Buffer | Uint8Array | string;
  contentType?: string;
  metadata?: Record<string, string>;
}
export interface GetObjectInput { key: string }
export interface DeleteObjectInput { key: string }
export interface ListObjectsInput { prefix?: string; maxKeys?: number }
export interface ObjectExistsInput { key: string }
export interface SignedUrlInput { key: string; expiresInSeconds?: number; contentType?: string }

export interface StorageObject {
  key: string;
  size?: number;
  etag?: string;
  lastModified?: Date;
}

export interface StorageProvider {
  uploadObject(input: UploadObjectInput): Promise<{ key: string; etag?: string }>;
  getObject(input: GetObjectInput): Promise<{ body?: Uint8Array; contentType?: string; etag?: string }>;
  deleteObject(input: DeleteObjectInput): Promise<void>;
  listObjects(input: ListObjectsInput): Promise<StorageObject[]>;
  objectExists(input: ObjectExistsInput): Promise<boolean>;
  getSignedUploadUrl(input: SignedUrlInput): Promise<string>;
  getSignedDownloadUrl(input: SignedUrlInput): Promise<string>;
  bucketExists(): Promise<boolean>;
}
