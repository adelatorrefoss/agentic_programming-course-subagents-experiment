#!/usr/bin/env bash
set -euo pipefail

POSTGRES_SERVICE="${POSTGRES_SERVICE:-postgres}"
POSTGRES_USER="${POSTGRES_USER:-supabase_admin}"
POSTGRES_DATABASE="${POSTGRES_DATABASE:-postgres}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if ! command -v docker >/dev/null 2>&1; then
	echo "Docker is required to check PostgreSQL." >&2
	exit 1
fi

if ! docker compose exec -T "$POSTGRES_SERVICE" \
	pg_isready -U "$POSTGRES_USER" -d "$POSTGRES_DATABASE" >/dev/null
then
	echo "PostgreSQL is not ready. Start it with: docker compose up -d --wait postgres" >&2
	exit 1
fi

echo "PostgreSQL is ready."
bash "${SCRIPT_DIR}/ollama-healthcheck.sh"
