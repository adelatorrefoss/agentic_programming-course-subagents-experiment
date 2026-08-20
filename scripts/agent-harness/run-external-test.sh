#!/usr/bin/env bash

set -euo pipefail

timeout_seconds="${EXTERNAL_TEST_TIMEOUT_SECONDS:-120}"

if [[ ! "$timeout_seconds" =~ ^[1-9][0-9]*$ ]]; then
	echo "EXTERNAL_TEST_TIMEOUT_SECONDS must be a positive integer." >&2
	exit 2
fi

if [[ "$#" -eq 0 ]]; then
	echo "Usage: $0 <command> [args...]" >&2
	exit 2
fi

echo "External-service check: timeout=${timeout_seconds}s command=$*"
set +e
timeout --foreground --signal=TERM "${timeout_seconds}s" "$@"
status=$?
set -e

case "$status" in
	0) echo "External-service check passed." ;;
	124 | 137 | 143)
		echo "External-service check timed out after ${timeout_seconds}s. Run 'npm run task:preflight'; for EPERM/access denied, use the authorized sandbox escalation flow." >&2
		;;
	126 | 127)
		echo "External-service check could not execute the command. Verify the executable and sandbox permissions." >&2
		;;
	*)
		echo "External-service check failed with exit code ${status}. Inspect the command output to distinguish assertions from service connection errors." >&2
		;;
esac

exit "$status"
