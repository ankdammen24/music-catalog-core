#!/usr/bin/env bash
set -euo pipefail

if [[ -f .env ]]; then
  set -a
  source .env
  set +a
fi

./scripts/check-env.sh

if [[ ! -d node_modules ]]; then
  npm ci
fi

docker compose build api

docker compose up -d

./scripts/smoke-test.sh "http://localhost:${PORT:-3000}"

echo "Deploy complete"
