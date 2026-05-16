import { z } from 'zod';

const bucketTypeSchema = z.enum(['staging', 'masters', 'previews', 'normalized', 'artwork', 'exports']);

export const presignSchema = z.object({
  bucketType: bucketTypeSchema.optional(),
  fileName: z.string().min(1),
  contentType: z.string().min(1),
  entityType: z.enum(['track', 'artist', 'album', 'release']),
  entityId: z.string().uuid(),
  artistId: z.string().uuid().optional()
});

export const completeSchema = z.object({
  bucketType: bucketTypeSchema,
  entityType: z.enum(['track', 'artist', 'album', 'release']),
  entityId: z.string().uuid(),
  objectKey: z.string().min(1),
  createProcessingJob: z.boolean().optional()
});
