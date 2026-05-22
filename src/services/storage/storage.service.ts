import { randomUUID } from "node:crypto";
import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";
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
  allowedMimeTypes: (process.env.STORAGE_ALLOWED_MIME_TYPES ?? "").split(",").map((v) => v.trim()).filter(Boolean),
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

function buildR2Client(): S3Client {
  return new S3Client({
    region: "auto",
    endpoint: env.R2_ENDPOINT,
    forcePathStyle: true,
    credentials: {
      accessKeyId: env.R2_ACCESS_KEY_ID ?? "",
      secretAccessKey: env.R2_SECRET_ACCESS_KEY ?? "",
    },
  });
}

export async function getStorageDiagnostics() {
  const bucket = env.R2_BUCKET;
  const endpoint = env.R2_ENDPOINT;
  const endpointConfigured = Boolean(endpoint);
  const bucketConfigured = Boolean(bucket);
  const started = Date.now();

  try {
    const client = buildR2Client();
    await client.send(new ListObjectsV2Command({ Bucket: bucket, MaxKeys: 1 }));
    return {
      provider: env.STORAGE_PROVIDER,
      bucketConfigured,
      endpointConfigured,
      publicBaseUrlConfigured: Boolean(env.STORAGE_PUBLIC_BASE_URL ?? env.R2_PUBLIC_BASE_URL),
      bucketExists: true,
      latencyMs: Date.now() - started,
      httpStatusCode: 200,
      code: "OK",
      message: "Storage health check passed",
      maxUploadBytes: storageUploadConstraints.maxBytes,
      allowedMimeTypes: storageUploadConstraints.allowedMimeTypes,
    };
  } catch (error) {
    const err = error as {
      name?: string;
      message?: string;
      code?: string;
      Code?: string;
      $metadata?: { httpStatusCode?: number };
    };
    const rawCode = err.code ?? err.Code ?? err.name ?? "UNKNOWN";
    const httpStatusCode = err.$metadata?.httpStatusCode ?? 503;
    const mappedMessage =
      rawCode === "AccessDenied" ? "Storage permission issue" :
      rawCode === "NoSuchBucket" ? "Storage bucket missing or name is incorrect" :
      rawCode === "InvalidAccessKeyId" ? "Storage access key is invalid" :
      rawCode === "SignatureDoesNotMatch" ? "Storage secret or endpoint configuration is invalid" :
      err.message ?? "Storage check failed";

    console.error("[storage/diagnostics] check failed", {
      provider: env.STORAGE_PROVIDER,
      bucket,
      endpoint: endpointConfigured ? "(configured)" : "(missing)",
      errorName: err.name,
      errorCode: err.code,
      errorCodeAlt: err.Code,
      httpStatusCode: err.$metadata?.httpStatusCode,
      message: err.message,
    });

    return {
      provider: env.STORAGE_PROVIDER,
      bucketConfigured,
      endpointConfigured,
      publicBaseUrlConfigured: Boolean(env.STORAGE_PUBLIC_BASE_URL ?? env.R2_PUBLIC_BASE_URL),
      bucketExists: false,
      latencyMs: Date.now() - started,
      httpStatusCode,
      code: rawCode,
      message: mappedMessage,
      maxUploadBytes: storageUploadConstraints.maxBytes,
      allowedMimeTypes: storageUploadConstraints.allowedMimeTypes,
    };
  }
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
