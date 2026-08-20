#!/usr/bin/env bash
set -euo pipefail

fixture_dir="$(mktemp -d)"
trap 'rm -rf "$fixture_dir"' EXIT

cat >"$fixture_dir/in-progress.md" <<'EOF'
# Active task

- Task identifier (`TASK-XXX`): `TASK-999`
- Lifecycle: `in-progress`

Implementation and evidence are intentionally pending while work continues.
EOF

bash scripts/agent-harness/validate-task-closeout.sh "$fixture_dir" >/dev/null

sed -i 's/in-progress/invalid-state/' "$fixture_dir/in-progress.md"
if bash scripts/agent-harness/validate-task-closeout.sh "$fixture_dir" >/dev/null 2>&1; then
	echo "Invalid coordination lifecycle was accepted." >&2
	exit 1
fi

echo "Task closeout lifecycle validation passed."
