import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { tracksService } from '../services/tracks.service.js';
import { trackCreateSchema, trackUpdateSchema } from '../schemas/track.schema.js';
import { r2, R2_BUCKETS } from '../lib/r2.js';

export async function trackRoutes(app: FastifyInstance) {
  app.get('/tracks', async () => tracksService.list());
  app.get('/tracks/:id', async (req) => tracksService.get(z.object({ id: z.string().uuid() }).parse(req.params).id));
  app.post('/tracks', async (req) => tracksService.create(trackCreateSchema.parse(req.body)));
  app.patch('/tracks/:id', async (req) => tracksService.update(z.object({ id: z.string().uuid() }).parse(req.params).id, trackUpdateSchema.parse(req.body)));
  app.delete('/tracks/:id', async (req, reply) => { await tracksService.remove(z.object({ id: z.string().uuid() }).parse(req.params).id); return reply.code(204).send(); });
  app.get('/tracks/:id/audio-url', async (req) => {
    const id = z.object({ id: z.string().uuid() }).parse(req.params).id;
    const objectKey = `previews/${id}/preview.mp3`;
    return { objectKey, url: await getSignedUrl(r2, new GetObjectCommand({ Bucket: R2_BUCKETS.previews, Key: objectKey }), { expiresIn: 900 }) };
  });
  app.get('/tracks/:id/artwork-url', async (req) => {
    const id = z.object({ id: z.string().uuid() }).parse(req.params).id;
    const objectKey = `artwork/tracks/${id}/cover.jpg`;
    return { objectKey, url: await getSignedUrl(r2, new GetObjectCommand({ Bucket: R2_BUCKETS.artwork, Key: objectKey }), { expiresIn: 900 }) };
  });
}
