import { NextFunction, Request, Response } from "express";
import { supabase } from "../db/supabase.js";
import type { Database } from "../db/types.js";
import { AppError } from "../utils/errors.js";
import { verifyAccessToken } from "./jwt.js";
import type { UserRole } from "./roles.js";

export type RequestUser = {
  id: string;
  email: string;
  role: UserRole;
  organizationId?: string;
};

export type RequestAuth = {
  userId: string;
  organizationId?: string;
  role: UserRole;
};

declare global {
  namespace Express {
    interface Request {
      auth?: RequestAuth;
      user?: RequestUser;
    }
  }
}

const roleSchema = new Set<UserRole>(["admin", "label", "artist", "viewer"]);

export async function requireAuth(req: Request, _res: Response, next: NextFunction) {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) throw new AppError(401, "Missing bearer token");

    const claims = await verifyAccessToken(header.slice(7));
    if (!claims.sub) throw new AppError(401, "Invalid token subject");

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

    const { data: userData, error: userError } = await supabase
      .from("users")
      .upsert(
        {
          clerk_user_id: claims.sub,
          organization_id: organizationId ?? null,
          role: "viewer",
        },
        { onConflict: "clerk_user_id" },
      )
      .select("role")
      .single();

    const user = userData as Pick<Database["public"]["Tables"]["users"]["Row"], "role"> | null;

    if (userError || !user) throw new AppError(500, "Failed to upsert user");

    const role = roleSchema.has(user.role as UserRole) ? (user.role as UserRole) : "viewer";
    const email = typeof claims.email === "string" && claims.email.length > 0 ? claims.email : `${claims.sub}@internal.local`;

    req.auth = { userId: claims.sub, organizationId, role };
    req.user = { id: claims.sub, email, role, organizationId };
    next();
  } catch (_err) {
    next(new AppError(401, "Unauthorized"));
  }
}
