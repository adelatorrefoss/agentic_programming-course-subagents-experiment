#!/usr/bin/env bash
set -uo pipefail

lock_dir="${NEXT_BUILD_LOCK_DIR:-.next-build.lock}"
poll_seconds="${NEXT_BUILD_LOCK_POLL_SECONDS:-0.1}"
timeout_seconds="${NEXT_BUILD_LOCK_TIMEOUT_SECONDS:-600}"

if [[ "$#" -eq 0 ]]; then
	echo "Usage: $0 <command> [argument ...]" >&2
	exit 2
fi

started_at="$SECONDS"
waiting=false

while ! mkdir "$lock_dir" 2>/dev/null; do
	if [[ "$waiting" == false ]]; then
		echo "Waiting for shared Next.js build lock: ${lock_dir}" >&2
		waiting=true
	fi

	if (( SECONDS - started_at >= timeout_seconds )); then
		echo "Timed out waiting for shared Next.js build lock after ${timeout_seconds}s: ${lock_dir}" >&2
		if [[ -f "$lock_dir/owner" ]]; then
			echo "Current lock owner: $(<"$lock_dir/owner")" >&2
		fi
		exit 1
	fi

	sleep "$poll_seconds"
done

printf 'pid=%s command=%q\n' "$$" "$*" > "$lock_dir/owner"

release_lock() {
	rm -f "$lock_dir/owner"
	rmdir "$lock_dir" 2>/dev/null || true
}

trap release_lock EXIT
trap 'exit 130' INT
trap 'exit 143' TERM

if [[ "$waiting" == true ]]; then
	echo "Acquired shared Next.js build lock: ${lock_dir}" >&2
fi

"$@"
command_status=$?
exit "$command_status"
