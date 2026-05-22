# Frontend integration guide

## API base URL
- `https://api.mediarosenqvist.com`

## Frontend origins currently expected in CORS_ORIGINS
- `https://catalogusmusicus.mediarosenqvist.com`
- `https://soundloom.mediarosenqvist.com`
- `https://soundloom-core.lovable.app`

## Frontend env variables
- `VITE_API_BASE_URL=https://api.mediarosenqvist.com`
- `VITE_CLERK_PUBLISHABLE_KEY=<your-clerk-publishable-key>`

## Authentication model
- All protected routes require a Clerk Bearer token in the `Authorization` header.
- Public health routes do **not** require auth (`/health`, `/health/database`, `/health/storage`, `/health/auth-config`, `/health/redis`, `/cors-test`).

Example:

```ts
const token = await clerk.session?.getToken();
await fetch(`${import.meta.env.VITE_API_BASE_URL}/artists`, {
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
});
```

## CORS validation endpoint
- `GET /cors-test` returns:
  - request origin seen by API,
  - allowed origins list,
  - allowed methods and required request headers.

Use this to debug browser CORS issues before testing protected endpoints.

## Upload pipeline flow

### 1) Initialize upload
`POST /api/assets/uploads/init`

Request body:

```json
{
  "trackId": "uuid",
  "filename": "demo.wav",
  "contentType": "audio/wav",
  "sizeBytes": 1234567
}
```

Response includes signed `uploadUrl`, `objectKey`, and `assetId`.

### 2) Upload file directly to R2
Use `PUT` to the returned `uploadUrl` with the same `Content-Type`.

### 3) Complete upload
`POST /api/assets/uploads/complete`

Request body:

```json
{
  "trackId": "uuid",
  "objectKey": "org/<org-id>/staging/uploads/<track-id>/...",
  "sizeBytes": 1234567,
  "mimeType": "audio/wav"
}
```

Response includes `jobId` for processing.

### 4) Fetch asset metadata
`GET /api/assets/:id`

### 5) Fetch short-lived download URL
`GET /api/assets/:id/download-url`

Response returns `downloadUrl` (5-minute expiry) and associated object key.
