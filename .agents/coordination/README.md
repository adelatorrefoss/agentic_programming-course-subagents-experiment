# Agent coordination records

Create one Markdown record per multi-agent task from
[DELEGATION_TEMPLATE.md](../DELEGATION_TEMPLATE.md).

The record is the handoff contract for the task. It must preserve:

- named ownership and shared contracts before parallel work;
- dependency order and stop conditions;
- agent run or output references;
- implementation commit and PR code-review commit range;
- `code-review` agent, persisted report under `.agents/reviews/`, exact reviewed
  range, `APPROVED` verdict, review evidence, and remediation commit when
  findings were accepted;
- post-remediation validation, harness-retro report, and final sign-off.
- one executable producer-to-consumer contract row for every runtime boundary
  owned by different agents, including its fixture, consumer assertion, exact
  passing command, and `producer-to-consumer:` evidence;
- one evidence row for every acceptance criterion and checked TODO item, naming
  both the implementation artifact and a passing verification.
- the dedicated `task/TASK-XXX` branch and linked-worktree path used for
  parallel execution, the shared PostgreSQL/Ollama isolation plan, and the task
  lead's explicit merge/cherry-pick integration method and clean removal evidence.

Run `npm run agents:validate` before closeout. It rejects records with missing,
placeholder, or pending acceptance evidence, and cross-agent evidence made only
of separate role-local suites.

Commit subjects must include the task identifier, for example
`feat(TASK-002): add weekly meal planning`. Use `fix(TASK-002): ...` for review
remediation and `chore(TASK-002): ...` for the retro commit.

Records are part of the agent harness, not test infrastructure. Do not store
secrets or credentials in them.
