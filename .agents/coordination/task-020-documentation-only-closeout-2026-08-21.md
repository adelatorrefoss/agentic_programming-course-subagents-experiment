# TASK-020 coordination record

## Objective

- Task: Allow documentation-only tasks to skip code review while preserving mandatory main push and remote-CI monitoring.
- Task identifier (`TASK-XXX`): TASK-020
- Lifecycle: in-progress
- Change classification: code
- Expected outcome: The harness recognizes a narrowly validated documentation-only review exception without weakening remote publication and CI gates.
- Scope boundaries: Task worktrees, local validation, commits, local main integration, coordination evidence, and harness retro remain required.
- Task worktree path: `/home/antonio/Training/Cursos/ia-codely/.agentic_programming-course-subagents-experiment-task-worktrees/TASK-020`
- Task branch: `task/TASK-020`
- Shared-service isolation plan: Reuse preflight-verified services; serialize full validation through the shared Next.js build lock.

## Ownership and contracts

| Agent | Owns | Inputs | Required output | Must not change |
| --- | --- | --- | --- | --- |
| task lead | Closeout validator, regression fixtures, and lifecycle documentation | User-requested workflow exception and existing closeout gates | Validator-backed documentation-only exception | Product behavior and CI workflow |

- Domain contract: Not applicable.
- Persistence contract: Not applicable.
- API contract: Not applicable.
- Test contract: Accept a committed documentation-only range; reject a range containing code or an unsupported classification; preserve existing code-task review checks.

### Cross-agent boundary contracts

none (no cross-agent runtime boundaries)

## Integration handoff

- Implementation commit subject: `feat(TASK-020): validate documentation-only closeout`
- Implementation commit: `fd0b38b`
- Code-review agent: `code-review`
- PR code review commit range: `fd0b38b^..6b0b120`
- Code-review verdict: `CHANGES_REQUESTED`
- Code-review evidence: The complete remediated range was inspected; `npm run task:preflight`, `bash -n`, `git diff --check`, and `npm run agents:validate` passed. Push and remote CI remained mandatory, but the unrelated historical-commit bypass remained.
- Code-review report: `.agents/reviews/TASK-020-6b0b120.md`
- Remediation required: yes
- Remediation commit subject: `fix(TASK-020): bind documentation commit to task`
- Remediation commit: pending
- Post-remediation validation commands and results: pending
- Harness retro report: pending
- Harness retro commit subject: `chore(TASK-020): record harness retro`
- Harness retro commit: pending
- Final sign-off: pending
- Task-lead integration method and target: Rebase task/TASK-020 onto updated main, then merge with `--no-ff` into main; push main and verify remote CI because this task changes shell code.
- Clean worktree removal evidence: pending

### Code-review rounds

| Round | Commit range | Verdict | Report | Findings / remediation |
| --- | --- | --- | --- | --- |
| 1 | `fd0b38b^..fd0b38b` | `CHANGES_REQUESTED` | `.agents/reviews/TASK-020-fd0b38b.md` | Bind the documentation-only range to the declared implementation commit and add an unrelated-range rejection fixture |
| 2 | `fd0b38b^..6b0b120` | `CHANGES_REQUESTED` | `.agents/reviews/TASK-020-6b0b120.md` | Bind the implementation commit to the declared task identifier and coordination-record name |

## Acceptance evidence

| ID | Acceptance criterion / TODO item | Implementation artifact | Passing verification |
| --- | --- | --- | --- |
| AC-01 | Documentation-only tasks can omit code review after objective range validation. | `validate-task-closeout.sh` | Exact implementation-range fixture and `npm run agents:validate` pass |
| AC-02 | A task containing code cannot claim the exception. | `validate-task-closeout.sh`, lifecycle regression | Cross-task historical commit, unrelated range, and known code range rejection fixtures pass |
| AC-03 | Unsupported or incomplete classifications cannot bypass review. | `validate-task-closeout.sh`, lifecycle regression | Unsupported classification, task-identity mismatch, and implementation-range mismatch fixtures are rejected |
| AC-04 | Validated documentation-only tasks still push main and monitor remote CI. | `AGENTS.md`, delegation template, harness and closeout documentation | Documentation scan, shell syntax check, and `npm run agents:validate` pass |
| AC-05 | Code tasks retain code review, push, and remote-CI monitoring. | Validator default and lifecycle documentation | Existing closeout and remote-CI regression suites pass via `npm run agents:validate` |
