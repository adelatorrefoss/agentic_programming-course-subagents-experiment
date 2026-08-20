# TASK-004 harness remediation code review

- Agent: `code-review`
- Commit range: `dd04873^..27fee8a`
- Verdict: `CHANGES_REQUESTED`
- Evidence: Complete cumulative diff and remediation inspected; diff check, lock regression, closeout lifecycle regression, and producer-to-consumer Jest suite passed (3 tests). The original sentinel location bypass is fixed, but stale-lock ownership remains unsafe and the sentinel is not mutually exclusive with contract rows.
- Findings: Wrapper death can leave a live child while PID-based reclamation permits another writer; concurrent reclaimers can move a successor lock; an in-section `none` sentinel can bypass invalid rows.

## Acceptance criteria not proven

- AH-025 remains bypassable when `none` and contract rows coexist.
- AH-026 does not yet prove exclusive `.next` ownership after wrapper death or
  with multiple concurrent stale-lock waiters.
