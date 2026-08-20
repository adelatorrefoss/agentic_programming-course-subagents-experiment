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
owner_token="$$-${BASHPID:-$$}-${RANDOM:-0}"

reclaim_stale_lock() {
	local owner_pid=""
	local recorded_token=""
	local owner_command=""
	local stale_dir="${lock_dir}.stale.${owner_token}"

	[[ -f "$lock_dir/owner" ]] || return 1
	read -r owner_pid recorded_token owner_command < "$lock_dir/owner" || return 1
	[[ "$owner_pid" =~ ^[0-9]+$ && -n "$recorded_token" ]] || return 1

	# A failed signal check means the recorded process no longer exists. If it
	# is alive (including this process), its lock must never be reclaimed.
	if kill -0 "$owner_pid" 2>/dev/null; then
		return 1
	fi

	# Renaming is the ownership transfer: only one waiter can move this exact
	# lock directory, and a successor can create a fresh lock at the old path.
	if mv "$lock_dir" "$stale_dir" 2>/dev/null; then
		rm -f "$stale_dir/owner"
		rmdir "$stale_dir" 2>/dev/null || true
		echo "Reclaimed stale shared Next.js build lock from pid ${owner_pid}: ${lock_dir}" >&2
		return 0
	fi

	return 1
}

while ! mkdir "$lock_dir" 2>/dev/null; do
	if [[ "$waiting" == false ]]; then
		echo "Waiting for shared Next.js build lock: ${lock_dir}" >&2
		waiting=true
	fi

	if reclaim_stale_lock; then
		continue
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

printf '%s %s command=%q\n' "$$" "$owner_token" "$*" > "$lock_dir/owner"

release_lock() {
	local recorded_pid=""
	local recorded_token=""
	local recorded_command=""

	if [[ -f "$lock_dir/owner" ]]; then
		read -r recorded_pid recorded_token recorded_command < "$lock_dir/owner" || true
	fi

	if [[ "$recorded_pid" == "$$" && "$recorded_token" == "$owner_token" ]]; then
		rm -f "$lock_dir/owner"
		rmdir "$lock_dir" 2>/dev/null || true
	fi
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
