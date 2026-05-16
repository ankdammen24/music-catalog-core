import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { albumsService } from '../services/albums.service.js';
import { albumCreateSchema, albumUpdateSchema } from '../schemas/album.schema.js';
export async function albumRoutes(app: FastifyInstance) { /* CRUD */
  app.get('/albums', async () => albumsService.list());
  app.get('/albums/:id', async (req) => albumsService.get(z.object({ id: z.string().uuid() }).parse(req.params).id));
  app.post('/albums', async (req) => albumsService.create(albumCreateSchema.parse(req.body)));
  app.patch('/albums/:id', async (req) => albumsService.update(z.object({ id: z.string().uuid() }).parse(req.params).id, albumUpdateSchema.parse(req.body)));
  app.delete('/albums/:id', async (req, reply) => { await albumsService.remove(z.object({ id: z.string().uuid() }).parse(req.params).id); return reply.code(204).send(); });
}
