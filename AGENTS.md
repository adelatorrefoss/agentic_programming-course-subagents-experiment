# Useful commands

```bash
npm run task:preflight # validate harness permissions and required services
npm run prep      # lint + build + regular and .ci tests
docker compose up # start database
npm run dev       # local dev server (not Docker)
npm run lint:fix
npm run agents:validate
npm run test
```

# Task lifecycle

- Start every task with `npm run task:preflight`.
- Map every acceptance criterion and checked TODO item to an implementation
  artifact and a passing verification in the task coordination record.
- Run `npm run prep` before closing the task.
- After the implementation commit, invoke the `code-review` agent with the
  exact commit range. Do not close the task until it returns `APPROVED` and the
  review evidence is recorded in the coordination record.
- Invoke `harness-retro` after code review, commit its complete TODO register,
  implement or explicitly justify every applicable harness TODO, and commit
  those improvements separately.
- Before handoff, run the final validations, leave all completed task changes
  committed, push the completed commits, monitor the resulting GitHub Actions
  run to completion, and confirm CI is green. Then confirm a clean task
  worktree and show the user a visual HIL summary of the outcome, review,
  harness changes, commits, remote CI run, and warnings. A task is not done
  until its pushed commit has passed CI.
- Finish every task with its own commit whose subject follows the convention
  below. Do not leave completed task changes uncommitted.

Full workflows:

- [mandatory task code review](docs/agents/task-code-review-workflow.md)
- [complete task closeout and HIL handoff](docs/agents/task-closeout-workflow.md)

# Architecture

- Next.js 16, Onion Architecture, DDD.
- Frontend in `src/app/`, API routes in `src/app/api/`.
- Backend in `src/contexts/`.

## Commit convention

Include the task identifier in every commit subject:

```text
feat(TASK-XXX): describe the implementation
```

Use `fix(TASK-XXX): ...` for commits applying `/review` findings and
`chore(TASK-XXX): ...` for the final harness retrospective.
