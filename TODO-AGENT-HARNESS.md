# Agent Harness TODO

Recommendations for agent harness engineering and agent configuration best practices.

## 🚨 Recommendations

| ID | Priority | Recommendation | Owner | Status |
| --- | --- | --- | --- | --- |
| AH-001 | High | Keep agent harness guidance and test infrastructure guidance in separate documentation and TODO tracks. | Agent Platform | ✅ Done |
| AH-002 | High | Require explicit role boundaries and shared contracts before delegating parallel agent work. | Agent Platform | ✅ Done |
| AH-003 | Medium | Validate agent frontmatter, declared tools, and required role documentation in CI. | Agent Platform | ✅ Done |
| AH-004 | Medium | Keep `harness-retro` recommendations classified as `agent-harness` or `test-infrastructure` in every report. | Agent Platform | ✅ Done |
| AH-005 | High | Standardize delegation prompts with named ownership, input/output contracts, dependency order, stop conditions, and an integration handoff. | Agent Platform | ✅ Done |
| AH-006 | Medium | Define and validate a least-privilege tool matrix for each agent role instead of granting every implementation agent the same tool set. | Agent Platform | ✅ Done |
| AH-007 | Medium | Persist a task-level coordination record containing delegation briefs, agent run/output references, contract-review checkpoints, and integrated sign-off. | Agent Platform | ✅ Done |
| AH-008 | High | Make the post-task `harness-retro` invocation and TODO status update an explicit multi-agent task closeout gate. | Agent Platform | ✅ Done |
| AH-009 | High | Require task closeout to map every acceptance criterion and checked TODO item to an implementation artifact and a passing verification; reject checkbox-only completion. | Task Lead | ✅ Done |
| AH-010 | High | Make the canonical full-validation command run both regular and `.ci` tests, or require both commands explicitly in the task closeout checklist. | Test Infrastructure | ✅ Done |
| AH-011 | Medium | Validate documented repository commands against `package.json` scripts so guidance uses executable forms such as `npm run prep`. | Agent Platform | ✅ Done |
| AH-012 | Medium | Add a task-start preflight that checks required service availability and tool permissions, and reports an actionable database-start instruction before implementation or verification begins. | Developer Experience | ✅ Done |
| AH-013 | High | Enforce an independent `code-review` agent gate with a reviewed commit range, approved verdict, and persisted evidence before task closeout. | Agent Platform | ✅ Done |
| AH-014 | High | Require every delegated agent to acknowledge the exact shared contract, including null and empty-state semantics, and verify its output against that contract before integration handoff. | Task Lead | ✅ Done |
| AH-015 | Medium | Require delegated test work that changes typed mocks or interface implementations to run a TypeScript-aware build or typecheck in addition to focused Jest tests before handoff. | Test Infrastructure | ✅ Done |
| AH-016 | High | Make closeout validation lifecycle-aware so task preflight and delegated checks accept explicitly in-progress coordination records while final closeout still rejects pending evidence. | Agent Platform | ✅ Done |
| AH-017 | Medium | Persist every code-review round and its findings, remediation commit, and verdict in the task coordination record and under `.agents/reviews/`, rather than retaining only the final approval. | Task Lead | ✅ Done |
| AH-018 | Medium | Audit required frontend component-test capabilities before delegation and provision `jsdom` plus React Testing Library before implementation when acceptance criteria require interactive UI proof. | Test Infrastructure | ✅ Done |
| AH-019 | Medium | Use a stable icon/emoticon for every user-visible workflow update: 🗄️ database, ⚙️ backend, 🎨 frontend, 🧪 testing, 🔍 review, 🧰 retro, ✅ HIL/cierre. | Task Lead | ✅ Done |
| AH-020 | High | Include the current coordination record in the same commit as the implementation, test, review or harness files that caused its update; avoid separate coordination-progress commits when associated artifacts exist. | Task Lead | ✅ Done |
| AH-021 | Medium | Time-box focused tests that depend on external services and emit an actionable diagnostic on timeout or sandbox denial, so agents can distinguish infrastructure access failures from product failures without waiting indefinitely. | Test Infrastructure | ✅ Done |
| AH-022 | Medium | Name newly spawned agent threads with the current task identifier and role; when reusing a persistent legacy thread, spawn a correctly named nested worker and expose that current name in user-visible status. | Task Lead | ✅ Done |
| AH-023 | High | Fetch complete Git history in CI before validating commit-backed coordination evidence, and keep a harness regression check that rejects shallow checkout configuration for that validation job. | Test Infrastructure | ✅ Done |
| AH-024 | High | Make push plus successful monitoring of the corresponding GitHub Actions run the final task-completion gate, and include its URL and result in the HIL handoff. | Task Lead | ✅ Done |
| AH-025 | High | Require a producer-to-consumer contract test for every shared boundary implemented by different agents, and record its passing command in the integration handoff before the implementation commit. | Task Lead | ✅ Done |
| AH-026 | Medium | Serialize or isolate delegated commands that write shared build state (especially Next.js `.next`), while allowing independent read-only and focused test work to remain parallel. | Developer Experience | ✅ Done |
| AH-027 | Medium | Require mutation-tool onboarding to probe the repository's actual test environments before selecting coverage analysis, and document an evidence-based fallback when file-level environments are incompatible with per-test coverage. | Test Infrastructure | ✅ Done |
| AH-028 | High | Require tools that create instrumented or generated sandboxes to clean them after success and failure, and exclude their temp/report paths from repository-wide lint, formatting, test discovery, and Git. | Developer Experience | ✅ Done |
| AH-029 | High | Isolate parallel tasks in dedicated linked Git worktrees and task branches, with validated identifiers, explicit task-lead integration, and cleanup that refuses dirty worktrees. | Developer Experience | ✅ Done |

