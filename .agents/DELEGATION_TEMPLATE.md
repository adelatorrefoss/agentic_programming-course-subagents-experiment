# Delegation brief

Use this brief before delegating parallel agent work. Copy it into the task
coordination record and complete every section before starting implementation.

Commit the coordination record incrementally together with the implementation,
test, review or harness files that caused the update. Do not defer task history
to a final documentation-only commit, and do not create a separate progress
commit when the originating artifacts can share the same commit.

## Objective

- Task:
- Task identifier (`TASK-XXX`):
- Lifecycle: `in-progress` (change to `closed` only after all closeout evidence is complete)
- Expected outcome:
- Scope boundaries:

## Ownership and contracts

| Agent | Owns | Inputs | Required output | Must not change |
| --- | --- | --- | --- | --- |
|  |  |  |  |  |

Shared contracts must be explicit before parallel work begins:

- Domain contract:
- Persistence contract:
- API contract:
- Test contract:

For interactive frontend acceptance criteria, confirm the component-test
capability before delegating implementation:

- TSX transform available:
- DOM environment (`jsdom`) available:
- React render/query/user-event tooling available:
- Component-level scenarios required by acceptance criteria:

## Contract acknowledgements

Before implementation starts, every delegated agent must acknowledge the exact
shared contract it received. Before handoff, it must record how its output was
verified against that contract, including applicable boundary semantics such as
`null`, empty collections, zero values, missing resources, and error shapes.

| Agent | Contract acknowledged before implementation | Boundary semantics checked | Verification evidence before handoff |
| --- | --- | --- | --- |
|  |  |  |  |

## Dependencies and stop conditions

1. Contract checkpoint:
2. Implementation order/dependencies:
3. Stop condition for each agent:
4. Escalation condition:

## Integration handoff

- Implementation commit subject: `feat(TASK-XXX): ...`
- Agent output references:
- Contract-verification handoffs:
- Implementation commit:
- Code-review agent: `code-review`
- PR code review commit range:
- Code-review verdict: `APPROVED` or `CHANGES_REQUESTED`
- Code-review evidence:
- Code-review report: `.agents/reviews/TASK-XXX-<commit>.md`
- Remediation required: yes or no
- Remediation commit subject: `fix(TASK-XXX): ...`
- Remediation commit:
- Post-remediation validation commands and results:
- Harness retro report:
- Harness retro commit subject: `chore(TASK-XXX): ...`
- Harness retro commit:
- Final sign-off:

The pushed commit, GitHub Actions run URL, and remote CI result belong in the
post-push HIL handoff. Do not persist them in a follow-up evidence commit.

### Code-review rounds

Persist every review round, including `CHANGES_REQUESTED`, under
`.agents/reviews/`. Use the reviewed head in the filename and record the
findings/remediation chain here; do not retain only the final approval.

| Round | Commit range | Verdict | Report | Findings / remediation |
| --- | --- | --- | --- | --- |
| 1 |  |  |  |  |

## Acceptance evidence

Every acceptance criterion and checked TODO item must have one row. A task
cannot be closed while an artifact or verification is missing or pending.

| ID | Acceptance criterion / TODO item | Implementation artifact | Passing verification |
| --- | --- | --- | --- |
| AC-01 |  |  |  |
