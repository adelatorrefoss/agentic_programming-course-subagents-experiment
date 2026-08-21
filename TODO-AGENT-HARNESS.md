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
| AH-030 | Medium | Validate that product task catalogs contain only functional titles and observable scope, while delegation prompts, role assignments, test strategy, architecture rules, validation commands, and closeout gates remain owned by the harness. | Agent Platform | ✅ Done |
| AH-031 | High | Make shared-service discovery independent of the current linked-worktree directory, and ensure preflight recovery instructions target the canonical Compose project instead of creating a port-conflicting per-worktree project. | Developer Experience | ✅ Done |

### AH-031 completion evidence

- `compose.yml` declares the canonical project name, so Compose service discovery
  and the existing recovery command resolve the same shared PostgreSQL project
  from the main checkout and every linked worktree.
- `scripts/agent-harness/test-task-worktrees.sh` compares the rendered Compose
  project name in its fixture repository, a numeric task worktree, and a task
  worktree with an uppercase suffix without starting any containers.
- `npm run agents:validate` and `npm run task:preflight` pass from TASK-007B.

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

## TASK-018 harness retrospective — 2026-08-21

### Short summary

The closeout lifecycle previously described remote publication too broadly:
agents could interpret it as pushing and checking CI for the feature branch.
TASK-018 makes the repository's trunk-based workflow explicit: validate the
feature branch locally, merge it into `main`, push only `main`, and require the
corresponding `main` GitHub Actions run to pass. The remote-CI verifier now
rejects a branch override even when the override is supplied through its
environment, and the independent review returned `APPROVED`.

### Timeline

- The task lead identified the mismatch between the desired local feature-branch
  workflow and the previous closeout wording.
- `AGENTS.md`, `docs/agent-harness.md`,
  `docs/agents/task-closeout-workflow.md`, and
  `.agents/DELEGATION_TEMPLATE.md` were updated to state that feature branches
  are local only and that publication/remote CI happen after integration into
  `main`.
- `verify-remote-ci.sh` was first made branch-aware, then corrected to make
  `main` mandatory rather than configurable.
- `test-verify-remote-ci.sh` gained a regression that attempts to set
  `REMOTE_CI_EXPECTED_BRANCH=task/TASK-018`; the verifier correctly rejects the
  task-branch evidence.
- The focused verifier test and `npm run agents:validate` passed. Independent
  review of `deaf6ff..034252d` returned `APPROVED` with no findings.

### Root causes

| Cause | Classification | Confidence | Impact |
| --- | --- | --- | --- |
| Closeout guidance used generic pushed-commit language and did not state that the remote branch must be `main`. | Coordination / process | High | The documented lifecycle was ambiguous with respect to trunk-based development and could cause unnecessary task-branch pushes or CI checks. |
| The verifier briefly accepted an environment-provided expected branch, so a caller could request successful CI evidence from a task branch. | Agent harness validation | High | A successful but disallowed task-branch run could have been treated as final evidence. |

### Evidence

- `AGENTS.md`, `docs/agent-harness.md`,
  `docs/agents/task-closeout-workflow.md`, and
  `.agents/DELEGATION_TEMPLATE.md` document local-only feature branches and
  main-only publication/CI.
- `scripts/agent-harness/verify-remote-ci.sh` hard-codes `expected_branch="main"`
  and matches both SHA and branch.
- `scripts/agent-harness/test-verify-remote-ci.sh` proves that successful
  `main` evidence passes, task-branch evidence fails, and an attempted
  `REMOTE_CI_EXPECTED_BRANCH` override still fails.
- `.agents/reviews/TASK-018-034252d.md` records the independent `APPROVED`
  verdict for `deaf6ff..034252d`.
- `bash scripts/agent-harness/test-verify-remote-ci.sh` and `npm run
  agents:validate` passed during this retrospective.

### Prioritized remediation plan and applicability

| Order | ID | Applicability to current harness | Action | Verification evidence |
| --- | --- | --- | --- | --- |
| Completed | AH-024 | Applicable and completed. Remote publication and successful monitoring are the final gate, but the target is specifically the integrated `main` commit under trunk-based development. | Keep the lifecycle documentation and verifier aligned on local-only task branches, `main` integration, main push, and green remote CI. | Main-only lifecycle source scan, `bash scripts/agent-harness/test-verify-remote-ci.sh`, `npm run agents:validate`, and the recorded approved review. |

No new harness TODO is warranted. AH-029 already governs local task worktrees,
and AH-024 governs publication plus remote-CI completion; TASK-018 clarifies
their relationship for trunk-based development without introducing another
overlapping recommendation.