### AH-029 completion evidence

- `scripts/agent-harness/task-worktree.sh` creates, lists, and safely finishes a
  dedicated `task/TASK-XXX` worktree under an external configurable root. It
  rejects unsafe identifiers, duplicate branches/paths and in-repository roots;
  cleanup uses no force, refuses tracked or untracked changes, and preserves the
  task branch for explicit task-lead integration and later deletion.
- `scripts/agent-harness/test-task-worktrees.sh` creates two real linked
  worktrees in a temporary repository, proves task files and `.next` output are
  isolated, checks duplicate/unsafe input rejection, and proves a dirty
  worktree cannot be removed. It is part of `npm run agents:validate` through
  `validate-agent-config.sh`.
- `AGENTS.md`, `docs/agent-harness.md`, the delegation template, and coordination
  README require agents to stay in the assigned worktree and make the task lead
  merge or cherry-pick deliberately. They also state that PostgreSQL and Ollama
  remain shared and require namespacing or serialization.

## TASK-004 harness retrospective — 2026-08-20

### Short summary

Parallel role isolation was effective for ownership and focused verification,
but it allowed a persistence-to-API shape mismatch to survive the delegated
handoffs: the backend/persistence path held snapshot-shaped `changes`, while the
frontend required a normalized `changes[]`. The task lead caught and corrected
the mismatch during integrated diff inspection, added cross-boundary contract
coverage before commit `5aa0477`, and the independent review subsequently
returned `APPROVED`; a separate Next.js build lock showed that write-heavy
verification also needs resource-aware scheduling.

### Timeline

- The task lead fixed shared domain, persistence, API and test contracts before
  delegating database, backend, frontend and testing work.
- Each delegated role completed its focused tests/build and handed off its
  owned artifacts without reporting a contract violation.
- During integrated diff inspection, the task lead found that persisted audit
  entries exposed snapshot objects whereas the frontend parser expected the
  public `changes` array.
- Before the implementation commit, the task lead added the projection in
  `CookedDishHistorySearcher` and a contract test proving the normalized API
  shape consumed by the frontend.
- Concurrent Next.js builds contended on shared `.next` build state; serializing
  those builds removed the environmental conflict.
- Commit `5aa0477` passed `npm run prep`; independent review of
  `5aa0477^..5aa0477` returned `APPROVED` with 8 focused suites / 25 tests.

### Root causes

| Cause | Classification | Confidence | Impact |
| --- | --- | --- | --- |
| Delegated verification stopped at role-local tests and did not require one executable producer-to-consumer example at the persistence/application/frontend boundary. | Coordination / process | High | Both implementations could be locally green while disagreeing on the runtime representation of `changes`; lead integration inspection became the first effective boundary check. |
| Parallel agents ran Next.js builds against the same workspace and shared `.next` state without a resource lock or isolated output directory. | Environment / tool coordination | High | A build lock created a false-negative verification signal and avoidable delay; serialization was required. |

The existing written contract and acknowledgement controls (AH-002, AH-005,
AH-007 and AH-014) remain valid and are not duplicated here. TASK-004 exposed a
more specific missing enforcement mechanism: executable compatibility between
separately owned producer and consumer artifacts.

### Evidence

- `.agents/coordination/task-004-cooked-dish-audit-history-2026-08-20.md`
  records all four role handoffs, the lead's projection correction, the initial
  full validation, and the acceptance-evidence mapping.
- `src/contexts/dishes/cooked-dish-history/infrastructure/PostgresCookedDishAuditRepository.ts`
  reconstructs the stored snapshot/delta object as `CookedDishAuditChanges`.
