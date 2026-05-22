import { Request, Response, Router } from "express";
import { z } from "zod";
import { tracksService } from "../services/tracks.service.js";

const s = z.object({ release_id: z.string().uuid(), artist_id: z.string().uuid(), title: z.string().min(1), version: z.string().optional(), isrc: z.string().optional(), track_number: z.number().int().optional(), explicit: z.boolean().optional() });

function requireOrgId(req: Request, res: Response): string | null {
  const organizationId = req.auth?.organizationId;
  if (!organizationId) {
    res.status(401).json({ error: "organizationId is required" });
    return null;
  }
  return organizationId;
}

export const tracksRoutes = Router();
tracksRoutes.get("/tracks", async (r, sn) => { const org = requireOrgId(r, sn); if (!org) return; sn.json((await tracksService.list(org)).data); });
tracksRoutes.post("/tracks", async (r, sn) => { const org = requireOrgId(r, sn); if (!org) return; sn.status(201).json((await tracksService.create(org, s.parse(r.body))).data); });
tracksRoutes.get("/tracks/:id", async (r, sn) => { const org = requireOrgId(r, sn); if (!org) return; const trackId = r.params.id; if (!trackId) return sn.status(400).json({ error: "trackId is required" }); sn.json((await tracksService.byId(org, trackId)).data); });
tracksRoutes.patch("/tracks/:id", async (r, sn) => { const org = requireOrgId(r, sn); if (!org) return; const trackId = r.params.id; if (!trackId) return sn.status(400).json({ error: "trackId is required" }); sn.json((await tracksService.update(org, trackId, s.partial().parse(r.body))).data); });
tracksRoutes.delete("/tracks/:id", async (r, sn) => { const org = requireOrgId(r, sn); if (!org) return; const trackId = r.params.id; if (!trackId) return sn.status(400).json({ error: "trackId is required" }); await tracksService.delete(org, trackId); sn.status(204).send(); });
tracksRoutes.post("/tracks/:id/approve", async (r, sn) => { const org = requireOrgId(r, sn); if (!org) return; const trackId = r.params.id; if (!trackId) return sn.status(400).json({ error: "trackId is required" }); sn.json((await tracksService.approve(org, trackId)).data); });
tracksRoutes.post("/tracks/:id/reject", async (r, sn) => { const org = requireOrgId(r, sn); if (!org) return; const trackId = r.params.id; if (!trackId) return sn.status(400).json({ error: "trackId is required" }); sn.json((await tracksService.reject(org, trackId)).data); });
