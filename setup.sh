#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
API_ENV_FILE="$ROOT_DIR/apps/api/.env"
WEB_ENV_FILE="$ROOT_DIR/apps/web/.env.local"

prompt_value() {
  local prompt="$1"
  local default_value="${2:-}"
  local secret="${3:-false}"
  local value

  if [[ "$secret" == "true" ]]; then
    if [[ -n "$default_value" ]]; then
      read -r -s -p "$prompt [$default_value]: " value
    else
      read -r -s -p "$prompt: " value
    fi
    echo
  else
    if [[ -n "$default_value" ]]; then
      read -r -p "$prompt [$default_value]: " value
    else
      read -r -p "$prompt: " value
    fi
  fi

  if [[ -z "$value" ]]; then
    value="$default_value"
  fi

  printf '%s' "$value"
}

confirm() {
  local prompt="$1"
  local answer
  read -r -p "$prompt [y/N]: " answer
  [[ "$answer" =~ ^[Yy]$ ]]
}

ensure_dirs() {
  mkdir -p "$(dirname "$API_ENV_FILE")" "$(dirname "$WEB_ENV_FILE")"
}

write_env_files() {
  local node_env="$1"
  local api_port="$2"
  local frontend_origin="$3"
  local database_url="$4"
  local supabase_url="$5"
  local supabase_key="$6"
  local r2_account_id="$7"
  local r2_access_key="$8"
  local r2_secret_key="$9"
  local r2_bucket_name="${10}"
  local r2_upload_prefix="${11}"
  local r2_endpoint="${12}"
  local music_api_url="${13}"

  cat > "$API_ENV_FILE" <<EOT
NODE_ENV=$node_env
PORT=$api_port
FRONTEND_ORIGIN=$frontend_origin
DATABASE_URL=$database_url
SUPABASE_URL=$supabase_url
SUPABASE_SERVICE_ROLE_KEY=$supabase_key
R2_ACCOUNT_ID=$r2_account_id
R2_ACCESS_KEY_ID=$r2_access_key
R2_SECRET_ACCESS_KEY=$r2_secret_key
R2_BUCKET_NAME=$r2_bucket_name
R2_UPLOAD_PREFIX=$r2_upload_prefix
R2_ENDPOINT=$r2_endpoint
EOT

  cat > "$WEB_ENV_FILE" <<EOT
MUSIC_API_URL=$music_api_url
EOT
}

start_docker() {
  echo "Startar Docker Compose..."
  docker compose up --build
}

start_kubernetes() {
  if ! command -v kubectl >/dev/null 2>&1; then
    echo "kubectl saknas i PATH. Installera kubectl och försök igen."
    exit 1
  fi

  echo "Applicerar Kubernetes-overlay: infra/kubernetes/overlays/local"
  kubectl apply -k "$ROOT_DIR/infra/kubernetes/overlays/local"

  cat <<'EOT'
Kubernetes manifests är applicerade.
Tips:
  - Kontrollera pods: kubectl get pods -n music-platform
  - Kontrollera services: kubectl get svc -n music-platform
EOT
}

main() {
  echo "=== music-catalog-core setup ==="
  ensure_dirs

  local node_env
  local api_port
  local frontend_origin
  local database_url
  local supabase_url
  local supabase_key
  local r2_account_id
  local r2_access_key
  local r2_secret_key
  local r2_bucket_name
  local r2_upload_prefix
  local r2_endpoint
  local deployment_target
  local music_api_url

  node_env="$(prompt_value 'NODE_ENV' 'development')"
  api_port="$(prompt_value 'API PORT' '3001')"
  frontend_origin="$(prompt_value 'FRONTEND_ORIGIN' 'http://localhost:3000')"
  database_url="$(prompt_value 'DATABASE_URL (Supabase Postgres)' '' true)"
  supabase_url="$(prompt_value 'SUPABASE_URL' '')"
  supabase_key="$(prompt_value 'SUPABASE_SERVICE_ROLE_KEY' '' true)"
  r2_account_id="$(prompt_value 'R2_ACCOUNT_ID' '')"
  r2_access_key="$(prompt_value 'R2_ACCESS_KEY_ID' '' true)"
  r2_secret_key="$(prompt_value 'R2_SECRET_ACCESS_KEY' '' true)"
  r2_bucket_name="$(prompt_value 'R2_BUCKET_NAME' 'mrq-music-masters')"
  r2_upload_prefix="$(prompt_value 'R2_UPLOAD_PREFIX' 'staging/uploads/')"
  r2_endpoint="$(prompt_value 'R2_ENDPOINT (ex https://<account>.r2.cloudflarestorage.com)' '')"

  echo
  echo "Välj hur applikationen ska startas:"
  echo "  1) Docker Compose"
  echo "  2) Kubernetes (local overlay)"

  deployment_target="$(prompt_value 'Ange val (1/2)' '1')"

  if [[ "$deployment_target" == "1" ]]; then
    music_api_url="http://api:${api_port}"
  else
    music_api_url="http://localhost:${api_port}"
  fi

  write_env_files \
    "$node_env" \
    "$api_port" \
    "$frontend_origin" \
    "$database_url" \
    "$supabase_url" \
    "$supabase_key" \
    "$r2_account_id" \
    "$r2_access_key" \
    "$r2_secret_key" \
    "$r2_bucket_name" \
    "$r2_upload_prefix" \
    "$r2_endpoint" \
    "$music_api_url"

  echo "Skrev env-filer:"
  echo "  - $API_ENV_FILE"
  echo "  - $WEB_ENV_FILE"

  if ! confirm 'Vill du starta applikationen nu?'; then
    echo "Klart. Start hoppar över på begäran."
    exit 0
  fi

  case "$deployment_target" in
    1)
      start_docker
      ;;
    2)
      start_kubernetes
      ;;
    *)
      echo "Ogiltigt val: $deployment_target"
      exit 1
      ;;
  esac
}

main "$@"
