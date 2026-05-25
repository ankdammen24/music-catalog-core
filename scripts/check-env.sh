#!/usr/bin/env bash
set -euo pipefail

required=(
  DATABASE_URL SUPABASE_URL SUPABASE_SERVICE_ROLE_KEY ENTRA_TENANT_ID ENTRA_ISSUER ENTRA_JWKS_URI ENTRA_AUDIENCE AUTH_API_URL
  STORAGE_PROVIDER R2_ACCOUNT_ID R2_ACCESS_KEY_ID R2_SECRET_ACCESS_KEY R2_BUCKET R2_ENDPOINT R2_PUBLIC_BASE_URL
  REDIS_URL PORT NODE_ENV CORS_ORIGINS
)

missing=()
for key in "${required[@]}"; do
  if [[ -z "${!key:-}" ]]; then
    missing+=("$key")
  fi
done

if [[ "${STORAGE_PROVIDER:-}" != "r2" ]]; then
  echo "STORAGE_PROVIDER must be r2 for this deployment target"
  exit 1
fi

if (( ${#missing[@]} > 0 )); then
  echo "Missing required env vars: ${missing[*]}"
  exit 1
fi

echo "Environment looks good."
