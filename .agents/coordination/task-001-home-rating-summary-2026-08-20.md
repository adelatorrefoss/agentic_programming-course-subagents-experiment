# TASK-001 home rating summary coordination

## Objective

- Task: Complete cooked-dish ratings by exposing their summary on home cards.
- Task identifier (`TASK-XXX`): `TASK-001`.
- Expected outcome: Every cooked-dish card shows its average score and rating count, including an explicit unrated state.
- Scope boundaries: Reuse the existing rating domain, persistence, use cases and detail UI; do not change rating invariants.

## Ownership and contracts

| Agent | Owns | Inputs | Required output | Must not change |
| --- | --- | --- | --- | --- |
| `frontend-engineer` | Home list integration, card markup and CSS; minimal list API/application enrichment when needed | Existing cooked-dish list and rating summary contracts | Rated and unrated cards without per-card navigation | Rating invariants and persistence schema |
| `testing-engineer` | Focused automated regression tests | List response contract with `ratingSummary` | Proof for rated and unrated dishes | Production files |
| Primary agent | Integration, full verification, commits and closeout | Both agent handoffs | Reviewed, reproducible integrated result | Unrelated tasks |

Shared contracts were fixed before implementation delegation:

- Domain contract: `CookedDishRatingSummary` remains `{ average, total, distribution }`; an unrated dish has `average: null` and `total: 0`.
- Persistence contract: Existing `dishes.cooked_dish_ratings` schema and uniqueness constraints remain unchanged.
- API contract: `GET /api/cooked-dishes` returns each cooked dish with a `ratingSummary`; no N+1 client requests.
- Test contract: Cover list enrichment for rated and unrated dishes and retain the existing rating test suite.

## Dependencies and stop conditions

1. Contract checkpoint: Existing rating summary types and endpoints were inspected before delegation.
2. Implementation order/dependencies: UI/API and focused tests may proceed in parallel against the contract above; primary agent integrates them.
3. Stop condition for each agent: Focused checks pass and changed files plus contract decisions are reported; agents do not commit.
4. Escalation condition: Stop only if the current API cannot expose summaries without changing stored rating semantics.

## Integration handoff

- Implementation commit subject: `feat(TASK-001): show rating summaries on home cards`
- Agent output references: `task001_frontend`, `task001_tests`.
- Implementation commit: `2ea1efc`
- Code-review agent: `code-review`
- PR code review commit range: `9caf3f4..2ea1efc`
- Code-review verdict: `APPROVED`
- Code-review evidence: Committed diff inspected end-to-end; batched rating enrichment and rated/unrated home-card rendering are correct; focused application/API tests passed (2 suites, 3 tests). The PostgreSQL-focused reviewer rerun was blocked only by sandbox `EPERM`; its passing `npm run prep` evidence is recorded in the coordination record.
- Code-review report: `.agents/reviews/TASK-001-2ea1efc.md`
- Remediation required: no
- Remediation commit subject: `fix(TASK-001): address home rating summary review`
- Remediation commit: none (no findings)
- Post-remediation validation commands and results: not applicable; `npm run prep` passed before review (44 regular + 11 CI tests).
- Harness retro report: `TODO-AGENT-HARNESS.md` entries `AH-014` and `AH-015`; contract acknowledgment and typed-mock validation gates recommended.
- Harness retro commit subject: `chore(TASK-001): record home rating summary harness retro`
- Harness retro commit: `4c23ade`
- Final sign-off: TASK-001 implementation and independent review are complete; harness recommendations AH-014 and AH-015 are implemented in the following harness-control commit.

## Acceptance evidence

Every checked TASK-001 item and its remaining home-card criterion is represented below. Existing feature evidence is revalidated by the final `npm run prep`.

| ID | Acceptance criterion / TODO item | Implementation artifact | Passing verification |
| --- | --- | --- | --- |
| AC-01 | Persist ratings linked to cooked dishes | `database/migrations`, `PostgresCookedDishRatingRepository` | `PostgresCookedDishRatingRepository.ci.test.ts`; final `npm run prep` |
| AC-02 | Store author, score, comment and creation date | `CookedDishRating`, rating migration/repository | Domain and PostgreSQL rating tests; final `npm run prep` |
| AC-03 | One rating per author and dish | Rating unique constraint and repository error mapping | Duplicate integration/application tests; final `npm run prep` |
| AC-04 | Model rating invariants in domain | `CookedDishRating`, `CookedDishRatingScore` | `CookedDishRating.test.ts`; final `npm run prep` |
| AC-05 | Add-rating use case | `CookedDishRatingAdder` | `CookedDishRatingAdder.test.ts`; final `npm run prep` |
| AC-06 | Rating-summary use case | `CookedDishRatingsSummarizer` | `CookedDishRatingsSummarizer.test.ts`; final `npm run prep` |
| AC-07 | POST ratings API | `src/app/api/cooked-dishes/[uuid]/ratings/route.ts` | Build and rating suites; final `npm run prep` |
| AC-08 | GET ratings summary API | `src/app/api/cooked-dishes/[uuid]/ratings/route.ts` | Summary and PostgreSQL tests; final `npm run prep` |
| AC-09 | DIOD registrations | `diod.config.ts` | Next build; final `npm run prep` |
| AC-10 | Unit tests for domain and use cases | Rating domain/application tests | Final `npm run prep` |
| AC-11 | PostgreSQL repository integration tests | `PostgresCookedDishRatingRepository.ci.test.ts` | Final `npm run test:ci` via `npm run prep` |
| AC-12 | Missing dish, invalid score and duplicate errors | Rating errors, use case and route mapping | Rating unit/integration tests; final `npm run prep` |
| AC-13 | Detail UI shows average and distribution | `src/app/cooked-dishes/[id]/page.tsx` | Next build; final `npm run prep` |
| AC-14 | Detail UI submits score and comment | `src/app/cooked-dishes/[id]/page.tsx` | Next build; final `npm run prep` |
| AC-15 | Detail UI loading, success and error states | `src/app/cooked-dishes/[id]/page.tsx` | Next build; final `npm run prep` |
| AC-16 | Home cards show average/count and unrated state | `AllCookedDishesSearcher`, `PostgresCookedDishRatingRepository.summarizeMany`, `src/app/page.tsx` | Searcher/API/PostgreSQL tests and successful `npm run prep` (44 regular + 11 CI tests) |
| AC-17 | Full lint, build and test verification | Entire TASK-001 implementation | `npm run prep` passed: lint, Next production build, 44 regular and 11 CI tests |
