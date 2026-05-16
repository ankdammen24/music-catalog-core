import type { FastifyInstance } from 'fastify';
import { completeSchema, presignSchema } from '../schemas/upload.schema.js';
import { uploadsService } from '../services/uploads.service.js';

export async function uploadRoutes(app: FastifyInstance) {
  app.post('/uploads/presign', async (req) => {
    const body = presignSchema.parse(req.body);
    const bucketType = uploadsService.resolveBucketType(body);

    if (['normalized', 'previews'].includes(bucketType) && !['admin', 'service'].includes(req.auth.role)) {
      throw app.httpErrors.forbidden('Only admin/service can presign normalized/previews uploads');
    }

    const objectKey = uploadsService.buildObjectKey({ ...body, bucketType });
    return uploadsService.presign(bucketType, objectKey, body.contentType);
  });

  app.post('/uploads/complete', async (req) => {
    const body = completeSchema.parse(req.body);
    await uploadsService.complete(body);
    return { ok: true };
  });
}
