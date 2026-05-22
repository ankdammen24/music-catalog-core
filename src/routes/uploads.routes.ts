import { Router } from "express";
import { z } from "zod";
import { completeUpload, initUpload } from "../services/uploadPipeline.service.js";

const initSchema = z.object({ trackId: z.string().uuid(), filename: z.string().min(1), contentType: z.string().min(1), sizeBytes: z.number().int().positive().optional() });
const completeSchema = z.object({ trackId: z.string().uuid(), objectKey: z.string().min(1), sizeBytes: z.number().int().positive().optional(), mimeType: z.string().min(1).optional() });

export const uploadsRoutes = Router();

uploadsRoutes.post("/uploads/init", async (req, res) => {
  if (!req.auth?.organizationId) return res.status(401).json({ error: "organizationId is required" });
  const body = initSchema.parse(req.body);
  const out = await initUpload({ organizationId: req.auth.organizationId, ...body });
  return res.status(201).json(out);
});

uploadsRoutes.post("/uploads/complete", async (req, res) => {
  if (!req.auth?.organizationId) return res.status(401).json({ error: "organizationId is required" });
  const body = completeSchema.parse(req.body);
  const out = await completeUpload({ organizationId: req.auth.organizationId, ...body });
  return res.json({ ok: true, ...out });
});
