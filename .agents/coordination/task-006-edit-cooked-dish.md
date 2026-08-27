# Delegation brief — TASK-006

## Objective

- Task: Edit an existing cooked dish from the UI
- Task identifier (`TASK-XXX`): `TASK-006`
- Lifecycle: `in-progress`
- Change classification: `code`
- Expected outcome: A registered user can edit the name, description, and ingredients of an existing cooked dish from the detail page. The edit form is prefilled, validates input, shows loading/success/error states, and cancel preserves original data.
- Scope boundaries: Edit flow only — no bulk edit, no metadata outside name/description/ingredients.
- Task worktree path: `/home/runner/work/agentic_programming-course-subagents-experiment/.agentic_programming-course-subagents-experiment-task-worktrees/TASK-006`
- Task branch: `task/TASK-006`
- Shared-service isolation plan: No PostgreSQL or Ollama usage in this task (frontend-only UI change using existing PUT API).

## Harness-generated task brief

- Functional source: TASK-006 "Edit an existing cooked dish from the UI"
- Functional outcome to preserve verbatim: Visible edit action, prefilled form, update name/description/ingredients, validation, cancel preserves data, loading/success/error states, immediate UI reflection.
- Applicable role agents selected by the harness: `frontend-engineer`
- Harness constraints added to delegation prompts: Use existing PUT `/api/cooked-dishes/[uuid]` endpoint with `X-Actor-Id` header; do not add new API routes; follow onion architecture.

## Ownership and contracts

| Agent | Owns | Inputs | Required output | Must not change |
| --- | --- | --- | --- | --- |
| frontend-engineer | Edit UI in `src/app/cooked-dishes/[id]/page.tsx` + CSS | Existing PUT API contract | Edit form, tests, CSS styles | API routes, domain layer |

- Domain contract: none (uses existing `CookedDishUpserter` via PUT API)
- Persistence contract: none
- API contract: `PUT /api/cooked-dishes/:uuid` with `X-Actor-Id` header; body `{ name, description, ingredients }`
- Test contract: jsdom component tests in `tests/app/cooked-dishes/`

For interactive frontend acceptance criteria:
- TSX transform available: yes (`@swc/jest`)
- DOM environment (`jsdom`) available: yes (per-file `@jest-environment jsdom`)
- React render/query/user-event tooling available: yes (`@testing-library/react`)
- Component-level scenarios required by acceptance criteria: yes (see AC table)

## Contract acknowledgements

| Agent | Contract acknowledged before implementation | Boundary semantics checked | Verification evidence before handoff |
| --- | --- | --- | --- |
| frontend-engineer | PUT API contract, jsdom env | null dish, API error, cancel preserves data | 8 tests passing (`tests/app/cooked-dishes/cooked-dish-detail-edit.test.tsx`) |

## Dependencies and stop conditions

1. Contract checkpoint: PUT API already exists and tested
2. Implementation order/dependencies: UI only; no backend changes needed
3. Stop condition: all 8 component tests green, `npm run prep` passes
4. Escalation condition: PUT API shape change would require backend changes first

## Integration handoff

- Implementation commit subject: `feat(TASK-006): Edit an existing cooked dish from the UI`
- Implementation commit: `f7582ed`
- Code-review agent: `code-review`
- PR code review commit range: `f7582ed^..f7582ed`
- Code-review verdict: `APPROVED`
- Code-review evidence: no significant findings; all 7 ACs verified; 8 tests pass; 3 non-blocking informational notes
- Code-review report: `.agents/reviews/TASK-006-f7582ed.md`
- Remediation required: no
- Remediation commit subject: none (no findings)
- Remediation commit: none
- Post-remediation validation commands and results: n/a
- Harness retro report: `TODO-AGENT-HARNESS.md` — AH-032 added (enforce task-bootstrap gate before implementation)
- Harness retro commit subject: `chore(TASK-006): record harness retro`
- Harness retro commit: `c0e7d9f`
- Final sign-off: _pending_
- Task-lead integration method: rebase onto updated `main`, then `git merge --no-ff`; fallback to direct `merge --no-ff` on `main`
- Clean worktree removal evidence (`task-worktree.sh finish TASK-006`): _pending_

### Harness TODO disposition

| TODO ID | Priority | Decision | Justification |
| --- | --- | --- | --- |
| AH-032 | High | **Deferred — out of scope** | AH-032 requires 2–4 h of Agent Platform harness infrastructure work (changes to `task-worktree.sh`, `validate-task-closeout.sh`, regression fixtures). This is not applicable within TASK-006 (UI feature task). AH-032 remains open in `TODO-AGENT-HARNESS.md` for the next harness improvement sprint. |

All new harness TODOs reviewed. No implementable harness improvements identified within TASK-006 scope.

### Cross-agent boundary contracts

| Boundary | Producer agent | Consumer agent | Producer fixture | Consumer assertion | Passing command | Passing evidence |
| --- | --- | --- | --- | --- | --- | --- |
| none (no cross-agent runtime boundaries) | — | — | — | — | — | — |

### Code-review rounds

| Round | Commit range | Verdict | Report | Findings / remediation |
| --- | --- | --- | --- | --- |
| 1 | `f7582ed^..f7582ed` | `APPROVED` | `.agents/reviews/TASK-006-f7582ed.md` | No significant findings; 3 informational notes (non-blocking); no remediation |

## Acceptance evidence

| ID | Acceptance criterion / TODO item | Implementation artifact | Passing verification |
| --- | --- | --- | --- |
| AC-01 | A visible edit action is available from the dish details view | `Edit dish` button in `src/app/cooked-dishes/[id]/page.tsx` | `cooked-dish-detail-edit.test.tsx`: "show an edit button on the dish detail page" ✅ |
| AC-02 | The edit form is prefilled with the current name, description, and ingredients | `startEditing()` initialises form state from `dish` | `cooked-dish-detail-edit.test.tsx`: "open the edit form prefilled with current dish data" ✅ |
| AC-03 | Users can update name, description, and ingredients and save | `saveEdit()` calls PUT with updated body | `cooked-dish-detail-edit.test.tsx`: "calls PUT with updated data and correct author header" ✅ |
| AC-04 | Invalid input is rejected before submission with clear validation messages | Validation in `saveEdit()` for empty name, ingredients, author | `cooked-dish-detail-edit.test.tsx`: "rejects empty dish name…" + "rejects missing author name…" ✅ |
| AC-05 | Canceling the edit preserves the original dish data | `cancelEditing()` closes form without mutation; `setDish` only updated on API success | `cooked-dish-detail-edit.test.tsx`: "restores original dish data and closes form when cancel is clicked" ✅ |
| AC-06 | The UI shows loading, success, and error states during the update flow | `isSaving` disables submit, `editSuccess` shown after save, `editError` on API failure | `cooked-dish-detail-edit.test.tsx`: "shows an error alert…" + "reflects saved changes…shows success message" ✅ |
| AC-07 | Saved changes are immediately reflected in the UI without stale values | `setDish(...)` with new values on successful PUT response | `cooked-dish-detail-edit.test.tsx`: "reflects saved changes in the UI and shows success message after save" ✅ |
