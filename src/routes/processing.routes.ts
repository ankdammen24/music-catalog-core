import { Router, type Request, type Response } from "express";
import { z } from "zod";

import type { AuthenticatedRequest } from "../db/types";
import { createByOrg, getByOrg, listByOrg, patchByOrg } from "../services/base";

const queueSchema = z.object({
  input_r2_key: z.string().min(1),
  job_type: z.string().default("audio_mastering")
});

const router = Router();

router.post("/processing/tracks/:trackId/queue", async (req: Request, res: Response) => {
  const { organizationId } = (req as Request & AuthenticatedRequest).auth;
  const body = queueSchema.parse(req.body);

  const { data, error } = await createByOrg("processing_jobs", {
    organization_id: organizationId,
    track_id: req.params.trackId,
    job_type: body.job_type,
    status: "queued",
    input_r2_key: body.input_r2_key
  });

  if (error) return res.status(400).json({ error: error.message });

  await patchByOrg("tracks", req.params.trackId, organizationId, { status: "processing" });
  return res.status(201).json(data);
});

router.get("/processing/jobs", async (req: Request, res: Response) => {
  const { organizationId } = (req as Request & AuthenticatedRequest).auth;
  const { data, error } = await listByOrg("processing_jobs", organizationId);
  if (error) return res.status(400).json({ error: error.message });
  return res.json(data);
});

router.get("/processing/jobs/:id", async (req: Request, res: Response) => {
  const { organizationId } = (req as Request & AuthenticatedRequest).auth;
  const { data, error } = await getByOrg("processing_jobs", req.params.id, organizationId);
  if (error) return res.status(404).json({ error: error.message });
  return res.json(data);
});

export const processingRouter = router;
