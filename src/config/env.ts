import dotenv from "dotenv";
import { z } from "zod";
dotenv.config();

const schema = z.object({
  PORT: z.coerce.number().default(4000), NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  CLERK_SECRET_KEY: z.string().optional(), CLERK_JWT_ISSUER: z.string(), CLERK_JWKS_URL: z.string().url(),
  SUPABASE_URL: z.string().url(), SUPABASE_SERVICE_ROLE_KEY: z.string(),
  R2_ACCOUNT_ID: z.string(), R2_ACCESS_KEY_ID: z.string(), R2_SECRET_ACCESS_KEY: z.string(),
  R2_BUCKET: z.string().default("mrq-music-masters"), R2_ENDPOINT: z.string().url(), R2_PUBLIC_BASE_URL: z.string().url().optional(),
  AUDIO_WORKER_ENABLED: z.coerce.boolean().default(true), FFMPEG_PATH: z.string().default("ffmpeg"), FFPROBE_PATH: z.string().default("ffprobe"),
  CORS_ORIGIN: z.string().url()
});

export const env = schema.parse(process.env);
