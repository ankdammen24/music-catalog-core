import { z } from 'zod';
export const artistCreateSchema = z.object({ name: z.string(), display_name: z.string().optional(), bio: z.string().optional(), country: z.string().optional(), website_url: z.string().url().optional(), image_key: z.string().optional() });
export const artistUpdateSchema = artistCreateSchema.partial();
