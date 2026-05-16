import type { FastifyInstance } from 'fastify';
import { completeSchema, presignSchema } from '../schemas/upload.schema.js';
import { uploadsService } from '../services/uploads.service.js';

export async function uploadRoutes(app: FastifyInstance) {
  app.post('/uploads/presign', async (req) => {
    const body = presignSchema.parse(req.body);
    const objectKey = uploadsService.buildObjectKey(body);
    return uploadsService.presign(body.bucketType, objectKey, body.contentType);
  });

  app.post('/uploads/complete', async (req) => {
    const body = completeSchema.parse(req.body);
    await uploadsService.complete(body);
    return { ok: true };
  });
}