- `src/contexts/dishes/cooked-dish-history/application/search/CookedDishHistorySearcher.ts`
  is the integration projection that converts that object to the public
  `changes: {field,before,after}[]` contract.
- `tests/contexts/dishes/cooked-dish-history/application/search/CookedDishHistorySearcher.test.ts`
  proves the persistence-domain entry is projected to the public history
  representation; `tests/app/cooked-dishes/cooked-dish-history-api.test.ts`
  proves the frontend accepts that representation.
- `.agents/reviews/TASK-004-5aa0477.md` records `APPROVED`, a clean diff check,
  preflight success, and 8 focused suites / 25 passing tests, including the
  cross-layer and real PostgreSQL checks.

### Prioritized remediation plan and applicability

| Order | ID | Applicability to current harness | Action | Proposed verification evidence |
| --- | --- | --- | --- | --- |
| Immediate | AH-025 | Applicable now; TASK-004 has multiple independently owned runtime boundaries. | Extend the delegation template/coordination validator so each cross-agent boundary names a producer fixture, consumer assertion and command, and the integration handoff cannot complete without passing evidence. | A harness regression fixture with locally green producer/consumer tests but an incompatible payload must be rejected; a fixture recording a passing cross-boundary Jest test must be accepted; `npm run agents:validate` passes. |
| Immediate | AH-026 | Applicable now; all agents share one worktree and Next.js writes `.next`. | Add a repository-supported serialized build wrapper or lock and require delegated agents to use it for shared-state builds; document which commands may still run concurrently. | Run two wrapper invocations concurrently and show that the second waits then both succeed without a `.next/lock` error; add a deterministic shell regression test and run `npm run agents:validate`. |

No long-term recommendation is warranted from the supplied evidence. The two
immediate items cover the observed coordination and environment failure modes;
broader workspace isolation would add cost without evidence that it is needed.

### Follow-up tasks

| ID | Suggested owner | Estimate | Deliverable |
| --- | --- | --- | --- |
| AH-025 | Task Lead with Test Infrastructure | 2–4 hours | Delegation-template fields, closeout validation, regression fixtures, and documentation for executable cross-agent contracts. |
| AH-026 | Developer Experience | 1–3 hours | Shared-build lock/wrapper, concurrency regression test, and agent command guidance. |

### Preventive checks and monitoring

- At contract checkpoint, label every boundary with its producing agent,
  consuming agent, canonical fixture and one compatibility command.
- At integration handoff, reject evidence made only of separate producer and
  consumer unit suites when no test passes the producer-shaped value directly
  through the consumer contract.
- Treat `.next`, coverage directories, generated clients and database schemas
  as declared shared resources in delegation briefs; schedule exclusive writers
  and retain parallelism for independent focused tests.
- Track build-lock diagnostics separately from product failures so orchestration
  problems do not trigger unnecessary application changes.

### AH-025 completion evidence

- `.agents/DELEGATION_TEMPLATE.md` and the coordination conventions require one
  row per cross-agent runtime boundary naming the producer fixture, consumer
  assertion, exact command and `producer-to-consumer: PASS` evidence.
- `scripts/agent-harness/validate-task-closeout.sh` rejects closed records with
  missing rows, same-agent ownership, placeholders, or role-local-only evidence.
- `scripts/agent-harness/test-task-closeout-lifecycle.sh` rejects a fixture whose
  producer and consumer suites are locally green but do not cross the boundary,
  then accepts the same fixture with complete executable contract evidence.
- TASK-004 now passes a real `CookedDishHistorySearcher` result directly through
  `parseCookedDishHistory`; the focused Jest command and `npm run
  agents:validate` provide the recorded passing evidence.

### AH-026 completion evidence

- `scripts/agent-harness/run-with-next-lock.sh` serializes shared `.next` writers
  with an atomic lock, bounded wait, owner diagnostics and trap-based cleanup.
- `scripts/agent-harness/test-next-build-lock.sh` starts two concurrent wrapper
  invocations and proves that the second waits, both commands succeed in order,
  and the lock is released.
- The regression runs from `validate-agent-config.sh`; the delegation template
  and harness guide distinguish exclusive generated-state commands from work
  that remains safe to parallelize.

## TASK-005 harness retrospective — 2026-08-20

### Short summary

Stryker integrated successfully, but two dry-run failure modes exposed missing
tool-onboarding safeguards: coverage analysis assumed a uniform Jest
environment, and abandoned instrumented sandboxes were later traversed by
repository-wide ESLint. Configuration changes (`coverageAnalysis: "off"`,
`cleanTempDir: "always"`, and explicit ignores) produced a clean 149-test dry
run without weakening the regular `prep` gate.

### Timeline