### Follow-up tasks

None. The applicable existing recommendation is implemented, and no separate
configuration or production-code patch is justified by this retrospective.

### Preventive checks and monitoring

- Treat feature branches as local validation workspaces only; do not push them
  or use their runs as final CI evidence.
- Integrate the reviewed task branch into `main` before publication and remote
  verification.
- Keep the verifier's accepted branch non-configurable and test attempted
  environment overrides in regression coverage.
- Record the `main` SHA, GitHub Actions URL, and successful conclusion in the
  final HIL handoff without creating a follow-up evidence commit.

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

## TASK-017 harness retrospective — 2026-08-21

### Short summary

TASK-017 correctly moved orchestration concerns out of `TODO.md` and made the
harness responsible for generating delegation prompts from each task's title
and functional scope. The policy is explicit and the implementation review was
approved, but the separation is not yet protected by an automated regression
check. AH-030 was identified and completed during closeout.

### Timeline

- The task lead ran the task preflight and verified the existing harness sources
  for testing, validation, role ownership, architecture, review, and closeout
  responsibilities.
- `TODO.md` was rewritten as a functional catalog: example prompts, recommended
  role splits, frontend-test tasks, `npm run prep`, and common coordination
  criteria were removed from product scope.
- Ten functional examples (`TASK-007` through `TASK-016`) were added.
- `.agents/DELEGATION_TEMPLATE.md` and `docs/agent-harness.md` were updated so
  the task lead constructs prompts from title plus functional scope and adds
  harness-owned constraints.
- Commit `fa6d1cd` passed the recorded catalog scans and `npm run prep` (139
  regular tests and 11 CI tests).
- Independent review of `fa6d1cd^..fa6d1cd` returned `APPROVED` with no
  findings; its report notes that preflight harness validation passed.

### Root causes

| Cause | Classification | Confidence | Impact |
| --- | --- | --- | --- |
| Product outcomes and orchestration instructions had previously shared one catalog, leaving prompts, role allocation, test ownership, implementation conventions, and closeout gates duplicated inside functional task definitions. | Prompt design / coordination | High | Product scope was coupled to the current agent topology and harness workflow, making examples verbose and liable to drift when the harness changes. |
| The corrected ownership boundary initially lacked an automated scan for reintroduced harness-only concerns. | Process / configuration | High | Resolved by AH-030 during this task. |

Existing recommendations AH-001, AH-005, AH-009, AH-010, AH-018, and AH-020
remain applicable and complete: they already own documentation separation,
prompt structure, acceptance evidence, full validation, frontend-test
capability, and coordination-record updates. AH-030 is narrower and does not
duplicate them: it enforces the boundary at the product catalog itself.

### Evidence

- Commit `fa6d1cd` removes every `Prompt de ejemplo`, `Reparto recomendado`,
  frontend-test/prep checklist entry, and the shared coordination checklist
  from `TODO.md`, while adding ten functional examples.
- `.agents/DELEGATION_TEMPLATE.md` states that product TODO files are not a
  source for role assignment, testing strategy, architecture conventions,
  validation commands, review gates, or closeout instructions.
- `docs/agent-harness.md` requires prompts to be built from the selected title
  and functional scope, with role ownership and harness constraints added by
  the task lead.
- `AGENTS.md`, the role definitions, and the closeout workflows retain the
  removed responsibilities: contracts before parallel work, Onion/DDD and
  DIOD conventions, route initialization, Mothers/mocks, integrated review,
  frontend testing, `npm run prep`, and `harness-retro`.
- `.agents/coordination/task-017-functional-examples-2026-08-21.md` maps AC-01
  through AC-05 to artifacts and passing checks.
- `.agents/reviews/TASK-017-fa6d1cd.md` records `APPROVED` for
  `fa6d1cd^..fa6d1cd` with no findings.

### Prioritized remediation plan and applicability

| Order | ID | Applicability to current harness | Action | Proposed verification evidence |
| --- | --- | --- | --- | --- |
| Immediate | AH-030 | Completed now; `TODO.md` is validated as a product task catalog. | Added a catalog-boundary validator to `npm run agents:validate` that rejects task-local example prompts, role-agent assignments, test implementation tasks, architecture/DI instructions, validation commands, and review/retro gates, while permitting observable UI states and other functional outcomes. | `test-functional-task-catalog.sh` exercises positive and negative fixtures; `validate-functional-task-catalog.sh` passes against the real catalog. |

No immediate production or CI change is warranted, and no other new harness
recommendation is supported by the evidence. The existing written rule already
guides current agents; AH-030 now adds durable enforcement against recurrence.

