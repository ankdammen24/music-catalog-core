import { Request, Response, Router } from "express";
import { z } from "zod";
import { artistsService } from "../services/artists.service.js";

const schema = z.object({ name: z.string().min(1), slug: z.string().min(1), biography: z.string().optional(), country: z.string().optional() });

function requireOrgId(req: Request, res: Response): string | null {
  const organizationId = req.auth?.organizationId;
  if (!organizationId) {
    res.status(401).json({ error: "organizationId is required" });
    return null;
  }
  return organizationId;
}

export const artistsRoutes = Router();
artistsRoutes.get("/artists", async (req, res) => {
  const organizationId = requireOrgId(req, res); if (!organizationId) return;
  res.json((await artistsService.list(organizationId)).data);
});
artistsRoutes.post("/artists", async (req, res) => {
  const organizationId = requireOrgId(req, res); if (!organizationId) return;
  res.status(201).json((await artistsService.create(organizationId, schema.parse(req.body))).data);
});
artistsRoutes.get("/artists/:id", async (req, res) => {
  const organizationId = requireOrgId(req, res); if (!organizationId) return;
  const artistId = req.params.id; if (!artistId) return res.status(400).json({ error: "artistId is required" });
  res.json((await artistsService.byId(organizationId, artistId)).data);
});
artistsRoutes.patch("/artists/:id", async (req, res) => {
  const organizationId = requireOrgId(req, res); if (!organizationId) return;
  const artistId = req.params.id; if (!artistId) return res.status(400).json({ error: "artistId is required" });
  res.json((await artistsService.update(organizationId, artistId, schema.partial().parse(req.body))).data);
});
artistsRoutes.delete("/artists/:id", async (req, res) => {
  const organizationId = requireOrgId(req, res); if (!organizationId) return;
  const artistId = req.params.id; if (!artistId) return res.status(400).json({ error: "artistId is required" });
  await artistsService.delete(organizationId, artistId); res.status(204).send();
});
