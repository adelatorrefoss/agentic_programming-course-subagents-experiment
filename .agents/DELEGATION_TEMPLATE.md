# Delegation brief

Use this brief before delegating parallel agent work. Copy it into the task
coordination record and complete every section before starting implementation.

## Objective

- Task:
- Task identifier (`TASK-XXX`):
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

## Dependencies and stop conditions

1. Contract checkpoint:
2. Implementation order/dependencies:
3. Stop condition for each agent:
4. Escalation condition:

## Integration handoff

- Implementation commit subject: `feat(TASK-XXX): ...`
- Agent output references:
- Implementation commit:
- Code-review agent: `code-review`
- PR code review commit range:
- Code-review verdict: `APPROVED` or `CHANGES_REQUESTED`
- Code-review evidence:
- Remediation required: yes or no
- Remediation commit subject: `fix(TASK-XXX): ...`
- Remediation commit:
- Post-remediation validation commands and results:
- Harness retro report:
- Harness retro commit subject: `chore(TASK-XXX): ...`
- Harness retro commit:
- Final sign-off:

## Acceptance evidence

Every acceptance criterion and checked TODO item must have one row. A task
cannot be closed while an artifact or verification is missing or pending.

| ID | Acceptance criterion / TODO item | Implementation artifact | Passing verification |
| --- | --- | --- | --- |
| AC-01 |  |  |  |
