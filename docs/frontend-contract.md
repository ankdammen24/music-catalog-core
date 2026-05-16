# Frontend contract (`soundloom-core` -> `music-catalog-core`)

## API base URL
- Local: `PUBLIC_API_BASE_URL=http://localhost:3000`
- Frontend origin (local): `FRONTEND_ORIGIN=http://localhost:5173`
- Planned production frontend origin: `https://soundloom.mediarosenqvist.com`

## Authentication
- Clerk is the auth provider.
- Frontend must send a bearer token on protected endpoints:

```http
Authorization: Bearer <clerk_token>
```

- Backend verifies Clerk JWT and resolves app-level role/user context.

## User bootstrap flow
1. User signs in through Clerk in `soundloom-core`.
2. Frontend calls `POST /me/sync` with optional email payload.
3. Backend upserts/read user in Supabase users table by `clerk_user_id`.
4. Frontend may call `GET /me` to read app role and artist binding.

`GET /me` response shape:

```json
{
  "id": "...",
  "clerk_user_id": "...",
  "email": "...",
  "role": "admin|label|artist|editor|listener|service",
  "artist_id": "..."
}
```

## Track upload flow (staging)
1. Frontend creates or updates track metadata.
2. Frontend calls `POST /uploads/presign` with:

```json
{
  "bucketType": "staging",
  "fileName": "song.wav",
  "contentType": "audio/wav",
  "entityType": "track",
  "entityId": "track-uuid",
  "artistId": "artist-uuid"
}
```

3. Backend returns temporary R2 upload URL and object key:

```json
{
  "uploadUrl": "...",
  "bucket": "mrq-music-masters",
  "objectKey": "staging/uploads/{trackId}/{safeFileName}",
  "expiresIn": 900
}
```

4. Frontend uploads file directly to R2 via `PUT uploadUrl`.
5. Frontend calls `POST /uploads/complete` with:

```json
{
  "entityType": "track",
  "entityId": "track uuid",
  "bucketType": "staging",
  "bucket": "mrq-music-masters",
  "objectKey": "staging/uploads/{trackId}/{safeFileName}",
  "contentType": "audio/wav"
}
```

6. Backend updates Supabase track and queues `audio_ingest` job.

## Response and error shape
- Success responses are JSON.
- Validation errors:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": [{ "path": "field", "message": "reason" }]
  }
}
```

- Non-validation errors:

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "...",
    "path": "/endpoint"
  }
}
```
