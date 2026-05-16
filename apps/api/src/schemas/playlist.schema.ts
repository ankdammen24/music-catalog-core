import { z } from 'zod';
export const playlistCreateSchema = z.object({ name: z.string(), description: z.string().optional(), usage_type: z.string().optional(), station_scope: z.string().optional() });
export const playlistUpdateSchema = playlistCreateSchema.partial();
export const playlistTrackSchema = z.object({ track_id: z.string().uuid(), sort_order: z.number().int() });
