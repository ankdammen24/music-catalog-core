import { Router } from "express";
import { getStorageProvider } from "../storage/storageProvider.js";
import { deleteObjectSchema, ensureSafeObjectKey, listObjectsSchema, signDownloadSchema, signUploadSchema } from "../storage/storageValidation.js";
import { createSignedDownload, createSignedUpload, getStorageDiagnostics, runStorageUploadTest } from "../services/storage/storage.service.js";

export const storagePublicRoutes = Router();
export const storageRoutes = Router();

storagePublicRoutes.get("/api/storage/health", async (_req, res) => {
  const diagnostics = await getStorageDiagnostics().catch(() => null);
  const ok = Boolean(diagnostics?.bucketExists);
  res.status(ok ? 200 : 503).json({ ok, diagnostics });
});

storageRoutes.post("/api/storage/uploads/sign", async (req, res) => {
  const payload = signUploadSchema.parse(req.body);
  const signed = await createSignedUpload(payload);
  res.json(signed);
});
storageRoutes.post("/api/storage/downloads/sign", async (req, res) => {
  const payload = signDownloadSchema.parse(req.body);
  const signed = await createSignedDownload(payload);
  res.json(signed);
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

storageRoutes.post("/debug/storage-upload-test", async (req, res) => {
  if (!req.auth) return res.status(401).json({ error: "Unauthorized" });
  const out = await runStorageUploadTest(req.auth.organizationId);
  res.json({ ok: true, ...out });
});
