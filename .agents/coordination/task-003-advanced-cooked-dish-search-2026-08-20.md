# TASK-003 advanced cooked-dish search coordination

## Objective

- Task: Add advanced, safely paginated cooked-dish search.
- Task identifier (`TASK-XXX`): `TASK-003`
- Lifecycle: `in-progress`
- Expected outcome: Search by text, ingredient types, minimum rating and date range with allow-listed sorting, metadata, UI controls and robust states.
- Scope boundaries: Preserve create/by-id/similarity behavior; evolve list GET to a paginated envelope and update all current consumers.

## Ownership and contracts

| Agent | Owns | Inputs | Required output | Must not change |
| --- | --- | --- | --- | --- |
| `database-engineer` | Idempotent search indexes, safe PostgreSQL query/projection and real SQL tests | Criteria/result contracts below | Parameterized filters/count/page/order with justified indexes | Route, UI and unrelated repositories |
| `backend-engineer` (primary) | Criteria validation, use case, repository contract, API parsing/errors and DI | Criteria/result contracts below | Framework-independent criteria and thin GET route | Frontend behavior and database implementation details in domain |
| `frontend-engineer` | Home search controls/results/pagination/states and meal-planner catalog compatibility | Paginated API envelope below | Accessible search UI preserving TASK-001 rating cards and TASK-002 catalog | Backend/domain and database files |
| `testing-engineer` | Domain/use-case/API/component test matrix and mocks | Contracts below plus jsdom/RTL capability | Isolated/combined/boundary/error/interaction evidence | Production files |

Shared contracts fixed before parallel implementation:

- Domain contract: `CookedDishSearchCriteria` contains optional trimmed text (1..100), deduplicated `IngredientType[]`, optional `minimumRating` (0..5), optional ISO `cookedFrom/cookedTo` with from<=to, allow-listed `sortBy` (`cookedAt|name|rating`), `sortDirection` (`asc|desc`), page >=1 and pageSize 1..50. Defaults: no filters, `cookedAt desc`, page 1, pageSize 12.
- Persistence contract: Categories combine with AND; multiple ingredient types use OR; text is literal case-insensitive substring across name/description; date bounds are inclusive days; unrated average is null in output and behaves as 0 only for minimum-rating filtering; ordering adds `id ASC` tie-break; count remains correct for empty/out-of-range pages.
- API contract: `GET /api/cooked-dishes` accepts `text`, repeated `ingredientType`, `minimumRating`, `cookedFrom`, `cookedTo`, `sortBy`, `sortDirection`, `page`, `pageSize`; returns `{items:[{id,name,description,ingredients,cookedAt,ratingSummary:{average,total}}],pagination:{page,pageSize,totalItems,totalPages}}`; known invalid values return 400 `{error:{type:"InvalidCookedDishSearchCriteria",params}}`.
- Test contract: Prove defaults/bounds/invalid criteria; isolated and combined filters; literal wildcard/quote safety; every sort direction and stable ties; page limits/out-of-range total; real PostgreSQL; API parsing/envelope/400; React controls, loading/error/empty/results and pagination. Existing meal planner consumes the final envelope.

## Contract acknowledgements

| Agent | Contract acknowledged before implementation | Boundary semantics checked | Verification evidence before handoff |
| --- | --- | --- | --- |
| `database-engineer` | Safe query/projection/index contract supplied | null vs zero rating, inclusive dates, empty page total, literal `%`/`_`, stable ties | Required: real PostgreSQL tests and query/index justification |
| `backend-engineer` (primary) | Framework-independent criteria and exact API envelope supplied | defaults, missing/invalid/repeated params and consistent 400 | Required: unit/API tests and build |
| `frontend-engineer` | Final envelope and retained TASK-001/002 behavior supplied | loading/error/empty, filter reset, disabled pagination | Required: component tests, lint and build |
| `testing-engineer` | Full matrix and exact contracts supplied | bounds, combined filters, errors, races and pagination | Required: focused Jest + build for typed mocks/component setup |

Frontend component-test capability checkpoint:

- TSX transform available: yes, configured in `jest.config.js`.
- DOM environment (`jsdom`) available: yes.
- React render/query/user-event tooling available: yes.
- Component-level scenarios required: form submission/reset, results/ratings, metadata, previous/next, loading/error/empty and stale request protection.

## Dependencies and stop conditions

1. Contract checkpoint: Schema, current repository/API/home consumers, ingredient enum and React test capabilities were inspected before delegation.
2. Implementation order/dependencies: Primary adds domain/application interfaces first; database, frontend and tests implement in parallel against this fixed contract and coordinate compile errors through handoffs.
3. Stop condition for each agent: Contract-verification handoff names changed files, edge semantics and passing focused commands; no agent commits.
4. Escalation condition: Stop for a required contract change, unsafe dynamic SQL, unavailable migration application, or incompatible consumer not covered above.

