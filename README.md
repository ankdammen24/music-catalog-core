# music-catalog-core
Backend/API core för Media Rosenqvist musik-katalog.
## Vad det är
API + workers + Postgres schema + R2 integration för artister, releaser, tracks, uploads och processing.
## Vad det inte är
Inte frontend, inte radio-core, inte fristående auth-system.
## Stack
Node.js, TypeScript, Express, Supabase Postgres, Clerk JWT, Cloudflare R2, ffmpeg/ffprobe, Docker.
## Lokal setup
1. `cp .env.example .env`
2. Fyll env-värden.
3. `npm install`
4. `npm run dev` (API) och `npm run worker` (worker)
## Docker
`docker compose up --build`
## Supabase setup
Kör `supabase/schema.sql`, `supabase/policies.sql`, `supabase/seed.sql` i Supabase SQL editor.
## R2 setup
En bucket: `mrq-music-masters`, med prefixes `staging/uploads`, `masters/originals`, `masters/flac`, `artwork`, `exports`.
## Clerk setup
Sätt `CLERK_JWT_ISSUER` + `CLERK_JWKS_URL`; API verifierar bearer-token och mappar org/user i databasen.
## API-översikt
`/health`, `/artists`, `/releases`, `/tracks`, `/uploads`, `/processing`.
## Nästa steg
RLS policies, kö-system (Redis/Queue), förbättrad EBU R128 loudness pipeline, distribution/export connectors.
