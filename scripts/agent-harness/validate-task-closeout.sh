#!/usr/bin/env bash
set -euo pipefail

COORDINATION_DIR="${1:-.agents/coordination}"
failure_count=0
record_count=0

if [[ ! -d "$COORDINATION_DIR" ]]; then
	echo "Coordination directory not found: ${COORDINATION_DIR}" >&2
	exit 1
fi

is_legacy_review_exception() {
	local record_name="$1"

	case "$record_name" in
		harness-todos-2026-08-20.md | harness-todos-ah009-ah012-2026-08-20.md)
			return 0
			;;
		*)
			return 1
			;;
	esac
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

commit_is_in_range() {
	local commit="$1"
	local range_base="$2"
	local range_head="$3"

	git merge-base --is-ancestor "$commit" "$range_head" &&
		! git merge-base --is-ancestor "$commit" "$range_base"
}

for record in "$COORDINATION_DIR"/*.md; do
	[[ -f "$record" ]] || continue
	[[ "$(basename "$record")" == "README.md" ]] && continue
	record_count=$((record_count + 1))
	record_error=false
	record_name="$(basename "$record")"
	lifecycle="$(field_value "Lifecycle" "$record")"
	[[ -n "$lifecycle" ]] || lifecycle="closed"

	case "$lifecycle" in
		in-progress)
			echo "${record}: in-progress coordination record accepted"
			continue
			;;
		closing | closed)
			;;
		*)
			echo "${record}: Lifecycle must be 'in-progress', 'closing', or 'closed'" >&2
			failure_count=$((failure_count + 1))
			continue
			;;
	esac

	if is_legacy_review_exception "$record_name"; then
		echo "${record}: legacy code-review exception recorded"
	else
		implementation_commit="$(field_value "Implementation commit" "$record")"
		review_agent="$(field_value "Code-review agent" "$record")"
		review_range="$(field_value "PR code review commit range" "$record")"
		review_verdict="$(field_value "Code-review verdict" "$record")"
		review_evidence="$(field_value "Code-review evidence" "$record")"
		review_report="$(field_value "Code-review report" "$record")"
		remediation_required="$(field_value "Remediation required" "$record" | tr '[:upper:]' '[:lower:]')"
		remediation_commit="$(field_value "Remediation commit" "$record")"

		if [[ "$review_agent" != "code-review" ]]; then
			echo "${record}: Code-review agent must be 'code-review'" >&2
			record_error=true
		fi

		range_valid=false
		if [[ "$review_range" =~ ^([0-9a-f]{7,40})(\^)?\.\.([0-9a-f]{7,40})$ ]]; then
			range_base="${BASH_REMATCH[1]}${BASH_REMATCH[2]}"
			range_head="${BASH_REMATCH[3]}"
			if git rev-parse --verify --quiet "${range_base}^{commit}" >/dev/null &&
				git rev-parse --verify --quiet "${range_head}^{commit}" >/dev/null
			then
				range_valid=true
			fi
		fi
		if [[ "$range_valid" != true ]]; then
			echo "${record}: invalid PR code review commit range '${review_range}'" >&2
			record_error=true
		fi

		if [[ ! "$implementation_commit" =~ ^[0-9a-f]{7,40}$ ]] ||
			! git rev-parse --verify --quiet "${implementation_commit}^{commit}" >/dev/null
		then
			echo "${record}: Implementation commit must be an existing commit hash" >&2
			record_error=true
		elif [[ "$range_valid" == true ]] && ! commit_is_in_range "$implementation_commit" "$range_base" "$range_head"; then
			echo "${record}: implementation commit is outside the approved review range" >&2
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

		if [[ ! "$review_report" =~ ^\.agents/reviews/[A-Za-z0-9._-]+\.md$ || ! -f "$review_report" ]]; then
			echo "${record}: Code-review report must reference an existing file under .agents/reviews/" >&2
			record_error=true
		else
			report_agent="$(field_value "Agent" "$review_report")"
			report_range="$(field_value "Commit range" "$review_report")"
			report_verdict="$(field_value "Verdict" "$review_report")"
			report_evidence="$(field_value "Evidence" "$review_report")"
			if [[ "$report_agent" != "$review_agent" || "$report_range" != "$review_range" || "$report_verdict" != "$review_verdict" || "$report_evidence" != "$review_evidence" ]]; then
				echo "${record}: Code-review report does not match coordination evidence" >&2
				record_error=true
			fi
			if ! grep -q '^- Findings:' "$review_report"; then
				echo "${record}: Code-review report is missing Findings" >&2
				record_error=true
			fi
		fi

		if [[ "$remediation_required" != "yes" && "$remediation_required" != "no" ]]; then
			echo "${record}: Remediation required must be 'yes' or 'no'" >&2
			record_error=true
		elif [[ "$remediation_required" == "yes" ]]; then
			if [[ ! "$remediation_commit" =~ ^[0-9a-f]{7,40}$ ]] ||
				! git rev-parse --verify --quiet "${remediation_commit}^{commit}" >/dev/null
			then
				echo "${record}: remediation requires an existing commit hash" >&2
				record_error=true
			elif [[ "$range_valid" == true ]] && ! commit_is_in_range "$remediation_commit" "$range_base" "$range_head"; then
				echo "${record}: remediation commit is outside the approved review range" >&2
				record_error=true
			fi
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