## Integration handoff

- Implementation commit subject: `feat(TASK-003): add advanced cooked dish search`
- Agent output references: `task002_contract_audit` database handoff; `task001_frontend` TASK-003 handoff; `task001_tests` TASK-003 handoff; primary backend integration.
- Contract-verification handoffs: Database delivered/applied idempotent DDL and safe query, then primary verified 10 real PostgreSQL tests and index presence; frontend delivered envelope-only consumers and accessible home states with lint/build; testing delivered 26 focused domain/use-case/API/React tests plus build.
- Implementation commit: `09c4e33`
- Code-review agent: `code-review`
- PR code review commit range: `2403e63..8e5b34c`
- Code-review verdict: pending final review after round 1 `CHANGES_REQUESTED`.
- Code-review evidence: Round 1 found unsafe unbounded offsets, an incomplete 50-item planner catalog and missing PostgreSQL backslash evidence; all three were remediated and the full gate passes pending independent confirmation.
- Code-review report: round 1 `.agents/reviews/TASK-003-09c4e33.md`; final pending.
- Remediation required: yes.
- Remediation commit subject: `fix(TASK-003): harden search pagination and catalog completeness`
- Remediation commit: `8e5b34c`
- Post-remediation validation commands and results: `npm run prep` passed lint, Next build, 105 regular tests and 11 CI tests.
- Harness retro report: pending review approval.
- Harness retro commit subject: `chore(TASK-003): record advanced search harness retro`
- Harness retro commit: pending review approval.
- Final sign-off: pending full workflow.

### Code-review rounds

| Round | Commit range | Verdict | Report | Findings / remediation |
| --- | --- | --- | --- | --- |
| 1 | `2403e63..09c4e33` | `CHANGES_REQUESTED` | `.agents/reviews/TASK-003-09c4e33.md` | Bound page/offset, paginate the full planner catalog and add real backslash coverage. Remediated by `8e5b34c`. |
| 2 | `2403e63..8e5b34c` | pending | pending | Independent re-review in progress. |

## Acceptance evidence

| ID | Acceptance criterion / TODO item | Implementation artifact | Passing verification |
| --- | --- | --- | --- |
| AC-01 | PostgreSQL-independent search criteria | `CookedDishSearchCriteria.ts` and domain error | Criteria unit suite; final `npm run prep` |
| AC-02 | Combinable filters, allowed sorting and safe limits | Criteria value object with page cap 1000 and repository query | Boundary tests prove page 1000 accepted/page 1001 rejected; PostgreSQL tests; final `npm run prep` |
| AC-03 | Necessary indexes with justification | `databases/4-cooked-dish-search.sql` with rationale comments | DDL applied; `pg_indexes` confirms three indexes; EXPLAIN inspected |
| AC-04 | Safe parameterized PostgreSQL query | `PostgresCookedDishRepository.search` | 10 real repository tests including literal `%`, `_`, backslash and apostrophe; final `npm run prep` |
| AC-05 | Search use case keeps route free of business logic | `CookedDishesSearcher` | Use-case tests and successful build; pending independent review |
| AC-06 | GET cooked-dishes supports new parameters | Thin `src/app/api/cooked-dishes/route.ts` | API tests for repeated/default/invalid params; final `npm run prep` |
| AC-07 | Results plus pagination metadata | Search result projection/use case/API envelope | Use-case, API and React tests; final `npm run prep` |
| AC-08 | Consistent invalid-parameter responses | `InvalidCookedDishSearchCriteriaError` and route mapping | 13 invalid criteria cases plus API 400 test |
| AC-09 | UI filters, sorting and pagination | Home search form, adapter and pagination controls | Real React component tests; successful Next build |
| AC-10 | UI results, metadata, loading and error states | Home result/state branches with request invalidation | React loading/error/retry/empty/result/stale tests |
| AC-11 | Tests for isolated/combined filters, sorting and limits | Criteria, repository and application test suites | Focused 26 tests plus real SQL matrix; final `npm run prep` |
| AC-12 | Real SQL integration catches query errors | Extended `PostgresCookedDishRepository.test.ts` | 10/10 real PostgreSQL tests passed; final regular suite passed |
| AC-13 | Full lint, build and tests | Entire TASK-003 implementation | Post-remediation `npm run prep` passed: lint, Next build, 105 regular and 11 CI tests |
| AC-14 | Invoke harness-retro and register recommendations | Pending closeout retro | Pending harness-retro report and TODO register |
