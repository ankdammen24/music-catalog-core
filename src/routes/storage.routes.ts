import { Router } from "express";
import { getStorageProvider } from "../storage/storageProvider.js";
import { deleteObjectSchema, ensureSafeObjectKey, listObjectsSchema, signDownloadSchema, signUploadSchema } from "../storage/storageValidation.js";

export const storagePublicRoutes = Router();
export const storageRoutes = Router();

storagePublicRoutes.get("/api/storage/health", async (_req, res) => {
  const provider = getStorageProvider();
  const ok = await provider.listObjects({ maxKeys: 1 }).then(() => true).catch(() => false);
  res.status(ok ? 200 : 503).json({ ok });
});

storageRoutes.post("/api/storage/uploads/sign", async (req, res) => {
  const payload = signUploadSchema.parse(req.body);
  const provider = getStorageProvider();
  const key = ensureSafeObjectKey(payload.key);
  const url = await provider.getSignedUploadUrl({ key, contentType: payload.contentType, expiresInSeconds: payload.expiresInSeconds });
  res.json({ url, key });
});
storageRoutes.post("/api/storage/downloads/sign", async (req, res) => {
  const payload = signDownloadSchema.parse(req.body);
  const provider = getStorageProvider();
  const key = ensureSafeObjectKey(payload.key);
  const url = await provider.getSignedDownloadUrl({ key, expiresInSeconds: payload.expiresInSeconds });
  res.json({ url, key });
});
storageRoutes.get("/api/storage/objects", async (req, res) => {
  const payload = listObjectsSchema.parse(req.query);
  const provider = getStorageProvider();
  const prefix = payload.prefix ? ensureSafeObjectKey(payload.prefix) : undefined;
  const objects = await provider.listObjects({ prefix, maxKeys: payload.maxKeys });
  res.json({ objects });
});
storageRoutes.delete("/api/storage/objects", async (req, res) => {
  const payload = deleteObjectSchema.parse(req.body);
  const provider = getStorageProvider();
  await provider.deleteObject({ key: ensureSafeObjectKey(payload.key) });
  res.status(204).send();
});
