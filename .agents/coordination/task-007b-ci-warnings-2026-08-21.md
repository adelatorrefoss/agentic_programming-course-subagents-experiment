# TASK-007B · CI security and runtime warnings

## Objective

- Task: Eliminate npm vulnerability and GitHub Actions Node.js runtime warnings.
- Task identifier (`TASK-XXX`): `TASK-007B`
- Lifecycle: `in-progress`
- Expected outcome: zero npm audit vulnerabilities and CI actions/application tests on Node.js 24.
- Scope boundaries: dependency lockfile, dependency override, CI workflow, task TODO and harness evidence; no product behavior changes.
- Task worktree path: `/home/antonio/Training/Cursos/ia-codely/.agentic_programming-course-subagents-experiment-task-worktrees/TASK-007B`
- Task branch: `task/TASK-007B`
- Shared-service isolation plan: no parallel implementation; commands that build `.next` are serialized through the repository lock; local validation reuses the main worktree PostgreSQL with `COMPOSE_PROJECT_NAME=agentic_programming-course-subagents-experiment`.

## Ownership and contracts

| Agent | Owns | Inputs | Required output | Must not change |
| --- | --- | --- | --- | --- |
| Task lead | Dependency and CI maintenance | npm audit report and CI warning | Audited lockfile, Node.js 24 workflow and lifecycle evidence | Product behavior |

- Domain contract: unchanged.
- Persistence contract: unchanged.
- API contract: unchanged.
- Test contract: `npm audit` reports zero vulnerabilities; `npm run prep` and remote CI pass.
- Delegation: none for implementation; mandatory independent `code-review` and `harness-retro` are invoked during closeout.

## Dependencies and stop conditions

1. Confirm the baseline warnings before editing.
2. Update only compatible dependency versions plus the minimum transitive override needed for a dependency whose parent has not yet released a fix.
3. Stop if a security fix requires an unrequested product/API migration.
4. Do not close until review is approved, harness retro is resolved, commits are pushed, and remote CI is green.

## Integration handoff

- Implementation commit subject: `feat(TASK-007B): eliminate CI security and runtime warnings`
- Agent output references: task lead implementation in the managed TASK-007B worktree.
- Contract-verification handoffs: none (no cross-agent runtime boundaries).
- Implementation commit: pending
- Code-review agent: `code-review`
- PR code review commit range: pending
- Code-review verdict: pending
- Code-review evidence: pending
- Code-review report: pending
- Remediation required: pending
- Remediation commit: pending
- Post-remediation validation commands and results: pending
- Harness retro report: pending
- Harness retro commit: pending
- Final sign-off: pending
- Task-lead integration method and target: task branch pushed directly; PR/merge remains user-controlled.
- Clean worktree removal evidence: pending

### Cross-agent boundary contracts

| Boundary | Producer agent | Consumer agent | Producer fixture | Consumer assertion | Passing command | Passing evidence |
| --- | --- | --- | --- | --- | --- | --- |
| none | none | none | none | none | none | producer-to-consumer: none (no cross-agent runtime boundaries) |

### Code-review rounds

| Round | Commit range | Verdict | Report | Findings / remediation |
| --- | --- | --- | --- | --- |
| 1 | pending | pending | pending | pending |

## Acceptance evidence

| ID | Acceptance criterion / TODO item | Implementation artifact | Passing verification |
| --- | --- | --- | --- |
| AC-01 | Eliminate the 16 npm vulnerabilities without unnecessary major upgrades | `package-lock.json`, `package.json` | `npm audit --json`: 0 vulnerabilities |
| AC-02 | Run GitHub Actions on Node.js 24 runtime | `.github/workflows/ci.yml` | workflow uses `checkout@v5`, `setup-node@v5`, and `cache@v5`; official releases identify their Node.js 24 runtime; remote CI pending |
| AC-03 | Run project CI on Node.js 24 | `.github/workflows/ci.yml` | workflow pins `node-version: 24`; local `npm run prep` passed on Node.js 24.14.0; remote CI pending |
| AC-04 | Keep full project validation green | complete TASK-007B diff | `COMPOSE_PROJECT_NAME=agentic_programming-course-subagents-experiment bash scripts/agent-harness/run-with-next-lock.sh npm run prep` passed: build, 139 regular tests and 11 CI tests |
| AC-05 | Publish and validate the task head | `task/TASK-007B` | pending remote CI |
