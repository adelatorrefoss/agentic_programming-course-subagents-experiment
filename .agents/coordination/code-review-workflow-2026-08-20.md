# Mandatory code-review workflow

## Objective

- Task: Prevent task closeout without the dedicated code-review agent.
- Task identifier: `TASK-001`.
- Expected outcome: verifiable review evidence after the implementation commit.
- Scope boundaries: agent harness configuration, validation, and documentation.

## Ownership and contracts

| Agent | Owns | Inputs | Required output | Must not change |
| --- | --- | --- | --- | --- |
| main agent | harness implementation and remediation | reported workflow omission | commits and coordination evidence | production application code |
| code-review | independent read-only review | task criteria and committed range | findings, verdict, and report content | repository files |

Shared contracts:

- Review contract: `.agents/agents/code-review.agent.md`.
- Validation contract: `scripts/agent-harness/validate-task-closeout.sh`.
- Documentation contract: `docs/agents/task-code-review-workflow.md`.
- Evidence contract: `.agents/reviews/TASK-001-4b59b02.md`.

## Dependencies and stop conditions

1. Commit the initial harness implementation before review.
2. Stop closeout when `code-review` returns `CHANGES_REQUESTED`.
3. Commit accepted findings separately and re-review the inclusive range.
4. Close only after `APPROVED`, persisted evidence, and passing validation.

## Integration handoff

- Implementation commit subject: `chore(TASK-001): enforce code review workflow`.
- Agent output references: `/root/code_review` initial and follow-up runs.
- Implementation commit: 30d2923
- Code-review agent: `code-review`
- PR code review commit range: d77aa8a..4b59b02
- Code-review verdict: `APPROVED`
- Code-review evidence: persisted report matching, real commit/range validation, remediation inclusion, fixed legacy exceptions, and documentation consistency verified; no significant findings
- Code-review report: `.agents/reviews/TASK-001-4b59b02.md`
- Remediation required: yes
- Remediation commit subject: `fix(TASK-001): harden code review evidence gate`
- Remediation commit: 4b59b02
- Post-remediation validation commands and results: agent configuration,
  documented commands, strict closeout validation, shell syntax, build, 43
  regular tests, and 10 `.ci` tests passed.
- Harness retro report: AH-013 records the enforced review gate.
- Harness retro commit subject: `chore(TASK-001): record approved code review`.
- Harness retro commit: current closeout commit.
- Final sign-off: main agent after `APPROVED` and strict validation.

## Acceptance evidence

| ID | Acceptance criterion / TODO item | Implementation artifact | Passing verification |
| --- | --- | --- | --- |
| AH-013 | Require the dedicated code-review agent after implementation | `.agents/agents/code-review.agent.md` and `AGENTS.md` | Agent `/root/code_review` reviewed `d77aa8a..4b59b02` and returned `APPROVED` |
| AC-01 | Reject missing or self-certified review evidence | `scripts/agent-harness/validate-task-closeout.sh` | Validator checks an existing report, real commits, matching evidence, and range membership |
| AC-02 | Require re-review after remediation | `4b59b02` and `.agents/reviews/TASK-001-4b59b02.md` | Approved range includes implementation `30d2923` and remediation `4b59b02` |
| AC-03 | Prevent new legacy bypasses | hard-coded historical cases in `validate-task-closeout.sh` | Configurable exception file removed; only two historical filenames are accepted |
