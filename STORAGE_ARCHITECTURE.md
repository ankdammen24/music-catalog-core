# Storage Architecture

## Provider abstraction

The backend uses a provider abstraction to support multiple object stores:
- Cloudflare R2
- AWS S3
- Azure Blob

Provider selection is controlled by `STORAGE_PROVIDER` and initialized in `src/storage/storage.factory.ts`.

## Service layer

`src/services/storage/storage.service.ts` provides cross-provider behavior:
- retry/backoff handling for transient failures
- upload mime/type and size validation
- signed upload/download URL generation
- bucket diagnostics and existence checks
- debug upload test flow
- asset metadata persistence to Supabase `assets`

## Health and diagnostics

- `GET /health/storage` now returns detailed diagnostics including bucket availability.
- `GET /api/storage/health` exposes storage readiness plus diagnostics.

## Debug operations

- `POST /debug/storage-upload-test` uploads a temporary test object, verifies existence, and deletes it.

## Upload controls

- `STORAGE_MAX_UPLOAD_BYTES` (default: 50 MB)
- `STORAGE_ALLOWED_MIME_TYPES` (comma-separated allow-list)

## Security notes

- Metadata DB stores object keys (`r2_key`), not permanent public URLs.
- Signed URLs are short-lived and generated server-side.
