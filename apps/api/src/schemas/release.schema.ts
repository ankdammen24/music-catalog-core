import { z } from 'zod';
export const releaseCreateSchema = z.object({ title: z.string(), artist_id: z.string().uuid(), album_id: z.string().uuid().optional(), release_type: z.string().optional(), release_date: z.string().optional(), upc: z.string().optional(), status: z.string().optional(), distribution_status: z.string().optional() });
export const releaseUpdateSchema = releaseCreateSchema.partial();
