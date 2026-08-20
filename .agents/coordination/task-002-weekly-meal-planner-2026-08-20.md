# TASK-002 weekly meal planner coordination

## Objective

- Task: Complete the weekly meal planner and consolidated shopping-list UI.
- Task identifier (`TASK-XXX`): `TASK-002`
- Lifecycle: `closed`
- Expected outcome: A durable `/meal-plans` experience, reachable from home, supporting week selection, assign/replace/remove, and shopping-list feedback.
- Scope boundaries: Reuse existing aggregate, persistence and mutation APIs; add week-start lookup but do not redesign stored meal-plan data.

## Ownership and contracts

| Agent | Owns | Inputs | Required output | Must not change |
| --- | --- | --- | --- | --- |
| `backend-engineer` | Durable GET lookup by `weekStart`, thin route, use case, DI and backend tests | Existing `searchByWeekStart` repository contract | `GET /api/meal-plans?weekStart=YYYY-MM-DD` returning plan or consistent 404 | Meal-plan invariants/schema and frontend files |
| `frontend-engineer` | `/meal-plans` page/components/styles/API adapter and visible home CTA | Contracts below | Accessible 7×3 planner, week navigation, mutations, shopping list and feedback states | Backend/domain files and tests |
| `testing-engineer` | Frontend-focused contract, helper and interaction tests | Page/API adapter contracts below | Automated proof of calendar, calls, mutations and loading/error/empty states | Production files |
| Primary agent | Contract integration, database review, full verification and closeout | All handoffs | Integrated task with review/retro evidence | Unrelated tasks |

Shared contracts were fixed before parallel implementation:

- Domain contract: A week starts on ISO Monday; days are ISO dates; slots are `breakfast`, `lunch`, `dinner`; one meal per day/slot.
- Persistence contract: Existing weekly tables and unique constraint stay unchanged; retrieval uses existing `searchByWeekStart`.
- API contract: `GET /api/meal-plans?weekStart=...` returns `{id,weekStart,meals}` or consistent 404. UI uses POST for empty, PUT for occupied, DELETE for removal and reloads plan/list after mutations.
- Test contract: Prove UTC-safe seven-day generation, 21 slots, payload/method selection, durable retrieval/creation, loading/error/empty shopping list, and home link. No permanent array/envelope compatibility shim for TASK-003.

## Contract acknowledgements

| Agent | Contract acknowledged before implementation | Boundary semantics checked | Verification evidence before handoff |
| --- | --- | --- | --- |
| `backend-engineer` | Monday lookup and existing error envelope acknowledged | Missing plan is 404; malformed/missing weekStart is 400 | Required: focused use-case/API tests plus build |
| `frontend-engineer` | 7×3/mutation/list and future paginated dish contract acknowledged | Empty plan/list, no dishes, loading and request errors | Required: lint/build and executable helper/adapter checks |
| `testing-engineer` | UI/API contracts and Node test constraints acknowledged | UTC/DST, POST vs PUT, DELETE, error and empty states | Required: focused Jest plus build for typed mocks/helpers |

## Dependencies and stop conditions

1. Contract checkpoint: Primary audit confirmed existing route payloads, response shapes, repository lookup and frontend-test infrastructure before delegation.
2. Implementation order/dependencies: Backend lookup, frontend and isolated tests proceed in parallel; frontend adapter targets the fixed lookup contract.
3. Stop condition for each agent: Contract-verification handoff lists files and passing commands; no agent commits.
4. Escalation condition: Stop only for a discovered incompatibility with the fixed API/domain contract or a required external dependency unavailable to the repository.

## Integration handoff

- Implementation commit subject: `feat(TASK-002): add weekly meal planner interface`
- Agent output references: `task002_contract_audit` backend handoff; `task001_frontend` TASK-002 handoff; `task001_tests` TASK-002 handoff.
- Contract-verification handoffs: Backend proved valid/missing/malformed week lookup with 12 focused tests and build; frontend proved UTC 7×3, empty/error states, mutations and 409 recovery with lint/build; testing proved adapter/calendar/home contracts with 19 focused tests and build.
- Implementation commit: `6853360`
- Code-review agent: `code-review`
- PR code review commit range: `afbd87d..143536d`
- Code-review verdict: `APPROVED`
- Code-review evidence: The complete committed range and affected context were inspected. `git diff --check` passed and focused verification passed with 4 suites and 31 tests, including 8 real React component tests. Weekly-plan and shopping-list responses are correlated with the active week; the ARIA grid hierarchy is valid; shopping-list error/retry/recovery is exercised; and out-of-order lists are proven not to replace the current week’s content, error, or loading state.
- Code-review report: `.agents/reviews/TASK-002-143536d.md`
- Remediation required: yes
- Remediation commit subject: `fix(TASK-002): address weekly planner review`
- Remediation commit: `143536d`
- Post-remediation validation commands and results: `cab8949` fixed production concurrency/ARIA and introduced React tests; `143536d` added shopping-list retry/race proof. Final `npm run prep` passed with 74 regular and 11 CI tests.
- Harness retro report: `TODO-AGENT-HARNESS.md` entries `AH-016` through `AH-019`, covering lifecycle-aware validation, review-round evidence, frontend test capability and stable visual phase icons.
- Harness retro commit subject: `chore(TASK-002): record weekly planner harness retro`
- Harness retro commit: `ca5413f`
- Final sign-off: TASK-002 functionality, remediations, final `APPROVED` review and 74 regular + 11 CI tests are complete; AH-016 through AH-019 are implemented in the following harness-control commit.

