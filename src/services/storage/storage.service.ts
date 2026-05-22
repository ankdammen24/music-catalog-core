import { randomUUID } from "node:crypto";
import { z } from "zod";
import { env } from "../../config/env.js";
import { supabase } from "../../db/supabase.js";
import type { Json } from "../../db/types.js";
import { getStorageProvider } from "../../storage/storageProvider.js";
import { ensureSafeObjectKey } from "../../storage/storageValidation.js";

const uploadConstraintsSchema = z.object({
  maxBytes: z.coerce.number().int().positive().default(50 * 1024 * 1024),
  allowedMimeTypes: z.array(z.string().min(1)).default(["audio/mpeg", "audio/wav", "audio/flac", "image/jpeg", "image/png"]),
});

export const storageUploadConstraints = uploadConstraintsSchema.parse({
  maxBytes: process.env.STORAGE_MAX_UPLOAD_BYTES,
  allowedMimeTypes: process.env.STORAGE_ALLOWED_MIME_TYPES
    ? process.env.STORAGE_ALLOWED_MIME_TYPES.split(",").map((v) => v.trim()).filter(Boolean)
    : undefined,
});

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function withStorageRetry<T>(opName: string, fn: () => Promise<T>, maxRetries = 3): Promise<T> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxRetries; attempt += 1) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt === maxRetries) break;
      await wait(Math.min(250 * 2 ** (attempt - 1), 1_500));
    }
  }

  throw new Error(`Storage operation failed: ${opName}`, { cause: lastError });
}

export function validateUploadRequest(contentType: string, sizeBytes?: number): void {
  if (!storageUploadConstraints.allowedMimeTypes.includes(contentType)) {
    throw new Error(`Unsupported mime type: ${contentType}`);
  }

  if (typeof sizeBytes === "number" && sizeBytes > storageUploadConstraints.maxBytes) {
    throw new Error(`Upload exceeds max size of ${storageUploadConstraints.maxBytes} bytes`);
  }
}

export async function saveAssetMetadata(input: {
  organizationId: string;
  key: string;
  filename: string;
  mimeType: string;
  sizeBytes?: number;
  status: "pending" | "uploaded";
  metadata?: Json;
}) {
  const { data } = await supabase.from("assets").insert({
    organization_id: input.organizationId,
    status: input.status,
    filename: input.filename,
    mime_type: input.mimeType,
    size_bytes: input.sizeBytes ?? null,
    r2_key: input.key,
    metadata: input.metadata ?? null,
  }).select("id").single();

  return data?.id ?? null;
}

export async function getStorageDiagnostics() {
  const provider = getStorageProvider();
  const started = Date.now();
  const bucket = env.STORAGE_PROVIDER === "r2" ? env.R2_BUCKET : env.STORAGE_PROVIDER === "s3" ? env.AWS_S3_BUCKET : env.AZURE_BLOB_CONTAINER;

  const bucketExists = await withStorageRetry("bucket exists", () => provider.bucketExists(), 2);
  const sampleObjects = await withStorageRetry("list objects", () => provider.listObjects({ prefix: "", maxKeys: 5 }), 2);

  return {
    provider: env.STORAGE_PROVIDER,
    bucket,
    bucketExists,
    latencyMs: Date.now() - started,
    sampleObjectCount: sampleObjects.length,
    maxUploadBytes: storageUploadConstraints.maxBytes,
    allowedMimeTypes: storageUploadConstraints.allowedMimeTypes,
  };
}

export async function createSignedUpload(input: { key: string; contentType: string; expiresInSeconds?: number }) {
  validateUploadRequest(input.contentType);
  const provider = getStorageProvider();
  const key = ensureSafeObjectKey(input.key);

  const url = await withStorageRetry(
    "signed upload url",
    () => provider.getSignedUploadUrl({ key, contentType: input.contentType, expiresInSeconds: input.expiresInSeconds }),
  );

  return { key, url };
}

export async function createSignedDownload(input: { key: string; expiresInSeconds?: number }) {
  const provider = getStorageProvider();
  const key = ensureSafeObjectKey(input.key);
  const url = await withStorageRetry("signed download url", () => provider.getSignedDownloadUrl({ key, expiresInSeconds: input.expiresInSeconds }));
  return { key, url };
}

export async function runStorageUploadTest(organizationId: string) {
  const provider = getStorageProvider();
  const key = `debug/upload-test/${organizationId}/${Date.now()}-${randomUUID()}.txt`;
  const body = Buffer.from("storage upload test");

  await withStorageRetry("upload test object", () => provider.uploadObject({ key, body, contentType: "text/plain" }));
  const exists = await withStorageRetry("verify uploaded object", () => provider.objectExists({ key }));
  await withStorageRetry("delete uploaded object", () => provider.deleteObject({ key }));

  return { key, exists };
}
