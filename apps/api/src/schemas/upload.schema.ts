import { z } from 'zod';
export const presignSchema = z.object({ bucketType: z.enum(['masters','previews','normalized','artwork','exports']), fileName: z.string(), contentType: z.string(), entityType: z.enum(['track','artist','album','release']), entityId: z.string().uuid() });
export const completeSchema = z.object({ bucketType: z.enum(['masters','previews','normalized','artwork','exports']), entityType: z.enum(['track','artist','album','release']), entityId: z.string().uuid(), objectKey: z.string(), createProcessingJob: z.boolean().optional() });