### Follow-up tasks

| ID | Suggested owner | Estimate | Deliverable |
| --- | --- | --- | --- |
| AH-030 | Agent Platform | Completed | Catalog-boundary validator, positive/negative fixtures, integration into `agents:validate`, and configuration for repositories with different product catalogs. |

### Preventive checks and monitoring

- Treat task titles and observable product behavior as the only inputs copied
  from a product catalog into a delegation brief.
- Source role selection, testing depth, architecture constraints, commands, and
  lifecycle gates from the harness on every run.
- Keep the validator semantic enough to allow functional UI requirements such
  as loading, success, empty, and error states; reject only implementation or
  orchestration ownership of their tests.
- During code review, compare any product-catalog change with the generated
  delegation brief and confirm that harness instructions were added rather
  than copied back into the catalog.

## TASK-007B harness retrospective — 2026-08-21

### Short summary

TASK-007B's product and CI changes passed review, but mandatory local validation
initially failed because Compose derived a different project name inside the
linked worktree. The database was healthy under the main repository's Compose
project; explicitly selecting that project made the same validation pass.

### Timeline

- The task ran in the managed `TASK-007B` linked worktree, as required by AH-029.
- Worktree-local Compose could not find the already-running database.
- Its recovery command attempted to create `task-007b-postgres-1`, which could
  not bind port `5432` because the canonical PostgreSQL already owned it.
- Reusing the canonical project passed build, 139 regular tests and 11 CI tests.
- Implementation `310cb0c` reduced npm audit from 16 vulnerabilities to 0;
  review range `310cb0c^..310cb0c` returned `APPROVED`.

### Root causes

| Cause | Classification | Confidence | Impact |
| --- | --- | --- | --- |
| `check-services.sh` used path-derived Compose identity. | Harness configuration / environment | High | Healthy shared services appeared unavailable from worktrees. |
| The recovery command targeted a second fixed-port project. | Prompt design / recovery process | High | Recovery created a conflicting container instead of repairing the check. |

AH-031 closes the distinct gap left by worktree isolation: shared-service
discovery must be deterministic regardless of the caller's checkout path.

### Evidence

- `compose.yml` publishes PostgreSQL as `5432:5432`.
- TASK-007B resolved project `task-007b`; the main checkout resolved
  `agentic_programming-course-subagents-experiment` before remediation.
- The task coordination record contains the successful full-validation command.
- The independent review report records `APPROVED`, zero vulnerabilities, a
  valid dependency tree and Node.js 24 workflow evidence.

### Prioritized remediation plan and applicability

| Order | ID | Applicability | Action | Verification evidence |
| --- | --- | --- | --- | --- |
| Immediate | AH-031 | Completed; every worktree consumes the shared PostgreSQL service. | Declare one canonical Compose project and verify it from multiple worktree identifier forms. | `npm run agents:validate` and `npm run task:preflight` pass from TASK-007B. |

No broader database isolation change is justified; the defect was path-dependent
service discovery and an unsafe recovery target.

### Follow-up tasks

| ID | Suggested owner | Estimate | Deliverable |
| --- | --- | --- | --- |
| AH-031 | Developer Experience | Completed | Canonical Compose identity and multi-worktree service-discovery regression. |

### Preventive checks and monitoring

- Treat Compose project identity as repository configuration, not directory state.
- Exercise shared-service resolution from numeric and suffixed task worktrees.
- Ensure recovery commands address the same project as the health check.
- Reject regressions that attempt to bind a second PostgreSQL to the canonical port.

## TASK-019 harness retrospective — 2026-08-21

### Short summary

TASK-019 completed successfully after a brief planning correction: the task
lead applied the explicitly requested `create-doc` skill, confirmed the target
path, followed the required documentation structure, and obtained an
independent `APPROVED` review. No new harness recommendation is warranted.

### Timeline

- Task preflight passed.
- The initial planning response had not yet applied the requested `create-doc`
  workflow.
- The skill was read and its structure, path-confirmation, and `AGENTS.md`
  indexing requirements were applied.
- The user confirmed `docs/product/user-story-template.md`.
- Implementation commit `6405f4f` added the template and index link.
- Review of `6405f4f^..6405f4f` returned `APPROVED` with no findings.
- Linked-worktree creation used the expected sandbox approval flow.

### Root causes

| Cause | Classification | Confidence | Impact |
| --- | --- | --- | --- |
| Initial planning preceded application of the user-requested documentation skill. | Prompt execution / process | Medium | One clarification round; no incorrect artifact was written. |
| The linked worktree lives outside the managed writable root. | Environment | High | Expected approval interaction; worktree creation succeeded. |

