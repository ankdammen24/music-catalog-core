import dotenv from "dotenv";
import { z } from "zod";
dotenv.config();
const schema = z.object({ PORT: z.string().default("4000"), NODE_ENV: z.string().default("development"), CORS_ORIGIN: z.string().default("http://localhost:5173"), CLERK_SECRET_KEY: z.string().optional(), CLERK_JWT_ISSUER: z.string().min(1), CLERK_JWKS_URL: z.string().url(), SUPABASE_URL: z.string().url(), SUPABASE_SERVICE_ROLE_KEY: z.string().min(1), R2_ACCOUNT_ID: z.string().min(1), R2_ACCESS_KEY_ID: z.string().min(1), R2_SECRET_ACCESS_KEY: z.string().min(1), R2_BUCKET: z.string().default("mrq-music-masters"), R2_ENDPOINT: z.string().url(), R2_PUBLIC_BASE_URL: z.string().optional(), AUDIO_WORKER_ENABLED: z.string().default("true"), FFMPEG_PATH: z.string().default("ffmpeg"), FFPROBE_PATH: z.string().default("ffprobe") });
export const env = schema.parse(process.env);
