# Useful commands

```bash
npm prep          # lint + build + test
docker compose up # start database
npm run dev       # local dev server (not Docker)
npm run lint:fix
npm run agents:validate
npm run test
```

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
