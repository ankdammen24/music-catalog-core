import { Router } from "express";
import { processingService } from "../services/processing.service.js";
import { tracksService } from "../services/tracks.service.js";

export const processingRoutes = Router();

processingRoutes.post("/processing/tracks/:trackId/queue", async (req, res) => {
  const track = (await tracksService.byId(req.auth!.organizationId, req.params.trackId)).data as any;
  const job = await processingService.queue(req.auth!.organizationId, req.params.trackId, track.audio_original_r2_key);
  await tracksService.update(req.auth!.organizationId, req.params.trackId, { status: "processing" });
  res.status(201).json(job.data);
});

processingRoutes.post("/processing/jobs/:id/retry", async (req, res) => {
  const retried = await processingService.retry(req.auth!.organizationId, req.params.id);
  res.status(201).json(retried.data);
});

processingRoutes.get("/processing/jobs", async (req, res) => res.json((await processingService.list(req.auth!.organizationId)).data));
processingRoutes.get("/processing/jobs/:id", async (req, res) => res.json((await processingService.byId(req.auth!.organizationId, req.params.id)).data));
processingRoutes.get("/processing/dashboard", async (req, res) => res.json(await processingService.dashboard(req.auth!.organizationId)));
