# Test Infrastructure TODO

Recommendations for test execution, test infrastructure, and external test services.

## ✅ Completed recommendations

| ID | Priority | Recommendation | Owner | Status |
| --- | --- | --- | --- | --- |
| TH-001 | High | Preload and pin the Ollama model `qwen3-embedding:0.6b` in the development and CI test infrastructure. | Testing Platform | ✅ Done |
| TH-002 | High | Add an Ollama healthcheck that verifies service availability and the required model before tests. | Testing Platform | ✅ Done |
| TH-003 | Medium | Cache the required Ollama model between runs and document cache invalidation. | Testing Platform | ✅ Done |
| TH-004 | Medium | Document PostgreSQL and Ollama as explicit test prerequisites. | Testing | ✅ Done |
| TH-005 | Low | Add a no-cache execution path and early dependency diagnostics. | Testing | ✅ Done |

## Maintenance rules

- Keep test execution and test infrastructure recommendations in this file only.
- Assign stable IDs and do not duplicate equivalent items.
- Use `✅ Done`, `⏳ Pending`, or `🚫 Blocked` in the `Status` column.
