import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const schema = z
  .object({
    PORT: z.coerce.number().default(3000),
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    DATABASE_URL: z.string().min(1),
    SUPABASE_URL: z.string().url(),
    SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
    ENTRA_TENANT_ID: z.string().min(1),
    ENTRA_ISSUER: z.string().url(),
    ENTRA_JWKS_URI: z.string().url(),
    ENTRA_AUDIENCE: z.string().min(1),
    AUTH_API_URL: z.string().url(),
    STORAGE_PROVIDER: z.enum(["r2", "s3", "azure"]).default("r2"),
    STORAGE_PUBLIC_BASE_URL: z.string().url().optional(),
    R2_ACCOUNT_ID: z.string().optional(),
    R2_ACCESS_KEY_ID: z.string().optional(),
    R2_SECRET_ACCESS_KEY: z.string().optional(),
    R2_BUCKET: z.string().optional(),
    R2_REGION: z.string().default("auto"),
    R2_ENDPOINT: z.string().url().optional(),
    R2_PUBLIC_BASE_URL: z.string().url().optional(),
    AWS_ACCESS_KEY_ID: z.string().optional(),
    AWS_SECRET_ACCESS_KEY: z.string().optional(),
    AWS_REGION: z.string().optional(),
    AWS_S3_BUCKET: z.string().optional(),
    AWS_S3_ENDPOINT: z.string().optional(),
    AZURE_STORAGE_CONNECTION_STRING: z.string().optional(),
    AZURE_BLOB_CONTAINER: z.string().optional(),
    REDIS_URL: z.string().url(),
    AUDIO_WORKER_ENABLED: z.coerce.boolean().default(true),
    FFMPEG_PATH: z.string().default("ffmpeg"),
    FFPROBE_PATH: z.string().default("ffprobe"),
    CORS_ORIGINS: z.string().min(1),
  })
  .superRefine((data, ctx) => {
    if (data.STORAGE_PROVIDER === "r2") {
      for (const key of ["R2_ACCOUNT_ID", "R2_ACCESS_KEY_ID", "R2_SECRET_ACCESS_KEY", "R2_BUCKET"] as const) {
        if (!data[key]) ctx.addIssue({ code: "custom", path: [key], message: `${key} is required when STORAGE_PROVIDER=r2` });
      }
    }
  });

export const env = schema.parse(process.env);
export const corsOrigins = Array.from(new Set([
  ...env.CORS_ORIGINS.split(",").map((origin) => origin.trim()).filter(Boolean),
  "https://connect.mediarosenqvist.com"
]));
export function requireEnv(name: string): string { const value = process.env[name]; if (!value || value.trim().length === 0) throw new Error(`Missing required environment variable: ${name}`); return value; }
