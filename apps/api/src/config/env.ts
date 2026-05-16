import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(3000),
  FRONTEND_ORIGIN: z.string().url().default('http://localhost:3000'),
  PUBLIC_API_BASE_URL: z.string().url().default('http://localhost:3001'),
  SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  CLERK_SECRET_KEY: z.string().min(1).optional(),
  CLERK_JWT_ISSUER: z.string().url().optional(),
  AUTH_DISABLED: z.string().default('false').transform((v) => v === 'true'),
  R2_ACCOUNT_ID: z.string().min(1),
  R2_ACCESS_KEY_ID: z.string().min(1),
  R2_SECRET_ACCESS_KEY: z.string().min(1),
  R2_ENDPOINT: z.string().url(),
  R2_BUCKET_NAME: z.string().default('mrq-music-masters')
}).superRefine((data, ctx) => {
  if (data.AUTH_DISABLED && data.NODE_ENV === 'production') {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'AUTH_DISABLED cannot be true in production' });
  }
});

export const env = envSchema.parse(process.env);
