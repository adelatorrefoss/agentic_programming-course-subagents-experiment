#!/usr/bin/env bash
set -euo pipefail

OLLAMA_URL="${OLLAMA_URL:-http://127.0.0.1:11434}"
OLLAMA_MODEL="${OLLAMA_MODEL:-qwen3-embedding:0.6b}"
OLLAMA_HEALTHCHECK_TIMEOUT="${OLLAMA_HEALTHCHECK_TIMEOUT:-60}"
CHECK_MODEL=true

if [[ "${1:-}" == "--service-only" ]]; then
	CHECK_MODEL=false
fi

OLLAMA_URL="${OLLAMA_URL%/}"
deadline=$((SECONDS + OLLAMA_HEALTHCHECK_TIMEOUT))
last_error="Ollama did not respond"

while (( SECONDS < deadline )); do
	if tags="$(
		curl --fail --silent --show-error --max-time 5 \
			"${OLLAMA_URL}/api/tags" 2>&1
	)"; then
		if [[ "$CHECK_MODEL" == false ]]; then
			echo "Ollama service is ready at ${OLLAMA_URL}."
			exit 0
		fi

		if printf '%s' "$tags" | grep -F "\"name\":\"${OLLAMA_MODEL}\"" >/dev/null; then
			echo "Ollama model ${OLLAMA_MODEL} is ready."
			exit 0
		fi

		last_error="Ollama is ready, but model ${OLLAMA_MODEL} is not installed"
	else
		last_error="$tags"
	fi

	sleep 2
done

echo "Ollama healthcheck failed: ${last_error}" >&2
echo "Expected service: ${OLLAMA_URL}" >&2
echo "Expected model: ${OLLAMA_MODEL}" >&2
exit 1
