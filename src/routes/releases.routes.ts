import { Request, Response, Router } from "express";
import { z } from "zod";
import { releasesService } from "../services/releases.service.js";
import { requirePermission } from "../auth/requirePermission.js";

const s = z.object({ artist_id: z.string().uuid(), title: z.string().min(1), release_type: z.string().optional(), upc: z.string().optional(), artwork_r2_key: z.string().optional(), release_date: z.string().optional() });
function requireOrgId(req: Request, res: Response): string | null {
  const organizationId = req.auth?.organizationId;
  if (!organizationId) { res.status(401).json({ error: "organizationId is required" }); return null; }
  return organizationId;
}
export const releasesRoutes = Router();
releasesRoutes.get("/releases", requirePermission("catalog.read"), async (r, sn) => { const org = requireOrgId(r, sn); if (!org) return; sn.json((await releasesService.list(org)).data); });
releasesRoutes.post("/releases", requirePermission("releases.manage"), async (r, sn) => { const org = requireOrgId(r, sn); if (!org) return; sn.status(201).json((await releasesService.create(org, s.parse(r.body))).data); });
releasesRoutes.get("/releases/:id", async (r, sn) => { const org = requireOrgId(r, sn); if (!org) return; const releaseId = r.params.id; if (!releaseId) return sn.status(400).json({ error: "releaseId is required" }); sn.json((await releasesService.byId(org, releaseId)).data); });
releasesRoutes.patch("/releases/:id", requirePermission("releases.manage"), async (r, sn) => { const org = requireOrgId(r, sn); if (!org) return; const releaseId = r.params.id; if (!releaseId) return sn.status(400).json({ error: "releaseId is required" }); sn.json((await releasesService.update(org, releaseId, s.partial().parse(r.body))).data); });
releasesRoutes.delete("/releases/:id", requirePermission("releases.manage"), async (r, sn) => { const org = requireOrgId(r, sn); if (!org) return; const releaseId = r.params.id; if (!releaseId) return sn.status(400).json({ error: "releaseId is required" }); await releasesService.delete(org, releaseId); sn.status(204).send(); });
releasesRoutes.post("/releases/:id/submit", async (r, sn) => { const org = requireOrgId(r, sn); if (!org) return; const releaseId = r.params.id; if (!releaseId) return sn.status(400).json({ error: "releaseId is required" }); sn.json((await releasesService.submit(org, releaseId)).data); });
releasesRoutes.post("/releases/:id/approve", async (r, sn) => { const org = requireOrgId(r, sn); if (!org) return; const releaseId = r.params.id; if (!releaseId) return sn.status(400).json({ error: "releaseId is required" }); sn.json((await releasesService.approve(org, releaseId)).data); });
