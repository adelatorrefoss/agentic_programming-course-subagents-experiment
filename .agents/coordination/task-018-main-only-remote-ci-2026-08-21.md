# TASK-018 coordination record

## Objective

- Task: Make remote publication and CI explicit in the harness lifecycle.
- Task identifier (`TASK-XXX`): TASK-018
- Lifecycle: closed
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
- PR code review commit range: `44814fe^..034252d`
- Code-review verdict: `APPROVED`
- Code-review evidence: The complete range was reviewed; trunk-based local-only task branches, main-only remote CI enforcement, override rejection regression, documentation, and focused validations are correct.
- Code-review report: `.agents/reviews/TASK-018-034252d.md`
- Remediation required: no
- Remediation commit subject: none (no findings)
- Remediation commit: none (no findings)
- Post-remediation validation commands and results: `bash scripts/agent-harness/test-verify-remote-ci.sh`, `npm run agents:validate`, and final `npm run prep` passed.
- Harness retro report: `TODO-AGENT-HARNESS.md`, section “TASK-018 harness retrospective — 2026-08-21”
- Harness retro commit subject: `chore(TASK-018): implement harness retro todos`
- Harness retro commit: `470fba8`
- Final sign-off: Review APPROVED; trunk-based lifecycle documented; verifier and regression tests enforce main-only remote CI; final validations passed.
- Task-lead integration method and target: merge task/TASK-018 into main, then push main and verify remote CI
- Clean worktree removal evidence: Run `task-worktree.sh finish TASK-018` after main integration and green CI.

### Code-review rounds

| Round | Commit range | Verdict | Report | Findings / remediation |
| --- | --- | --- | --- | --- |
| 1 | `44814fe^..44814fe` | `CHANGES_REQUESTED` | `.agents/reviews/TASK-018-44814fe.md` | Removed branch override; remediation follows |
| 2 | `44814fe^..034252d` | `APPROVED` | `.agents/reviews/TASK-018-034252d.md` | Complete range approved; regression exercises override attempt |

## Acceptance evidence

| ID | Acceptance criterion / TODO item | Implementation artifact | Passing verification |
| --- | --- | --- | --- |
| AC-01 | Feature branches remain local-only | `AGENTS.md`, `docs/agent-harness.md`, closeout workflow | Source scan and final `npm run agents:validate` |
| AC-02 | Main push and CI are the remote completion gate | `verify-remote-ci.sh` | Main-only branch check and final remote CI run |
| AC-03 | Task-branch CI cannot satisfy the gate | `test-verify-remote-ci.sh` | Positive main fixture and negative task-branch/override fixtures pass |
| AC-04 | Integration prefers rebase then non-fast-forward merge, with a direct merge fallback | `AGENTS.md`, `docs/agent-harness.md`, closeout workflow, delegation template | Lifecycle source scan documents clean-rebase and conflict-heavy fallback paths |
| AC-05 | Delete the local feature branch after successful main integration | `task-worktree.sh`, `test-task-worktrees.sh`, lifecycle documentation | Regression test confirms merged branches are deleted and unmerged branches are protected |
