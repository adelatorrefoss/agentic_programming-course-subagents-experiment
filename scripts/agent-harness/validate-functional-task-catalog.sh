#!/usr/bin/env bash
set -euo pipefail

catalogs=("$@")
if [[ "${#catalogs[@]}" -eq 0 ]]; then
	read -r -a catalogs <<< "${HARNESS_FUNCTIONAL_CATALOGS:-TODO.md}"
fi

failure_count=0

report_matches() {
	local catalog="$1"
	local description="$2"
	local matches="$3"

	if [[ -n "$matches" ]]; then
		echo "${catalog}: ${description} belongs to the agent harness, not functional task scope:" >&2
		printf '%s\n' "$matches" >&2
		failure_count=$((failure_count + 1))
	fi
}

for catalog in "${catalogs[@]}"; do
	if [[ ! -f "$catalog" ]]; then
		echo "Functional task catalog not found: ${catalog}" >&2
		failure_count=$((failure_count + 1))
		continue
	fi

	structural_matches="$(grep -nE '^#{2,4} (Prompt de ejemplo|Reparto recomendado|Criterios comunes( de coordinación)?)$' "$catalog" || true)"
	report_matches "$catalog" "prompt, role assignment, or common coordination sections" "$structural_matches"

	scope_items="$(awk '
		/^### Alcance$/ { in_scope=1; next }
		/^## / { in_scope=0 }
		in_scope && /^- \[[ xX]\]/ { print NR ":" $0 }
	' "$catalog")"

	harness_items="$(printf '%s\n' "$scope_items" | grep -Ei '(^|[^[:alnum:]_])((database|backend|frontend|testing)-engineer|pruebas?|tests?|npm run|reflect-metadata|@Service|DIOD|Object Mothers?|Mock Objects?|code-review|harness-retro|lint|build)([^[:alnum:]_]|$)' || true)"
	report_matches "$catalog" "test, role, architecture, command, review, or closeout items" "$harness_items"
done

if [[ "$failure_count" -ne 0 ]]; then
	exit 1
fi

echo "Functional task catalog validation passed: ${#catalogs[@]} catalog(s)."
