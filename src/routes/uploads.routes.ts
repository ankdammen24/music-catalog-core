import { Router } from "express";
import { z } from "zod";
import { supabase } from "../db/supabase.js";
import type { Database } from "../db/types.js";
import { buildStagingKey, signUpload } from "../services/r2.service.js";

const presignSchema = z.object({ trackId: z.string().uuid(), filename: z.string().min(1), contentType: z.string().min(1) });
const completeSchema = z.object({ trackId: z.string().uuid(), filename: z.string().min(1), sizeBytes: z.number().int().positive().optional() });

export const uploadsRoutes = Router();

uploadsRoutes.post("/uploads/presign", async (req, res) => {
  if (!req.auth) return res.status(401).json({ error: "Unauthorized" });

  const body = presignSchema.parse(req.body);
  const key = buildStagingKey(req.auth.organizationId, body.trackId, body.filename);
  const url = await signUpload(key, body.contentType);

  const { data: insertedAssetData } = await supabase.from("assets").insert({
    organization_id: req.auth.organizationId,
    status: "pending",
    filename: body.filename,
    mime_type: body.contentType,
    r2_key: key,
  }).select("*").single();

  const insertedAsset = insertedAssetData as Database["public"]["Tables"]["assets"]["Row"] | null;

  return res.json({ url, key, assetId: insertedAsset?.id ?? null });
});

uploadsRoutes.post("/uploads/complete", async (req, res) => {
  if (!req.auth) return res.status(401).json({ error: "Unauthorized" });

  const body = completeSchema.parse(req.body);
  const key = buildStagingKey(req.auth.organizationId, body.trackId, body.filename);

  const { data: updatedAssetsData } = await supabase
    .from("assets")
    .update({ status: "uploaded", size_bytes: body.sizeBytes ?? null })
    .eq("organization_id", req.auth.organizationId)
    .eq("r2_key", key)
    .select("*");

  const updatedAssets = updatedAssetsData as Database["public"]["Tables"]["assets"]["Row"][] | null;

  await supabase
    .from("tracks")
    .update({ status: "uploaded", audio_original_r2_key: key })
    .eq("organization_id", req.auth.organizationId)
    .eq("id", body.trackId);

  return res.json({ ok: true, key, updatedAssets: updatedAssets?.length ?? 0 });
});
