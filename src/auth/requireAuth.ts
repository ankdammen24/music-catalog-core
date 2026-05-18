import type { NextFunction, Request, Response } from "express";

import { supabase } from "../db/supabase";
import type { AuthContext } from "../db/types";
import { AppError } from "../utils/errors";
import { verifyClerkJwt } from "./clerk";

export async function requireAuth(req: Request, _res: Response, next: NextFunction) {
  try {
    const auth = req.headers.authorization;
    if (!auth?.startsWith("Bearer ")) throw new AppError(401, "Missing token");

    const payload = await verifyClerkJwt(auth.slice(7));
    const clerkUserId = String(payload.sub ?? "");
    const clerkOrgId = String((payload as Record<string, unknown>).org_id ?? "");

    if (!clerkUserId || !clerkOrgId) throw new AppError(403, "Missing Clerk org context");

    const { data: org } = await supabase
      .from("organizations")
      .select("id")
      .eq("clerk_org_id", clerkOrgId)
      .single();

    if (!org?.id) throw new AppError(403, "Organization not mapped");

    const { data: user } = await supabase
      .from("users")
      .select("id")
      .eq("clerk_user_id", clerkUserId)
      .maybeSingle();

    (req as Request & { auth: AuthContext }).auth = {
      clerkUserId,
      clerkOrgId,
      organizationId: org.id,
      userId: user?.id
    };

    next();
  } catch (error) {
    next(error);
  }
}
