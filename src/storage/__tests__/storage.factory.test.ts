import test from "node:test";
import assert from "node:assert/strict";

process.env.ENTRA_ISSUER = process.env.ENTRA_ISSUER ?? "issuer";
process.env.ENTRA_JWKS_URI = process.env.ENTRA_JWKS_URI ?? "https://example.com/jwks";
process.env.ENTRA_TENANT_ID = process.env.ENTRA_TENANT_ID ?? "tenant";
process.env.ENTRA_AUDIENCE = process.env.ENTRA_AUDIENCE ?? "api://aud";
process.env.AUTH_API_URL = process.env.AUTH_API_URL ?? "https://connect.mediarosenqvist.com";
process.env.SUPABASE_URL = process.env.SUPABASE_URL ?? "https://example.supabase.co";
process.env.SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "key";
process.env.CORS_ORIGIN = process.env.CORS_ORIGIN ?? "https://example.com";
process.env.STORAGE_PROVIDER = "r2";
process.env.R2_ACCOUNT_ID = "acct";
process.env.R2_ACCESS_KEY_ID = "key";
process.env.R2_SECRET_ACCESS_KEY = "secret";
process.env.R2_BUCKET = "bucket";

test("factory creates provider", async () => {
  const mod = await import("../storage.factory.js");
  const provider = mod.createStorageProvider();
  assert.ok(provider);
});
