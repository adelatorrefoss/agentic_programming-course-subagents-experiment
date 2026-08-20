# TASK-017 coordination record

## Objective

- Task: Keep the example-task catalog functional and add ten examples.
- Task identifier (`TASK-017`): TASK-017
- Lifecycle: closed
- Expected outcome: `TODO.md` contains only product-facing scope and ten new examples.
- Scope boundaries: Documentation and harness verification only; no production behavior changes.
- Task worktree path: `/home/antonio/Training/Cursos/ia-codely/.agentic_programming-course-subagents-experiment-task-worktrees/TASK-017`
- Task branch: `task/TASK-017`
- Shared-service isolation plan: No shared services used by the documentation change.

## Ownership and contracts

| Agent | Owns | Inputs | Required output | Must not change |
| --- | --- | --- | --- | --- |
| task lead | Functional catalog and harness verification | User request and existing harness docs | Updated `TODO.md` and validation evidence | Production code |

- Domain contract: Not applicable; documentation-only task.
- Persistence contract: Not applicable.
- API contract: Not applicable.
- Test contract: Existing harness validation and full repository preparation must pass.

## Contract acknowledgements

| Agent | Contract acknowledged before implementation | Boundary semantics checked | Verification evidence before handoff |
| --- | --- | --- | --- |
| task lead | Functional-only acceptance scope | Harness concerns are absent from every task | Catalog scan and full `npm run prep` passed |

## Dependencies and stop conditions

1. Contract checkpoint: Confirm testing, role assignment, and `npm run prep` are present in harness sources.
2. Implementation order/dependencies: Verify harness, rewrite catalog, validate.
3. Stop condition for each agent: Catalog contains ten additional functional tasks and no harness checklist items.
4. Escalation condition: Harness does not contain a required responsibility removed from the catalog.

## Integration handoff

- Implementation commit subject: `docs(TASK-017): expand functional task examples`
- Agent output references: task lead only
- Contract-verification handoffs: none
- Implementation commit: `fa6d1cd`
- Code-review agent: `code-review`
- PR code review commit range: `fa6d1cd^..fa6d1cd`
- Code-review verdict: `APPROVED`
- Code-review evidence: The committed change adds exactly ten functional examples (`TASK-007` through `TASK-016`), removes example prompts, recommended role assignments, testing/validation tasks, and common coordination criteria from `TODO.md`, and records those responsibilities in `.agents/DELEGATION_TEMPLATE.md`, `docs/agent-harness.md`, `AGENTS.md`, and the applicable role-agent definitions. `git diff --check` passed and the task worktree was clean. Harness configuration validation passed during preflight; the reviewer's service check could not complete because PostgreSQL was not running in its environment.
- Code-review report: `.agents/reviews/TASK-017-fa6d1cd.md`
- Remediation required: no
- Remediation commit subject: none (no findings)
- Remediation commit: none (no findings)
- Post-remediation validation commands and results: none required; final `npm run prep` and `npm run agents:validate` passed after the harness retrospective implementation.
- Harness retro report: `TODO-AGENT-HARNESS.md`, section “TASK-017 harness retrospective — 2026-08-21”
- Harness retro commit subject: `chore(TASK-017): enforce functional task catalogs`
- Harness retro commit: `chore(TASK-017): enforce functional task catalogs` (the separate closeout commit containing this record)
- Final sign-off: Review `APPROVED`; AH-030 implemented with positive/negative regression fixtures; `npm run agents:validate` passed; final `npm run prep` passed lint, build, 139 regular tests, and 11 CI tests.
- Task-lead integration method and target: merge task branch into originating branch
- Clean worktree removal evidence: Must run `task-worktree.sh finish TASK-017` after integration; the managed worktree is currently clean apart from the closeout commit being prepared.

### Cross-agent boundary contracts

none (no cross-agent runtime boundaries)

### Code-review rounds

| Round | Commit range | Verdict | Report | Findings / remediation |
| --- | --- | --- | --- | --- |
| 1 | `fa6d1cd^..fa6d1cd` | `APPROVED` | `.agents/reviews/TASK-017-fa6d1cd.md` | No findings |

## Acceptance evidence

| ID | Acceptance criterion / TODO item | Implementation artifact | Passing verification |
| --- | --- | --- | --- |
| AC-01 | Add ten example tasks | `TODO.md` TASK-007 through TASK-016 | `rg -n '^## TASK-' TODO.md` lists exactly the ten new identifiers |
| AC-02 | Keep scope entirely functional and remove example prompts/common coordination | `TODO.md` titles and scope lists | Harness-term scan finds no prompt, recommended split, common criteria, commands, role names, or test items in task scope |
| AC-03 | Confirm frontend tests and validation states belong to harness | `.agents/DELEGATION_TEMPLATE.md`, `.agents/agents/testing-engineer.md` | Component capability and rendered-state requirements are explicit; `npm run prep` passed (139 regular + 11 CI tests) |
| AC-04 | Confirm role assignment and generated delegation prompt belong to harness | `docs/agent-harness.md`, `.agents/DELEGATION_TEMPLATE.md` | Harness sources explicitly build prompts from functional title/scope and add applicable role ownership |
| AC-05 | Confirm all former common criteria belong to harness | `AGENTS.md`, `docs/agent-harness.md`, role-agent definitions | Ownership map documents contracts, architecture, DIOD, tests, review, `npm run prep`, and `harness-retro`; full `npm run prep` passed |
