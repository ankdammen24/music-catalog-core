# music-catalog-core
Backend/API + workers för Media Rosenqvist musik-katalog.

## Vad projektet är
API-kärna för artists, releases, tracks, upload-jobs, processing-jobs, metadata och ljudprocessning.

## Vad projektet inte är
Inte frontend (soundloom-core), inte radio-core, inte ett auth-system.

## Stack
Node.js, TypeScript, Express, Zod, Supabase Postgres, Microsoft Entra External ID (JWT via Media Rosenqvist Connect), Cloudflare R2, ffmpeg/ffprobe, Docker.

## Lokal setup
1. `cp .env.example .env`
2. Fyll variabler.
3. `npm install`
4. `npm run dev`
5. Worker: `npm run dev:worker`

## Env-variabler
Se `.env.example` och `docs/ENV.md`.

## Docker
- `docker compose up --build api`
- `docker compose up --build`
- API exponeras på host-port `3001`.

## Supabase setup
Kör SQL i ordning: `supabase/schema.sql`, `supabase/policies.sql`, `supabase/seed.sql`.

## R2 setup
En bucket: `mrq-music-masters`, med prefix staging/, masters/, artwork/, exports/.

## Auth setup
Central auth finns i Connect: `https://connect.mediarosenqvist.com`.
Frontend skickar `Authorization: Bearer <access_token>` där token kommer från Microsoft Entra External ID och är utfärdad för audience `api://a523e8c6-0ef0-42f3-aa97-4b465bf78642`.

## API-översikt
/health, /artists, /releases, /tracks, /uploads, /processing enligt kravspec.


## Connect authentication
Connect (`https://connect.mediarosenqvist.com`) is the central authentication and identity gateway. `music-catalog-core` does not own login/session management; it validates Connect JWTs on protected routes.

### Required environment variables
- `CONNECT_REQUIRED=true`
- `CONNECT_ISSUER=https://connect.mediarosenqvist.com`
- `CONNECT_JWKS_URL=https://connect.mediarosenqvist.com/.well-known/jwks.json`
- `CONNECT_AUDIENCE=music-catalog-core`

If `CONNECT_REQUIRED=true`, startup env validation fails with clear errors when any required Connect value is missing.

### Example JWT claims
```json
{
  "sub": "user_123",
  "email": "user@example.com",
  "name": "User Name",
  "app": "music_catalog",
  "roles": ["catalog_admin"],
  "permissions": [
    "catalog.read",
    "artists.manage",
    "releases.manage",
    "tracks.upload",
    "tracks.process",
    "metadata.edit"
  ]
}
```

### Route-based permission checks
- `GET /artists`, `GET /releases`, `GET /tracks` -> `catalog.read`
- `POST/PATCH/DELETE /artists` -> `artists.manage`
- `POST/PATCH/DELETE /releases` -> `releases.manage`
- `POST /tracks/upload` -> `tracks.upload`
- `POST /tracks/:id/process` -> `tracks.process`
- `PATCH /tracks/:id` -> `metadata.edit`

`platform_admin` in roles bypasses permission checks.

### Verification examples
```bash
# allowed
curl -H "Authorization: Bearer <CONNECT_TOKEN>" \
  https://api.mediarosenqvist.com/artists

# no token => 401
curl https://api.mediarosenqvist.com/artists

# valid token but missing permission => 403
curl -H "Authorization: Bearer <TOKEN_WITHOUT_catalog.read>" \
  https://api.mediarosenqvist.com/artists

# platform_admin role => allowed even if permission is missing
curl -H "Authorization: Bearer <PLATFORM_ADMIN_TOKEN>" \
  https://api.mediarosenqvist.com/artists
```
