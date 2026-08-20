#!/usr/bin/env bash

set -euo pipefail

project_root="${1:-.}"
config="$project_root/stryker.config.mjs"

[[ -f "$config" ]] || exit 0

require_text() {
	local file="$1"
	local pattern="$2"
	local message="$3"

	if ! grep -Eq "$pattern" "$file"; then
		echo "Mutation config invalid: $message" >&2
		exit 1
	fi
}

require_text "$project_root/package.json" '"test:mutation"[[:space:]]*:[[:space:]]*"stryker run"' "missing executable mutation command"
require_text "$project_root/package.json" '"test:mutation:dry"[[:space:]]*:[[:space:]]*"stryker run --dryRunOnly"' "missing compatibility dry-run command"
require_text "$config" 'coverageAnalysis:[[:space:]]*"off"' "mixed Jest environments require the documented coverage fallback"
require_text "$config" 'Per-test coverage requires Stryker-specific Jest environments' "coverage fallback lacks its mixed-environment rationale"
require_text "$config" 'cleanTempDir:[[:space:]]*"always"' "temporary sandboxes must be cleaned after success and failure"
require_text "$config" 'tempDirName:[[:space:]]*"\.stryker-tmp"' "temporary sandbox root must be explicit"
require_text "$project_root/jest.config.js" 'testEnvironment:[[:space:]]*"node"' "the expected base Node Jest environment was not found"

if ! grep -R -Eq '@jest-environment jsdom' "$project_root/tests"; then
	echo "Mutation config invalid: expected a file-level jsdom Jest environment probe" >&2
	exit 1
fi

for generated_root in '.stryker-tmp' 'reports/mutation'; do
	require_text "$project_root/.gitignore" "$generated_root" "$generated_root must be ignored by Git"
	require_text "$project_root/eslint.config.mjs" "$generated_root" "$generated_root must be ignored by repository-wide lint"
done

echo "Mutation testing configuration valid: mixed Jest environments and generated roots are guarded."
