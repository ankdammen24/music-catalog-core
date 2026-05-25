import { createRemoteJWKSet, jwtVerify } from 'jose';
import { env } from '../config/env.js';

export type AuthClaims = { sub: string; org_id?: string; email?: string; name?: string; role?: string; preferred_username?: string; upn?: string; roles?: string[] };

const jwks = createRemoteJWKSet(new URL(env.ENTRA_JWKS_URI));

export async function verifyAccessToken(token: string): Promise<AuthClaims> {
  const { payload } = await jwtVerify(token, jwks, { issuer: env.ENTRA_ISSUER, audience: env.ENTRA_AUDIENCE });
  return payload as AuthClaims;
}
