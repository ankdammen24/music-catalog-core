import { z } from 'zod';
export const syncMeSchema = z.object({ email: z.string().email().optional() });
