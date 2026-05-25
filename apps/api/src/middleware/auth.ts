import { createRemoteJWKSet, jwtVerify } from 'jose';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { env } from '../config/env.js';

const jwks = createRemoteJWKSet(new URL(env.ENTRA_JWKS_URI));

declare module 'fastify' {
  interface FastifyRequest {
    auth: {
      userId: string;
      externalUserId: string;
      clerkUserId: string; // TODO: rename clerkUserId to externalUserId in later migration.
      email?: string;
      role: string;
      artistId?: string | null;
    };
  }
}

export async function authMiddleware(request: FastifyRequest, reply: FastifyReply) {
  if (env.AUTH_DISABLED && env.NODE_ENV === 'development') {
    request.auth = { userId: 'dev-user', externalUserId: 'dev-user', clerkUserId: 'dev-user', email: 'dev@local', role: 'admin' };
    return;
  }

  const header = request.headers.authorization;
  if (!header?.startsWith('Bearer ')) return reply.code(401).send({ error: 'Missing bearer token' });

  try {
    const token = header.slice(7);
    const { payload } = await jwtVerify(token, jwks, { issuer: env.ENTRA_ISSUER, audience: env.ENTRA_AUDIENCE });
    const externalUserId = String(payload.sub ?? '');
    if (!externalUserId) return reply.code(401).send({ error: 'Invalid token subject' });

    const roles = Array.isArray(payload.roles) ? payload.roles.map(String) : [];
    const role = roles[0] ?? (typeof payload.role === 'string' ? payload.role : 'listener');
    const email = [payload.preferred_username, payload.email, payload.upn].find((v) => typeof v === 'string' && v.length > 0) as string | undefined;

    request.auth = {
      userId: externalUserId,
      externalUserId,
      clerkUserId: externalUserId,
      email,
      role
    };
  } catch {
    return reply.code(401).send({ error: 'Invalid or expired token' });
  }
}
