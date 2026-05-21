import type { StorageProvider } from "./types.js";

let provider: StorageProvider | null = null;

export const setStorageProvider = (p: StorageProvider): void => { provider = p; };
export const getStorageProvider = (): StorageProvider => {
  if (!provider) throw new Error("Storage provider not initialized");
  return provider;
};
