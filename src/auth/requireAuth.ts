import type { NextFunction, Request, Response } from "express";
import { verifyClerkJwt } from "./clerk";
import { AppError } from "../utils/errors";
import { supabase } from "../db/supabase";
export async function requireAuth(req:Request,res:Response,next:NextFunction){
  try {
    const auth = req.headers.authorization;
    if (!auth?.startsWith("Bearer ")) throw new AppError(401, "Missing token");
    const payload = await verifyClerkJwt(auth.slice(7));
    const clerkUserId = String(payload.sub || "");
    const clerkOrgId = String((payload as any).org_id || "");
    if (!clerkUserId || !clerkOrgId) throw new AppError(403, "Missing Clerk org context");
    const { data: org } = await supabase.from("organizations").select("id").eq("clerk_org_id", clerkOrgId).single();
    const { data: user } = await supabase.from("users").select("id").eq("clerk_user_id", clerkUserId).single();
    (req as any).auth = { userId: user?.id, organizationId: org?.id, clerkUserId, clerkOrgId };
    if (!org?.id) throw new AppError(403, "Organization not mapped");
    next();
  } catch (e) { next(e); }
}
