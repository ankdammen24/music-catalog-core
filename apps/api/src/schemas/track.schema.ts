import { z } from 'zod';
export const trackCreateSchema = z.object({ artist_id: z.string().uuid(), album_id: z.string().uuid().nullable().optional(), title: z.string() }).passthrough();
export const trackUpdateSchema = trackCreateSchema.partial();
