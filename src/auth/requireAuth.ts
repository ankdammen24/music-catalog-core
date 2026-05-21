import { NextFunction, Request, Response } from "express";
import { supabase } from "../db/supabase.js";
import { AppError } from "../utils/errors.js";
import { verifyClerkToken } from "./clerk.js";

export type RequestUser = {
  userId: string;
  organizationId: string;
  clerkOrgId: string;
};

declare global {
  namespace Express {
    interface Request {
      auth?: RequestUser;
    }
  }
}

export async function requireAuth(req: Request, _res: Response, next: NextFunction) {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) throw new AppError(401, "Missing bearer token");

    const claims = await verifyClerkToken(header.slice(7));
    if (!claims.org_id) throw new AppError(403, "Organization context missing");

    const { data: organization, error: organizationError } = await supabase
      .from("organizations")
      .upsert({ clerk_org_id: claims.org_id, name: claims.org_id }, { onConflict: "clerk_org_id" })
      .select("id, clerk_org_id")
      .single();

    if (organizationError || !organization) throw new AppError(500, "Failed to resolve organization");

    const { error: userError } = await supabase.from("users").upsert(
      {
        clerk_user_id: claims.sub,
        clerk_org_id: claims.org_id,
        organization_id: organization.id,
        email: claims.email ?? null,
        name: claims.name ?? null,
      },
      { onConflict: "clerk_user_id" },
    );

    if (userError) throw new AppError(500, "Failed to upsert user");

    req.auth = { userId: claims.sub, organizationId: organization.id, clerkOrgId: organization.clerk_org_id };
    next();
  } catch {
    next(new AppError(401, "Unauthorized"));
  }
}