### Code-review rounds

| Round | Commit range | Verdict | Report | Findings / remediation |
| --- | --- | --- | --- | --- |
| 1 | `afbd87d..6853360` | `CHANGES_REQUESTED` | `.agents/reviews/TASK-002-6853360.md` | Stale week/list responses, missing React component tests and invalid ARIA header hierarchy; remediated in `cab8949` |
| 2 | `afbd87d..cab8949` | `CHANGES_REQUESTED` | `.agents/reviews/TASK-002-cab8949.md` | Missing direct component proof for shopping-list retry and out-of-order list responses; remediated in `143536d` |
| 3 | `afbd87d..143536d` | `APPROVED` | `.agents/reviews/TASK-002-143536d.md` | No significant findings remain |

## Acceptance evidence

| ID | Acceptance criterion / TODO item | Implementation artifact | Passing verification |
| --- | --- | --- | --- |
| AC-01 | Persist weekly plans and meals | Existing database scripts and `PostgresWeeklyMealPlanRepository` | Existing PostgreSQL CI suite plus final `npm run prep` |
| AC-02 | Enforce one dish per day and slot | Existing unique constraint and aggregate/repository errors | Domain/concurrency tests plus final `npm run prep` |
| AC-03 | Model identifiers and business rules | Existing `WeeklyMealPlan` domain | Domain tests plus final `npm run prep` |
| AC-04 | Create, assign, replace and remove use cases | Existing meal-plan application services | Use-case tests plus final `npm run prep` |
| AC-05 | Consolidate repeated ingredients | Existing shopping-list generator | Use-case tests plus final `npm run prep` |
| AC-06 | Expose create/read/mutate APIs | Meal-plan routes and `WeeklyMealPlanByWeekStartSearcher` | API/use-case tests and successful `npm run prep` |
| AC-07 | Resolve dependencies through DIOD | `diod.config.ts` registrations including week lookup | Successful Next production build via `npm run prep` |
| AC-08 | Rules, use-case, error and persistence tests | Existing meal-plan suites plus `tests/app/api/meal-plans` and `tests/app/meal-plans` | Successful final `npm run prep`: 74 regular + 11 CI tests |
| AC-09 | Verify concurrent assignment | Existing PostgreSQL concurrency test | Final `npm run test:ci` via `npm run prep` |
| AC-10 | Keep routes as thin coordinators | Meal-plan route handlers delegate to application services | Backend handoff, successful build and independent `APPROVED` review |
| AC-11 | Weekly view manages planned meals | `src/app/meal-plans/page.tsx`, calendar and API adapter | Calendar/adapter tests and successful Next build |
| AC-12 | Planner reachable from home | Home `Plan your week` CTA to `/meal-plans` | `home-cta.test.ts` and successful Next build |
| AC-13 | Assign, replace and remove from UI | Planner cell selects/removal plus `saveMeal`/`removeMeal` adapter | Adapter interaction tests for POST/PUT/DELETE and successful build |
| AC-14 | Shopping list with loading/error states | Shopping-list panel and adapter | Empty/error adapter tests plus loading/error/empty render branches and successful build |
| AC-15 | Frontend calendar/interactions/state tests | `tests/app/meal-plans/*`, including real jsdom component coverage | Component suite 8 tests; final regular suite 74 tests passed |
| AC-16 | Full lint, build and tests | Entire TASK-002 implementation | Final `npm run prep` passed: lint, Next build, 74 regular and 11 CI tests |
| AC-17 | Invoke harness-retro and register recommendations | `TODO-AGENT-HARNESS.md` entries `AH-016` through `AH-019` | Harness-retro report persisted every recommendation in the root register |
