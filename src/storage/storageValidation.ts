import { z } from "zod";
import { STORAGE_AREAS } from "./types.js";

export const storageAreaSchema = z.enum(STORAGE_AREAS);
export const safeIdSchema = z.string().min(1).max(200).regex(/^[A-Za-z0-9_-]+$/);

export const sanitizeFilename = (filename: string): string =>
  filename
    .normalize("NFKC")
    .replace(/[\\/]/g, "-")
    .replace(/\.{2,}/g, ".")
    .replace(/[^A-Za-z0-9._-]/g, "-")
    .replace(/^-+/, "")
    .slice(0, 255);

export const sanitizePathSegment = (value: string): string =>
  value.replace(/[^A-Za-z0-9/_-]/g, "-").replace(/\.{2,}/g, "").replace(/^\/+|\/+$/g, "");

export const ensureSafeObjectKey = (key: string): string => {
  const safe = sanitizePathSegment(key);
  if (!safe || safe.includes("../") || safe.startsWith("..")) throw new Error("Unsafe object key");
  return safe;
};

export const signUploadSchema = z.object({ key: z.string().min(1), contentType: z.string().min(1), expiresInSeconds: z.number().int().positive().max(3600).optional() });
export const signDownloadSchema = z.object({ key: z.string().min(1), expiresInSeconds: z.number().int().positive().max(3600).optional() });
export const listObjectsSchema = z.object({ prefix: z.string().optional(), maxKeys: z.coerce.number().int().positive().max(1000).optional() });
export const deleteObjectSchema = z.object({ key: z.string().min(1) });
