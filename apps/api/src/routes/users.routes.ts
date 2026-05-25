import type { FastifyInstance } from 'fastify';
import { syncMeSchema } from '../schemas/user.schema.js';
import { usersService } from '../services/users.service.js';

export async function userRoutes(app: FastifyInstance) {
  app.get('/me', async (req) => usersService.me(req.auth.externalUserId));
  app.post('/me/sync', async (req) => usersService.sync(req.auth.externalUserId, syncMeSchema.parse(req.body).email ?? req.auth.email));
}
