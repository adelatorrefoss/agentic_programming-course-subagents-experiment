#!/usr/bin/env bash
set -euo pipefail

COORDINATION_DIR="${1:-.agents/coordination}"
LEGACY_REVIEW_EXCEPTIONS="${LEGACY_REVIEW_EXCEPTIONS:-${COORDINATION_DIR}/legacy-review-exceptions.conf}"
failure_count=0
record_count=0

if [[ ! -d "$COORDINATION_DIR" ]]; then
	echo "Coordination directory not found: ${COORDINATION_DIR}" >&2
	exit 1
fi

is_legacy_review_exception() {
	local record_name="$1"

	[[ -f "$LEGACY_REVIEW_EXCEPTIONS" ]] &&
		awk -F'|' -v name="$record_name" '
			$0 !~ /^[[:space:]]*#/ && $1 == name && $2 != "" { found = 1 }
			END { exit(found ? 0 : 1) }
		' "$LEGACY_REVIEW_EXCEPTIONS"
}

field_value() {
	local label="$1"
	local record="$2"

	sed -n "s/^- ${label}:[[:space:]]*//p" "$record" | head -n 1 | tr -d '\`'
}

is_forbidden_value() {
	local value
	value="$(printf '%s' "$1" | tr '[:upper:]' '[:lower:]')"

	[[ -z "$value" || "$value" == *"not requested"* || "$value" == *"pending"* || "$value" == "n/a" || "$value" == "tbd" ]]
}

for record in "$COORDINATION_DIR"/*.md; do
	[[ -f "$record" ]] || continue
	[[ "$(basename "$record")" == "README.md" ]] && continue
	record_count=$((record_count + 1))
	record_error=false
	record_name="$(basename "$record")"

	if is_legacy_review_exception "$record_name"; then
		echo "${record}: legacy code-review exception recorded"
	else
		review_agent="$(field_value "Code-review agent" "$record")"
		review_range="$(field_value "PR code review commit range" "$record")"
		review_verdict="$(field_value "Code-review verdict" "$record")"
		review_evidence="$(field_value "Code-review evidence" "$record")"
		remediation_required="$(field_value "Remediation required" "$record" | tr '[:upper:]' '[:lower:]')"
		remediation_commit="$(field_value "Remediation commit" "$record")"

		if [[ "$review_agent" != "code-review" ]]; then
			echo "${record}: Code-review agent must be 'code-review'" >&2
			record_error=true
		fi

		if [[ ! "$review_range" =~ ^[0-9a-f]{7,40}(\^)?\.\.[0-9a-f]{7,40}$ ]]; then
			echo "${record}: invalid PR code review commit range '${review_range}'" >&2
			record_error=true
		fi

		if [[ "$review_verdict" != "APPROVED" ]]; then
			echo "${record}: Code-review verdict must be APPROVED" >&2
			record_error=true
		fi

		if is_forbidden_value "$review_evidence"; then
			echo "${record}: missing valid Code-review evidence" >&2
			record_error=true
		fi

		if [[ "$remediation_required" != "yes" && "$remediation_required" != "no" ]]; then
			echo "${record}: Remediation required must be 'yes' or 'no'" >&2
			record_error=true
		elif [[ "$remediation_required" == "yes" && ! "$remediation_commit" =~ ^[0-9a-f]{7,40}$ ]]; then
			echo "${record}: remediation requires a commit hash" >&2
			record_error=true
		elif [[ "$remediation_required" == "no" && "$remediation_commit" != "none (no findings)" ]]; then
			echo "${record}: no-remediation closeout must say 'none (no findings)'" >&2
			record_error=true
		fi
	fi

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
