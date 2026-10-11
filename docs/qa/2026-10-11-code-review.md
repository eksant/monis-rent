# Code review round — 2026-10-11

- **Scope:** `main..feat/builder-rough` (core logic and builder UI), reviewed by an independent reviewer agent.
- **Build:** `f82648b` on a local production build (`pnpm build && pnpm start --port 3100`)
- **Command:** `pnpm test && pnpm test:e2e`
- **Result:** 102 unit tests pass; E2E 35 passed, 5 skipped by design.

## Findings

| ID    | Severity | What happened                                                                                                                     | Status                                                           | Test                                                                   |
| ----- | -------- | --------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- | ---------------------------------------------------------------------- |
| CR-01 | High     | "Upgrade to the 160 cm desk" offered when the screen would still not fit; a selected 34" could not be removed by tapping its card | Fixed (rules in PR #3; UI here)                                  | `setup.test.ts` (upgrade, maxQty, isMultiUnit); E2E single-unit screen |
| CR-02 | Medium   | Searching "constructor" or "\_\_proto\_\_" crashed the builder (no error boundary)                                                | Fixed                                                            | `search.test.ts` prototype words                                       |
| CR-03 | Medium   | Item cards hid price, badges and "Concept" from screen readers behind an "Add/Remove" label                                       | Fixed                                                            | E2E accessible name and description                                    |
| CR-04 | Medium   | Price changes were not announced on phones                                                                                        | Fixed                                                            | E2E price bar live region                                              |
| CR-05 | Low      | Notice toast ids could collide with other toasts                                                                                  | Fixed                                                            | Code change only (string ids)                                          |
| CR-06 | Low      | Some touch targets were under 32 px                                                                                               | Fixed                                                            | E2E touch targets ≥ 32 px                                              |
| CR-07 | Low      | Landscape phones left no room for the item list                                                                                   | Fixed                                                            | E2E layout at 844×390 and 667×375                                      |
| CR-08 | Low      | The layout test could not detect an unusable item list                                                                            | Fixed; it then caught sr-only text stretching the page by 143 px | E2E layout (item card in view)                                         |
| CR-09 | Low      | Concept items had no "Concept" badge in the summary                                                                               | Fixed                                                            | E2E concept badge                                                      |
| CR-10 | Low      | No fallback when a product photo failed to load                                                                                   | Fixed                                                            | E2E with strapi.monis.rent blocked                                     |

## Not changed

Nothing was rejected. All ten findings were confirmed before fixing.
