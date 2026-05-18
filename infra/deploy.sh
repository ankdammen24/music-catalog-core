#!/usr/bin/env bash
set -euo pipefail

ENVIRONMENT=${1:-staging}
if [[ "$ENVIRONMENT" == "production" ]]; then
  COMPOSE_FILE="docker-compose.prod.yml"
  ENV_FILE=".env.production"
else
  COMPOSE_FILE="docker-compose.staging.yml"
  ENV_FILE=".env.staging"
fi

echo "Deploying $ENVIRONMENT with $COMPOSE_FILE"

export COMPOSE_FILE
export COMPOSE_PROJECT_NAME="music-catalog-core-$ENVIRONMENT"

docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" pull
docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" up -d --remove-orphans
docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" ps
docker image prune -af --filter "until=168h"
