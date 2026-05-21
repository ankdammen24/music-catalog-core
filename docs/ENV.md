# Environment variables

## Required
- `DATABASE_URL`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `CLERK_SECRET_KEY`
- `CLERK_JWT_ISSUER`
- `CLERK_JWKS_URL`
- `STORAGE_PROVIDER=r2`
- `R2_ACCOUNT_ID`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- `R2_BUCKET`
- `R2_ENDPOINT`
- `R2_PUBLIC_BASE_URL`
- `REDIS_URL`
- `PORT`
- `NODE_ENV`
- `CORS_ORIGINS`

## Notes
- `CORS_ORIGINS` is comma-separated and supports `*` wildcards.
- Do not commit real credentials.
- Keep service-role keys in backend only.
