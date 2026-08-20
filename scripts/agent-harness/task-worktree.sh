#!/usr/bin/env bash
set -euo pipefail

usage() {
	cat <<'EOF'
Usage:
  task-worktree.sh create TASK-XXX [start-point]
  task-worktree.sh list
  task-worktree.sh finish TASK-XXX

Worktrees default to a sibling directory named .<repository>-task-worktrees.
Override that location with an absolute AGENT_WORKTREE_ROOT path.
EOF
}

die() {
	printf 'task-worktree: %s\n' "$*" >&2
	exit 1
}

validate_task_id() {
	[[ "${1:-}" =~ ^TASK-[0-9]{3,}[A-Z]?$ ]] || die "unsafe task identifier '${1:-}'; expected TASK-XXX with an optional uppercase suffix"
}

repository_root="$(git rev-parse --show-toplevel 2>/dev/null)" || die "run this command from a Git worktree"
repository_root="$(realpath -m "$repository_root")"
repository_name="$(basename "$repository_root")"
worktree_root="${AGENT_WORKTREE_ROOT:-$(dirname "$repository_root")/.${repository_name}-task-worktrees}"
[[ "$worktree_root" == /* ]] || die "AGENT_WORKTREE_ROOT must be an absolute path"
worktree_root="$(realpath -m "$worktree_root")"
[[ "$worktree_root" != "$repository_root" && "$worktree_root" != "$repository_root"/* ]] || die "worktree root must be outside the repository"

command="${1:-}"
case "$command" in
	create)
		task_id="${2:-}"
		validate_task_id "$task_id"
		[[ "$#" -le 3 ]] || die "create accepts only TASK-XXX and an optional start-point"
		branch="task/${task_id}"
		path="${worktree_root}/${task_id}"
		[[ ! -e "$path" ]] || die "worktree path already exists: ${path}"
		if git show-ref --verify --quiet "refs/heads/${branch}"; then
			die "branch already exists: ${branch}"
		fi
		mkdir -p "$worktree_root"
		git worktree add -b "$branch" "$path" "${3:-HEAD}"
		printf 'Created %s on %s at %s\n' "$task_id" "$branch" "$path"
		;;
	list)
		[[ "$#" -eq 1 ]] || die "list accepts no arguments"
		git worktree list --porcelain | awk -v root="${worktree_root}/" '
			function emit() {
				if (index(path, root) == 1) printf "%s\t%s\n", branch, path
				path = ""
				branch = "<detached>"
			}
			$1 == "worktree" {
				if (path != "") emit()
				path = substr($0, length($1) + 2)
				branch = "<detached>"
			}
			$1 == "branch" { branch = $2; sub("refs/heads/", "", branch) }
			/^$/ && path != "" { emit() }
			END { if (path != "") emit() }
		'
		;;
	finish)
		task_id="${2:-}"
		validate_task_id "$task_id"
		[[ "$#" -eq 2 ]] || die "finish accepts exactly one TASK-XXX"
		branch="task/${task_id}"
		path="${worktree_root}/${task_id}"
		git worktree list --porcelain | grep -Fqx "worktree ${path}" || die "managed worktree not found: ${path}"
		expected_ref="refs/heads/${branch}"
		current_ref="$(git -C "$path" symbolic-ref -q HEAD || true)"
		[[ "$current_ref" == "$expected_ref" ]] || die "refusing to remove worktree that does not own ${expected_ref}: ${path} (${current_ref:-detached})"
		[[ -z "$(git -C "$path" status --porcelain --untracked-files=all)" ]] || die "refusing to remove dirty worktree: ${path}"
		git worktree remove "$path"
		printf 'Removed clean worktree %s. Branch %s was preserved; integrate it explicitly, then delete it separately if desired.\n' "$path" "$branch"
		;;
	-h|--help|help)
		usage
		;;
	*)
		usage >&2
		exit 1
		;;
esac
