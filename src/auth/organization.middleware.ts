import type { NextFunction, Request, Response } from "express";
import { supabase } from "../db/supabase.js";
import type { Database } from "../db/types.js";
import { AppError } from "../utils/errors.js";

export type OrgRole = "owner" | "admin" | "editor" | "viewer";

declare global {
  namespace Express {
    interface Request {
      orgRole?: OrgRole;
    }
  }
}

export async function requireOrganizationContext(req: Request, _res: Response, next: NextFunction) {
  if (!req.auth) return next(new AppError(401, "Unauthorized"));

  const { data, error } = await supabase
    .from("users")
    .select("role, organization_id")
    .eq("clerk_user_id", req.auth.userId)
    .eq("organization_id", req.auth.organizationId)
    .single();

  const membership = data as Pick<Database["public"]["Tables"]["users"]["Row"], "role" | "organization_id"> | null;
  if (error || !membership) return next(new AppError(403, "Organization membership missing"));

  const role = (membership.role === "member" ? "viewer" : membership.role) as OrgRole;
  req.orgRole = role;
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
