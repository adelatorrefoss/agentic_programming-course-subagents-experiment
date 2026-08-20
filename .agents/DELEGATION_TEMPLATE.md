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
- PR code review commit range:
- `/review` result:
- Remediation commit subject: `fix(TASK-XXX): ...`
- Remediation commit:
- Post-remediation validation commands and results:
- Harness retro report:
- Harness retro commit subject: `chore(TASK-XXX): ...`
- Harness retro commit:
- Final sign-off:
