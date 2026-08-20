#!/usr/bin/env bash
set -euo pipefail

wrapper="scripts/agent-harness/run-with-next-lock.sh"
fixture_dir="$(mktemp -d)"
first_pid=""
second_pid=""

cleanup() {
	[[ -z "$first_pid" ]] || kill "$first_pid" 2>/dev/null || true
	[[ -z "$second_pid" ]] || kill "$second_pid" 2>/dev/null || true
	rm -rf "$fixture_dir"
}
trap cleanup EXIT

export NEXT_BUILD_LOCK_DIR="$fixture_dir/shared-next.lock"
export NEXT_BUILD_LOCK_POLL_SECONDS="0.02"
export NEXT_BUILD_LOCK_TIMEOUT_SECONDS="5"
export TEST_FIRST_ACQUIRED="$fixture_dir/first-acquired"
export TEST_FIRST_COMPLETED="$fixture_dir/first-completed"
export TEST_RELEASE_FIRST="$fixture_dir/release-first"
export TEST_SECOND_COMPLETED="$fixture_dir/second-completed"

bash "$wrapper" sh -c '
	touch "$TEST_FIRST_ACQUIRED"
	while [ ! -f "$TEST_RELEASE_FIRST" ]; do sleep 0.02; done
	touch "$TEST_FIRST_COMPLETED"
' >"$fixture_dir/first.out" 2>"$fixture_dir/first.err" &
first_pid=$!

for _ in {1..100}; do
	[[ -f "$TEST_FIRST_ACQUIRED" ]] && break
	sleep 0.02
done
[[ -f "$TEST_FIRST_ACQUIRED" ]] || { echo "First invocation did not acquire the lock" >&2; exit 1; }

bash "$wrapper" sh -c 'touch "$TEST_SECOND_COMPLETED"' \
	>"$fixture_dir/second.out" 2>"$fixture_dir/second.err" &
second_pid=$!

for _ in {1..100}; do
	grep -q 'Waiting for shared Next.js build lock' "$fixture_dir/second.err" 2>/dev/null && break
	sleep 0.02
done

grep -q 'Waiting for shared Next.js build lock' "$fixture_dir/second.err" || {
	echo "Second invocation did not report waiting for the lock" >&2
	exit 1
}
[[ ! -f "$TEST_SECOND_COMPLETED" ]] || {
	echo "Second invocation ran before the first released the lock" >&2
	exit 1
}

touch "$TEST_RELEASE_FIRST"
wait "$first_pid"
first_pid=""
wait "$second_pid"
second_pid=""

[[ -f "$TEST_FIRST_COMPLETED" && -f "$TEST_SECOND_COMPLETED" ]] || {
	echo "Both serialized invocations did not complete successfully" >&2
	exit 1
}
grep -q 'Acquired shared Next.js build lock' "$fixture_dir/second.err"
[[ ! -d "$NEXT_BUILD_LOCK_DIR" ]] || { echo "Build lock was not released" >&2; exit 1; }

echo "Shared Next.js build lock validation passed."
