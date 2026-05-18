import { createRemoteJWKSet, jwtVerify } from "jose";
import { env } from "../config/env.js";

const jwks = createRemoteJWKSet(new URL(env.CLERK_JWKS_URL));

export type AuthClaims = { sub: string; org_id?: string; email?: string; name?: string };

export async function verifyClerkToken(token: string): Promise<AuthClaims> {
  const { payload } = await jwtVerify(token, jwks, { issuer: env.CLERK_JWT_ISSUER });
  return { sub: payload.sub!, org_id: payload.org_id as string | undefined, email: payload.email as string | undefined, name: payload.name as string | undefined };
}
