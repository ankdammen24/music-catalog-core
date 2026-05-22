import { Router } from "express";
import { z } from "zod";
import { requireOrgRole } from "../auth/organization.middleware.js";
import { supabase } from "../db/supabase.js";

const settingsSchema = z.object({ name: z.string().min(1).max(120) });

export const organizationsRoutes = Router();

organizationsRoutes.get("/organizations/me", async (req, res) => {
  const { data: organization } = await supabase.from("organizations").select("*").eq("id", req.auth!.organizationId).single();
  const { data: memberships } = await supabase.from("users").select("id, clerk_user_id, role").eq("organization_id", req.auth!.organizationId);

  const { data: assets } = await supabase.from("assets").select("size_bytes").eq("organization_id", req.auth!.organizationId);
  const bytesUsed = (assets ?? []).reduce((sum, a: any) => sum + Number(a.size_bytes ?? 0), 0);

  const quotas = {
    maxStorageBytes: Number(process.env.ORG_MAX_STORAGE_BYTES ?? 25 * 1024 * 1024 * 1024),
    maxAssets: Number(process.env.ORG_MAX_ASSETS ?? 10000),
    usedStorageBytes: bytesUsed,
    usedAssets: assets?.length ?? 0,
  };

  res.json({ organization, memberships, activeRole: req.auth!.role, quotas });
});

organizationsRoutes.patch("/organizations/settings", requireOrgRole(["owner", "admin"]), async (req, res) => {
  const body = settingsSchema.parse(req.body);
  const { data } = await supabase.from("organizations").update({ name: body.name }).eq("id", req.auth!.organizationId).select("*").single();
  res.json({ organization: data });
});

organizationsRoutes.post("/organizations/switch", async (req, res) => {
  const schema = z.object({ clerkOrgId: z.string().min(1) });
  const body = schema.parse(req.body);

  const { data: org } = await supabase.from("organizations").select("id, clerk_org_id").eq("clerk_org_id", body.clerkOrgId).single();
  if (!org) return res.status(404).json({ error: "Organization not found" });

  const { data: user } = await supabase.from("users").select("role").eq("clerk_user_id", req.auth!.userId).eq("organization_id", org.id).single();
  if (!user) return res.status(403).json({ error: "Not a member of organization" });

  res.json({ ok: true, organizationId: org.id, clerkOrgId: org.clerk_org_id, role: user.role });
});
