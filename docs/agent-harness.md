# Agent harness and configuration

This guide covers the harness used to configure and coordinate agents. It is intentionally separate from the [test infrastructure](test-infrastructure.md), which covers Jest, PostgreSQL, Ollama, and test execution dependencies.

## Agent configuration

Agent definitions live in `.agents/agents/`. Each definition should declare:

- A stable `name` and clear `description`.
- An `argument-hint` when the agent needs structured input.
- The `tools` it is allowed to use, limited to the task.
- Whether it is `user-invocable`.

Skills live in `.agents/skills/` and should be focused on a repeatable workflow rather than a project role.

Validate all agent definitions locally with:

```bash
npm run agents:validate
```

Before starting any task, run the complete preflight:

```bash
npm run task:preflight
```

It validates agent tool permissions, documented npm commands, task closeout
records, PostgreSQL availability, and the required Ollama model. A failed
PostgreSQL check reports the exact `docker compose` command needed to start it.

The validator requires `name`, `description`, and `tools` frontmatter, checks declared tools against the supported tool set, rejects duplicate agent names, and requires role documentation headings in the body.

The least-privilege role matrix is maintained in
`.agents/agent-tool-matrix.conf`; `npm run agents:validate` rejects a
definition whose tools differ from its matrix entry.

### CI history requirement

Closeout validation resolves the implementation, remediation, and review-range
commits recorded under `.agents/coordination/`. CI must therefore fetch the
complete Git history before running `npm run agents:validate`:

```yaml
- uses: actions/checkout@v4
  with:
    fetch-depth: 0
```

`scripts/agent-harness/test-ci-checkout-history.sh` guards this prerequisite as
part of `npm run agents:validate`.

### Shared Next.js build state

Separate task worktrees isolate `.next` between tasks. Agents collaborating on
the same task still share that task's worktree, so commands that write its
`.next` must use the repository lock wrapper:

```bash
bash scripts/agent-harness/run-with-next-lock.sh npm run build
bash scripts/agent-harness/run-with-next-lock.sh npm run prep
```

The wrapper requires `flock`, waits up to
`NEXT_BUILD_LOCK_TIMEOUT_SECONDS` (600 seconds by default), and passes its
locked file descriptor to the child command. The kernel therefore retains the
lock if the wrapper dies while its child still writes shared state. The lock
file defaults to the per-worktree internal path reported by `git rev-parse
--git-path agent-harness/next-build.lock`, so it does not change `git status` or
collide across linked worktrees. Existing regular lock files are not truncated,
and symlink lock paths are rejected. The file contains no ownership state and
is harmless when no process holds it. Tests may override the path with
`NEXT_BUILD_LOCK_FILE`. A long-running `npm run dev` may also use the wrapper,
but it holds the lock until the server stops.

Read-only inspection, linting, and focused tests that do not invoke a Next.js
build may continue in parallel. Commands writing other shared generated state,
such as coverage or generated clients, need their own lock or an isolated
output directory. `npm run agents:validate` runs a deterministic concurrency
regression for the Next.js lock.

## Commit messages

Every task commit must include its task identifier in the subject:

```text
feat(TASK-XXX): describe the implementation
```

Use the matching phase prefix for follow-up commits:

```text
fix(TASK-XXX): apply PR review findings
chore(TASK-XXX): record harness retro
```

Replace `TASK-XXX` with the actual task identifier, such as `TASK-002`.

## Coordination best practices

- Run concurrently implemented tasks in separate linked worktrees. Create one
  from the task lead's intended base with:

  ```bash
  bash scripts/agent-harness/task-worktree.sh create TASK-004 [start-point]
  ```

  The default root is a sibling directory named
  `.<repository>-task-worktrees`; set `AGENT_WORKTREE_ROOT` to an absolute path
  outside the repository when another location is needed. The command accepts
  only `TASK-` followed by at least three digits, creates branch
  `task/TASK-004`, and rejects an existing branch or path. `list` reports only
  managed worktrees under that root.
- Give every delegated agent the exact worktree path and require all reads,
  edits, tests, generated output, and commits for that task to happen there.
  Linked worktrees isolate tracked files, untracked files, and `.next`, but
  PostgreSQL and Ollama remain shared services. Parallel tasks must namespace
  database/schema/test data and ports where supported, or serialize checks
  that mutate shared service state.
- The task lead reviews and integrates each task branch explicitly, using a
  merge or cherry-pick according to the task's commit contract. After
  integration and green main CI, run `task-worktree.sh finish TASK-004`.
  Cleanup refuses dirty worktrees, requires the task branch to be merged into
  `main`, deletes that local branch, and uses no force option. The check also
  works from detached CI checkouts. Never treat cleanup as integration.
