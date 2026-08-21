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

cat >"$fixture_dir/documentation-only.md" <<'EOF'
# Documentation-only task

- Task identifier (`TASK-XXX`): `TASK-997`
- Lifecycle: `closed`
- Change classification: `documentation-only`
- Documentation-only commit range: `6405f4f^..6405f4f`
- Documentation-only evidence: The range contains only Markdown documentation and coordination files.
- Code-review agent: skipped (documentation-only)
- PR code review commit range: skipped (documentation-only)
- Code-review verdict: skipped (documentation-only)

### Cross-agent boundary contracts

none (no cross-agent runtime boundaries)

## Acceptance evidence

| ID | Acceptance criterion / TODO item | Implementation artifact | Passing verification |
| --- | --- | --- | --- |
| AC-01 | Documentation is updated | `docs/product/user-story-template.md` | Documentation-only range validation passed |
EOF

bash scripts/agent-harness/validate-task-closeout.sh "$fixture_dir" >/dev/null

sed -i 's/6405f4f\^\.\.6405f4f/5aa0477^..5aa0477/' "$fixture_dir/documentation-only.md"
if bash scripts/agent-harness/validate-task-closeout.sh "$fixture_dir" >/dev/null 2>&1; then
	echo "A task containing code bypassed review as documentation-only." >&2
	exit 1
fi
sed -i 's/5aa0477\^\.\.5aa0477/6405f4f^..6405f4f/' "$fixture_dir/documentation-only.md"

sed -i 's/Change classification: `documentation-only`/Change classification: `unsupported`/' "$fixture_dir/documentation-only.md"
if bash scripts/agent-harness/validate-task-closeout.sh "$fixture_dir" >/dev/null 2>&1; then
	echo "An unsupported change classification was accepted." >&2
	exit 1
fi
rm "$fixture_dir/documentation-only.md"

sed -i 's/in-progress/invalid-state/' "$fixture_dir/in-progress.md"
if bash scripts/agent-harness/validate-task-closeout.sh "$fixture_dir" >/dev/null 2>&1; then
	echo "Invalid coordination lifecycle was accepted." >&2
	exit 1
fi
sed -i 's/invalid-state/in-progress/' "$fixture_dir/in-progress.md"

cat >"$fixture_dir/local-only.md" <<'EOF'
# Locally green but incompatible task

- Task identifier (`TASK-XXX`): `TASK-998`
- Lifecycle: `closed`
- Implementation commit: `5aa0477`
- Code-review agent: `code-review`
- PR code review commit range: `5aa0477^..5aa0477`
- Code-review verdict: `APPROVED`
- Code-review evidence: `npm run task:preflight` passed; the complete committed diff and surrounding code were inspected; `git diff --check 5aa0477^ 5aa0477` passed; 8 focused Jest suites / 25 tests passed, including real PostgreSQL append-only, stable-ordering, and second-connection rollback tests.
- Code-review report: `.agents/reviews/TASK-004-5aa0477.md`
- Remediation required: no
- Remediation commit: none (no findings)

none (no cross-agent runtime boundaries)

### Cross-agent boundary contracts

| Boundary | Producer agent | Consumer agent | Producer fixture | Consumer assertion | Passing command | Passing evidence |
| --- | --- | --- | --- | --- | --- | --- |
| API payload | `backend-engineer` | `frontend-engineer` |  | frontend parser assertion | `npm test` | producer and consumer unit suites pass locally |

## Acceptance evidence

| ID | Acceptance criterion / TODO item | Implementation artifact | Passing verification |
| --- | --- | --- | --- |
| AC-01 | Contract | test | command passed |
EOF

if bash scripts/agent-harness/validate-task-closeout.sh "$fixture_dir" >/dev/null 2>&1; then
	echo "A sentinel outside the boundary section bypassed an invalid contract table." >&2
	exit 1
fi

sed -i 's/|  | frontend parser assertion/| backend-produced fixture | frontend parser assertion/' "$fixture_dir/local-only.md"
if bash scripts/agent-harness/validate-task-closeout.sh "$fixture_dir" >/dev/null 2>&1; then
	echo "Role-local evidence with no producer-to-consumer contract was accepted." >&2
	exit 1
fi

sed -i 's/producer and consumer unit suites pass locally/producer-to-consumer: PASS; backend fixture was accepted by frontend parser/' "$fixture_dir/local-only.md"
bash scripts/agent-harness/validate-task-closeout.sh "$fixture_dir" >/dev/null

sed -i '/^none (no cross-agent runtime boundaries)$/d' "$fixture_dir/local-only.md"
sed -i '/^### Cross-agent boundary contracts$/a none (no cross-agent runtime boundaries)' "$fixture_dir/local-only.md"
if bash scripts/agent-harness/validate-task-closeout.sh "$fixture_dir" >/dev/null 2>&1; then
	echo "A no-boundaries sentinel combined with a nonempty contract table was accepted." >&2
	exit 1
fi

sed -i '/^| Boundary | Producer agent | Consumer agent | Producer fixture | Consumer assertion | Passing command | Passing evidence |$/,/^| API payload /d' "$fixture_dir/local-only.md"
bash scripts/agent-harness/validate-task-closeout.sh "$fixture_dir" >/dev/null

echo "Task closeout lifecycle validation passed."
