# TASK-019 coordination record

## Objective

- Task: Document the GitHub Issue user story format requested for the TODO migration.
- Task identifier (`TASK-XXX`): TASK-019
- Lifecycle: in-progress
- Expected outcome: A reusable Markdown convention matching the supplied user story, acceptance criteria, and out-of-scope structure.
- Scope boundaries: Documentation only; migrating TODO entries and configuring GitHub are not part of this step.
- Task worktree path: `/home/antonio/Training/Cursos/ia-codely/.agentic_programming-course-subagents-experiment-task-worktrees/TASK-019`
- Task branch: `task/TASK-019`
- Shared-service isolation plan: No application services or generated state are changed.

## Ownership and contracts

| Agent | Owns | Inputs | Required output | Must not change |
| --- | --- | --- | --- | --- |
| task lead | User story documentation | Supplied screenshot, create-doc skill, and documentation conventions | Copyable GitHub Issue body template and discoverable AGENTS.md reference | Product code and TODO catalogs |

- Domain contract: Not applicable.
- Persistence contract: Not applicable.
- API contract: Not applicable.
- Test contract: Markdown source checks must find the narrative, acceptance criteria, and out-of-scope blocks in the requested order.

### Cross-agent boundary contracts

none (no cross-agent runtime boundaries)

## Integration handoff

- Implementation commit subject: `docs(TASK-019): add GitHub user story template`
- Implementation commit: pending
- Code-review agent: `code-review`
- PR code review commit range: pending
- Code-review verdict: pending
- Code-review evidence: pending
- Code-review report: pending
- Remediation required: pending
- Remediation commit subject: pending
- Remediation commit: pending
- Post-remediation validation commands and results: pending
- Harness retro report: pending
- Harness retro commit subject: `chore(TASK-019): implement harness retro todos`
- Harness retro commit: pending
- Final sign-off: pending
- Task-lead integration method and target: Rebase task/TASK-019 onto updated main, then merge with `--no-ff` into main.
- Clean worktree removal evidence: pending

### Code-review rounds

| Round | Commit range | Verdict | Report | Findings / remediation |
| --- | --- | --- | --- | --- |
| 1 | pending | pending | pending | pending |

## Acceptance evidence

| ID | Acceptance criterion / TODO item | Implementation artifact | Passing verification |
| --- | --- | --- | --- |
| AC-01 | The template starts with an As a / I want / so that user story narrative. | `docs/product/user-story-template.md` | Ordered-heading `rg` source check passed |
| AC-02 | Acceptance criteria are represented as independently checkable items. | `docs/product/user-story-template.md` | Ordered-heading `rg` source check and `npm run agents:validate` passed |
| AC-03 | Explicit exclusions are recorded under an Out of Scope heading. | `docs/product/user-story-template.md` | Ordered-heading `rg` source check passed |
| AC-04 | The convention is discoverable from the agent instructions. | `AGENTS.md` | `npm run agents:validate` and `git diff --check` passed |
