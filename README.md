# music-catalog-core monorepo

Detta repo är nu ett gemensamt deploybart monorepo för backend + frontend.

## Struktur

```txt
apps/
  api/        # backend (äger DB, R2, upload, playback-token, rights)
  web/        # soundloom frontend
packages/
  shared/     # delade TypeScript-typer
infra/
  docker/
  kubernetes/
    base/
    overlays/
      local/
      staging/
      production/
```

## Arkitekturgränser
- `apps/web` pratar med backend via `/api` proxy.
- `apps/web` pratar **inte** direkt med Supabase eller R2.
- `apps/api` är enda tjänsten som pratar med Supabase och R2.
- Bucket för media/upload: `mrq-music-masters`.
- Upload-prefix för staging: `staging/uploads/`.

## Lokalt (utan Docker)
1. `npm install`
2. Kopiera env-filer:
   - `cp apps/api/.env.example apps/api/.env`
   - `cp apps/web/.env.example apps/web/.env.local`
3. Kör allt:
   - `npm run dev`

Separat:
- `npm run dev:api`
- `npm run dev:web`

Build/lint:
- `npm run build`
- `npm run build:api`
- `npm run build:web`
- `npm run lint`

## Docker Compose
- `docker compose up --build`
- API: `http://localhost:3001`
- Web: `http://localhost:3000`

Compose använder:
- `Dockerfile.api`
- `Dockerfile.web`
- `apps/api/.env`
- `apps/web/.env.local`

## Frontend proxy
`apps/web` använder `MUSIC_API_URL` som target för Vite proxy:
- Docker: `MUSIC_API_URL=http://api:3001`
- Lokal utveckling: `MUSIC_API_URL=http://localhost:3001`

Browser går fortsatt via frontend och `/api` proxas till backend.

## Kubernetes-förberedelse
`infra/kubernetes/base` innehåller manifests för:
- Namespace (`music-platform`)
- API Deployment + Service
- Web Deployment + Service
- ConfigMap
- Secret template (inga riktiga hemligheter)
- Ingress template

Images (placeholders):
- `ghcr.io/OWNER/music-catalog-api:latest`
- `ghcr.io/OWNER/soundloom-web:latest`

Overlays finns i:
- `infra/kubernetes/overlays/local`
- `infra/kubernetes/overlays/staging`
- `infra/kubernetes/overlays/production`

## Placeholders
- Ingress-host är exempelvärde.
- Secret-template har tomma värden.
- GHCR image-owner (`OWNER`) ska ersättas.

## Nästa steg för CI/CD
1. Bygg och push images för `apps/api` och `apps/web`.
2. Ersätt `OWNER` i K8s overlays.
3. Lägg in secrets via extern secret manager/CI.
4. Lägg till pipeline-steg för test, build, image scan och deploy per overlay.
