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

- Define shared contracts before starting parallel work.
- Start each delegation from `.agents/DELEGATION_TEMPLATE.md`, including named
  ownership, input/output contracts, dependency order, and stop conditions.
- Keep frontend, database, backend, and testing responsibilities separate.
- Ask the main agent to review the integrated diff, not only isolated agent results.
- Create the implementation commit before invoking the native `/review`
  command. Treat it as a PR review of that commit, not as a pre-commit lint
  step.
- Apply all accepted review changes in a second commit and record the review
  result and remediation commit in the task coordination record.
- Persist one coordination record per multi-agent task under
  `.agents/coordination/`.
- Map every acceptance criterion and checked TODO item to an implementation
  artifact and a passing verification in the coordination record. The closeout
  validator rejects missing, placeholder, or pending evidence.
- Preserve existing user changes and avoid unrelated production edits.
- Record agent-harness recommendations in `TODO-AGENT-HARNESS.md`.
- Record test infrastructure recommendations in `TODO-TEST-INFRASTRUCTURE.md`.

## `harness-retro`

`.agents/agents/harness-retro.agent.md` handles post-run retrospectives for agent harness configuration. Agent-harness recommendations are persisted in `TODO-AGENT-HARNESS.md`.

The agent may update that TODO file, but it must not modify production code or CI configuration unless explicitly authorized.

## Development cycle gate

1. Define contracts and the delegation brief.
2. Delegate bounded implementation work, invoking `frontend-engineer` for UI,
   React, or Next.js App Router changes alongside the other relevant role
   agents.
3. Integrate and validate the complete diff.
4. Commit the implementation and open or identify the PR commit range.
5. Execute `/review` as the PR review of the implementation commit.
6. Apply accepted findings and commit the remediation changes with a message
   starting with `code-review:`.
7. Run `npm run prep`, which includes regular and `.ci` tests, after remediation.
8. Validate the completed coordination record with `npm run agents:validate`.
9. Execute `harness-retro`, update the harness TODO register, and commit the
   retrospective separately.
10. Finish every task with all task changes recorded in a convention-compliant
    commit; completed task work must not remain uncommitted.
