#!/usr/bin/env bash
set -euo pipefail

base_url="${1:-http://localhost:3000}"

for path in /health /health/database /health/storage /health/auth-config /health/redis; do
  echo "Testing ${base_url}${path}"
  curl -fsS "${base_url}${path}" >/dev/null
  echo "OK ${path}"
done
