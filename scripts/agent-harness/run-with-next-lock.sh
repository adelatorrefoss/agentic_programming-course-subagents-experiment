#!/usr/bin/env bash
set -uo pipefail

lock_file="${NEXT_BUILD_LOCK_FILE:-.next-build.lock}"
timeout_seconds="${NEXT_BUILD_LOCK_TIMEOUT_SECONDS:-600}"

if [[ "$#" -eq 0 ]]; then
	echo "Usage: $0 <command> [argument ...]" >&2
	exit 2
fi

if ! command -v flock >/dev/null 2>&1; then
	echo "Shared Next.js build locking requires 'flock' on PATH." >&2
	exit 127
fi

# The child inherits FD 9. The kernel therefore keeps the lock while the child
# writes shared state even if this wrapper is terminated unexpectedly.
exec 9>"$lock_file"

if ! flock -n 9; then
	echo "Waiting for shared Next.js build lock: ${lock_file}" >&2
	if ! flock -w "$timeout_seconds" 9; then
		echo "Timed out waiting for shared Next.js build lock after ${timeout_seconds}s: ${lock_file}" >&2
		exit 1
	fi
	echo "Acquired shared Next.js build lock: ${lock_file}" >&2
fi

"$@"
command_status=$?
exit "$command_status"
