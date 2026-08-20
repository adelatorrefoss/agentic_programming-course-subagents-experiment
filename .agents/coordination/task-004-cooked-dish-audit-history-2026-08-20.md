# TASK-004 cooked-dish audit history coordination

## Objective

- Task: Add an auditable history for cooked-dish creation and modification.
- Task identifier (`TASK-XXX`): `TASK-004`
- Lifecycle: `in-progress`
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
- Code-review evidence: No findings; preflight and diff check passed, and 8 focused suites / 25 tests passed including append-only SQL, API/UI behavior and second-connection rollback.
- Code-review report: `.agents/reviews/TASK-004-5aa0477.md`
- Remediation required: no
- Remediation commit subject: none (no findings)
- Remediation commit: none (no findings)
- Post-remediation validation commands and results: no remediation; implementation `npm run prep` passed.
- Harness retro report: pending
- Harness retro commit subject: `chore(TASK-004): record harness retro`
- Harness retro commit: pending
- Final sign-off: Initial `npm run prep` passed lint, Next build, 138 regular tests and 11 CI tests; final validation will be repeated after review/retro.

### Code-review rounds

| Round | Commit range | Verdict | Report | Findings / remediation |
| --- | --- | --- | --- | --- |
| 1 | `5aa0477^..5aa0477` | `APPROVED` | `.agents/reviews/TASK-004-5aa0477.md` | No findings; 8 suites / 25 focused tests passed. |

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
| AC-15 | Harness retrospective and applicable TODOs | pending | pending |
