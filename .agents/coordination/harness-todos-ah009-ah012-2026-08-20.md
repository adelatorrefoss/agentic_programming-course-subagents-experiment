# Harness TODO implementation: AH-009 to AH-012

## Objective

- Task: Implement all pending agent-harness recommendations.
- Task identifier: `TASK-001`.
- Expected outcome: evidence-based closeout, complete test validation,
  executable documented commands, and a task-start preflight.
- Scope boundaries: agent harness, validation scripts, package scripts, and
  related documentation only.

## Ownership and contracts

| Agent | Owns | Inputs | Required output | Must not change |
| --- | --- | --- | --- | --- |
| main agent | implementation, validation, and commit | AH-009 through AH-012 | integrated harness controls and passing checks | production application behavior |

Shared contracts:

- Closeout evidence contract: `.agents/DELEGATION_TEMPLATE.md`.
- Full-validation contract: `npm run prep` runs regular and `.ci` tests.
- Documentation contract: every documented `npm run` command exists.
- Preflight contract: validate tool permissions and required services before a task.

## Dependencies and stop conditions

1. Add executable validators before marking recommendations complete.
2. Connect validators to canonical package scripts and task instructions.
3. Run isolated validator checks and the complete preflight and validation suite.
4. Stop if evidence is missing, a documented command is invalid, a tool matrix
   differs from an agent definition, or a required service is unavailable.

## Integration handoff

- Implementation commit subject: `chore(TASK-001): implement pending harness controls`.
- Agent output references: main-agent implementation session.
- Implementation commit: recorded after this file is committed.
- PR code review commit range: not requested for this harness-only task.
- `/review` result: not requested.
- Remediation commit: not required.
- Post-remediation validation commands and results: `npm run task:preflight`
  passed; `npm run prep` passed with 43 regular and 10 `.ci` tests;
  `npm run agents:validate` and `git diff --check` passed.
- Harness retro report: AH-009 through AH-012 implementation evidence below.
- Harness retro commit subject: included in the harness implementation commit.
- Harness retro commit: recorded after this file is committed.
- Final sign-off: main agent; all required checks passed.

## Acceptance evidence

| ID | Acceptance criterion / TODO item | Implementation artifact | Passing verification |
| --- | --- | --- | --- |
| AH-009 | Map every acceptance criterion and checked TODO item to an artifact and passing verification | `.agents/DELEGATION_TEMPLATE.md` and `scripts/agent-harness/validate-task-closeout.sh` | Isolated closeout validator passed and rejects missing or pending evidence |
| AH-010 | Run regular and `.ci` tests in the canonical full-validation command | `package.json` scripts `prep` and `checks` | Command composition includes `npm run test` and `npm run test:ci` |
| AH-011 | Validate documented repository commands against package scripts | `scripts/agent-harness/validate-documented-commands.sh` and corrected Markdown commands | Isolated documented-command validation passed for 11 scripts |
| AH-012 | Check service availability and agent tool permissions before starting a task | `scripts/agent-harness/task-preflight.sh` and `npm run task:preflight` | Preflight passed with 6 agent definitions, 11 documented commands, 2 closeout records, PostgreSQL, and Ollama validated |
