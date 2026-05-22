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
  const { data: orgAssets } = await supabase.from("assets").select("size_bytes").eq("organization_id", input.organizationId);
  const usedBytes = (orgAssets ?? []).reduce((sum, row: any) => sum + Number(row.size_bytes ?? 0), 0);
  const maxBytes = Number(process.env.ORG_MAX_STORAGE_BYTES ?? 25 * 1024 * 1024 * 1024);
  if (typeof input.sizeBytes === "number" && usedBytes + input.sizeBytes > maxBytes) throw new Error("Organization storage quota exceeded");
  const objectKey = `org/${input.organizationId}/staging/uploads/${input.trackId}/${Date.now()}-${randomUUID()}-${input.filename}`;
  const { url } = await createSignedUpload({ key: objectKey, contentType: input.contentType, expiresInSeconds: 900 });
  const assetId = await saveAssetMetadata({ organizationId: input.organizationId, key: objectKey, filename: input.filename, mimeType: input.contentType, sizeBytes: input.sizeBytes, status: "pending", metadata: { trackId: input.trackId, stage: "temporary" } });

  return { uploadUrl: url, objectKey, assetId };
}

export async function completeUpload(input: { organizationId: string; trackId: string; objectKey: string; sizeBytes?: number; mimeType?: string }) {
  const { data: pendingAsset } = await supabase
    .from("assets")
    .select("id")
    .eq("organization_id", input.organizationId)
    .eq("r2_key", input.objectKey)
    .eq("status", "pending")
    .contains("metadata", { trackId: input.trackId })
    .maybeSingle();

  if (!pendingAsset) {
    throw new Error("Upload object key is invalid for this organization or track");
  }

  await supabase
    .from("assets")
    .update({ status: "uploaded", size_bytes: input.sizeBytes ?? null, mime_type: input.mimeType ?? null })
    .eq("id", pendingAsset.id);

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
