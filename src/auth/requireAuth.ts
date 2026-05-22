import { NextFunction, Request, Response } from "express";
import { supabase } from "../db/supabase.js";
import type { Database } from "../db/types.js";
import { AppError } from "../utils/errors.js";
import { verifyAccessToken } from "./jwt.js";

export type RequestUser = {
  userId: string;
  organizationId?: string;
  role: "admin" | "label" | "artist" | "viewer" | string;
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

    const claims = await verifyAccessToken(header.slice(7));

    // Optional: maintain organization upsert if token carries org_id
    let organizationId: string | undefined;
    if (claims.org_id) {
      const { data: orgData, error: organizationError } = await supabase
        .from("organizations")
        .upsert({ clerk_org_id: claims.org_id, name: claims.org_id }, { onConflict: "clerk_org_id" })
        .select("id, clerk_org_id")
        .single();

      const organization = orgData as Pick<Database["public"]["Tables"]["organizations"]["Row"], "id" | "clerk_org_id"> | null;
      if (organizationError || !organization) throw new AppError(500, "Failed to resolve organization");
      organizationId = organization.id;
    }

    // Upsert user record by external id (keeps compatibility with existing schema)
    const { data: userData, error: userError } = await supabase.from("users").upsert(
      {
        clerk_user_id: claims.sub,
        organization_id: organizationId ?? null,
        role: "viewer",
      },
      { onConflict: "clerk_user_id" },
    ).select("*").single();

    const user = userData as Database["public"]["Tables"]["users"]["Row"] | null;

    if (userError || !user) throw new AppError(500, "Failed to upsert user");

    const role = (user.role === "member" ? "viewer" : user.role) as RequestUser["role"];
    req.auth = { userId: claims.sub, organizationId, role };
    next();
  } catch (err) {
    next(new AppError(401, "Unauthorized"));
  }
}
