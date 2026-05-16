import { z } from 'zod';
export const albumCreateSchema = z.object({ artist_id: z.string().uuid(), title: z.string(), release_date: z.string().optional(), artwork_key: z.string().optional(), upc: z.string().optional(), status: z.string().optional() });
export const albumUpdateSchema = albumCreateSchema.partial();
