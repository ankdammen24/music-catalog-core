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
