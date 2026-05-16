# music-catalog-core

Stabil backend/API för Soundloom (`soundloom-core`). Frontend finns i separat repo och ska **endast** prata med detta API.

## Vad music-catalog-core är
- Enda aktiva backend-repot för katalogdata, playback och worker-flöden.
- Supabase Postgres är source-of-truth för metadata.
- Cloudflare R2 är source-of-truth för media/artwork/export.
- Inga permanenta publika fil-URL:er lagras i databasen, endast object keys.

## API-endpoints (`/api/v1`)
- `GET /api/v1/health`
- `GET /api/v1/releases`
- `GET /api/v1/artists`
- `GET /api/v1/tracks`
- `GET /api/v1/search?q=`
- `POST /api/v1/playback/token`

Responsformat:
- Success: `{ "ok": true, "data": ... }`
- Error: `{ "ok": false, "error": { "code": "...", "message": "..." } }`

## Hur soundloom-core kopplar mot API:t
- `soundloom-core` anropar endast backend-API:t.
- Ingen direktkoppling från frontend till Supabase eller R2.
- Playback sker genom kortlivade signed URL:er från `POST /api/v1/playback/token`.

## Env setup
Kopiera `.env.example` till `.env` och fyll i värden.

Viktiga variabler:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `R2_ENDPOINT`
- `R2_ACCOUNT_ID`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- `R2_BUCKET_NAME=mrq-music-masters`
- `FRONTEND_ORIGIN` (t.ex. `http://localhost:3000` eller `https://soundloom.mediarosenqvist.com`)

## Lokal körning
- `npm install`
- `npm run dev`
- Kontroll:
  - `curl http://localhost:3001/api/v1/health`
  - `curl http://localhost:3001/api/v1/releases`
  - `curl http://localhost:3001/api/v1/artists`
  - `curl http://localhost:3001/api/v1/tracks`

## R2 playback flow
1. Frontend skickar `trackId` till `POST /api/v1/playback/token`.
2. Backend validerar `trackId`, playable-status och rights-status.
3. Backend väljer rätt audio object key i R2.
4. Backend returnerar kortlivad signed URL (15 min).

## Upload/staging-princip
All staging-upload sker under prefix i samma bucket:
- `mrq-music-masters/staging/uploads/...`

## Enkel testbar struktur
- `src/server.ts` (entry)
- `src/app.ts`
- `src/config`
- `src/routes`
- `src/services`
- `src/repositories`
- `src/lib`
- `src/middleware`
- `src/types`
