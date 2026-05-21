import test from "node:test";
import assert from "node:assert/strict";

process.env.CLERK_JWT_ISSUER = process.env.CLERK_JWT_ISSUER ?? "issuer";
process.env.CLERK_JWKS_URL = process.env.CLERK_JWKS_URL ?? "https://example.com/jwks";
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
