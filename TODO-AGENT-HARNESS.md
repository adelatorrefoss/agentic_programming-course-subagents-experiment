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
| AH-009 | High | Require task closeout to map every acceptance criterion and checked TODO item to an implementation artifact and a passing verification; reject checkbox-only completion. | Task Lead | ⏳ Pending |
| AH-010 | High | Make the canonical full-validation command run both regular and `.ci` tests, or require both commands explicitly in the task closeout checklist. | Test Infrastructure | ⏳ Pending |
| AH-011 | Medium | Validate documented repository commands against `package.json` scripts so guidance uses executable forms such as `npm run prep`. | Agent Platform | ⏳ Pending |
| AH-012 | Medium | Add a task-start preflight that checks required service availability and tool permissions, and reports an actionable database-start instruction before implementation or verification begins. | Developer Experience | ⏳ Pending |

## Maintenance rules

- Keep agent configuration recommendations in this file only.
- Assign stable IDs and do not duplicate equivalent items.
- Use `✅ Done`, `⏳ Pending`, or `🚫 Blocked` in the `Status` column.