- Task branches are validated locally but are not pushed and do not receive
  remote CI. This is the repository's trunk-based workflow: feature branches
  are local working branches only. After integrating any task into `main`, push
  `main` and run `npm run task:verify-remote-ci`; the verifier requires the
  matching SHA on `head_branch=main`. This remains mandatory for a validated
  `documentation-only` task.
- Before integration, update local `main` and attempt to rebase the feature
  branch onto it. When the rebase is clean, integrate with `git merge --no-ff`.
  If it becomes conflict-heavy or impractical, abort the rebase and use
  `git merge --no-ff` directly on `main`, resolving conflicts there before
  running final validations.
- Define shared contracts before starting parallel work.
- Start each delegation from `.agents/DELEGATION_TEMPLATE.md`, including named
  ownership, input/output contracts, dependency order, and stop conditions.
- Build each implementation/delegation prompt from the selected task title and
  functional scope, then add role ownership, test expectations, architecture
  conventions, validation commands, review, and closeout gates from the harness.
  Do not duplicate those harness concerns in product TODO catalogs.
  `validate-functional-task-catalog.sh` enforces this boundary for `TODO.md`;
  repositories with a different or additional product catalog can set the
  whitespace-separated `HARNESS_FUNCTIONAL_CATALOGS` list. Harness-owned TODO
  registers stay outside that list.
- Keep frontend, database, backend, and testing responsibilities separate.
- Ask the main agent to review the integrated diff, not only isolated agent results.
- Create the implementation commit before invoking the native `/review`
  command through the `code-review` agent. Treat it as a PR review of that
  commit, not as a pre-commit lint step. A `documentation-only` task may omit
  this step only after the closeout validator proves the exact
  `<Implementation commit>^..<Implementation commit>` range contains
  exclusively supported documentation paths.
- Apply all accepted review changes in a second commit and record the review
  result and remediation commit in the task coordination record.
- Persist one coordination record per multi-agent task under
  `.agents/coordination/`.
- For every runtime boundary implemented by different agents, pass a
  producer-shaped fixture directly through the consumer assertion in one
  executable contract test. Record its exact passing command and
  `producer-to-consumer:` result in the integration handoff before the
  implementation commit; separate producer and consumer unit suites do not
  satisfy this gate.
- Map every acceptance criterion and checked TODO item to an implementation
  artifact and a passing verification in the coordination record. The closeout
  validator rejects missing, placeholder, or pending evidence.

The former common coordination checklist is owned by these harness sources:

- contract agreement and safe parallelization: `.agents/DELEGATION_TEMPLATE.md`;
- Onion Architecture, thin API routes, `reflect-metadata`, `@Service()` and DIOD:
  `.agents/agents/backend-engineer.md`;
- Object Mothers, mocks and frontend interaction coverage:
  `.agents/agents/testing-engineer.md`;
- integrated-diff review: `.agents/agents/code-review.agent.md` and this workflow;
- `npm run prep` and `harness-retro`: `AGENTS.md` and the development cycle gate below.
- Preserve existing user changes and avoid unrelated production edits.
- Record agent-harness recommendations in `TODO-AGENT-HARNESS.md`.
- Record test infrastructure recommendations in `TODO-TEST-INFRASTRUCTURE.md`.

## `harness-retro`

`.agents/agents/harness-retro.agent.md` handles post-run retrospectives for agent harness configuration. Agent-harness recommendations are persisted in `TODO-AGENT-HARNESS.md`.

The agent may update that TODO file, but it must not modify production code or CI configuration unless explicitly authorized.

## Development cycle gate

1. Create the task worktree and define contracts and the delegation brief
   inside it.
2. Delegate bounded implementation work in that task worktree, invoking `frontend-engineer` for UI,
   React, or Next.js App Router changes alongside the other relevant role
   agents.
3. Integrate and validate the complete diff.
4. Commit the implementation and identify its exact commit range. Classify the
   task as `code` or `documentation-only` in the coordination record.
5. Invoke `code-review` with the exact implementation commit range and record
   its verdict and evidence. A `documentation-only` task skips this step only
   after `npm run agents:validate` accepts its recorded range. See [the review
   convention](agents/task-code-review-workflow.md).
6. Apply accepted findings and commit the remediation changes with a message
   starting with `fix(TASK-XXX):`.
7. Run `bash scripts/agent-harness/run-with-next-lock.sh npm run prep`, which
   includes regular and `.ci` tests, after remediation.
8. Validate the completed coordination record with `npm run agents:validate`;
   it rejects missing review evidence and non-approved verdicts.
9. Execute `harness-retro`, update the harness TODO register, and commit the
   retrospective separately.
10. Finish every task with all task changes recorded in a convention-compliant
    commit; completed task work must not remain uncommitted.
11. Let the task lead integrate the task branch, then remove only its clean
    linked worktree with the harness command.

Every task then pushes `main` and monitors the matching GitHub Actions run,
including a validated `documentation-only` task.
