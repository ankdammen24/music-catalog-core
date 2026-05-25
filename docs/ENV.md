# Environment variables

## Required
- `DATABASE_URL`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ENTRA_TENANT_ID`
- `ENTRA_ISSUER`
- `ENTRA_JWKS_URI`
- `ENTRA_AUDIENCE`
- `AUTH_API_URL`
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
- Auth verifier använder Microsoft Entra External ID JWT via Connect-konfiguration.
- Frontend skickar `Authorization: Bearer <access_token>` till API.
- `CORS_ORIGINS` is comma-separated and supports `*` wildcards.
- Do not commit real credentials.
- Keep service-role keys in backend only.
