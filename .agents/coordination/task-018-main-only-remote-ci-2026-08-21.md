# TASK-018 coordination record

## Objective

- Task: Make remote publication and CI explicit in the harness lifecycle.
- Task identifier (`TASK-XXX`): TASK-018
- Lifecycle: in-progress
- Expected outcome: Task branches are validated locally only; merged `main` is pushed and verified green.
- Scope boundaries: Harness instructions and remote-CI verifier only; no production behavior.
- Task worktree path: `/home/antonio/Training/Cursos/ia-codely/.agentic_programming-course-subagents-experiment-task-worktrees/TASK-018`
- Task branch: `task/TASK-018`
- Shared-service isolation plan: Reuse the preflight-verified services; no application tests depend on this documentation change.

## Ownership and contracts

| Agent | Owns | Inputs | Required output | Must not change |
| --- | --- | --- | --- | --- |
| task lead | Lifecycle wording and verifier regression | User correction and existing harness workflow | Main-only publish/CI policy and branch-aware verifier | Production code |

- Domain contract: Not applicable.
- Persistence contract: Not applicable.
- API contract: Not applicable.
- Test contract: Verifier fixtures must accept successful `main` evidence and reject successful task-branch evidence.

## Acceptance evidence

| ID | Acceptance criterion / TODO item | Implementation artifact | Passing verification |
| --- | --- | --- | --- |
| AC-01 | Task branch is not pushed or remotely checked | `AGENTS.md`, `docs/agent-harness.md`, `docs/agents/task-closeout-workflow.md`, `.agents/DELEGATION_TEMPLATE.md` | Source scan confirms local validation precedes main integration |
| AC-02 | Main is pushed and remote CI must be green | `AGENTS.md`, closeout workflow, `verify-remote-ci.sh` | Verifier requires `head_branch=main` |
| AC-03 | Reject task-branch CI evidence | `scripts/agent-harness/test-verify-remote-ci.sh` | Regression fixture passes and rejects `task/TASK-018` |

### Cross-agent boundary contracts

none (no cross-agent runtime boundaries)

## Integration handoff

- Implementation commit subject: `docs(TASK-018): require main-only remote CI`
- Implementation commit: `44814fe`
- Code-review agent: `code-review`
- PR code review commit range: `44814fe^..44814fe`
- Code-review verdict: `CHANGES_REQUESTED`
- Code-review evidence: Review found that `REMOTE_CI_EXPECTED_BRANCH` could bypass the mandatory `main` branch requirement.
- Code-review report: `.agents/reviews/TASK-018-44814fe.md`
- Remediation required: yes
- Remediation commit subject: `none (no findings)`
- Remediation commit: pending
- Post-remediation validation commands and results: pending
- Harness retro report: pending
- Harness retro commit subject: `chore(TASK-018): implement harness retro todos`
- Harness retro commit: pending
- Final sign-off: pending
- Task-lead integration method and target: merge task/TASK-018 into main, then push main and verify remote CI
- Clean worktree removal evidence: pending

### Code-review rounds

| Round | Commit range | Verdict | Report | Findings / remediation |
| --- | --- | --- | --- | --- |
| 1 | `44814fe^..44814fe` | `CHANGES_REQUESTED` | `.agents/reviews/TASK-018-44814fe.md` | Removed branch override; remediation follows |
