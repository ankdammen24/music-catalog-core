# music-catalog-core

Unified backend monorepo for Media Rosenqvist catalog products (Radio Core, Music Core, Radio Uppsala, distribution tooling, and future Lovable/admin frontend).

## Single-repo policy
This is the only active backend repository. API + workers + shared + infra all live here.

## Monorepo structure
- `apps/api` — Fastify + TypeScript API (Clerk auth, Supabase metadata, R2 signed URLs)
- `workers/audio-worker` — audio processing skeleton
- `workers/distribution-worker` — distribution/export skeleton
- `workers/radio-sync-worker` — radio sync skeleton
- `packages/shared` — shared types/constants
- `infra/supabase/migrations` — database migrations
- `docs` — architecture, auth, API, R2 notes, audio ingest flow

## Core system model
- Supabase Postgres = metadata source of truth.
- Cloudflare R2 = file source of truth.
- No separate staging bucket is used; staging uploads are key prefixes under `mrq-music-masters`.
- Clerk = auth provider.
- Supabase Auth is not used.
- Database stores R2 object keys, never permanent public URLs.

## Environment setup
1. Copy `.env.example` to `.env`
2. Fill required values for Supabase, Clerk, and R2

## Local development
- Install deps: `pnpm install`
- Run API: `pnpm dev:api`
- Run workers:
  - `pnpm dev:audio-worker`
  - `pnpm dev:distribution-worker`
  - `pnpm dev:radio-sync-worker`

## Docker local development
Run all runtime services:
- `docker compose up --build`

## How future Lovable frontend should consume this backend
- Authenticate users with Clerk.
- Call API endpoints in `apps/api`.
- Request short-lived signed R2 URLs from API when needed.
- Never use Supabase service-role keys in frontend code.
