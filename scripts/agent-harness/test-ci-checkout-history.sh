#!/usr/bin/env bash
set -euo pipefail

workflow=".github/workflows/ci.yml"

if ! grep -q 'npm run agents:validate' "$workflow"; then
	echo "CI workflow does not run the agent configuration validation." >&2
	exit 1
fi

checkout_block="$({
	sed -n '/uses: actions\/checkout@/,/^[[:space:]]*- name:/p' "$workflow" || true
} | sed '$d')"

if ! printf '%s\n' "$checkout_block" | grep -Eq '^[[:space:]]+fetch-depth:[[:space:]]*0[[:space:]]*$'; then
	echo "CI must fetch full Git history before validating coordination commit evidence." >&2
	exit 1
fi

echo "CI checkout history validation passed."
