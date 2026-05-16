import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { artistsService } from '../services/artists.service.js';
import { artistCreateSchema, artistUpdateSchema } from '../schemas/artist.schema.js';

export async function artistRoutes(app: FastifyInstance) {
  app.get('/artists', async () => artistsService.list());
  app.get('/artists/:id', async (req) => artistsService.get(z.object({ id: z.string().uuid() }).parse(req.params).id));
  app.post('/artists', async (req) => artistsService.create(artistCreateSchema.parse(req.body)));
  app.patch('/artists/:id', async (req) => artistsService.update(z.object({ id: z.string().uuid() }).parse(req.params).id, artistUpdateSchema.parse(req.body)));
  app.delete('/artists/:id', async (req, reply) => { await artistsService.remove(z.object({ id: z.string().uuid() }).parse(req.params).id); return reply.code(204).send(); });
}
