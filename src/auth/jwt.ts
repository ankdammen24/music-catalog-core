import { SignJWT, jwtVerify } from 'jose';
import { env } from '../config/env.js';

export type AuthClaims = { sub: string; org_id?: string; email?: string; name?: string; role?: string };

const encoder = new TextEncoder();

export async function signAccessToken(claims: Record<string, any>) {
  const jwt = await new SignJWT(claims)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(env.JWT_EXPIRES_IN)
    .setSubject(String(claims.sub));
  return jwt.sign(encoder.encode(env.JWT_SECRET));
}

export async function verifyAccessToken(token: string): Promise<AuthClaims> {
  const { payload } = await jwtVerify(token, encoder.encode(env.JWT_SECRET));
  return { sub: String(payload.sub), org_id: payload.org_id as string | undefined, email: payload.email as string | undefined, name: payload.name as string | undefined, role: payload.role as string | undefined };
}

export async function signRefreshToken(claims: Record<string, any>) {
  const jwt = await new SignJWT(claims)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(env.REFRESH_TOKEN_EXPIRES_IN)
    .setSubject(String(claims.sub));
  return jwt.sign(encoder.encode(env.REFRESH_TOKEN_SECRET));
}

export async function verifyRefreshToken(token: string): Promise<AuthClaims> {
  const { payload } = await jwtVerify(token, encoder.encode(env.REFRESH_TOKEN_SECRET));
  return { sub: String(payload.sub), org_id: payload.org_id as string | undefined, email: payload.email as string | undefined, name: payload.name as string | undefined, role: payload.role as string | undefined };
}
