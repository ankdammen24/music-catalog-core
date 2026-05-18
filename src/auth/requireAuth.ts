import { NextFunction, Request, Response } from "express";
import { verifyClerkToken } from "./clerk.js";
import { AppError } from "../utils/errors.js";
import { supabase } from "../db/supabase.js";

declare global { namespace Express { interface Request { auth?: { userId: string; organizationId: string }; } } }

export async function requireAuth(req: Request, _res: Response, next: NextFunction) {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) throw new AppError(401, "Missing bearer token");
    const claims = await verifyClerkToken(header.slice(7));
    if (!claims.org_id) throw new AppError(403, "Organization context missing");
    const { data: org } = await supabase.from("organizations").upsert({ clerk_org_id: claims.org_id, name: claims.org_id }, { onConflict: "clerk_org_id" }).select("id").single();
    await supabase.from("users").upsert({ clerk_user_id: claims.sub, email: claims.email ?? null, name: claims.name ?? null }, { onConflict: "clerk_user_id" });
    req.auth = { userId: claims.sub, organizationId: (org as { id: string }).id };
    next();
  } catch { next(new AppError(401, "Unauthorized")); }
}
