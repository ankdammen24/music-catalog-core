import type { FastifyReply, FastifyRequest } from 'fastify';

export function requireRoles(roles: string[]) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    if (!roles.includes(request.auth.role)) {
      return reply.code(403).send({ error: 'Forbidden' });
    }
  };
}
