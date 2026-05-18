# music-catalog-core

Backend/API + workers för Media Rosenqvist musik-katalog (inte frontend, inte radio-core).

## Lokal utveckling
1. Kopiera env: `cp .env.example .env`
2. Installera: `npm ci`
3. Starta API: `npm run dev`
4. Starta worker separat: `npm run worker`

## Docker development
- Build dev image: `docker build -f docker/Dockerfile.dev -t music-catalog-core:dev .`
- Kör lokalt: `docker run --rm -p 4000:4000 --env-file .env music-catalog-core:dev`

## Production deployment
Deployment sker med images i GHCR och compose-filer i `infra/`.
- Staging compose: `infra/docker-compose.staging.yml`
- Production compose: `infra/docker-compose.prod.yml`
- Deployment-script: `infra/deploy.sh`

På VPS körs i compose-katalogen:
```bash
./deploy.sh staging
# eller
./deploy.sh production
```

## GHCR setup
Image-namn:
- `ghcr.io/mediarosenqvist/music-catalog-core:latest`
- `ghcr.io/mediarosenqvist/music-catalog-core:vX.Y.Z`
- `ghcr.io/mediarosenqvist/music-catalog-core:sha-<commit>`

Sätt package visibility i GitHub Packages till privat eller public enligt miljökrav.

## GitHub secrets
Följande secrets krävs:
- `GHCR_TOKEN`
- `VPS_HOST`
- `VPS_USER`
- `VPS_SSH_KEY`
- `VPS_PATH`

## VPS setup
VPS behöver inte ha repo-kod. Endast:
1. Docker + Docker Compose installerat.
2. En deploy-katalog (exempel: `/opt/music-catalog-core`) med:
   - `docker-compose.prod.yml`
   - `docker-compose.staging.yml`
   - `.env.production`
   - `.env.staging`
   - `deploy.sh`
3. Inloggning till GHCR på servern med token som har `read:packages`.

## Rollback-strategi
1. Byt image-tag i compose-fil till tidigare stabil tag, t.ex. `v1.0.0`.
2. Kör:
```bash
docker compose -f docker-compose.prod.yml --env-file .env.production pull
docker compose -f docker-compose.prod.yml --env-file .env.production up -d
```

## CI/CD översikt
- **CI** (`.github/workflows/ci.yml`): PR + push => install, typecheck, lint, test, build.
- **Docker build** (`.github/workflows/docker-build.yml`): push till `main` och semver-tags => build + push till GHCR.
- **Deploy** (`.github/workflows/deploy.yml`): deploy via SSH till VPS (manuell eller vid push main).
