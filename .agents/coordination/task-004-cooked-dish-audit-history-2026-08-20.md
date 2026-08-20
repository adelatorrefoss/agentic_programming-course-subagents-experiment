# TASK-004 cooked-dish audit history coordination

## Objective

- Task: Add an auditable history for cooked-dish creation and modification.
- Task identifier (`TASK-XXX`): `TASK-004`
- Lifecycle: `closed`
- Expected outcome: Immutable, queryable audit events recorded atomically for every cooked-dish create/update, exposed through an API and accessible timeline UI.
- Scope boundaries: Keep domain and routes independent of PostgreSQL; do not introduce authentication beyond the explicit request actor contract.

## Ownership and contracts

| Agent | Owns | Inputs | Required output | Must not change |
| --- | --- | --- | --- | --- |
| `database-engineer` | Append-only DDL, transaction context, PostgreSQL repositories | Contracts below | Immutable storage, stable query and atomic persistence evidence | UI and route behavior |
| `backend-engineer` | Events, aggregate/use cases, subscriber, API and DIOD | Contracts below | Framework-independent domain flow and thin routes | UI presentation and DB constraints |
| `frontend-engineer` | History API adapter and timeline | API contract below | Accessible loading/error/empty/detail states | Domain and persistence |
| `testing-engineer` | Unit, API, component and real PostgreSQL matrix | All contracts below | Serialization/publication/subscription/atomicity evidence | Production behavior |

Shared contracts fixed before parallel implementation:

- Domain contract: `CookedDish.create` records `dishes.cooked_dish.created`; update records `dishes.cooked_dish.updated` only when data changes. Events contain actor, current snapshot and, for update, previous snapshot plus changed fields. `PUT` creates when absent and updates when present through an application use case.
- Persistence contract: `dishes.cooked_dish_audit_events` is append-only (UPDATE/DELETE rejected), keyed by event UUID, constrained to cooked-dish created/updated types, and ordered by `(cooked_dish_id, occurred_at ASC, event_id ASC)`. Dish mutation, synchronous event publication and audit append share one PostgreSQL transaction; any subscriber failure propagates and rolls everything back.
- API contract: `PUT /api/cooked-dishes/:uuid` requires non-blank `X-Actor-Id`. `GET /api/cooked-dishes/:uuid/history` returns `{items:[{id,type,entity:{type,id},author,occurredAt,changes}]}` ordered oldest-first; missing dish is 404 and an existing legacy dish may return an empty list.
- Test contract: Prove event round-trip, aggregate publication, subscriber mapping/error propagation, DIOD discovery, append-only constraints, stable history, create/update flow and real rollback on audit failure; prove API response and independent accessible UI loading/error/retry/empty/details.

Frontend component-test capability checkpoint:

- TSX transform available: yes (`@swc/jest`).
- DOM environment (`jsdom`) available: yes.
- React render/query/user-event tooling available: yes.
- Component-level scenarios required: loading, success ordering/details, empty, error/retry and endpoint identity.

## Contract acknowledgements

| Agent | Contract acknowledged before implementation | Boundary semantics checked | Verification evidence before handoff |
| --- | --- | --- | --- |
| `database-engineer` | Append-only schema, stable ordering and shared transaction | duplicate IDs, FK, rollback, equal timestamps | Required: real PostgreSQL tests and build |
| `backend-engineer` | Event snapshots/deltas, explicit actor, upsert semantics and API envelope | unchanged update, missing actor/dish, subscriber failure | Required: focused unit/API/DIOD tests and build |
| `frontend-engineer` | `{items}` envelope and independent history state | empty, HTTP/network error, complex ingredients | Required: RTL component/helper tests and build |
| `testing-engineer` | Complete cross-layer matrix and fail-closed policy | serialization, stable ties, second-connection rollback | Required: focused Jest, PostgreSQL suite and build |

## Dependencies and stop conditions

1. Contract checkpoint: Existing aggregate, event bus, PostgreSQL connection, PUT route, DIOD and component-test capability inspected by all four roles before implementation.
2. Implementation order/dependencies: Backend establishes domain interfaces/events; database and frontend implement only against the fixed contracts; testing integrates after production artifacts exist.
3. Stop condition for each agent: Handoff names changed files, boundary behavior and passing focused checks; agents do not commit.
4. Escalation condition: Stop for any incompatible contract change, inability to share a transaction, or missing external service.

