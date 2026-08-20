#!/usr/bin/env bash
set -euo pipefail

OLLAMA_MODEL="${OLLAMA_MODEL:-qwen3-embedding:0.6b}"
OLLAMA_CLI="${OLLAMA_CLI:-ollama}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
NO_CACHE=false

if [[ "${1:-}" == "--no-cache" ]]; then
	NO_CACHE=true
elif [[ "${1:-}" != "" ]]; then
	echo "Usage: $0 [--no-cache]" >&2
	exit 2
fi

bash "${SCRIPT_DIR}/ollama-healthcheck.sh" --service-only

if [[ "$NO_CACHE" == true ]]; then
	if "$OLLAMA_CLI" list | awk -v model="$OLLAMA_MODEL" \
		'NR > 1 && $1 == model { found = 1 } END { exit found ? 0 : 1 }'
	then
		echo "Removing cached Ollama model ${OLLAMA_MODEL}."
		"$OLLAMA_CLI" rm "$OLLAMA_MODEL"
	fi
fi

echo "Pulling pinned Ollama model ${OLLAMA_MODEL}."
"$OLLAMA_CLI" pull "$OLLAMA_MODEL"
bash "${SCRIPT_DIR}/ollama-healthcheck.sh"
