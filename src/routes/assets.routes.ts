import { Router } from "express";
import { z } from "zod";
import { supabase } from "../db/supabase.js";
import { createSignedDownload } from "../services/storage/storage.service.js";
import { completeUpload, initUpload } from "../services/uploadPipeline.service.js";

const initSchema = z.object({
  trackId: z.string().uuid(),
  filename: z.string().min(1),
  contentType: z.string().min(1),
  sizeBytes: z.number().int().positive().optional(),
});

const completeSchema = z.object({
  trackId: z.string().uuid(),
  objectKey: z.string().min(1),
  sizeBytes: z.number().int().positive().optional(),
  mimeType: z.string().min(1).optional(),
});

export const assetsRoutes = Router();

assetsRoutes.post("/api/assets/uploads/init", async (req, res) => {
  const body = initSchema.parse(req.body);
  const out = await initUpload({ organizationId: req.auth?.organizationId, ...body });
  res.status(201).json(out);
});

assetsRoutes.post("/api/assets/uploads/complete", async (req, res) => {
  const body = completeSchema.parse(req.body);
  const out = await completeUpload({ organizationId: req.auth?.organizationId, ...body });
  res.json({ ok: true, ...out });
});

assetsRoutes.get("/api/assets/:id", async (req, res) => {
  const { data } = await supabase
    .from("assets")
    .select("id, organization_id, status, filename, mime_type, size_bytes, r2_key, created_at, updated_at, metadata")
    .eq("organization_id", req.auth?.organizationId)
    .eq("id", req.params.id)
    .single();

  if (!data) {
    res.status(404).json({ error: "Asset not found" });
    return;
  }

  res.json({ asset: data });
});

assetsRoutes.get("/api/assets/:id/download-url", async (req, res) => {
  const { data } = await supabase
    .from("assets")
    .select("id, r2_key")
    .eq("organization_id", req.auth?.organizationId)
    .eq("id", req.params.id)
    .single();

  if (!data) {
    res.status(404).json({ error: "Asset not found" });
    return;
  }

  const signed = await createSignedDownload({ key: data.r2_key, expiresInSeconds: 300 });
  res.json({ assetId: data.id, objectKey: signed.key, downloadUrl: signed.url, expiresInSeconds: 300 });
});