The first issue was corrected by the existing skill trigger and confirmation
workflow. The second is expected permission enforcement rather than a harness
defect.

### Evidence

- `.agents/skills/create-doc/SKILL.md` requires placement under `docs/`, the
  prescribed convention structure, path confirmation, and an `AGENTS.md` link.
- `.agents/coordination/task-019-github-user-story-template-2026-08-21.md`
  records the scope, acceptance evidence, and approved review.
- `.agents/reviews/TASK-019-6405f4f.md` records `APPROVED` and the passing checks.
- `docs/product/user-story-template.md` and its `AGENTS.md` reference satisfy
  the requested documentation outcome.

### Prioritized remediation plan and applicability

| Order | ID | Applicability | Action | Verification evidence |
| --- | --- | --- | --- | --- |
| Immediate | none | Not applicable; existing skill rules corrected the omission before implementation. | No harness change. | Confirmed path, compliant document, and `APPROVED` review. |
| Short-term | none | Not applicable; no recurring or unguarded failure was observed. | No new TODO. | Existing skill and lifecycle checks passed. |

No harness TODO is applicable to this task. Adding one would duplicate existing
skill activation and path-confirmation rules without evidence of a recurring
failure.

### Follow-up tasks

None.

### Preventive checks and monitoring

- Read explicitly requested skills before implementation.
- Continue confirming documentation destinations when required by the skill.
- Treat successful sandbox escalation for external linked worktrees as an
  expected control unless it repeatedly fails or gives misleading recovery
  guidance.

## TASK-020 harness retrospective — 2026-08-21

### Short summary

TASK-020 introduced a narrowly validated `documentation-only` review exception
while preserving mandatory main push and remote CI. Three review rounds exposed
range ownership and test-depth gaps; all were remediated before the complete
range received `APPROVED`. No new harness TODO is warranted.

### Timeline

- `fd0b38b` introduced the documentation-only review exception.
- Review found that an unrelated historical documentation range could bypass
  review for a code-bearing task.
- `6b0b120` bound the range to the declared implementation commit.
- Review found that both fields could still reuse another task's commit.
- `562aad0` bound record filename, declared task identifier, commit subject, and
  exact implementation range.
- Review found that the code-bearing fixture failed before reaching path
  validation.
- `e886e5b` aligned fixture identity and asserted the exact non-documentation
  path diagnostic.
- Review of `fd0b38b^..e886e5b` returned `APPROVED`.

### Root causes

| Cause | Classification | Confidence | Impact |
| --- | --- | --- | --- |
| The initial exception trusted a caller-selected historical range. | Validator design | High | A code task could omit mandatory review. |
| Range and implementation identity were not tied to the current task. | Validator design | High | Cross-task commit reuse remained possible after the first fix. |
| The code-path negative fixture failed at an earlier identity gate. | Test design | High | A path-allowlist regression would not have been detected. |

### Evidence

- Four persisted review rounds record the two security-relevant bypasses, the
  ineffective negative fixture, and the final approval.
- `validate-task-closeout.sh` now correlates record filename, `TASK-XXX`, commit
  subject, exact implementation range, and allowed documentation paths.
- `test-task-closeout-lifecycle.sh` covers valid documentation, cross-task
  reuse, mismatched ranges, matching-identity code paths, and unsupported
  classifications; the code case asserts the intended rejection diagnostic.
- Lifecycle guidance keeps push of `main` and remote-CI monitoring mandatory
  for every task.

### Prioritized remediation plan and applicability

| Order | ID | Applicability | Action | Verification evidence |
| --- | --- | --- | --- | --- |
| Immediate | none | Completed in TASK-020; no open harness action remains. | Retain exact range, task identity, path checks, and diagnostic-specific fixtures. | Final review `APPROVED`; focused lifecycle test, shell syntax, diff check, and agent validation pass. |

AH-009 already requires evidence-backed acceptance, AH-013 owns independent
review, and AH-017 owns persisted iterative review rounds. A new generic TODO
would duplicate those completed controls without an unguarded recurring gap.

### Follow-up tasks

None.

### Preventive checks and monitoring

- Make bypass fixtures pass every preceding gate before asserting the intended
  rejection.
- Assert the specific diagnostic for negative validation paths.
- Retain cross-task historical reuse and exact-range mismatch cases.
- Review the complete remediated range, not only the latest fix.

## Maintenance rules

- Keep agent configuration recommendations in this file only.
- Assign stable IDs and do not duplicate equivalent items.
- Use `✅ Done`, `⏳ Pending`, or `🚫 Blocked` in the `Status` column.
