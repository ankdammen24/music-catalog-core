import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { playlistsService } from '../services/playlists.service.js';
import { playlistCreateSchema, playlistUpdateSchema, playlistTrackSchema } from '../schemas/playlist.schema.js';

export async function playlistRoutes(app: FastifyInstance) {
  app.get('/playlists', async () => playlistsService.list());
  app.get('/playlists/:id', async (req) => playlistsService.get(z.object({ id: z.string().uuid() }).parse(req.params).id));
  app.post('/playlists', async (req) => playlistsService.create(playlistCreateSchema.parse(req.body)));
  app.patch('/playlists/:id', async (req) => playlistsService.update(z.object({ id: z.string().uuid() }).parse(req.params).id, playlistUpdateSchema.parse(req.body)));
  app.delete('/playlists/:id', async (req, reply) => { await playlistsService.remove(z.object({ id: z.string().uuid() }).parse(req.params).id); return reply.code(204).send(); });
  app.post('/playlists/:id/tracks', async (req) => {
    const p = z.object({ id: z.string().uuid() }).parse(req.params);
    const b = playlistTrackSchema.parse(req.body);
    const { supabase } = await import('../lib/supabase.js');
    return (await supabase.from('playlist_tracks').insert({ playlist_id: p.id, ...b }).select('*').single()).data;
  });
}
