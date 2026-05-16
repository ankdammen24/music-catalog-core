import { createRemoteJWKSet, jwtVerify } from 'jose';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { env } from '../config/env.js';

const jwks = env.CLERK_JWT_ISSUER ? createRemoteJWKSet(new URL(`${env.CLERK_JWT_ISSUER}/.well-known/jwks.json`)) : null;

declare module 'fastify' {
  interface FastifyRequest {
    auth: { clerkUserId: string; role: string; artistId?: string | null };
  }
}

export async function authMiddleware(request: FastifyRequest, reply: FastifyReply) {
  if (env.AUTH_DISABLED && env.NODE_ENV === 'development') {
    request.auth = { clerkUserId: 'dev-user', role: 'admin' };
    return;
  }
  const header = request.headers.authorization;
  if (!header?.startsWith('Bearer ') || !jwks || !env.CLERK_JWT_ISSUER) {
    return reply.code(401).send({ error: 'Unauthorized' });
  }
  const token = header.slice(7);
  const { payload } = await jwtVerify(token, jwks, { issuer: env.CLERK_JWT_ISSUER });
  request.auth = { clerkUserId: String(payload.sub), role: String(payload.role ?? 'listener') };
}
