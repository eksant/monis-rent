# AGENTS.md

Rules for coding agents and humans working in this repository. `CLAUDE.md` imports this file, so it is the single source of truth.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Project

A visual workspace builder for [monis.rent](https://www.monis.rent), built for the Desent Solutions developer challenge. Digital nomads in Bali design a desk setup, see it come to life, see the price, and rent it.

- Design spec: `docs/superpowers/specs/2026-10-11-workspace-builder-design.md`
- Implementation plans: `docs/superpowers/plans/`
- Architecture: `docs/overview/architecture.md`

## Stack

Next.js 16 (App Router, TypeScript strict), Tailwind CSS 4, shadcn/ui (Radix base), Zustand, Vitest, Playwright with axe. Deployed on Vercel. There is no backend and no database.

## Commands

| Command                        | What it does                                                         |
| ------------------------------ | -------------------------------------------------------------------- |
| `pnpm install`                 | Install dependencies (pnpm only; npm and yarn are blocked)           |
| `pnpm dev`                     | Dev server on http://localhost:3000                                  |
| `pnpm lint`                    | ESLint, strict type-checked rules, zero warnings allowed             |
| `pnpm type-check`              | Generate Next route types, then `tsc --noEmit`                       |
| `pnpm format:check`            | Prettier check (`pnpm format` to fix)                                |
| `pnpm test`                    | Vitest unit tests (`src/**/*.test.ts`)                               |
| `pnpm build`                   | Production build                                                     |
| `pnpm test:e2e`                | Playwright against `pnpm start --port 3100` (run `pnpm build` first) |
| `BASE_URL=<url> pnpm test:e2e` | Playwright against a deployed URL (no local server)                  |

## Code layout

```
src/app/              routes: / (builder), /checkout
src/data/             catalog snapshot and presets (pure data + lookups)
src/lib/              pure logic: money, pricing, setup rules, share URL, search, scene layout
src/store/            Zustand store: a thin wrapper over src/lib/setup.ts
src/components/ui/    vendored shadcn/ui primitives
src/components/scene/ SVG scene (1 unit = 1 cm)
src/components/builder/ builder UI
e2e/                  Playwright specs
docs/                 overview, product notes, specs and plans, QA rounds, bug log
```

`src/lib` and `src/data` never import React. Components read the store and call its actions; business rules live only in `src/lib`.

## House rules

- **pnpm only.** Exact versions are pinned; add dependencies with `pnpm add <name>@<version>`.
- **English everywhere in the repo:** code, file names, comments, docs, commit messages and UI copy.
- **Comments:** at most 2 lines each, and only to explain why.
- **Lint:** zero warnings, no `any`, no unused code. Prettier is the formatting authority; the pre-commit hook runs lint-staged.
- **Money** is integer cents. Format only at the edge with `formatCents` / `formatDelta`.
- **Setup changes** go through `src/lib/setup.ts`, which returns `{ setup, notice? }`. Never mutate a setup in a component.
- **Catalog honesty:** the catalog is a dated snapshot (`docs/product/catalog-notes.md`). Concept items have no slug and always show a "Concept" badge. Never promise free delivery or a real order.
- **shadcn/ui:** add components with `pnpm dlx shadcn@4.21.4 add <name>`, then `pnpm lint:fix && pnpm format`. Only the three rules listed in `eslint.config.mjs` are relaxed for `src/components/ui/**`.
- **Tests:** every behaviour change ships with a test. Unit tests sit next to the code (`*.test.ts`); user flows go in `e2e/`.
- **Commits:** Conventional Commits (`feat:`, `fix:`, `docs:`, `chore:`, `test:`, `refactor:`).

## Shipping a change

The owner keeps a single branch: **`main`**. Do not create feature branches or pull requests.

1. `git pull --ff-only` on `main`.
2. Before pushing, run: `pnpm lint && pnpm type-check && pnpm format:check && pnpm test && pnpm build && pnpm test:e2e`.
3. Commit (Conventional Commits) and `git push`. CI runs on the push and Vercel deploys production.
4. Watch CI with `gh run watch`. If a run fails, fix it, push again, and then **delete the failed runs** (`gh run list --status failure`, `gh run delete <id>`), so the Actions history only shows the resolved state.
5. Check production: `BASE_URL=https://monis-rent-theta.vercel.app pnpm test:e2e`.
6. For larger changes, have an independent reviewer read the diff before pushing.

## QA and bugs

These are the project-specific inputs for the `qa-fix-round` procedure.

- **Scenarios:** `e2e/*.spec.ts`.
- **Round results:** `docs/qa/YYYY-MM-DD-<round>.md`, one file per round (template in `docs/qa/README.md`).
- **Bug history:** `docs/bugs/bug-log.md`, newest first.
- **Announcements:** in the PR description and to the owner in chat. There is no team channel.
- **Data:** the app writes only to the visitor's `localStorage` (key `monis-builder`). There is no server data. E2E runs in fresh browser contexts, so nothing needs restoring.

## Deployment

Vercel project linked to `eksant/monis-rent` through Git integration: every push to `main` deploys production at https://monis-rent-theta.vercel.app. No environment variables are needed. See `docs/overview/deployment.md`.
