#!/usr/bin/env bash

set -euo pipefail

runner="scripts/agent-harness/run-external-test.sh"
EXTERNAL_TEST_TIMEOUT_SECONDS=2 "$runner" true >/dev/null

set +e
output="$(EXTERNAL_TEST_TIMEOUT_SECONDS=1 "$runner" sleep 2 2>&1)"
status=$?
set -e

if [[ "$status" -ne 124 ]] || [[ "$output" != *"timed out after 1s"* ]]; then
	echo "External test runner did not report its timeout correctly." >&2
	exit 1
fi

echo "External test runner validation passed."
