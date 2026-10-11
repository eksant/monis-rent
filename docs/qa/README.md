# QA rounds

Each QA or E2E round gets one file: `docs/qa/YYYY-MM-DD-<round>.md`.

## Template

```markdown
# <Round name> — YYYY-MM-DD

- **Build:** <commit SHA> on <local | preview URL | production URL>
- **Command:** `pnpm test:e2e` (or `BASE_URL=… pnpm test:e2e`)

## Results

| Scenario (spec › test) | Desktop | Mobile | Evidence |
| ---------------------- | ------- | ------ | -------- |

## Findings

| ID  | Severity | What happens | Status |
| --- | -------- | ------------ | ------ |

## Notes
```

Scenario IDs for findings use `NEW-nn`. Fixed findings are also recorded in `docs/bugs/bug-log.md`.
