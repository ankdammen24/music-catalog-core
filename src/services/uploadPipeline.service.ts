import { randomUUID } from "node:crypto";
import { supabase } from "../db/supabase.js";
import { enqueueProcessingJob } from "./redisQueue.service.js";
import { createSignedUpload, saveAssetMetadata, validateUploadRequest, withStorageRetry } from "./storage/storage.service.js";

const PROCESSING_STATES = {
  uploaded: "uploaded",
  validating: "validating",
  processing: "processing",
  ready: "ready",
  failed: "failed",
} as const;

export async function initUpload(input: { organizationId: string; trackId: string; filename: string; contentType: string; sizeBytes?: number }) {
  validateUploadRequest(input.contentType, input.sizeBytes);
  const objectKey = `staging/uploads/${input.organizationId}/${input.trackId}/${Date.now()}-${randomUUID()}-${input.filename}`;
  const { url } = await createSignedUpload({ key: objectKey, contentType: input.contentType, expiresInSeconds: 900 });
  const assetId = await saveAssetMetadata({ organizationId: input.organizationId, key: objectKey, filename: input.filename, mimeType: input.contentType, sizeBytes: input.sizeBytes, status: "pending", metadata: { trackId: input.trackId, stage: "temporary" } });

  return { uploadUrl: url, objectKey, assetId };
}

export async function completeUpload(input: { organizationId: string; trackId: string; objectKey: string; sizeBytes?: number; mimeType?: string }) {
  await supabase.from("assets").update({ status: "uploaded", size_bytes: input.sizeBytes ?? null, mime_type: input.mimeType ?? null }).eq("organization_id", input.organizationId).eq("r2_key", input.objectKey);

  const { data: job } = await supabase.from("processing_jobs").insert({
    organization_id: input.organizationId,
    track_id: input.trackId,
    type: "audio_processing",
    status: "queued",
    input_r2_key: input.objectKey,
    log: { retryCount: 0 },
  }).select("id").single();

  await supabase.from("tracks").update({ status: PROCESSING_STATES.uploaded as any, audio_original_r2_key: input.objectKey }).eq("organization_id", input.organizationId).eq("id", input.trackId);

  if (job?.id) {
    await withStorageRetry("enqueue processing job", () => enqueueProcessingJob(job.id), 3);
  }

  return { jobId: job?.id ?? null, state: PROCESSING_STATES.uploaded };
}
