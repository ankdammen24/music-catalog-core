# music-catalog-core
Backend/API + workers för Media Rosenqvist musik-katalog.

## Vad projektet är
API-kärna för artists, releases, tracks, upload-jobs, processing-jobs, metadata och ljudprocessning.

## Vad projektet inte är
Inte frontend (soundloom-core), inte radio-core, inte ett auth-system.

## Stack
Node.js, TypeScript, Express, Zod, Supabase Postgres, Clerk JWT, Cloudflare R2, ffmpeg/ffprobe, Docker.

## Lokal setup
1. `cp .env.example .env`
2. Fyll variabler.
3. `npm install`
4. `npm run dev`
5. Worker: `npm run dev:worker`

## Env-variabler
Se `.env.example`.

## Docker
- `docker compose up --build api`
- `docker compose up --build`

## Supabase setup
Kör SQL i ordning: `supabase/schema.sql`, `supabase/policies.sql`, `supabase/seed.sql`.

## R2 setup
En bucket: `mrq-music-masters`, med prefix staging/, masters/, artwork/, exports/.

## Clerk setup
Ange issuer + JWKS URL i env. Alla endpoints utom `/health` kräver Bearer JWT.

## API-översikt
/health, /artists, /releases, /tracks, /uploads, /processing enligt kravspec.

## Nästa steg
Inför kö-system (Redis/SQS), förbättra EBU R128-mätning, lägg till distribution/export workflows.
