#!/usr/bin/env bash

set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
validator="$repo_root/scripts/agent-harness/validate-mutation-config.sh"
fixture="$(mktemp -d)"
trap 'rm -rf "$fixture"' EXIT

mkdir -p "$fixture/tests"
cp "$repo_root/package.json" "$fixture/package.json"
cp "$repo_root/stryker.config.mjs" "$fixture/stryker.config.mjs"
cp "$repo_root/jest.config.js" "$fixture/jest.config.js"
cp "$repo_root/.gitignore" "$fixture/.gitignore"
cp "$repo_root/eslint.config.mjs" "$fixture/eslint.config.mjs"
printf '/** @jest-environment jsdom */\n' > "$fixture/tests/browser.test.ts"

"$validator" "$fixture" >/dev/null

assert_rejected() {
	local expected="$1"
	shift
	if "$validator" "$fixture" >"$fixture/output.log" 2>&1; then
		echo "Expected mutation validation to reject: $expected" >&2
		exit 1
	fi
	if ! rg -q "$expected" "$fixture/output.log"; then
		echo "Mutation validation failed without expected message: $expected" >&2
		exit 1
	fi
}

sed -i 's/cleanTempDir: "always"/cleanTempDir: "true"/' "$fixture/stryker.config.mjs"
assert_rejected 'cleaned after success and failure'
cp "$repo_root/stryker.config.mjs" "$fixture/stryker.config.mjs"

sed -i '/reports\/mutation/d' "$fixture/eslint.config.mjs"
assert_rejected 'reports/mutation must be ignored by repository-wide lint'
cp "$repo_root/eslint.config.mjs" "$fixture/eslint.config.mjs"

sed -i '/Per-test coverage requires Stryker-specific Jest environments/d' "$fixture/stryker.config.mjs"
assert_rejected 'coverage fallback lacks its mixed-environment rationale'

echo "Mutation configuration regression tests passed."
