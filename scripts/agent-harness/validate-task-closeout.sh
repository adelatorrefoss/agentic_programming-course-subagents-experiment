#!/usr/bin/env bash
set -euo pipefail

COORDINATION_DIR="${1:-.agents/coordination}"
failure_count=0
record_count=0

if [[ ! -d "$COORDINATION_DIR" ]]; then
	echo "Coordination directory not found: ${COORDINATION_DIR}" >&2
	exit 1
fi

for record in "$COORDINATION_DIR"/*.md; do
	[[ -f "$record" ]] || continue
	[[ "$(basename "$record")" == "README.md" ]] && continue
	record_count=$((record_count + 1))
	record_error=false

	if ! grep -q '^## Acceptance evidence$' "$record"; then
		echo "${record}: missing Acceptance evidence section" >&2
		record_error=true
	fi

	if ! grep -q '^| ID | Acceptance criterion / TODO item | Implementation artifact | Passing verification |$' "$record"; then
		echo "${record}: missing acceptance evidence table" >&2
		record_error=true
	fi

	evidence_rows="$(grep -E '^\| (AC|AH|TASK)-[^|]+\|' "$record" || true)"
	if [[ -z "$evidence_rows" ]]; then
		echo "${record}: no acceptance evidence rows" >&2
		record_error=true
	elif ! printf '%s\n' "$evidence_rows" | awk -F'|' '
		function trim(value) {
			gsub(/^[[:space:]]+|[[:space:]]+$/, "", value)
			return tolower(value)
		}
		{
			for (column = 2; column <= 5; column++) {
				value = trim($column)
				if (value == "" || value == "pending" || value == "todo" || value == "n/a" || value == "tbd") {
					exit 1
				}
			}
		}
	'; then
		echo "${record}: acceptance evidence contains an empty or pending value" >&2
		record_error=true
	fi

	if [[ "$record_error" == true ]]; then
		failure_count=$((failure_count + 1))
	fi
done

if [[ "$record_count" -eq 0 ]]; then
	echo "No task coordination records found in ${COORDINATION_DIR}." >&2
	exit 1
fi

if [[ "$failure_count" -gt 0 ]]; then
	echo "Task closeout validation failed: ${failure_count} record(s)." >&2
	exit 1
fi

echo "Task closeout evidence valid: ${record_count} record(s)."
