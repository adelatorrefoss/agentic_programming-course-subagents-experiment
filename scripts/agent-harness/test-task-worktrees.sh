#!/usr/bin/env bash
set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
worktree_script="${script_dir}/task-worktree.sh"
fixture_root="$(mktemp -d)"
trap 'rm -rf "$fixture_root"' EXIT
repository="${fixture_root}/repository"
managed_root="${fixture_root}/managed-worktrees"

mkdir -p "$repository"
git -C "$repository" init -q
git -C "$repository" config user.name 'Harness Test'
git -C "$repository" config user.email 'harness@example.invalid'
printf 'base\n' > "${repository}/README.md"
cp "${script_dir}/../../compose.yml" "${repository}/compose.yml"
git -C "$repository" add README.md compose.yml
git -C "$repository" commit -qm 'test: initialize fixture'
git -C "$repository" branch -M main

run_harness() {
	(cd "$repository" && AGENT_WORKTREE_ROOT="$managed_root" bash "$worktree_script" "$@")
}

run_harness create TASK-101 >/dev/null
run_harness create TASK-102 >/dev/null
run_harness create TASK-103B >/dev/null

compose_project_name() {
	(cd "$1" && docker compose config --format json | node -e \
		'let input = ""; process.stdin.on("data", chunk => input += chunk); process.stdin.on("end", () => process.stdout.write(JSON.parse(input).name));')
}

canonical_compose_project="$(compose_project_name "$repository")"
[[ "$canonical_compose_project" == agentic_programming-course-subagents-experiment ]]
[[ "$(compose_project_name "${managed_root}/TASK-101")" == "$canonical_compose_project" ]]
[[ "$(compose_project_name "${managed_root}/TASK-103B")" == "$canonical_compose_project" ]]
printf 'one\n' > "${managed_root}/TASK-101/task-one.txt"
printf 'two\n' > "${managed_root}/TASK-102/task-two.txt"
mkdir -p "${managed_root}/TASK-101/.next" "${managed_root}/TASK-102/.next"
printf 'first\n' > "${managed_root}/TASK-101/.next/owner"
printf 'second\n' > "${managed_root}/TASK-102/.next/owner"

[[ ! -e "${managed_root}/TASK-102/task-one.txt" ]]
[[ ! -e "${managed_root}/TASK-101/task-two.txt" ]]
[[ "$(<"${managed_root}/TASK-101/.next/owner")" == first ]]
[[ "$(<"${managed_root}/TASK-102/.next/owner")" == second ]]
[[ "$(run_harness list | wc -l)" -eq 3 ]]

if run_harness create TASK-101 >/dev/null 2>&1; then
	echo 'duplicate task identifier was accepted' >&2
	exit 1
fi
for unsafe_id in '../TASK-103' 'TASK-1' 'TASK-104/other' 'task-104' 'TASK-104bb'; do
	if run_harness create "$unsafe_id" >/dev/null 2>&1; then
		echo "unsafe task identifier was accepted: ${unsafe_id}" >&2
		exit 1
	fi
done
run_harness finish TASK-103B >/dev/null
if git -C "$repository" show-ref --verify --quiet refs/heads/task/TASK-103B; then
	echo 'merged task branch TASK-103B was preserved' >&2
	exit 1
fi
if run_harness finish TASK-101 >/dev/null 2>&1; then
	echo 'dirty worktree was removed' >&2
	exit 1
fi
[[ -d "${managed_root}/TASK-101" ]]

git -C "${managed_root}/TASK-102" add task-two.txt
git -C "${managed_root}/TASK-102" commit -qm 'test: task two change'
rm -rf "${managed_root}/TASK-102/.next"

git -C "${managed_root}/TASK-102" switch --detach -q
printf 'detached\n' > "${managed_root}/TASK-102/detached.txt"
git -C "${managed_root}/TASK-102" add detached.txt
git -C "${managed_root}/TASK-102" commit -qm 'test: detached task change'
if run_harness finish TASK-102 >/dev/null 2>&1; then
	echo 'detached worktree was removed' >&2
	exit 1
fi
run_harness list | grep -Fq $'<detached>\t'"${managed_root}/TASK-102"

git -C "${managed_root}/TASK-102" switch -q task/TASK-102
git -C "${managed_root}/TASK-102" switch -qc unrelated-branch
if run_harness finish TASK-102 >/dev/null 2>&1; then
	echo 'worktree on a mismatched branch was removed' >&2
	exit 1
fi
git -C "${managed_root}/TASK-102" switch -q task/TASK-102
git -C "$repository" merge --no-ff task/TASK-102 -qm 'test: integrate task two'
run_harness finish TASK-102 >/dev/null
[[ ! -e "${managed_root}/TASK-102" ]]
if git -C "$repository" show-ref --verify --quiet refs/heads/task/TASK-102; then
	echo 'merged task branch TASK-102 was preserved' >&2
	exit 1
fi

echo 'Task worktree regression tests passed.'
