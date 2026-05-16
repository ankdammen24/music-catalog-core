import Fastify from 'fastify';
import sensible from '@fastify/sensible';
import { authMiddleware } from './middleware/auth.js';
import { registerErrorHandler } from './middleware/error.js';
import { healthRoutes } from './routes/health.routes.js';
import { userRoutes } from './routes/users.routes.js';
import { artistRoutes } from './routes/artists.routes.js';
import { albumRoutes } from './routes/albums.routes.js';
import { trackRoutes } from './routes/tracks.routes.js';
import { releaseRoutes } from './routes/releases.routes.js';
import { playlistRoutes } from './routes/playlists.routes.js';
import { uploadRoutes } from './routes/uploads.routes.js';

export async function buildApp() {
  const app = Fastify({ logger: true });
  await app.register(sensible);
  app.addHook('preHandler', authMiddleware);
  await app.register(healthRoutes);
  await app.register(userRoutes);
  await app.register(artistRoutes);
  await app.register(albumRoutes);
  await app.register(trackRoutes);
  await app.register(releaseRoutes);
  await app.register(playlistRoutes);
  await app.register(uploadRoutes);
  registerErrorHandler(app);
  return app;
}
