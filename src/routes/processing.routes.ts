import { Router } from "express";
import { processingService } from "../services/processing.service.js";
import { tracksService } from "../services/tracks.service.js";

export const processingRoutes = Router();
const orgId = (req: any, res: any) => { const v = req.auth?.organizationId; if (!v) { res.status(401).json({ error: "organizationId is required" }); return null; } return v; };

processingRoutes.post("/processing/tracks/:trackId/queue", async (req, res) => {
  const organizationId = orgId(req, res); if (!organizationId) return;
  const trackId = req.params.trackId; if (!trackId) return res.status(400).json({ error: "trackId is required" });
  const track = (await tracksService.byId(organizationId, trackId)).data as any;
  const job = await processingService.queue(organizationId, trackId, track.audio_original_r2_key);
  await tracksService.update(organizationId, trackId, { status: "processing" });
  res.status(201).json(job.data);
});
processingRoutes.post("/processing/jobs/:id/retry", async (req, res) => {
  const organizationId = orgId(req, res); if (!organizationId) return;
  const jobId = req.params.id; if (!jobId) return res.status(400).json({ error: "id is required" });
  const retried = await processingService.retry(organizationId, jobId);
  res.status(201).json(retried.data);
});
processingRoutes.get("/processing/jobs", async (req, res) => { const organizationId = orgId(req, res); if (!organizationId) return; res.json((await processingService.list(organizationId)).data); });
processingRoutes.get("/processing/jobs/:id", async (req, res) => { const organizationId = orgId(req, res); if (!organizationId) return; const jobId = req.params.id; if (!jobId) return res.status(400).json({ error: "id is required" }); res.json((await processingService.byId(organizationId, jobId)).data); });
processingRoutes.get("/processing/dashboard", async (req, res) => { const organizationId = orgId(req, res); if (!organizationId) return; res.json(await processingService.dashboard(organizationId)); });