## Integration handoff

- Implementation commit subject: `feat(TASK-004): add auditable cooked dish history`
- Agent output references: `task004_database`, `task004_backend`, `task004_frontend`, `task004_testing`.
- Contract-verification handoffs: Database delivered append-only DDL, ambient transaction context and 4 real SQL tests; backend delivered events/upsert/subscriber/API/DIOD with 19 focused tests; frontend delivered accessible timeline and 7 RTL/helper tests; testing delivered 24 cross-layer tests including second-connection rollback proof. Primary corrected the integrated persistence-to-API projection and verified it against the frontend parser.
- Implementation commit: `5aa0477`
- Code-review agent: `code-review`
- PR code review commit range: `5aa0477^..5aa0477`
- Code-review verdict: `APPROVED`
- Code-review evidence: `npm run task:preflight` passed; the complete committed diff and surrounding code were inspected; `git diff --check 5aa0477^ 5aa0477` passed; 8 focused Jest suites / 25 tests passed, including real PostgreSQL append-only, stable-ordering, and second-connection rollback tests.
- Code-review report: `.agents/reviews/TASK-004-5aa0477.md`
- Remediation required: no
- Remediation commit subject: none (no findings)
- Remediation commit: none (no findings)
- Post-remediation validation commands and results: no remediation; implementation `npm run prep` passed.
- Harness retro report: TASK-004 exposed two immediate harness gaps: cross-agent boundaries need executable producer-to-consumer contract evidence (AH-025), and commands writing shared `.next` state need serialization or isolation (AH-026). The retro, evidence, root causes and complete action register are persisted in `TODO-AGENT-HARNESS.md`.
- Harness retro commit subject: `chore(TASK-004): record harness retro`
- Harness retro commit: `7ad870c`
- Final sign-off: Final locked `npm run prep` passed lint, Next build, 139 regular tests and 11 CI tests on the integrated HEAD; `npm run agents:validate` passed contract, lock, worktree, lifecycle, remote-CI and mutation harness regressions. Application review and final AH-025/AH-026/AH-029 remediation reviews are `APPROVED`. TASK-004 began before worktree isolation existed, so no managed task worktree can be retroactively removed; all future parallel tasks are required to use `task-worktree.sh`.

### Cross-agent boundary contracts

| Boundary | Producer agent | Consumer agent | Producer fixture | Consumer assertion | Passing command | Passing evidence |
| --- | --- | --- | --- | --- | --- | --- |
| Backend history projection → frontend history parser | `backend-engineer` | `frontend-engineer` | `CookedDishHistorySearcher` output created from a domain audit entry | `parseCookedDishHistory({items: producerFixture})` accepts and preserves the projection | `npx jest --runInBand --runTestsByPath tests/contexts/dishes/cooked-dish-history/application/search/CookedDishHistorySearcher.test.ts` | producer-to-consumer: PASS; backend-produced fixture passed directly through the frontend parser (3 tests) |

### Code-review rounds

| Round | Commit range | Verdict | Report | Findings / remediation |
| --- | --- | --- | --- | --- |
| 1 | `5aa0477^..5aa0477` | `APPROVED` | `.agents/reviews/TASK-004-5aa0477.md` | No findings; 8 suites / 25 focused tests passed. |
| 2 | `dd04873^..dd04873` | `CHANGES_REQUESTED` | `.agents/reviews/TASK-004-dd04873.md` | Scope the no-boundaries sentinel to its section; reclaim abandoned build locks safely and test both failure paths. |
| 3 | `dd04873^..27fee8a` | `CHANGES_REQUESTED` | `.agents/reviews/TASK-004-27fee8a.md` | Out-of-section sentinel fixed; replace unsafe PID reclamation and make in-section `none` exclusive. |
| 4 | `dd04873^..40e7150` | `CHANGES_REQUESTED` | `.agents/reviews/TASK-004-40e7150.md` | Prior findings resolved; move persistent lock out of tracked worktree and avoid unsafe truncating opens. |
| 5 | `dd04873^..7a0d0e4` | `APPROVED` | `.agents/reviews/TASK-004-7a0d0e4.md` | All sentinel, ownership-race, surviving-child, clean-worktree, truncation and symlink findings resolved; focused regressions passed. |
| 6 | `e4a9c63^..e4a9c63` | `CHANGES_REQUESTED` | `.agents/reviews/TASK-004-e4a9c63.md` | Require branch ownership before finish and reset/report detached state correctly in list. |
| 7 | `e4a9c63^..033c89f` | `APPROVED` | `.agents/reviews/TASK-004-033c89f.md` | Exact task-branch ownership, detached/mismatch rejection and detached listing regression-covered. |
| 8 | remote-CI portability remediation to be reviewed | remediation implemented | review report to follow | Replace unavailable `rg` dependency in mutation harness validation with portable `grep` and prove a minimal PATH. |

