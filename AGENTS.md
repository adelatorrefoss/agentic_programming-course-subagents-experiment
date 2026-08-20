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
- Finish every task with its own commit whose subject follows the convention
  below. Do not leave completed task changes uncommitted.

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