- Initial Stryker dry runs using `perTest` and `all` coverage analysis failed
  when the existing Jest suite selected `jsdom` through file-level environment
  directives alongside Node tests.
- Changing coverage analysis to `off` allowed Stryker to execute the existing
  mixed-environment suite correctly.
- Failed exploratory runs left `.stryker-tmp` instrumented sandboxes behind.
- A later `eslint . --fix` recursively inspected those generated copies,
  creating avoidable noise and work outside the intended source tree.
- Stryker was configured with `cleanTempDir: "always"`; `.stryker-tmp/**/*`
  and `reports/mutation/**/*` were added to ESLint ignores, while both output
  roots were excluded from Git.
- `npm run test:mutation:dry` then passed with 123 instrumented source files,
  2,343 mutants and all 149 Jest tests; independent review of
  `b7cc5bc^..b7cc5bc` returned `APPROVED`.

### Root causes

| Cause | Classification | Confidence | Impact |
| --- | --- | --- | --- |
| Mutation-tool setup selected coverage modes before proving compatibility with the repository's mixed file-level Jest environments. | Test infrastructure / configuration | High | `perTest` and `all` produced false-negative onboarding failures until coverage analysis was disabled. |
| Generated-sandbox lifecycle relied on successful tool termination and did not initially protect broad repository scanners from abandoned instrumented files. | Developer experience / environment | High | Failed dry runs polluted later lint-fix traversal and risked modifying or reporting generated copies. |

AH-026 remains relevant to concurrent writers of shared generated state, but it
does not cover environment compatibility or cleanup after a failed single-tool
run. AH-027 and AH-028 therefore add distinct controls rather than duplicating
the existing serialization recommendation.

### Evidence

- `stryker.config.mjs` uses the existing Jest config with
  `coverageAnalysis: "off"`, `tempDirName: ".stryker-tmp"`, and
  `cleanTempDir: "always"`.
- `eslint.config.mjs` excludes `.stryker-tmp/**/*` and
  `reports/mutation/**/*`; `.gitignore` excludes both output roots.
- `.agents/coordination/task-005-mutation-testing-2026-08-20.md` maps AC-01
  through AC-04 to the committed configuration and passing verification.
- `.agents/reviews/TASK-005-b7cc5bc.md` records the independent dry-run
  reproduction: 123 source files, 2,343 mutants and 149 passing tests.

### Prioritized remediation plan and applicability

| Order | ID | Applicability to current harness | Action | Proposed verification evidence |
| --- | --- | --- | --- | --- |
| Immediate | AH-028 | Applicable now; Stryker creates instrumented copies and repository commands scan from `.`. | Add a harness validation rule or documented tool-onboarding checklist requiring unconditional temp cleanup plus matching scanner and Git exclusions for every declared generated root. | A regression fixture with a generated sandbox must be ignored by lint/test discovery and Git; force a failed dry run, verify the temp root is removed, then run `npm run lint -- --no-fix` and `npm run agents:validate`. |
| Short-term | AH-027 | Applicable now; Jest contains both Node and file-level `jsdom` environments. | Add a mutation-onboarding compatibility check that inventories Jest environment selection, tries supported coverage modes, records failures, and permits `off` only with a passing full dry run and rationale. | Run the probe against one Node and one file-level-jsdom suite; retain the failed-mode diagnostic and prove `npm run test:mutation:dry` executes all discovered tests successfully. |

No broader long-term recommendation is justified by the evidence. These two
controls address the observed configuration and generated-artifact lifecycle
failures directly.

### Follow-up tasks

| ID | Suggested owner | Estimate | Deliverable |
| --- | --- | --- | --- |
| AH-027 | Test Infrastructure | 1–2 hours | Environment inventory/probe, documented coverage-mode decision rule, and a mixed-environment regression fixture. |
| AH-028 | Developer Experience | 1–2 hours | Generated-root onboarding checklist/validator and failure-path cleanup plus scanner-ignore regression checks. |

### Preventive checks and monitoring

- Before accepting mutation configuration, enumerate Jest environment sources,
  including file-level docblocks, and run a dry test with each represented
  environment.
- Treat `coverageAnalysis: "off"` as a compatibility decision supported by a
  complete dry run, not as an unexplained default.
- For every tool-owned temp or report root, require three protections: cleanup
  on failure, exclusion from broad scanners, and exclusion from Git.
- After an intentionally failed tool run, check both filesystem cleanup and a
  clean `git status --short` before running repository-wide fix commands.

## Maintenance rules

- Keep agent configuration recommendations in this file only.
- Assign stable IDs and do not duplicate equivalent items.
- Use `✅ Done`, `⏳ Pending`, or `🚫 Blocked` in the `Status` column.