## Acceptance evidence

| ID | Acceptance criterion / TODO item | Implementation artifact | Passing verification |
| --- | --- | --- | --- |
| AC-01 | Immutable audit-event persistence | `databases/5-cooked-dish-audit.sql`, `PostgresCookedDishAuditRepository` | Real SQL tests reject UPDATE and DELETE; initial `npm run prep` |
| AC-02 | Change type, entity, relevant data, author and date | Audit entry, created/updated events and JSONB schema | Event round-trip, subscriber and repository tests |
| AC-03 | Domain events on create and update | `CookedDish`, created/updated event classes and `CookedDishUpserter` | Aggregate/upserter tests prove create, update and unchanged behavior |
| AC-04 | Subscriber maps events to audit entries | `CookedDishAuditRecorder` | Recorder tests prove both mappings and error propagation |
| AC-05 | API routes and aggregate contain no infrastructure details | Domain interfaces, application services and thin route handlers | Successful build, API tests and integrated diff inspection |
| AC-06 | Use case queries one dish history | `CookedDishHistorySearcher` | Existing/missing/projection tests; frontend parser compatibility test |
| AC-07 | `GET /api/cooked-dishes/:uuid/history` | History route with `{items}` envelope and 404 mapping | API route tests and successful Next build |
| AC-08 | Subscriber and dependencies registered in DIOD | `diod.config.ts` registrations and subscriber tag | DIOD discovery test publishes through the tagged subscriber |
| AC-09 | Chronologically ordered history view | PostgreSQL stable ASC order, history adapter and `CookedDishHistory` timeline | Equal-timestamp SQL test and RTL ordering test |
| AC-10 | Change details plus loading/error states | Independent history component with retry/empty/detail branches | 7 frontend helper/RTL tests |
| AC-11 | Serialization, publication, subscription and persistence tests | Event, use-case, recorder, DIOD and PostgreSQL suites | 31 regular suites / 138 tests passed |
| AC-12 | Agreed fail-closed atomic behavior on audit failure | Ambient `PostgresTransactionManager`, propagating event bus and transactional upserter | Real create/update rollback tests observe committed state from a second connection |
| AC-13 | `npm run prep` | Entire TASK-004 implementation | Passed lint, build, 138 regular tests and 11 CI tests |
| AC-14 | Common coordination contracts and conventions | This record, thin routes, `@Service()` registrations and test conventions | Preflight, build, full tests and integrated diff inspection passed |
| AC-15 | Harness retrospective and applicable TODOs | `TODO-AGENT-HARNESS.md`, AH-025 contract gate, AH-026 shared-build lock and AH-029 task worktree isolation | Contract, lock and two-worktree regressions plus `npm run agents:validate` passed |
| AH-025 | Executable producer-to-consumer evidence for every cross-agent boundary | `.agents/DELEGATION_TEMPLATE.md`, closeout validator/regression and backend-to-frontend TASK-004 contract test | Focused contract Jest suite rejects incompatible local-only shape; lifecycle regression and `npm run agents:validate` |
| AH-026 | Serialize or isolate commands writing shared `.next` state | `run-with-next-lock.sh`, concurrency regression and documented agent guidance | Two concurrent wrapper commands wait/succeed/release in order; `npm run agents:validate` |
| AH-029 | Isolate parallel task repositories and generated state in linked worktrees | `task-worktree.sh`, two-worktree regression, `AGENTS.md`, harness guide and delegation/coordination templates | Temporary Git repository proves two branches plus task-file/`.next` isolation, rejects duplicates/unsafe IDs and refuses dirty cleanup; `npm run agents:validate` |
