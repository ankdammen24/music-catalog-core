import { storageAreaSchema, safeIdSchema, sanitizeFilename } from "./storageValidation.js";

export function buildStorageKey(area: string, entityType: string, entityId: string, filename: string): string {
  const parsedArea = storageAreaSchema.parse(area);
  const parsedType = safeIdSchema.parse(entityType);
  const parsedId = safeIdSchema.parse(entityId);
  const safeFilename = sanitizeFilename(filename);
  if (!safeFilename) throw new Error("Invalid filename");
  return `${parsedArea}/${parsedType}/${parsedId}/${safeFilename}`;
}
