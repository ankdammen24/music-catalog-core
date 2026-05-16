# AGENTS.md

## Repository policy
- `music-catalog-core` is the **only active backend repository**.
- Never split API/workers/infra into multiple repositories unless explicitly requested by a human.

## Architecture guardrails
- Keep Supabase Postgres as source of truth for metadata.
- Keep Cloudflare R2 as source of truth for media/artwork/export files.
- Keep Clerk as authentication provider.
- Do not introduce Supabase Auth.

## Security guardrails
- Do not hardcode secrets.
- Keep service role keys in backend/server code only.
- Never store permanent public file URLs in the database; store object keys.

## Engineering guardrails
- Keep services modular.
- Prefer clear TypeScript and Zod validation.
- Do not create duplicate app-specific catalog databases.
