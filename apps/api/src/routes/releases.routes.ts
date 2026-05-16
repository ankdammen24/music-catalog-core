import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { releasesService } from '../services/releases.service.js';
import { releaseCreateSchema, releaseUpdateSchema } from '../schemas/release.schema.js';
export async function releaseRoutes(app: FastifyInstance) {
  app.get('/releases', async () => releasesService.list());
  app.get('/releases/:id', async (req) => releasesService.get(z.object({ id: z.string().uuid() }).parse(req.params).id));
  app.post('/releases', async (req) => releasesService.create(releaseCreateSchema.parse(req.body)));
  app.patch('/releases/:id', async (req) => releasesService.update(z.object({ id: z.string().uuid() }).parse(req.params).id, releaseUpdateSchema.parse(req.body)));
}
