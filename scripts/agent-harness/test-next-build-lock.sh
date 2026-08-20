#!/usr/bin/env bash
set -euo pipefail

wrapper="scripts/agent-harness/run-with-next-lock.sh"
fixture_dir="$(mktemp -d)"
holder_pid=""
holder_child_pid=""
waiter_pid=""
parallel_pids=()

cleanup() {
	[[ -z "$holder_pid" ]] || kill "$holder_pid" 2>/dev/null || true
	[[ -z "$holder_child_pid" ]] || kill "$holder_child_pid" 2>/dev/null || true
	[[ -z "$waiter_pid" ]] || kill "$waiter_pid" 2>/dev/null || true
	for pid in "${parallel_pids[@]}"; do kill "$pid" 2>/dev/null || true; done
	rm -rf "$fixture_dir"
}
trap cleanup EXIT

command -v flock >/dev/null 2>&1 || {
	echo "Shared Next.js build lock test requires 'flock' on PATH." >&2
	exit 127
}

export NEXT_BUILD_LOCK_FILE="$fixture_dir/shared-next.lock"
export NEXT_BUILD_LOCK_TIMEOUT_SECONDS="5"
export TEST_HOLDER_ACQUIRED="$fixture_dir/holder-acquired"
export TEST_HOLDER_CHILD_PID="$fixture_dir/holder-child-pid"
export TEST_RELEASE_HOLDER="$fixture_dir/release-holder"
export TEST_WAITER_COMPLETED="$fixture_dir/waiter-completed"

bash "$wrapper" sh -c '
	echo "$$" > "$TEST_HOLDER_CHILD_PID"
	touch "$TEST_HOLDER_ACQUIRED"
	while [ ! -f "$TEST_RELEASE_HOLDER" ]; do sleep 0.02; done
' >"$fixture_dir/holder.out" 2>"$fixture_dir/holder.err" &
holder_pid=$!

for _ in {1..100}; do
	[[ -f "$TEST_HOLDER_ACQUIRED" && -f "$TEST_HOLDER_CHILD_PID" ]] && break
	sleep 0.02
done
[[ -f "$TEST_HOLDER_ACQUIRED" ]] || { echo "Holder did not acquire the lock" >&2; exit 1; }
holder_child_pid="$(<"$TEST_HOLDER_CHILD_PID")"

bash "$wrapper" sh -c 'touch "$TEST_WAITER_COMPLETED"' \
	>"$fixture_dir/waiter.out" 2>"$fixture_dir/waiter.err" &
waiter_pid=$!

for _ in {1..100}; do
	grep -q 'Waiting for shared Next.js build lock' "$fixture_dir/waiter.err" 2>/dev/null && break
	sleep 0.02
done
grep -q 'Waiting for shared Next.js build lock' "$fixture_dir/waiter.err" || {
	echo "Waiter did not report lock contention" >&2
	exit 1
}
[[ ! -f "$TEST_WAITER_COMPLETED" ]] || { echo "Waiter overlapped the holder" >&2; exit 1; }

# SIGKILL cannot run shell cleanup. The protected child still owns inherited
# FD 9, so the waiter must remain blocked until that child exits.
kill -9 "$holder_pid"
wait "$holder_pid" 2>/dev/null || true
holder_pid=""
sleep 0.05
[[ ! -f "$TEST_WAITER_COMPLETED" ]] || {
	echo "Killing the wrapper released the lock while its writer child was alive" >&2
	exit 1
}

touch "$TEST_RELEASE_HOLDER"
for _ in {1..100}; do
	[[ -f "$TEST_WAITER_COMPLETED" ]] && break
	sleep 0.02
done
wait "$waiter_pid"
waiter_pid=""
holder_child_pid=""
[[ -f "$TEST_WAITER_COMPLETED" ]] || { echo "Waiter did not complete after holder exit" >&2; exit 1; }

# Multiple contenders must all complete without entering the critical section
# together or stealing the kernel-owned lock.
export TEST_CRITICAL_DIR="$fixture_dir/critical"
export TEST_OVERLAP="$fixture_dir/overlap"
for index in 1 2 3 4; do
	export TEST_DONE_FILE="$fixture_dir/done-$index"
	bash "$wrapper" sh -c '
		mkdir "$TEST_CRITICAL_DIR" || { touch "$TEST_OVERLAP"; exit 1; }
		sleep 0.05
		rmdir "$TEST_CRITICAL_DIR"
		touch "$TEST_DONE_FILE"
	' >"$fixture_dir/parallel-$index.out" 2>"$fixture_dir/parallel-$index.err" &
	parallel_pids+=("$!")
done

for pid in "${parallel_pids[@]}"; do wait "$pid"; done
parallel_pids=()
[[ ! -f "$TEST_OVERLAP" ]] || { echo "Parallel waiters overlapped" >&2; exit 1; }
for index in 1 2 3 4; do
	[[ -f "$fixture_dir/done-$index" ]] || { echo "Parallel waiter $index did not complete" >&2; exit 1; }
done

# Lock files carry no ownership state: an old file without a kernel holder is
# immediately usable.
touch "$NEXT_BUILD_LOCK_FILE"
bash "$wrapper" sh -c 'touch "$1"' sh "$fixture_dir/stale-file-completed"
[[ -f "$fixture_dir/stale-file-completed" ]] || { echo "Stale lock file blocked execution" >&2; exit 1; }

echo "Shared Next.js build lock validation passed."
