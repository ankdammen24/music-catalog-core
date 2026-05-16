# music-catalog-core
Production-ready backend monorepo for Media Rosenqvist music catalog.

## What this backend does
- Central metadata API for artists/albums/tracks/releases/playlists.
- Private upload/download flows with Cloudflare R2 signed URLs.
- Clerk-authenticated access with role-aware backend controls.
- Background processing worker skeleton for audio normalization/preview generation.

## System model
- Supabase Postgres = metadata source of truth.
- Cloudflare R2 = file source of truth.
- Clerk = authentication provider.
- Supabase Auth is not used.
- Only R2 object keys are stored in DB (no permanent public URLs).

## Local run
1. Copy `.env.example` to `.env` and fill values.
2. `pnpm install`
3. `pnpm --filter @mrq/api dev`

## Docker
`docker compose up --build`

## Future Lovable frontend
Frontend should authenticate with Clerk, call this API, and never access service role keys directly.
