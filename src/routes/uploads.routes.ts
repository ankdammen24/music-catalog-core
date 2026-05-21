import { Router } from "express";
import { z } from "zod";
import { supabase } from "../db/supabase.js";
import { buildStagingKey, signUpload } from "../services/r2.service.js";

const presignSchema = z.object({ trackId: z.string().uuid(), filename: z.string().min(1), contentType: z.string().min(1) });
const completeSchema = z.object({ trackId: z.string().uuid(), filename: z.string().min(1) });

export const uploadsRoutes = Router();

uploadsRoutes.post("/uploads/presign", async (req, res) => {
  if (!req.auth) return res.status(401).json({ error: "Unauthorized" });

  const body = presignSchema.parse(req.body);
  const key = buildStagingKey(req.auth.organizationId, body.trackId, body.filename);
  const url = await signUpload(key, body.contentType);

  await supabase.from("upload_jobs").insert({
    organization_id: req.auth.organizationId,
    track_id: body.trackId,
    original_filename: body.filename,
    r2_key: key,
    status: "pending",
  });

  return res.json({ url, key });
});

uploadsRoutes.post("/uploads/complete", async (req, res) => {
  if (!req.auth) return res.status(401).json({ error: "Unauthorized" });

  const body = completeSchema.parse(req.body);
  const key = buildStagingKey(req.auth.organizationId, body.trackId, body.filename);

  await supabase
    .from("upload_jobs")
    .update({ status: "uploaded" })
    .eq("organization_id", req.auth.organizationId)
    .eq("track_id", body.trackId)
    .eq("r2_key", key);

  await supabase
    .from("tracks")
    .update({ status: "uploaded", audio_original_r2_key: key })
    .eq("organization_id", req.auth.organizationId)
    .eq("id", body.trackId);

  return res.json({ ok: true, key });
});
