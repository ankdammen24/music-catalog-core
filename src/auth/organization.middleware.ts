import type { NextFunction, Request, Response } from "express";
import { supabase } from "../db/supabase.js";
import type { Database } from "../db/types.js";
import { AppError } from "../utils/errors.js";
import type { UserRole } from "./roles.js";

export type OrgRole = UserRole;

declare global {
  namespace Express {
    interface Request {
      orgRole?: OrgRole;
    }
  }
}

export async function requireOrganizationContext(req: Request, _res: Response, next: NextFunction) {
  if (!req.auth) return next(new AppError(401, "Unauthorized"));
  if (!req.auth.organizationId) return next(new AppError(400, "organizationId is required"));

  const { data, error } = await supabase
    .from("users")
    .select("role, organization_id")
    .eq("clerk_user_id", req.auth.userId)
    .eq("organization_id", req.auth.organizationId)
    .single();

  const membership = data as Pick<Database["public"]["Tables"]["users"]["Row"], "role" | "organization_id"> | null;
  if (error || !membership) return next(new AppError(403, "Organization membership missing"));

  req.orgRole = (["admin", "label", "artist", "viewer"] as const).includes(membership.role as OrgRole)
    ? (membership.role as OrgRole)
    : "viewer";
  next();
}

export function requireOrgRole(allowed: OrgRole[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.orgRole || !allowed.includes(req.orgRole)) {
      next(new AppError(403, "Insufficient organization role"));
      return;
    }
    next();
  };
}
