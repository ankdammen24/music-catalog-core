import type { FastifyInstance } from 'fastify';
import { ZodError } from 'zod';

export function registerErrorHandler(app: FastifyInstance) {
  app.setErrorHandler((error, request, reply) => {
    app.log.error(error);
    if (error instanceof ZodError) {
      return reply.code(400).send({
        ok: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Request validation failed',
          details: error.issues.map((issue) => ({ path: issue.path.join('.'), message: issue.message }))
        }
      });
    }

    return reply.code((error as any).statusCode ?? 500).send({
      ok: false,
      error: {
        code: (error as any).code ?? 'INTERNAL_ERROR',
        message: error.message,
        path: request.url
      }
    });
  });
}
