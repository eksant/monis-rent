# Workspace Builder — Plan 1: Foundation and Clickable Build

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a deployed, tested, clickable workspace builder for monis.rent — milestones 1–3 of the design spec: tooling and CI, the pure domain logic, the SVG scene and the builder UI — ready for the owner's UX review on a Vercel preview URL.

**Architecture:** A static Next.js 16 App Router site with no backend. Pure TypeScript modules in `src/data` and `src/lib` hold the catalog snapshot and every rule (pricing, slots, sharing, scene layout) and are unit-tested with Vitest. A thin Zustand store wraps those rules and persists to localStorage; React components render an inline-SVG scene (1 unit = 1 cm) and shadcn/ui controls. Playwright covers the user flows on desktop and mobile.

**Tech Stack:** Next.js 16.4.0, React 19.3.0, TypeScript 5.9.3, Tailwind CSS 4.3.3, shadcn/ui 4.21.4 (Radix base, Nova preset), Zustand 5.0.15, Vitest 5.0.3, Playwright 1.64.0 with @axe-core/playwright 4.13.0, ESLint 9.39.5 with typescript-eslint 8.71.1, Prettier 3.9.10, Husky 9.1.7 + lint-staged 17.6.0, pnpm 12.4.2, Node.js 22, Vercel.

**Spec:** `docs/superpowers/specs/2026-10-11-workspace-builder-design.md`. **Scope:** spec §14 milestones 1–3. Plan 2 (milestones 4–8: polish, checkout, smart setup, full QA and README write-up, hand-off) is written after the UX review that ends this plan, because spec §7 is provisional.

**Validation:** every file in this plan was built and checked in a scratch copy before the plan was written: lint, type-check, Prettier, 85 unit tests, 21 Playwright tests (desktop + mobile, including axe) and a production build all pass.

## Deferred to Plan 2

These spec items are intentionally outside Plan 1: Motion animations (spring drop, cross-fade, price tween; Plan 1 uses CSS transitions), tap-to-edit highlighting in the scene, smart setup (§10), `/checkout` form and `/checkout/success` (§7.5–7.6), image-failure fallbacks and the route error boundary (§11), the README write-up, and the `desent-bot` invitation.

## Global Constraints

- **Package manager:** pnpm 12.4.2 only (`packageManager` field; `preinstall` runs `npx only-allow pnpm`). Node.js ≥ 22.
- **Pinned versions:** next 16.4.0, react 19.3.0, react-dom 19.3.0, zustand 5.0.15, typescript 5.9.3, @types/node 22.20.5, @types/react 19.3.0, @types/react-dom 19.3.0, tailwindcss 4.3.3, @tailwindcss/turbopack 4.3.3, eslint 9.39.5, eslint-config-next 16.4.0, typescript-eslint 8.71.1, eslint-plugin-jsx-a11y 6.10.2, eslint-plugin-simple-import-sort 14.0.0, prettier 3.9.10, prettier-plugin-tailwindcss 0.8.1, vitest 5.0.3, husky 9.1.7, lint-staged 17.6.0, @playwright/test 1.64.0, @axe-core/playwright 4.13.0, shadcn 4.21.4.
- **Do not upgrade** TypeScript to 6/7 (typescript-eslint 8.71.1 supports `<6.1`) or ESLint to 10 (eslint-plugin-jsx-a11y and eslint-plugin-react stop at ESLint 9).
- **Quality gate:** `pnpm lint` (zero warnings, no `any`), `pnpm type-check`, `pnpm format:check`, `pnpm test`, `pnpm build`, `pnpm test:e2e` — all must pass before every push.
- **Language:** English for code, file names, comments (max 2 lines each, explain why), docs, commit messages and UI copy.
- **Money:** integer cents everywhere; format only with `formatCents` / `formatDelta`.
- **Commits:** Conventional Commits; every message ends with the trailer `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- **Outward actions** (push, PR, merge, Vercel, repo settings, collaborator invite) follow the ship flow in `AGENTS.md` and need the owner's go-ahead given at the start of execution.
- **Browser checks:** use `pnpm test:e2e` / `curl`; do not use the Playwright MCP.
- **E2E needs a fresh build:** `playwright.config.ts` never reuses a running server. Run `pnpm build` first and make sure nothing listens on port 3000 (`lsof -i :3000`).
- **Repo root:** `/Users/eksa/Projects/monis-rent` (clone of `github.com/eksant/monis-rent`).

## File Map

| File | Responsibility | Task |
| --- | --- | --- |
| `package.json`, `pnpm-workspace.yaml`, `tsconfig.json`, `next.config.ts` | Project, scripts, pinned deps, TS strict + `noUncheckedIndexedAccess`, Next config | 1 |
| `eslint.config.mjs`, `.prettierrc.json`, `.prettierignore`, `.husky/pre-commit` | Strict lint, formatting, pre-commit lint-staged | 1 |
| `vitest.config.mts`, `.gitignore` | Unit test runner, ignores | 1 |
| `components.json`, `src/lib/utils.ts`, `src/components/ui/*` | shadcn/ui (generated) | 1 |
| `src/app/globals.css`, `src/app/layout.tsx`, `src/app/icon.svg` | Brand theme, Inter font, toaster, favicon | 1 |
| `src/app/page.tsx` | Home: hello page (1) → scene preview (10) → builder (11) | 1, 10, 11 |
| `playwright.config.ts`, `e2e/smoke.spec.ts`, `.github/workflows/ci.yml` | E2E harness and CI | 2 |
| `AGENTS.md`, `CLAUDE.md`, `README.md`, `LICENSE`, `docs/**` | House rules, ship flow, docs | 3 |
| `src/lib/types.ts` | Shared domain types | 4 |
| `src/data/catalog.ts`, `src/data/presets.ts` | Catalog snapshot + concept items; presets | 4 |
| `src/lib/money.ts`, `src/lib/pricing.ts` | USD formatting; effective price, totals, savings, arrival | 5 |
| `src/lib/setup.ts` | Every setup rule; `{ setup, notice? }` results | 6 |
| `src/lib/share.ts` | Setup ⇄ URL | 7 |
| `src/lib/scene-layout.ts` | Desk, monitor, chair and hotspot geometry | 8 |
| `src/store/setup-store.ts` | Zustand store, persistence, shared-link hydration | 9 |
| `src/components/scene/*` | SVG scene | 10 |
| `src/components/builder/*`, `src/app/checkout/page.tsx` | Builder UI, checkout placeholder | 11 |
| `e2e/scene.spec.ts`, `e2e/helpers.ts`, `e2e/builder.spec.ts` | Scene and builder flows | 10, 11 |
| `docs/qa/2026-10-11-milestone-3.md` | First QA round record | 12 |

## Ship Points

- **PR 0** (Task 0): the spec and this plan land on `main`.
- **PR A** (Tasks 1–3): scaffold, CI and docs → merge → owner imports the repo into Vercel → production "hello" page.
- **PR B** (Tasks 4–9): core logic and store.
- **PR C** (Tasks 10–12): scene and builder UI → Vercel preview → **stop for the owner's UX review**.

---
### Task 0: Land the spec and this plan on `main`

**Files:** none changed (branch `docs/workspace-builder-spec` already holds the spec and this plan).

- [ ] **Step 1: Push and open the PR**

```bash
cd /Users/eksa/Projects/monis-rent
git switch docs/workspace-builder-spec
git push -u origin docs/workspace-builder-spec
gh pr create --base main --title "docs: workspace builder design spec and plan 1" --body "$(cat <<'EOF'
Design spec and implementation plan 1 for the monis.rent workspace builder (Desent challenge).

- Spec: docs/superpowers/specs/2026-10-11-workspace-builder-design.md
- Plan 1 (milestones 1–3): docs/superpowers/plans/2026-10-11-workspace-builder-plan-1-foundation.md

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

Expected: a PR URL is printed.

- [ ] **Step 2: Merge and sync**

```bash
gh pr merge --squash --delete-branch
git switch main && git pull --ff-only
git log --oneline -3
```

Expected: `main` contains the docs commit; the remote branch is deleted.

---
### Task 1: Scaffold the Next.js app with strict tooling

**Files:**
- Create: `package.json`, `pnpm-workspace.yaml`, `tsconfig.json`, `next.config.ts`, `eslint.config.mjs`, `.prettierrc.json`, `.prettierignore`, `vitest.config.mts`, `.husky/pre-commit`, `src/app/globals.css`, `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/icon.svg`
- Replace: `.gitignore` (GitHub's Node template → Next.js-focused list)
- Generated by shadcn: `components.json`, `src/lib/utils.ts`, `src/components/ui/{button,card,badge,tabs,drawer,sonner,toggle,toggle-group}.tsx`

**Interfaces:**
- Produces: scripts `dev build start lint lint:fix type-check format format:check test test:watch test:e2e`; path alias `@/*` → `src/*`; `cn()` from `@/lib/utils`; shadcn components `Button` (with `asChild`), `Badge`, `Card*`, `Tabs`/`TabsList`/`TabsTrigger`/`TabsContent`, `ToggleGroup`/`ToggleGroupItem`, `Drawer*`, `Toaster`; Tailwind tokens `primary`, `accent`, `muted`, `sale`, …

- [ ] **Step 1: Branch**

```bash
cd /Users/eksa/Projects/monis-rent
git switch main && git pull --ff-only
git switch -c chore/scaffold
```

- [ ] **Step 2: Write the project and tool configuration**

`package.json` (dependencies are added by pnpm in Step 3):

```json
{
  "name": "monis-rent",
  "version": "0.1.0",
  "private": true,
  "engines": {
    "node": ">=22"
  },
  "packageManager": "pnpm@12.4.2",
  "scripts": {
    "preinstall": "npx only-allow pnpm",
    "prepare": "husky",
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint --max-warnings=0 .",
    "lint:fix": "eslint --fix .",
    "type-check": "next typegen && tsc --noEmit",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "test": "vitest run --passWithNoTests",
    "test:watch": "vitest",
    "test:e2e": "playwright test"
  },
  "lint-staged": {
    "*.{ts,tsx,mts,mjs}": [
      "eslint --fix --max-warnings=0",
      "prettier --write"
    ],
    "*.{json,md,css,yml,yaml}": [
      "prettier --write"
    ]
  }
}
```

`pnpm-workspace.yaml`:

```yaml
# Native builds are not needed: images are served unoptimized and lint uses no native resolver.
allowBuilds:
  sharp: false
  unrs-resolver: false
```

`tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "react-jsx",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./src/*"] }
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts",
    ".next/dev/types/**/*.ts",
    "**/*.mts"
  ],
  "exclude": ["node_modules"]
}
```

`next.config.ts`:

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
```

`eslint.config.mjs`:

```js
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import jsxA11y from "eslint-plugin-jsx-a11y";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import tseslint from "typescript-eslint";

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: { "simple-import-sort": simpleImportSort },
    rules: {
      ...jsxA11y.flatConfigs.strict.rules,
      "simple-import-sort/imports": "error",
      "simple-import-sort/exports": "error",
      "no-console": "error",
      eqeqeq: ["error", "always"],
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/consistent-type-imports": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/restrict-template-expressions": [
        "error",
        { allowNumber: true },
      ],
    },
  },
  {
    // Vendored shadcn/ui primitives: keep upstream code, relax only these rules.
    files: ["src/components/ui/**"],
    rules: {
      eqeqeq: "off",
      "@typescript-eslint/no-unnecessary-condition": "off",
      "@typescript-eslint/prefer-nullish-coalescing": "off",
    },
  },
  {
    files: ["**/*.{js,mjs,cjs}"],
    extends: [tseslint.configs.disableTypeChecked],
  },
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "playwright-report/**",
    "test-results/**",
    "coverage/**",
  ]),
]);
```

`.prettierrc.json`:

```json
{
  "plugins": ["prettier-plugin-tailwindcss"],
  "tailwindStylesheet": "./src/app/globals.css"
}
```

`.prettierignore`:

```text
pnpm-lock.yaml
.next
next-env.d.ts
playwright-report
test-results
coverage
docs/superpowers
```

`vitest.config.mts`:

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: { environment: "node", include: ["src/**/*.test.ts"] },
});
```

`.gitignore (replace the whole file)`:

```text
# dependencies
/node_modules

# next.js
/.next/
/out/
next-env.d.ts
*.tsbuildinfo

# testing
/coverage
/playwright-report/
/test-results/
/blob-report/
/playwright/.cache/

# env and deploy
.env*
.vercel

# misc
.DS_Store
*.pem
npm-debug.log*
.pnpm-debug.log*
```

`.husky/pre-commit`:

```text
pnpm exec lint-staged
```

Also create a placeholder stylesheet so the shadcn CLI can detect Tailwind v4 (it is replaced in Step 6):

```bash
mkdir -p src/app
printf '@import "tailwindcss";\n' > src/app/globals.css
```

- [ ] **Step 3: Install pinned dependencies**

```bash
pnpm add next@16.4.0 react@19.3.0 react-dom@19.3.0 zustand@5.0.15
pnpm add -D typescript@5.9.3 @types/node@22.20.5 @types/react@19.3.0 @types/react-dom@19.3.0 \
  tailwindcss@4.3.3 @tailwindcss/turbopack@4.3.3 \
  eslint@9.39.5 eslint-config-next@16.4.0 typescript-eslint@8.71.1 \
  eslint-plugin-jsx-a11y@6.10.2 eslint-plugin-simple-import-sort@14.0.0 \
  prettier@3.9.10 prettier-plugin-tailwindcss@0.8.1 vitest@5.0.3 husky@9.1.7 lint-staged@17.6.0
pnpm run prepare
git config core.hooksPath
```

Expected: both installs end with `Done in …`; the last command prints `.husky/_`. pnpm may append a `minimumReleaseAgeExclude:` list (for example `- prettier@3.9.10`) to `pnpm-workspace.yaml` because that release is very new — keep it and commit it.

- [ ] **Step 4: Initialise shadcn/ui and add the Plan 1 components**

```bash
CI=1 pnpm dlx shadcn@4.21.4 init -y -b radix -p nova --no-monorepo --no-rtl --pointer </dev/null
CI=1 pnpm dlx shadcn@4.21.4 add -y button card badge tabs toggle-group drawer sonner </dev/null
```

Expected: `components.json` with `"style": "radix-nova"`, `src/lib/utils.ts` (`export { cn } from "cn"`), and 8 files under `src/components/ui/` (`button card badge tabs drawer sonner toggle toggle-group`). Dependencies added: `class-variance-authority cn lucide-react radix-ui shadcn tw-animate-css sonner next-themes vaul`.

- [ ] **Step 5: Replace the generated stylesheet with the monis.rent theme**

`src/app/globals.css`:

```css
@import "tailwindcss";
@import "tw-animate-css";
@import "shadcn/tailwind.css";

@theme inline {
  --font-sans: var(--font-sans);
  --font-heading: var(--font-sans);
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --color-sale: var(--sale);
  --radius-sm: calc(var(--radius) * 0.6);
  --radius-md: calc(var(--radius) * 0.8);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) * 1.4);
  --radius-2xl: calc(var(--radius) * 1.8);
}

/* monis.rent brand: navy #15252e, blue #63aefd, cream #f9f2ea. Light theme only. */
:root {
  --background: #f9f2ea;
  --foreground: #15252e;
  --card: #ffffff;
  --card-foreground: #15252e;
  --popover: #ffffff;
  --popover-foreground: #15252e;
  --primary: #15252e;
  --primary-foreground: #ffffff;
  --secondary: #e8f2fe;
  --secondary-foreground: #15252e;
  --muted: #f1e9df;
  --muted-foreground: #56636b;
  --accent: #63aefd;
  --accent-foreground: #0b3a66;
  --destructive: #c8372d;
  --border: #e5dbcf;
  --input: #e5dbcf;
  --ring: #63aefd;
  --sale: #b8390c;
  --radius: 0.75rem;
}

@layer base {
  * {
    @apply border-border outline-ring/50;
  }
  body {
    @apply bg-background text-foreground;
  }
  button:not(:disabled),
  [role="button"]:not(:disabled) {
    cursor: pointer;
  }
  html {
    @apply font-sans;
  }
}
```

- [ ] **Step 6: Write the root layout, a temporary home page and the favicon**

`src/app/layout.tsx`:

```tsx
import "./globals.css";

import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";

import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ variable: "--font-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Workspace Builder · monis.rent",
  description:
    "Design your Bali workspace visually, see the price instantly, and rent it.",
};

export const viewport: Viewport = { themeColor: "#F9F2EA" };

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full">
        {children}
        <Toaster theme="light" position="top-center" />
      </body>
    </html>
  );
}
```

`src/app/page.tsx`:

```tsx
// Temporary landing page until the builder lands (milestone 3).
export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-2xl flex-col justify-center gap-3 px-4">
      <p className="text-sm font-semibold text-accent-foreground">monis.rent</p>
      <h1 className="text-4xl font-extrabold tracking-tight">
        Design your Bali workspace
      </h1>
      <p className="text-muted-foreground">
        The workspace builder is on its way. Check back soon.
      </p>
    </main>
  );
}
```

`src/app/icon.svg`:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="8" fill="#15252e" />
  <path d="M9 22v-9m0 4q0-4 3.5-4t3.5 4v5m0-5q0-4 3.5-4t3.5 4v5" fill="none" stroke="#63aefd" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" />
</svg>
```

- [ ] **Step 7: Normalise generated code and run the quality gate**

```bash
pnpm lint:fix && pnpm format
pnpm lint && pnpm type-check && pnpm format:check && pnpm test && pnpm build
```

Expected: `pnpm lint` prints only the command line (zero problems; the autofix sorts imports in the shadcn files); `type-check` prints `✓ Types generated successfully`; Prettier prints `All matched files use Prettier code style!`; Vitest prints `No test files found, exiting with code 0`; the build lists `○ /`, `○ /_not-found` and `○ /icon.svg` as static.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -F - <<'EOF'
chore: scaffold Next.js 16 app with strict tooling

Next.js 16 App Router, TypeScript strict, Tailwind 4, shadcn/ui (Radix),
strict type-checked ESLint, Prettier, Vitest, Husky + lint-staged, pnpm only.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```

Expected: the pre-commit hook prints `✔ Done running tasks for staged files!` and the commit succeeds.

---
### Task 2: Playwright harness, smoke test and CI

**Files:**
- Create: `playwright.config.ts`, `e2e/smoke.spec.ts`, `.github/workflows/ci.yml`

**Interfaces:**
- Produces: Playwright projects `desktop` (Desktop Chrome) and `mobile` (Pixel 7); `BASE_URL` env switches to a remote target; CI job `quality`.

- [ ] **Step 1: Install Playwright and axe**

```bash
pnpm add -D @playwright/test@1.64.0 @axe-core/playwright@4.13.0
pnpm exec playwright install chromium
```

Expected: Chromium `v1248` downloaded (or already present).

- [ ] **Step 2: Write the config and the smoke test**

`playwright.config.ts`:

```ts
import { defineConfig, devices } from "@playwright/test";

// Runs against a local production server, or against BASE_URL (e.g. a Vercel deployment).
const baseURL = process.env.BASE_URL ?? "http://localhost:3000";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
  webServer: process.env.BASE_URL
    ? undefined
    : {
        command: "pnpm start",
        url: baseURL,
        reuseExistingServer: false,
        timeout: 120_000,
      },
});
```

`e2e/smoke.spec.ts`:

```ts
import { expect, test } from "@playwright/test";

test("home page loads", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Design your Bali workspace" }),
  ).toBeVisible();
});
```

- [ ] **Step 3: Write the CI workflow**

`.github/workflows/ci.yml`:

```yaml
name: CI

on:
  pull_request:
  push:
    branches: [main]

concurrency:
  group: ci-${{ github.ref }}
  cancel-in-progress: true

jobs:
  quality:
    runs-on: ubuntu-latest
    timeout-minutes: 20
    env:
      HUSKY: "0"
    steps:
      - uses: actions/checkout@v7
      - uses: pnpm/action-setup@v6
      - uses: actions/setup-node@v7
        with:
          node-version: 22
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint
      - run: pnpm type-check
      - run: pnpm format:check
      - run: pnpm test
      - run: pnpm build
      - run: pnpm exec playwright install --with-deps chromium
      - run: pnpm test:e2e
        env:
          CI: "true"
      - uses: actions/upload-artifact@v7
        if: ${{ !cancelled() }}
        with:
          name: playwright-report
          path: playwright-report
          retention-days: 14
```

- [ ] **Step 4: Run the smoke test against a fresh production build**

```bash
lsof -i :3000 || true   # must print nothing; stop any server on :3000 first
pnpm build && pnpm test:e2e
```

Expected: `2 passed` (desktop and mobile).

- [ ] **Step 5: Gate and commit**

```bash
pnpm lint && pnpm type-check && pnpm format:check
```

```bash
git add -A
git commit -F - <<'EOF'
test: add Playwright smoke test and CI workflow

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```

---
### Task 3: Repository docs, PR A and the Vercel production deploy

**Files:**
- Create: `AGENTS.md`, `CLAUDE.md`, `LICENSE`, `docs/overview/architecture.md`, `docs/overview/deployment.md`, `docs/product/brief.md`, `docs/product/catalog-notes.md`, `docs/qa/README.md`, `docs/bugs/bug-log.md`
- Replace: `README.md`

`AGENTS.md` keeps the `nextjs-agent-rules` block that `next dev` re-adds; do not remove it.

- [ ] **Step 1: Write the docs**

`AGENTS.md`:

````markdown
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

| Command                        | What it does                                               |
| ------------------------------ | ---------------------------------------------------------- |
| `pnpm install`                 | Install dependencies (pnpm only; npm and yarn are blocked) |
| `pnpm dev`                     | Dev server on http://localhost:3000                        |
| `pnpm lint`                    | ESLint, strict type-checked rules, zero warnings allowed   |
| `pnpm type-check`              | Generate Next route types, then `tsc --noEmit`             |
| `pnpm format:check`            | Prettier check (`pnpm format` to fix)                      |
| `pnpm test`                    | Vitest unit tests (`src/**/*.test.ts`)                     |
| `pnpm build`                   | Production build                                           |
| `pnpm test:e2e`                | Playwright against `pnpm start` (run `pnpm build` first)   |
| `BASE_URL=<url> pnpm test:e2e` | Playwright against a deployed URL (no local server)        |

## Code layout

```
src/app/              routes: / (builder), /checkout
src/data/             catalog snapshot and presets (pure data + lookups)
src/lib/              pure logic: money, pricing, setup rules, share URL, scene layout
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

1. Branch from `main`: `feat/…`, `fix/…`, `docs/…` or `chore/…`.
2. Before pushing, run: `pnpm lint && pnpm type-check && pnpm format:check && pnpm test && pnpm build && pnpm test:e2e`.
3. Open a pull request. CI must be green.
4. Check the change on the Vercel preview URL posted on the PR.
5. Merge to `main`; Vercel deploys production. Re-run `BASE_URL=<production URL> pnpm test:e2e`.

## QA and bugs

These are the project-specific inputs for the `qa-fix-round` procedure.

- **Scenarios:** `e2e/*.spec.ts`.
- **Round results:** `docs/qa/YYYY-MM-DD-<round>.md`, one file per round (template in `docs/qa/README.md`).
- **Bug history:** `docs/bugs/bug-log.md`, newest first.
- **Announcements:** in the PR description and to the owner in chat. There is no team channel.
- **Data:** the app writes only to the visitor's `localStorage` (key `monis-builder`). There is no server data. E2E runs in fresh browser contexts, so nothing needs restoring.

## Deployment

Vercel project linked to `eksant/monis-rent` through Git integration: `main` deploys production, every PR gets a preview. No environment variables are needed. See `docs/overview/deployment.md`.
````

`CLAUDE.md`:

```markdown
@AGENTS.md

## Claude-specific notes

- Talk with the owner in Indonesian. Everything committed to the repo is English.
- Follow the superpowers flow: specs in `docs/superpowers/specs/`, plans in `docs/superpowers/plans/`.
- Check the app with `pnpm test:e2e` and `curl`, not the Playwright MCP, unless the owner asks for browser testing.
```

`README.md`:

````markdown
# monis.rent Workspace Builder

Design your Bali workspace visually, see the price instantly, and rent it.

A submission for the Desent Solutions developer challenge, built for their client [monis.rent](https://www.monis.rent), which rents office equipment to digital nomads and startups in Bali.

> **Status:** in development. The live URL and the full write-up (approach, tech choices, what we would improve) are added when the first public build ships.

## Run it locally

Requires Node.js 22+ and pnpm.

```bash
pnpm install
pnpm dev            # http://localhost:3000
```

Quality checks:

```bash
pnpm lint && pnpm type-check && pnpm format:check && pnpm test
pnpm build && pnpm test:e2e
```

## Tech stack

Next.js 16 (App Router, TypeScript), Tailwind CSS 4, shadcn/ui, Zustand, Vitest, Playwright. Deployed on Vercel.

## Docs

- [Design spec](docs/superpowers/specs/2026-10-11-workspace-builder-design.md)
- [Architecture](docs/overview/architecture.md)
- [Deployment](docs/overview/deployment.md)
- [Challenge brief and must-haves](docs/product/brief.md)
- [Catalog notes](docs/product/catalog-notes.md)

## License

Code: [MIT](LICENSE). Product names, prices and photos belong to monis.rent and are used here for the challenge only.
````

`LICENSE`:

```
MIT License

Copyright (c) 2026 eksant

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

`docs/overview/architecture.md`:

````markdown
# Architecture

A static Next.js app. Everything runs in the browser; there is no backend, database or secret.

## Modules

| Module                     | Responsibility                                                                 |
| -------------------------- | ------------------------------------------------------------------------------ |
| `src/data/catalog.ts`      | Snapshot of the monis.rent catalog plus concept items; id lookups              |
| `src/data/presets.ts`      | Presets that mirror the monis.rent bundles; preset matching                    |
| `src/lib/types.ts`         | Shared types: `CatalogItem`, `Setup`, `Notice`, …                              |
| `src/lib/money.ts`         | USD formatting of integer cents                                                |
| `src/lib/pricing.ts`       | Effective price (sale %), totals, monthly savings, arrival                     |
| `src/lib/setup.ts`         | All setup rules: slots, capacity, swaps, requirements, normalisation           |
| `src/lib/share.ts`         | Setup ⇄ URL query string                                                       |
| `src/lib/scene-layout.ts`  | Where things go in the scene (desk, monitors, chair, hotspots)                 |
| `src/store/setup-store.ts` | Zustand store: calls `lib/setup`, persists to localStorage, loads shared links |
| `src/components/scene/`    | SVG scene components                                                           |
| `src/components/builder/`  | Builder UI: presets, picker, summary, price bar, toasts                        |

`src/lib` and `src/data` are pure TypeScript and fully unit-tested.

## Data flow

```
user action ─▶ store action ─▶ lib/setup rule ─▶ { setup, notice? }
                                   │                    │
                                   ▼                    ▼
                        persisted to localStorage   toast (sonner)
                                   │
                                   ▼
   components re-render: scene (layoutScene) · picker (deltaCents) · summary (summarize)
```

## State, persistence and sharing

- `Setup` = desk id, chair id or `null`, item quantities, plan (`weekly` | `monthly`) and posture (`sit` | `stand`).
- On first load the store hydrates in this order: URL query (shared link), then localStorage (`monis-builder`, version 1), then the Essentials preset.
- A shared link is cleaned from the address bar after loading. Unknown ids are dropped and reported with a toast.
- Untrusted input (URL, storage) always passes through `parseSetup` and `normalizeSetup`, so the rules hold for every setup the UI sees.

## Share URL format

```
/?d=desk-electric&c=chair-ergo&i=mon-27-4k:2,lamp-led&p=m&pos=stand
```

`d` desk, `c` chair (`none` for no chair), `i` items (`id` or `id:qty`), `p=m` monthly, `pos=stand` standing. Defaults are omitted.

## Scene

- One SVG `viewBox` of 400 × 250 where 1 unit = 1 cm, so desk widths are true to scale.
- The scene is laid out at sitting height; standing lifts the desk group with a CSS transform so the change animates (and is instant with reduced motion).
- Monitors are centred on the desk with the largest one in the middle. When a row is wider than the desk, side screens are drawn narrower, as if angled.
- The "+" hotspots are real HTML buttons positioned over the SVG, which itself is a single `role="img"` with a text summary.
````

`docs/overview/deployment.md`:

````markdown
# Deployment

## Vercel

- Project linked to the GitHub repo `eksant/monis-rent` through Vercel's Git integration.
- Framework preset: Next.js. Install command: `pnpm install` (detected from `packageManager`). Node.js 22.
- `main` deploys to production. Every pull request gets a preview deployment, linked on the PR.
- No environment variables are needed.

### One-time setup (owner)

1. Sign in at vercel.com with GitHub.
2. **Add New → Project → Import** `eksant/monis-rent`.
3. Keep the detected defaults and press **Deploy**.
4. Copy the production URL into `README.md` and the repo's "Website" field.

## CI

GitHub Actions (`.github/workflows/ci.yml`) runs on every PR and on pushes to `main`: install, lint, type-check, format check, unit tests, build, then Playwright (Chromium, desktop and mobile projects). The Playwright HTML report is uploaded as an artifact.

## Checking a deployment

```bash
curl -sI https://<deployment-url>/ | head -1        # expect 200
BASE_URL=https://<deployment-url> pnpm test:e2e      # full E2E against the deployment
```
````

`docs/product/brief.md`:

```markdown
# Challenge brief

**Client:** monis.rent rents office equipment (desks, chairs, monitors and more) to digital nomads and startups in Bali.

**Ask:** an interactive tool where people design their dream workspace and then rent it. It should feel visual and fun, not like a product catalog.

**Persona:** a freelance developer who just landed in Bali and needs a workspace by next week.

**Required stack:** Next.js, Tailwind CSS, Vercel. **Time budget:** 4–8 hours; a polished MVP beats a half-finished masterpiece.

## Must-haves

| #   | Requirement                                               | Status  | Where                                  |
| --- | --------------------------------------------------------- | ------- | -------------------------------------- |
| M1  | Select a desk from at least 2 options                     | Planned | Desk tab: 3 real desks                 |
| M2  | Select a chair from at least 2 options                    | Planned | Chair tab: 1 real and 2 concept chairs |
| M3  | Add accessories (monitors, lamps, plants, etc.)           | Planned | Screens, Accessories and Bali tabs     |
| M4  | Workspace preview updates visually as items change        | Planned | SVG scene                              |
| M5  | Summary or checkout view of the selected setup            | Planned | Summary panel, `/checkout`             |
| M6  | Deployed and reachable through a public URL               | Planned | Vercel                                 |
| M7  | Code on GitHub with `desent-bot` as a collaborator (Read) | Planned | `eksant/monis-rent`                    |

## Submission checklist

- [ ] Live URL that works immediately
- [ ] GitHub repository with `desent-bot` (Read access)
- [ ] Short write-up in `README.md`: approach, tech choices, what we would improve
```

`docs/product/catalog-notes.md`:

```markdown
# Catalog notes

`src/data/catalog.ts` is a snapshot of [www.monis.rent](https://www.monis.rent) taken on **2026-10-11**.

## Source

- Product data (name, slug, `weekly_price`, `monthly_price`, `sale`, `enable_instant`, images) was read from the page data embedded in the monis.rent category pages.
- Images are served from `https://strapi.monis.rent/uploads/…`. All 38 image URLs and product slugs returned HTTP 200 on 2026-10-11.
- Each real item links to `https://www.monis.rent/products/<slug>`.

## Pricing rules

- Prices are USD list prices per week and per month, stored as integer cents.
- `sale` is a discount percentage: effective price = list × (100 − sale) / 100, rounded to the cent. Example: the desk lamp at $4.00 with `sale` 20 costs $3.20, which matches the site's "from $3/week".
- Monthly savings shown in the UI = weekly total × 52 / 12 − monthly total.
- Delivery fees are calculated by monis.rent at checkout from location and weight; this app never computes or promises them.
- "Can arrive today" means every item has `enable_instant`; otherwise "Arrives tomorrow" (monis.rent's standard next-day delivery).

## Assumptions

- **Sale on monthly prices:** we assume `sale` also applies to monthly prices.
- **Desk widths:** Electrical Adjustable Desk 120 cm and Mechanical Adjustable Desk 140 cm are assumptions (monis.rent does not list them). The Dual-Motor desk uses its largest variant, 160 cm.
- **Bundles:** presets mirror the contents of the Essentials, Founders, Trading and Studio bundles. The bundle discount is not applied because its exact rule is unknown.

## Concept items

monis.rent lists only one chair and no plants, but the brief needs at least two chairs and mentions plants. These items are added as **concept items**: no slug, no photo, an indicative price, and a visible "Concept" badge.

| id             | Name               | Weekly | Monthly |
| -------------- | ------------------ | ------ | ------- |
| chair-basic    | Basic Task Chair   | $5.00  | $14.00  |
| chair-premium  | Premium Ergo Chair | $15.00 | $40.00  |
| plant-monstera | Monstera Plant     | $2.00  | $6.00   |
| plant-snake    | Snake Plant        | $1.50  | $4.00   |

Product insight for monis.rent: a single chair model limits choice for the people who sit the longest.
```

`docs/qa/README.md`:

````markdown
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
````

`docs/bugs/bug-log.md`:

```markdown
# Bug log

History of reported bugs with root cause, fix, prevention and regression test. Newest entries first.

**Entry format:**

- **Symptom** (as reported) · **Repro** · **Root cause** · **Fix** (files) · **Prevention** · **Regression test**

---

_No bugs logged yet._
```

- [ ] **Step 2: Format check and commit**

```bash
pnpm format && pnpm format:check
```

```bash
git add -A
git commit -F - <<'EOF'
docs: add agent rules, README, license and project docs

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```

- [ ] **Step 3: Push, open PR A and wait for CI**

```bash
git push -u origin chore/scaffold
gh pr create --base main --title "chore: scaffold, tooling, CI and docs" --body "$(cat <<'EOF'
Milestone 1 of the workspace builder (spec §14).

- Next.js 16 + Tailwind 4 + shadcn/ui with strict ESLint, Prettier, Vitest, Playwright
- CI: lint, type-check, format, unit, build, E2E (desktop + mobile)
- AGENTS.md / CLAUDE.md house rules, MIT license, docs

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
gh pr checks --watch
```

Expected: the `quality` check ends `pass`. If it fails, read the log with `gh run view --log-failed`, fix on the branch, push, and watch again.

- [ ] **Step 4: Merge**

```bash
gh pr merge --squash --delete-branch
git switch main && git pull --ff-only
```

- [ ] **Step 5: Vercel production deploy (owner action)**

Ask the owner to follow `docs/overview/deployment.md` → "One-time setup" (import `eksant/monis-rent` at vercel.com). When they share the production URL:

```bash
curl -sI https://<production-url>/ | head -1
BASE_URL=https://<production-url> pnpm test:e2e
gh repo edit eksant/monis-rent \
  --description "Visual workspace builder for monis.rent: design your Bali desk setup and rent it." \
  --homepage https://<production-url>
```

Expected: `HTTP/2 200`; `2 passed`; the repo shows the description and website.

---
### Task 4: Domain types, catalog snapshot and presets

**Files:**
- Create: `src/lib/types.ts`, `src/data/catalog.ts`, `src/data/presets.ts`
- Test: `src/data/catalog.test.ts`

**Interfaces:**
- Produces (types): `CategoryId`, `SlotId`, `Plan`, `Posture`, `Tone`, `ArtSpec`, `CatalogItem`, `Setup`, `PresetId`, `Preset`, `SetupLine`, `NoticeAction { label; deskId; addItemId? }`, `Notice { message; action? }`, `Arrival`.
- Produces (catalog): `CATALOG: readonly CatalogItem[]` (42 items, 4 concept), `findItem(id): CatalogItem | undefined`, `getItem(id): CatalogItem` (throws `Unknown catalog item: <id>`), `itemsInCategory(category): CatalogItem[]`, `monisProductUrl(slug): string`, `MONIS_PRODUCT_BASE`.
- Produces (presets): `PRESETS`, `DEFAULT_PRESET_ID = "essentials"`, `presetSetup(id): Setup` (fresh copy), `defaultSetup()`, `emptySetup()` (desk-electric, no chair, no items), `matchingPresetId(setup): PresetId | null`.

Prices and images come from the monis.rent snapshot in `docs/product/catalog-notes.md`; all 38 image URLs and slugs were verified (HTTP 200) on 2026-10-11.

- [ ] **Step 0: Branch**

```bash
git switch main && git pull --ff-only
git switch -c feat/core-logic
```

- [ ] **Step 1: Write the failing tests**

`src/data/catalog.test.ts`:

```ts
import { describe, expect, it } from "vitest";

import {
  CATALOG,
  findItem,
  getItem,
  itemsInCategory,
  monisProductUrl,
} from "@/data/catalog";
import { matchingPresetId, presetSetup } from "@/data/presets";

describe("catalog integrity", () => {
  it("has unique ids", () => {
    const ids = CATALOG.map((entry) => entry.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("gives every real item a slug and a monis.rent image", () => {
    for (const entry of CATALOG.filter((candidate) => !candidate.concept)) {
      expect(entry.slug, entry.id).toBeTruthy();
      expect(entry.imageUrl, entry.id).toMatch(
        /^https:\/\/strapi\.monis\.rent\/uploads\//,
      );
    }
  });

  it("keeps concept items free of slugs and images", () => {
    const concepts = CATALOG.filter((entry) => entry.concept).map(
      (entry) => entry.id,
    );
    expect(concepts).toEqual([
      "chair-basic",
      "chair-premium",
      "plant-monstera",
      "plant-snake",
    ]);
    for (const id of concepts) {
      expect(getItem(id).slug).toBeUndefined();
      expect(getItem(id).imageUrl).toBeUndefined();
    }
  });

  it("covers the must-haves: 3 desks with widths and 3 chairs", () => {
    const desks = itemsInCategory("desk");
    expect(desks.map((desk) => desk.widthCm)).toEqual([120, 140, 160]);
    expect(itemsInCategory("chair")).toHaveLength(3);
  });

  it("uses positive integer prices and sane sale percentages", () => {
    for (const entry of CATALOG) {
      expect(
        Number.isInteger(entry.weeklyCents) && entry.weeklyCents > 0,
        entry.id,
      ).toBe(true);
      expect(
        Number.isInteger(entry.monthlyCents) && entry.monthlyCents > 0,
        entry.id,
      ).toBe(true);
      expect(entry.salePercent).toBeGreaterThanOrEqual(0);
      expect(entry.salePercent).toBeLessThan(100);
    }
  });

  it("looks items up by id", () => {
    expect(findItem("nope")).toBeUndefined();
    expect(() => getItem("nope")).toThrow("Unknown catalog item: nope");
    expect(monisProductUrl("mouse-pad")).toBe(
      "https://www.monis.rent/products/mouse-pad",
    );
  });
});

describe("matchingPresetId", () => {
  it("recognises a preset regardless of plan and posture", () => {
    const setup = {
      ...presetSetup("trading"),
      plan: "monthly" as const,
      posture: "stand" as const,
    };
    expect(matchingPresetId(setup)).toBe("trading");
  });

  it("returns null once the setup is customised", () => {
    const setup = presetSetup("trading");
    expect(
      matchingPresetId({ ...setup, items: { ...setup.items, "lamp-hue": 1 } }),
    ).toBeNull();
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

```bash
pnpm exec vitest run src/data/catalog.test.ts
```

Expected: FAIL — `Failed to resolve import "@/data/catalog"`.

- [ ] **Step 3: Implement**

`src/lib/types.ts`:

```ts
export type CategoryId = "desk" | "chair" | "screen" | "accessory" | "extra";

export type SlotId =
  | "desk"
  | "chair"
  | "monitor"
  | "monitorStand"
  | "lightBar"
  | "deskLamp"
  | "ambientLamp"
  | "keyboard"
  | "mouse"
  | "mousePad"
  | "laptopStand"
  | "webcam"
  | "headphones"
  | "mic"
  | "computer"
  | "dock"
  | "power"
  | "cable"
  | "plant"
  | "internet"
  | "dehumidifier"
  | "purifier"
  | "fan"
  | "coffee"
  | "underDesk";

export type Plan = "weekly" | "monthly";
export type Posture = "sit" | "stand";
export type Tone = "dark" | "silver";

// Which scene component draws an item, with its visual parameters.
export type ArtSpec =
  | { kind: "desk"; variant: "electric" | "mechanical" | "dualMotor" }
  | { kind: "chair"; variant: "ergo" | "basic" | "premium" }
  | { kind: "monitor"; inches: number; ultrawide: boolean; tone: Tone }
  | { kind: "keyboard"; tone: Tone }
  | { kind: "mouse"; tone: Tone }
  | { kind: "plant"; variant: "monstera" | "snake" }
  | {
      kind:
        | "deskLamp"
        | "hueLamp"
        | "lightBar"
        | "mousePad"
        | "laptopStand"
        | "monitorStand"
        | "webcam"
        | "headphones"
        | "mic"
        | "macMini"
        | "dock"
        | "powerStrip"
        | "cable"
        | "starlink"
        | "router"
        | "dehumidifier"
        | "purifier"
        | "fan"
        | "coffee"
        | "walkingPad";
    };

export interface CatalogItem {
  id: string;
  slug?: string;
  name: string;
  category: CategoryId;
  group?: string;
  slot: SlotId;
  slotSize: number;
  maxQty: number;
  requires?: SlotId;
  weeklyCents: number;
  monthlyCents: number;
  salePercent: number;
  instant: boolean;
  concept: boolean;
  imageUrl?: string;
  benefit: string;
  widthCm?: number;
  art: ArtSpec;
  tags: string[];
}

export interface Setup {
  deskId: string;
  chairId: string | null;
  items: Record<string, number>;
  plan: Plan;
  posture: Posture;
}

export type PresetId = "essentials" | "founders" | "trading" | "studio";

export interface Preset {
  id: PresetId;
  name: string;
  tagline: string;
  setup: Setup;
}

export interface SetupLine {
  item: CatalogItem;
  qty: number;
}

// "Upgrade desk" style action: switch desk, then retry adding the item that did not fit.
export interface NoticeAction {
  label: string;
  deskId: string;
  addItemId?: string;
}

export interface Notice {
  message: string;
  action?: NoticeAction;
}

export type Arrival = "today" | "tomorrow";
```

`src/data/catalog.ts`:

```ts
import type { CatalogItem } from "@/lib/types";

// Snapshot of www.monis.rent taken on 2026-10-11; see docs/product/catalog-notes.md.
const IMAGE_BASE = "https://strapi.monis.rent/uploads/";
export const MONIS_PRODUCT_BASE = "https://www.monis.rent/products/";

type ItemInput = Omit<
  CatalogItem,
  "slotSize" | "maxQty" | "salePercent" | "concept" | "imageUrl"
> &
  Partial<Pick<CatalogItem, "slotSize" | "maxQty" | "salePercent">> & {
    image?: string;
  };

// Items without a monis.rent slug are concept items (not in the real catalog).
function item({ image, ...rest }: ItemInput): CatalogItem {
  return {
    slotSize: 1,
    maxQty: 1,
    salePercent: 0,
    ...rest,
    concept: rest.slug === undefined,
    ...(image === undefined ? {} : { imageUrl: IMAGE_BASE + image }),
  };
}

export const CATALOG: readonly CatalogItem[] = [
  // Desks
  item({
    id: "desk-electric",
    slug: "electrical-adjustable-desk",
    name: "Electrical Adjustable Desk",
    category: "desk",
    slot: "desk",
    weeklyCents: 700,
    monthlyCents: 2000,
    salePercent: 30,
    instant: false,
    image: "desk_titel_new_3db151d44c.jpg",
    benefit: "Push-button height from 70 to 118 cm. Sit or stand in seconds.",
    widthCm: 120,
    art: { kind: "desk", variant: "electric" },
    tags: ["standing", "electric"],
  }),
  item({
    id: "desk-mechanical",
    slug: "adjustable-wooden-desk",
    name: "Mechanical Adjustable Desk",
    category: "desk",
    slot: "desk",
    weeklyCents: 1300,
    monthlyCents: 3600,
    instant: false,
    image: "Mechanical_Adjustable_Desk_front_new_a83b8077b0.jpg",
    benefit: "Crank it from 70 to 120 cm. No power socket needed.",
    widthCm: 140,
    art: { kind: "desk", variant: "mechanical" },
    tags: ["standing", "wood"],
  }),
  item({
    id: "desk-dual-motor",
    slug: "dual-motor-electric-standing-desk",
    name: "Dual-Motor Electric Standing Desk",
    category: "desk",
    slot: "desk",
    weeklyCents: 1600,
    monthlyCents: 3600,
    instant: false,
    image: "Dual_Motor_Standing_Desk_8_9f364ae87f.jpg",
    benefit: "Rock-solid dual motors and room for three screens.",
    widthCm: 160,
    art: { kind: "desk", variant: "dualMotor" },
    tags: ["standing", "premium", "wide"],
  }),
  // Chairs
  item({
    id: "chair-ergo",
    slug: "ergonomic-office-chair",
    name: "Ergonomic Office Chair",
    category: "chair",
    slot: "chair",
    weeklyCents: 900,
    monthlyCents: 2400,
    salePercent: 30,
    instant: false,
    image: "fantech_oca259s_chair_6_b632a0c529.jpg",
    benefit: "Breathable mesh with lumbar and neck support for long days.",
    art: { kind: "chair", variant: "ergo" },
    tags: ["ergonomic"],
  }),
  item({
    id: "chair-basic",
    name: "Basic Task Chair",
    category: "chair",
    slot: "chair",
    weeklyCents: 500,
    monthlyCents: 1400,
    instant: false,
    benefit: "A simple, comfy task chair for shorter stays.",
    art: { kind: "chair", variant: "basic" },
    tags: ["budget"],
  }),
  item({
    id: "chair-premium",
    name: "Premium Ergo Chair",
    category: "chair",
    slot: "chair",
    weeklyCents: 1500,
    monthlyCents: 4000,
    instant: false,
    benefit: "Top-tier ergonomics with every adjustment you can think of.",
    art: { kind: "chair", variant: "premium" },
    tags: ["premium", "ergonomic"],
  }),
  // Screens
  item({
    id: "mon-24-1c",
    slug: "full-hd-office-24",
    name: '24" Full HD Office Monitor 1C',
    category: "screen",
    slot: "monitor",
    maxQty: 3,
    weeklyCents: 700,
    monthlyCents: 2000,
    salePercent: 20,
    instant: true,
    image: "24_Full_HD_75_Hz_IPS_Desktop_1_C_Monitor_front_7eeba14881.jpg",
    benefit: "A crisp extra screen that won't break the budget.",
    art: { kind: "monitor", inches: 24, ultrawide: false, tone: "dark" },
    tags: ["budget", "full hd"],
  }),
  item({
    id: "mon-27-a27i",
    slug: "27-work-monitor-a27i",
    name: '27" Full HD Office Monitor A27i',
    category: "screen",
    slot: "monitor",
    maxQty: 3,
    weeklyCents: 1000,
    monthlyCents: 3200,
    instant: true,
    image: "A27i_front_35acc32043.jpg",
    benefit: "A big, sharp Full HD canvas for docs and code.",
    art: { kind: "monitor", inches: 27, ultrawide: false, tone: "dark" },
    tags: ["full hd"],
  }),
  item({
    id: "mon-27-4k",
    slug: "27-4-k-multimedia-monitor",
    name: '27" 4K Multimedia Monitor',
    category: "screen",
    slot: "monitor",
    maxQty: 3,
    weeklyCents: 2100,
    monthlyCents: 5200,
    salePercent: 25,
    instant: true,
    image: "27_4_K_A27_U_Multitasking_Monitor_1_ce29d15357.jpg",
    benefit: "4K detail with a single USB-C cable to your laptop.",
    art: { kind: "monitor", inches: 27, ultrawide: false, tone: "dark" },
    tags: ["4k", "usb-c"],
  }),
  item({
    id: "mon-27-4k-grading",
    slug: "4k-grading-monitor-27",
    name: '27" 4K+ Grading Monitor',
    category: "screen",
    slot: "monitor",
    maxQty: 3,
    weeklyCents: 2400,
    monthlyCents: 7200,
    instant: true,
    image: "27_4_K_60_Hz_IPS_Grading_Monitor_front_01b90d6ac0.jpg",
    benefit: "Colour-accurate 4K for photo and video work.",
    art: { kind: "monitor", inches: 27, ultrawide: false, tone: "dark" },
    tags: ["4k", "colour", "creative"],
  }),
  item({
    id: "mon-32-qhd",
    slug: "32-4-k-ergonomic-monitor",
    name: '32" QHD Ergonomic Monitor',
    category: "screen",
    slot: "monitor",
    maxQty: 3,
    weeklyCents: 2600,
    monthlyCents: 7600,
    salePercent: 20,
    instant: true,
    image: "32_LG_Fine_Art_addtition_1_1c49831c40.jpg",
    benefit: "A huge QHD screen on an arm you can tilt and swivel.",
    art: { kind: "monitor", inches: 32, ultrawide: false, tone: "dark" },
    tags: ["qhd", "large"],
  }),
  item({
    id: "mon-34-gaming",
    slug: "34-4-k-curved-monitor-180-hz",
    name: '34" 4K Gaming Monitor',
    category: "screen",
    slot: "monitor",
    slotSize: 2,
    maxQty: 1,
    weeklyCents: 2300,
    monthlyCents: 7600,
    salePercent: 20,
    instant: true,
    image: "34_4_K_Gaming_Monitor_7_3f6b2ba627.jpg",
    benefit: "Ultrawide 180 Hz curve. Charts and games love it.",
    art: { kind: "monitor", inches: 34, ultrawide: true, tone: "dark" },
    tags: ["ultrawide", "trading", "gaming"],
  }),
  item({
    id: "mon-34-curved",
    slug: "4-k-ultra-wide-34",
    name: '34" 4K Curved Monitor',
    category: "screen",
    slot: "monitor",
    slotSize: 2,
    maxQty: 1,
    weeklyCents: 2300,
    monthlyCents: 7600,
    instant: true,
    image: "34_4_K_Ultra_Wide_Curved_Monitor_front_3636b63aed.jpg",
    benefit: "One ultrawide curve that replaces two monitors.",
    art: { kind: "monitor", inches: 34, ultrawide: true, tone: "dark" },
    tags: ["ultrawide"],
  }),
  item({
    id: "mon-studio",
    slug: "apple-studio-display",
    name: '27" 5K Apple Studio Display',
    category: "screen",
    slot: "monitor",
    maxQty: 3,
    weeklyCents: 9900,
    monthlyCents: 30000,
    instant: false,
    image: "Apple_Studio_Display_6_94c6329a05.jpg",
    benefit: "Apple's 5K Retina display. The dream screen for Mac users.",
    art: { kind: "monitor", inches: 27, ultrawide: false, tone: "silver" },
    tags: ["5k", "apple", "creative", "premium"],
  }),
  // Accessories: lighting
  item({
    id: "lamp-led",
    slug: "smart-led-desk-lamp-1-s",
    name: "Smart LED Desk Lamp 1S",
    category: "accessory",
    group: "Lighting",
    slot: "deskLamp",
    weeklyCents: 400,
    monthlyCents: 1200,
    salePercent: 20,
    instant: true,
    image: "Xiaomi_Mi_Led_Desk_Lamp_1_S_10_3777ddd163.jpg",
    benefit: "Warm-to-cool light for late-night calls.",
    art: { kind: "deskLamp" },
    tags: ["light"],
  }),
  item({
    id: "lamp-hue",
    slug: "hue-signe-gradient-lamp",
    name: "Hue Signe Gradient Lamp",
    category: "accessory",
    group: "Lighting",
    slot: "ambientLamp",
    weeklyCents: 1200,
    monthlyCents: 3200,
    instant: true,
    image: "Philips_Hue_Signe_gradient_table_lamp_new_e4eeba8c56.jpg",
    benefit: "Gradient mood light that makes the villa feel like home.",
    art: { kind: "hueLamp" },
    tags: ["light", "mood"],
  }),
  item({
    id: "light-bar",
    slug: "metal-monitor-light-bar",
    name: "Monitor Light Bar",
    category: "accessory",
    group: "Lighting",
    slot: "lightBar",
    requires: "monitor",
    weeklyCents: 500,
    monthlyCents: 1200,
    instant: true,
    image: "Monitor_Light_Bar_1_8e97972171.jpg",
    benefit: "Lights your desk, not your screen. No glare.",
    art: { kind: "lightBar" },
    tags: ["light", "creator"],
  }),
  // Accessories: keyboard and mouse
  item({
    id: "kb-mx",
    slug: "logitech-mx-keyboard",
    name: "Logitech MX Keyboard",
    category: "accessory",
    group: "Keyboard & mouse",
    slot: "keyboard",
    weeklyCents: 700,
    monthlyCents: 2800,
    salePercent: 20,
    instant: true,
    image: "Logitech_MX_keys_1_9977480ae1.jpg",
    benefit: "Quiet, backlit keys that switch between three devices.",
    art: { kind: "keyboard", tone: "dark" },
    tags: ["keyboard"],
  }),
  item({
    id: "kb-magic",
    slug: "apple-magic-keyboard",
    name: "Apple Magic Keyboard",
    category: "accessory",
    group: "Keyboard & mouse",
    slot: "keyboard",
    weeklyCents: 1200,
    monthlyCents: 3200,
    instant: true,
    image: "magic_keyboard_with_touch_id_1_7124075f1d.jpg",
    benefit: "Touch ID and the feel of your Mac keyboard.",
    art: { kind: "keyboard", tone: "silver" },
    tags: ["keyboard", "apple"],
  }),
  item({
    id: "mouse-mx",
    slug: "logitech-mx-master-mouse-s3",
    name: "Logitech MX Master Mouse S3",
    category: "accessory",
    group: "Keyboard & mouse",
    slot: "mouse",
    weeklyCents: 500,
    monthlyCents: 1200,
    salePercent: 20,
    instant: true,
    image: "Logitech_S3_6_4cf1e523b8.jpg",
    benefit: "The precision mouse most developers swear by.",
    art: { kind: "mouse", tone: "dark" },
    tags: ["mouse"],
  }),
  item({
    id: "mouse-silent",
    slug: "logitech-mx-mouse",
    name: "Logitech M331 Silent Mouse",
    category: "accessory",
    group: "Keyboard & mouse",
    slot: "mouse",
    weeklyCents: 250,
    monthlyCents: 600,
    salePercent: 20,
    instant: true,
    image: "mouse_side_M33_030834aea0.jpg",
    benefit: "Click away without waking anyone in the co-living.",
    art: { kind: "mouse", tone: "dark" },
    tags: ["mouse", "budget", "quiet"],
  }),
  item({
    id: "mouse-magic",
    slug: "apple-magic-mouse",
    name: "Apple Magic Mouse",
    category: "accessory",
    group: "Keyboard & mouse",
    slot: "mouse",
    weeklyCents: 900,
    monthlyCents: 2400,
    instant: true,
    image: "Apple_Magic_Mouse_4_022f966524.jpg",
    benefit: "Multi-touch gestures for the Apple crowd.",
    art: { kind: "mouse", tone: "silver" },
    tags: ["mouse", "apple"],
  }),
  item({
    id: "mouse-pad",
    slug: "mouse-pad",
    name: "Mouse Pad",
    category: "accessory",
    group: "Keyboard & mouse",
    slot: "mousePad",
    weeklyCents: 200,
    monthlyCents: 400,
    instant: true,
    image: "Mouse_pad_1_e6684ebc31.jpg",
    benefit: "Smooth glide and a tidy desk.",
    art: { kind: "mousePad" },
    tags: ["mouse"],
  }),
  // Accessories: ergonomics
  item({
    id: "laptop-stand",
    slug: "ergonomic-laptop-stand",
    name: "Ergonomic Laptop Stand",
    category: "accessory",
    group: "Ergonomics",
    slot: "laptopStand",
    weeklyCents: 300,
    monthlyCents: 800,
    salePercent: 20,
    instant: true,
    image: "Laptop_stand_back_new2_91df29c3c8.jpg",
    benefit: "Raises your laptop to eye level. Your neck says thanks.",
    art: { kind: "laptopStand" },
    tags: ["ergonomic", "laptop"],
  }),
  item({
    id: "monitor-stand",
    slug: "adjustable-monitor-stand",
    name: "Adjustable Monitor Stand",
    category: "accessory",
    group: "Ergonomics",
    slot: "monitorStand",
    requires: "monitor",
    weeklyCents: 300,
    monthlyCents: 800,
    instant: true,
    image: "Adjustable_Monitor_Stand_4_e6ae3a1d06.jpg",
    benefit: "Lifts your screen and adds storage underneath.",
    art: { kind: "monitorStand" },
    tags: ["ergonomic"],
  }),
  // Accessories: calls and creator
  item({
    id: "webcam",
    slug: "logitech-4-k-webcam",
    name: "Logitech 4K Webcam",
    category: "accessory",
    group: "Calls & creator",
    slot: "webcam",
    weeklyCents: 900,
    monthlyCents: 2400,
    instant: true,
    image: "Logitech_Brio_4_K_Webcam_6_d7ea7e69b0.jpg",
    benefit: "4K video that makes every call look professional.",
    art: { kind: "webcam" },
    tags: ["calls", "creator"],
  }),
  item({
    id: "headphones",
    slug: "logitech-wireless-headphones",
    name: "Wireless Headphones",
    category: "accessory",
    group: "Calls & creator",
    slot: "headphones",
    weeklyCents: 700,
    monthlyCents: 1600,
    instant: true,
    image: "zone_300_graphite_4_17d41d1a5b.webp",
    benefit: "A light headset with a noise-cancelling mic.",
    art: { kind: "headphones" },
    tags: ["calls"],
  }),
  item({
    id: "mic-kit",
    slug: "podcast-microphone-kit",
    name: "Podcast Microphone Kit",
    category: "accessory",
    group: "Calls & creator",
    slot: "mic",
    weeklyCents: 1800,
    monthlyCents: 4800,
    instant: true,
    image: "Shure_MV_7_Podcast_Microphone_Kit_1_fefd9453fb.jpg",
    benefit: "Studio-grade Shure MV7 for podcasts and voice-overs.",
    art: { kind: "mic" },
    tags: ["creator", "podcast"],
  }),
  // Accessories: computer
  item({
    id: "mac-mini",
    slug: "apple-mac-mini-m4",
    name: "Apple Mac Mini M4",
    category: "accessory",
    group: "Computer",
    slot: "computer",
    weeklyCents: 3900,
    monthlyCents: 11600,
    salePercent: 30,
    instant: true,
    image: "Mac_mini_M4_front_b152d10743.jpg",
    benefit: "No laptop? A full desktop Mac that fits in your palm.",
    art: { kind: "macMini" },
    tags: ["computer", "apple"],
  }),
  // Accessories: power and cables
  item({
    id: "dock",
    slug: "display-docking-station",
    name: "Display Docking Station",
    category: "accessory",
    group: "Power & cables",
    slot: "dock",
    weeklyCents: 800,
    monthlyCents: 1800,
    instant: true,
    image: "Chat_GPT_Image_Apr_7_2026_02_38_23_PM_5d6f60c5e2.jpg",
    benefit: "One cable to three displays, with charging.",
    art: { kind: "dock" },
    tags: ["usb-c"],
  }),
  item({
    id: "power-strip-3",
    slug: "international-power-strip",
    name: "Smart Power Strip 3",
    category: "accessory",
    group: "Power & cables",
    slot: "power",
    weeklyCents: 150,
    monthlyCents: 400,
    instant: true,
    image: "Xiaomi_MI_Smart_Power_Strip_Plug_black_3965e07e42.jpg",
    benefit: "Sockets for EU, US and UK plugs. No adapter hunt.",
    art: { kind: "powerStrip" },
    tags: ["power"],
  }),
  item({
    id: "power-strip-6",
    slug: "smart-power-strip-6",
    name: "Smart Power Strip 6",
    category: "accessory",
    group: "Power & cables",
    slot: "power",
    weeklyCents: 300,
    monthlyCents: 800,
    instant: true,
    image: "Xiaomi_MI_Smart_Power_Strip_Plug_white_4b97124ba0.jpg",
    benefit: "Six universal sockets for a fully loaded desk.",
    art: { kind: "powerStrip" },
    tags: ["power"],
  }),
  item({
    id: "extension-cable",
    slug: "extension-cable",
    name: "Extension Cable",
    category: "accessory",
    group: "Power & cables",
    slot: "cable",
    weeklyCents: 80,
    monthlyCents: 320,
    instant: true,
    image: "extension_cable_547a728512.jpg",
    benefit: "Reach the socket on the other side of the room.",
    art: { kind: "cable" },
    tags: ["power"],
  }),
  // Accessories: decor (concept)
  item({
    id: "plant-monstera",
    name: "Monstera Plant",
    category: "accessory",
    group: "Decor",
    slot: "plant",
    maxQty: 2,
    weeklyCents: 200,
    monthlyCents: 600,
    instant: false,
    benefit: "A big leafy friend for that jungle-office vibe.",
    art: { kind: "plant", variant: "monstera" },
    tags: ["plant", "decor"],
  }),
  item({
    id: "plant-snake",
    name: "Snake Plant",
    category: "accessory",
    group: "Decor",
    slot: "plant",
    maxQty: 2,
    weeklyCents: 150,
    monthlyCents: 400,
    instant: false,
    benefit: "Low-maintenance greenery for the desk corner.",
    art: { kind: "plant", variant: "snake" },
    tags: ["plant", "decor"],
  }),
  // Bali extras
  item({
    id: "starlink",
    slug: "starlink-kit-incl-plan",
    name: "Starlink Kit (incl. plan)",
    category: "extra",
    slot: "internet",
    weeklyCents: 6800,
    monthlyCents: 23600,
    salePercent: 20,
    instant: true,
    image: "Starlink_V4_Gen_3_7_41ef714dbb.jpg",
    benefit: "Satellite internet for when the villa Wi-Fi gives up.",
    art: { kind: "starlink" },
    tags: ["internet", "remote"],
  }),
  item({
    id: "router",
    slug: "wi-fi-6-router-5-g",
    name: "Dual-Band Wi-Fi 6 Router",
    category: "extra",
    slot: "internet",
    weeklyCents: 1200,
    monthlyCents: 2800,
    instant: true,
    image:
      "Archer_AX_72_AX_5400_Dual_Band_Gigabit_Wi_Fi_6_Router_4_69792f5825.jpg",
    benefit: "Fast Wi-Fi 6 that reaches every corner of the villa.",
    art: { kind: "router" },
    tags: ["internet", "wifi"],
  }),
  item({
    id: "dehumidifier",
    slug: "smart-dehumidifier-lite",
    name: "Smart Dehumidifier Lite",
    category: "extra",
    slot: "dehumidifier",
    weeklyCents: 900,
    monthlyCents: 2400,
    instant: false,
    image: "Xiaomi_Smart_Dehumidifier_Lite_2_1e722aab84.jpg",
    benefit: "Fights Bali humidity, so your gear stays dry.",
    art: { kind: "dehumidifier" },
    tags: ["humid", "climate"],
  }),
  item({
    id: "purifier",
    slug: "smart-air-purifier",
    name: "Smart Air Purifier",
    category: "extra",
    slot: "purifier",
    weeklyCents: 1100,
    monthlyCents: 2800,
    instant: true,
    image: "Smart_Air_Purifier_6_5_bad4579786.jpg",
    benefit: "Cleaner air in the dusty or smoky season.",
    art: { kind: "purifier" },
    tags: ["air", "climate"],
  }),
  item({
    id: "tower-fan",
    slug: "smart-tower-fan",
    name: "Smart Tower Fan",
    category: "extra",
    slot: "fan",
    weeklyCents: 800,
    monthlyCents: 2000,
    instant: true,
    image: "Xiaomi_Smart_Tower_Fan_2_1_564cd4ec1e.jpg",
    benefit: "A quiet breeze for hot afternoons.",
    art: { kind: "fan" },
    tags: ["heat", "climate"],
  }),
  item({
    id: "nespresso",
    slug: "nespresso-essenza-coffee-machine",
    name: "Nespresso Essenza Coffee Machine",
    category: "extra",
    slot: "coffee",
    weeklyCents: 1200,
    monthlyCents: 2800,
    salePercent: 20,
    instant: true,
    image: "NESPRESSO_Essenza_Mini_2_4ea4cc0abc.jpg",
    benefit: "Espresso at your desk. No scooter ride needed.",
    art: { kind: "coffee" },
    tags: ["coffee"],
  }),
  item({
    id: "walking-pad",
    slug: "foldable-walk-pad",
    name: "Foldable Walking Pad R2 Pro",
    category: "extra",
    slot: "underDesk",
    weeklyCents: 2800,
    monthlyCents: 7200,
    salePercent: 20,
    instant: false,
    image: "Walking_pad_new_05f1ab2d48.jpg",
    benefit: "Walk while you work at a standing desk.",
    art: { kind: "walkingPad" },
    tags: ["walk", "active", "standing"],
  }),
];

const BY_ID = new Map(CATALOG.map((entry) => [entry.id, entry]));

export function findItem(id: string): CatalogItem | undefined {
  return BY_ID.get(id);
}

// Throws on unknown ids; use only with ids that come from the catalog itself.
export function getItem(id: string): CatalogItem {
  const found = BY_ID.get(id);
  if (found === undefined) throw new Error(`Unknown catalog item: ${id}`);
  return found;
}

export function itemsInCategory(
  category: CatalogItem["category"],
): CatalogItem[] {
  return CATALOG.filter((entry) => entry.category === category);
}

export function monisProductUrl(slug: string): string {
  return MONIS_PRODUCT_BASE + slug;
}
```

`src/data/presets.ts`:

```ts
import type { Preset, PresetId, Setup } from "@/lib/types";

// Mirrors the monis.rent bundles (contents only; the bundle discount is not applied).
export const PRESETS: readonly Preset[] = [
  {
    id: "essentials",
    name: "Essentials",
    tagline: "Desk, chair, power. Bring your laptop.",
    setup: {
      deskId: "desk-electric",
      chairId: "chair-ergo",
      items: { "power-strip-3": 1 },
      plan: "weekly",
      posture: "sit",
    },
  },
  {
    id: "founders",
    name: "Founders",
    tagline: "A 4K screen and pro peripherals for long build days.",
    setup: {
      deskId: "desk-electric",
      chairId: "chair-ergo",
      items: {
        "mon-27-4k": 1,
        "laptop-stand": 1,
        "kb-mx": 1,
        "mouse-mx": 1,
        "mouse-pad": 1,
        "power-strip-3": 1,
        "light-bar": 1,
      },
      plan: "weekly",
      posture: "sit",
    },
  },
  {
    id: "trading",
    name: "Trading",
    tagline: "An ultrawide for charts and a lamp for the early open.",
    setup: {
      deskId: "desk-electric",
      chairId: "chair-ergo",
      items: {
        "mon-34-gaming": 1,
        "kb-mx": 1,
        "mouse-mx": 1,
        "mouse-pad": 1,
        "lamp-led": 1,
        "power-strip-6": 1,
        "extension-cable": 1,
      },
      plan: "weekly",
      posture: "sit",
    },
  },
  {
    id: "studio",
    name: "Studio",
    tagline: "A 5K Studio Display and Apple peripherals for creatives.",
    setup: {
      deskId: "desk-electric",
      chairId: "chair-ergo",
      items: {
        "mon-studio": 1,
        "kb-magic": 1,
        "mouse-magic": 1,
        "mouse-pad": 1,
        "power-strip-6": 1,
        "lamp-led": 1,
      },
      plan: "weekly",
      posture: "sit",
    },
  },
];

export const DEFAULT_PRESET_ID: PresetId = "essentials";

export function presetSetup(id: PresetId): Setup {
  const preset = PRESETS.find((entry) => entry.id === id);
  if (preset === undefined) throw new Error(`Unknown preset: ${id}`);
  return { ...preset.setup, items: { ...preset.setup.items } };
}

export function defaultSetup(): Setup {
  return presetSetup(DEFAULT_PRESET_ID);
}

export function emptySetup(): Setup {
  return {
    deskId: "desk-electric",
    chairId: null,
    items: {},
    plan: "weekly",
    posture: "sit",
  };
}

// The preset whose desk, chair and items equal the setup (plan and posture ignored).
export function matchingPresetId(setup: Setup): PresetId | null {
  const key = (items: Record<string, number>): string =>
    JSON.stringify(
      Object.entries(items).sort(([a], [b]) => a.localeCompare(b)),
    );
  const match = PRESETS.find(
    (preset) =>
      preset.setup.deskId === setup.deskId &&
      preset.setup.chairId === setup.chairId &&
      key(preset.setup.items) === key(setup.items),
  );
  return match?.id ?? null;
}
```

- [ ] **Step 4: Run the tests to verify they pass**

```bash
pnpm exec vitest run src/data/catalog.test.ts
```

Expected: PASS — `Tests  8 passed`.

- [ ] **Step 5: Gate and commit**

```bash
pnpm lint && pnpm type-check && pnpm format:check && pnpm test
```

```bash
git add src/data/catalog.test.ts src/lib/types.ts src/data/catalog.ts src/data/presets.ts
git commit -F - <<'EOF'
feat: add catalog snapshot, presets and domain types

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```

---
### Task 5: Money formatting and pricing

**Files:**
- Create: `src/lib/money.ts`, `src/lib/pricing.ts`
- Test: `src/lib/money.test.ts`, `src/lib/pricing.test.ts`

**Interfaces:**
- Consumes: `CatalogItem`, `Plan`, `SetupLine`, `Arrival` (Task 4); `getItem`, `presetSetup` in tests.
- Produces: `formatCents(cents): string` (`490` → `$4.90`), `formatDelta(cents): string` (`+$4.90`, `−$2.00`, `$0.00`), `effectiveCents(item, plan)`, `totalCents(lines, plan)`, `monthlySavingsCents(lines)` (may be negative), `weeklyEquivalentCents(lines, plan)`, `arrivalFor(lines): Arrival`.

- [ ] **Step 1: Write the failing tests**

`src/lib/money.test.ts`:

```ts
import { describe, expect, it } from "vitest";

import { formatCents, formatDelta } from "@/lib/money";

describe("formatCents", () => {
  it("formats integer cents as USD", () => {
    expect(formatCents(490)).toBe("$4.90");
    expect(formatCents(13940)).toBe("$139.40");
    expect(formatCents(0)).toBe("$0.00");
  });
});

describe("formatDelta", () => {
  it("prefixes a plus sign for increases", () => {
    expect(formatDelta(490)).toBe("+$4.90");
  });

  it("uses a real minus sign for decreases", () => {
    expect(formatDelta(-200)).toBe("−$2.00");
  });

  it("shows zero without a sign", () => {
    expect(formatDelta(0)).toBe("$0.00");
  });
});
```

`src/lib/pricing.test.ts`:

```ts
import { describe, expect, it } from "vitest";

import { getItem } from "@/data/catalog";
import { presetSetup } from "@/data/presets";
import {
  arrivalFor,
  effectiveCents,
  monthlySavingsCents,
  totalCents,
  weeklyEquivalentCents,
} from "@/lib/pricing";
import type { PresetId, SetupLine } from "@/lib/types";

// Lines for a preset, built by hand so this test does not depend on lib/setup.
function presetLines(id: PresetId): SetupLine[] {
  const { deskId, chairId, items } = presetSetup(id);
  const single = chairId === null ? [deskId] : [deskId, chairId];
  return [
    ...single.map((itemId) => ({ item: getItem(itemId), qty: 1 })),
    ...Object.entries(items).map(([itemId, qty]) => ({
      item: getItem(itemId),
      qty,
    })),
  ];
}

describe("effectiveCents", () => {
  it("applies the sale percentage to the weekly list price", () => {
    expect(effectiveCents(getItem("desk-electric"), "weekly")).toBe(490);
    expect(effectiveCents(getItem("mon-27-4k"), "weekly")).toBe(1575);
  });

  it("applies the sale percentage to the monthly list price", () => {
    expect(effectiveCents(getItem("chair-ergo"), "monthly")).toBe(1680);
  });

  it("keeps the list price when there is no sale", () => {
    expect(effectiveCents(getItem("desk-dual-motor"), "weekly")).toBe(1600);
  });
});

describe("preset totals (spec §8.3)", () => {
  const cases: [PresetId, number, number][] = [
    ["essentials", 1270, 3480],
    ["founders", 4745, 12820],
    ["trading", 4820, 14840],
    ["studio", 13940, 40840],
  ];

  it.each(cases)("%s costs %i weekly and %i monthly", (id, weekly, monthly) => {
    const lines = presetLines(id);
    expect(totalCents(lines, "weekly")).toBe(weekly);
    expect(totalCents(lines, "monthly")).toBe(monthly);
  });
});

describe("monthlySavingsCents", () => {
  it("compares 52/12 weeks of weekly billing with the monthly plan", () => {
    // 1270 × 52 / 12 = 5503.33 → 5503; 5503 − 3480 = 2023
    expect(monthlySavingsCents(presetLines("essentials"))).toBe(2023);
  });
});

describe("weeklyEquivalentCents", () => {
  it("returns the weekly total on the weekly plan", () => {
    expect(weeklyEquivalentCents(presetLines("essentials"), "weekly")).toBe(
      1270,
    );
  });

  it("spreads the monthly total over 52/12 weeks", () => {
    // 3480 / 4.333… = 803.08 → 803
    expect(weeklyEquivalentCents(presetLines("essentials"), "monthly")).toBe(
      803,
    );
  });
});

describe("arrivalFor", () => {
  it("is today only when every item is instant", () => {
    expect(arrivalFor([{ item: getItem("mon-24-1c"), qty: 1 }])).toBe("today");
  });

  it("is tomorrow when any item is not instant", () => {
    expect(arrivalFor(presetLines("essentials"))).toBe("tomorrow");
  });

  it("treats concept items as not instant", () => {
    expect(arrivalFor([{ item: getItem("plant-snake"), qty: 1 }])).toBe(
      "tomorrow",
    );
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

```bash
pnpm exec vitest run src/lib/money.test.ts src/lib/pricing.test.ts
```

Expected: FAIL — `Failed to resolve import "@/lib/money"` and `"@/lib/pricing"`.

- [ ] **Step 3: Implement**

`src/lib/money.ts`:

```ts
const USD = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export function formatCents(cents: number): string {
  return USD.format(cents / 100);
}

// Signed price change for item cards, e.g. "+$4.90" or "−$2.00".
export function formatDelta(cents: number): string {
  if (cents === 0) return formatCents(0);
  const sign = cents > 0 ? "+" : "−";
  return `${sign}${formatCents(Math.abs(cents))}`;
}
```

`src/lib/pricing.ts`:

```ts
import type { Arrival, CatalogItem, Plan, SetupLine } from "@/lib/types";

const WEEKS_PER_MONTH = 52 / 12;

// List price for the plan minus the item's sale percentage, in integer cents.
export function effectiveCents(item: CatalogItem, plan: Plan): number {
  const list = plan === "weekly" ? item.weeklyCents : item.monthlyCents;
  return Math.round((list * (100 - item.salePercent)) / 100);
}

export function totalCents(lines: readonly SetupLine[], plan: Plan): number {
  return lines.reduce(
    (sum, line) => sum + line.qty * effectiveCents(line.item, plan),
    0,
  );
}

// What a month costs on weekly billing minus the monthly plan; may be negative.
export function monthlySavingsCents(lines: readonly SetupLine[]): number {
  return (
    Math.round(totalCents(lines, "weekly") * WEEKS_PER_MONTH) -
    totalCents(lines, "monthly")
  );
}

export function weeklyEquivalentCents(
  lines: readonly SetupLine[],
  plan: Plan,
): number {
  const total = totalCents(lines, plan);
  return plan === "weekly" ? total : Math.round(total / WEEKS_PER_MONTH);
}

export function arrivalFor(lines: readonly SetupLine[]): Arrival {
  return lines.every((line) => line.item.instant) ? "today" : "tomorrow";
}
```

- [ ] **Step 4: Run the tests to verify they pass**

```bash
pnpm exec vitest run src/lib/money.test.ts src/lib/pricing.test.ts
```

Expected: PASS — `Tests  17 passed`.

- [ ] **Step 5: Gate and commit**

```bash
pnpm lint && pnpm type-check && pnpm format:check && pnpm test
```

```bash
git add src/lib/money.test.ts src/lib/pricing.test.ts src/lib/money.ts src/lib/pricing.ts
git commit -F - <<'EOF'
feat: add money formatting and pricing rules

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```

---
### Task 6: Setup rules

**Files:**
- Create: `src/lib/setup.ts`
- Test: `src/lib/setup.test.ts`

**Interfaces:**
- Consumes: catalog lookups (Task 4), `effectiveCents`, `totalCents`, `monthlySavingsCents`, `arrivalFor` (Task 5).
- Produces: `SetupResult { setup; notice? }`, `SetupSummary { lines; totalCents; savingsCents; arrival }`, `monitorCapacity(deskId)`, `slotCapacity(setup, slot)`, `quantityOf(setup, id)`, `isSelected(setup, id)`, `usedUnits(setup, slot)`, `setupLines(setup)`, `summarize(setup)`, `setDesk`, `setChair(setup, id | null)`, `setPlan(setup, plan): Setup`, `setPosture`, `addItem`, `removeItem`, `toggleItem`, `deltaCents(setup, id)`, `normalizeSetup(raw): { setup; dropped: string[] }`, `parseSetup(value: unknown): Setup | null`. All mutators return `SetupResult` except `setPlan`.

Rules implemented (spec §9.1): desk capacity 2 monitor units below 160 cm, 3 at 160 cm; ultrawides take 2 units; single-capacity slots swap; `requires` items need a monitor and are removed with the last one; switching to a narrower desk drops the cheapest monitors; the walking pad switches posture to standing; untrusted setups are rebuilt through `addItem` in catalog order.

- [ ] **Step 1: Write the failing tests**

`src/lib/setup.test.ts`:

```ts
import { describe, expect, it } from "vitest";

import { emptySetup, PRESETS, presetSetup } from "@/data/presets";
import {
  addItem,
  deltaCents,
  monitorCapacity,
  normalizeSetup,
  parseSetup,
  removeItem,
  setDesk,
  setPosture,
  setupLines,
  summarize,
  toggleItem,
  usedUnits,
} from "@/lib/setup";
import type { Setup } from "@/lib/types";

function withItems(
  items: Record<string, number>,
  deskId = "desk-electric",
): Setup {
  return { ...emptySetup(), deskId, chairId: "chair-ergo", items };
}

describe("monitorCapacity", () => {
  it("gives 2 units to desks under 160 cm and 3 to 160 cm desks", () => {
    expect(monitorCapacity("desk-electric")).toBe(2);
    expect(monitorCapacity("desk-mechanical")).toBe(2);
    expect(monitorCapacity("desk-dual-motor")).toBe(3);
  });
});

describe("addItem", () => {
  it("adds monitors until the desk is full, then offers a wider desk", () => {
    let setup = withItems({});
    setup = addItem(setup, "mon-24-1c").setup;
    setup = addItem(setup, "mon-24-1c").setup;
    const result = addItem(setup, "mon-27-4k");
    expect(result.setup).toBe(setup);
    expect(result.notice?.action).toEqual({
      label: "Upgrade to the 160 cm desk",
      deskId: "desk-dual-motor",
      addItemId: "mon-27-4k",
    });
  });

  it("counts an ultrawide as two monitor units", () => {
    const setup = addItem(withItems({}), "mon-34-curved").setup;
    expect(usedUnits(setup, "monitor")).toBe(2);
    expect(addItem(setup, "mon-24-1c").notice?.message).toMatch(/no room/);
  });

  it("fits three monitors on the 160 cm desk with no upgrade offer", () => {
    let setup = withItems({ "mon-24-1c": 3 }, "desk-dual-motor");
    const result = addItem(setup, "mon-24-1c");
    expect(result.notice?.action).toBeUndefined();
    setup = result.setup;
    expect(setup.items["mon-24-1c"]).toBe(3);
  });

  it("swaps items in single-capacity slots", () => {
    const setup = addItem(withItems({ router: 1 }), "starlink").setup;
    expect(setup.items).toEqual({ starlink: 1 });
  });

  it("rejects a light bar without a monitor", () => {
    const result = addItem(withItems({}), "light-bar");
    expect(result.setup.items).toEqual({});
    expect(result.notice?.message).toBe(
      "The Monitor Light Bar needs a monitor. Add one first.",
    );
  });

  it("switches to standing when the walking pad is added", () => {
    const result = addItem(withItems({}), "walking-pad");
    expect(result.setup.posture).toBe("stand");
    expect(result.notice?.message).toMatch(/standing mode/);
  });

  it("allows two plants and no more", () => {
    let setup = addItem(withItems({}), "plant-monstera").setup;
    setup = addItem(setup, "plant-snake").setup;
    expect(addItem(setup, "plant-snake").notice?.message).toBe(
      "There's room for two plants.",
    );
  });

  it("routes desks and chairs to their setters", () => {
    expect(addItem(withItems({}), "desk-mechanical").setup.deskId).toBe(
      "desk-mechanical",
    );
    expect(addItem(withItems({}), "chair-basic").setup.chairId).toBe(
      "chair-basic",
    );
  });
});

describe("removeItem", () => {
  it("decrements quantities and never removes the desk", () => {
    const setup = withItems({ "mon-24-1c": 2 });
    expect(removeItem(setup, "mon-24-1c").setup.items).toEqual({
      "mon-24-1c": 1,
    });
    expect(removeItem(setup, "desk-electric").setup).toBe(setup);
  });

  it("removes monitor accessories with the last monitor", () => {
    const setup = withItems({
      "mon-27-4k": 1,
      "light-bar": 1,
      "monitor-stand": 1,
    });
    const result = removeItem(setup, "mon-27-4k");
    expect(result.setup.items).toEqual({});
    expect(result.notice?.message).toBe(
      "Removed the Monitor Light Bar and Adjustable Monitor Stand: they need a monitor.",
    );
  });

  it("clears the chair", () => {
    expect(removeItem(withItems({}), "chair-ergo").setup.chairId).toBeNull();
  });
});

describe("setDesk", () => {
  it("removes the cheapest monitors that no longer fit", () => {
    const setup = withItems(
      { "mon-24-1c": 1, "mon-34-gaming": 1 },
      "desk-dual-motor",
    );
    const result = setDesk(setup, "desk-electric");
    expect(result.setup.items).toEqual({ "mon-34-gaming": 1 });
    expect(result.notice?.message).toBe(
      "Removed 1 screen so everything fits the new desk.",
    );
  });

  it("ignores ids that are not desks", () => {
    const setup = withItems({});
    expect(setDesk(setup, "chair-ergo").setup).toBe(setup);
  });
});

describe("setPosture", () => {
  it("warns when sitting with a walking pad", () => {
    const result = setPosture(withItems({ "walking-pad": 1 }), "sit");
    expect(result.setup.posture).toBe("sit");
    expect(result.notice?.message).toMatch(/used while standing/);
  });
});

describe("toggleItem", () => {
  it("deselects a selected single item and adds to multi-unit slots", () => {
    expect(
      toggleItem(withItems({ "lamp-led": 1 }), "lamp-led").setup.items,
    ).toEqual({});
    expect(
      toggleItem(withItems({ "mon-24-1c": 1 }), "mon-24-1c").setup.items,
    ).toEqual({
      "mon-24-1c": 2,
    });
  });

  it("keeps the current desk when its own card is tapped", () => {
    expect(toggleItem(withItems({}), "desk-electric").setup.deskId).toBe(
      "desk-electric",
    );
  });
});

describe("deltaCents", () => {
  it("shows the swap difference within a slot", () => {
    // MX Master 400 → Silent mouse 200
    expect(deltaCents(withItems({ "mouse-mx": 1 }), "mouse-silent")).toBe(-200);
  });

  it("shows a negative price for a selected single item", () => {
    expect(deltaCents(withItems({ "lamp-led": 1 }), "lamp-led")).toBe(-320);
  });

  it("shows the full price for one more monitor", () => {
    expect(deltaCents(withItems({ "mon-24-1c": 1 }), "mon-24-1c")).toBe(560);
  });

  it("compares desks and chairs with the current choice", () => {
    expect(deltaCents(withItems({}), "desk-dual-motor")).toBe(1110);
    expect(deltaCents({ ...withItems({}), chairId: null }, "chair-basic")).toBe(
      500,
    );
  });
});

describe("setupLines and summarize", () => {
  it("lists desk, chair, then items in catalog order", () => {
    const ids = setupLines(presetSetup("founders")).map((line) => line.item.id);
    expect(ids.slice(0, 3)).toEqual([
      "desk-electric",
      "chair-ergo",
      "mon-27-4k",
    ]);
  });

  it("summarizes the Essentials preset", () => {
    expect(summarize(presetSetup("essentials"))).toMatchObject({
      totalCents: 1270,
      savingsCents: 2023,
      arrival: "tomorrow",
    });
  });
});

describe("normalizeSetup", () => {
  it("keeps a valid preset unchanged", () => {
    const founders = presetSetup("founders");
    expect(normalizeSetup(founders)).toEqual({ setup: founders, dropped: [] });
  });

  it("drops unknown ids and falls back to the default desk", () => {
    const raw: Setup = {
      deskId: "desk-gold",
      chairId: "chair-throne",
      items: { "mon-24-1c": 1, unicorn: 2 },
      plan: "monthly",
      posture: "sit",
    };
    const result = normalizeSetup(raw);
    expect(result.setup).toEqual({
      deskId: "desk-electric",
      chairId: null,
      items: { "mon-24-1c": 1 },
      plan: "monthly",
      posture: "sit",
    });
    expect(result.dropped).toEqual(["desk-gold", "chair-throne", "unicorn"]);
  });

  it("clamps quantities to what the desk fits", () => {
    const raw = withItems({ "mon-24-1c": 9, "light-bar": 1 });
    expect(normalizeSetup(raw).setup.items).toEqual({
      "mon-24-1c": 2,
      "light-bar": 1,
    });
  });

  it("keeps the requested posture even with a walking pad", () => {
    const raw = { ...withItems({ "walking-pad": 1 }), posture: "sit" as const };
    expect(normalizeSetup(raw).setup.posture).toBe("sit");
  });
});

describe("parseSetup", () => {
  it("accepts a well-formed setup and defaults plan and posture", () => {
    expect(
      parseSetup({
        deskId: "desk-electric",
        chairId: null,
        items: { "lamp-led": 1 },
      }),
    ).toEqual({
      deskId: "desk-electric",
      chairId: null,
      items: { "lamp-led": 1 },
      plan: "weekly",
      posture: "sit",
    });
  });

  it("rejects malformed input", () => {
    expect(parseSetup(null)).toBeNull();
    expect(parseSetup("desk")).toBeNull();
    expect(parseSetup({ deskId: 3, chairId: null, items: {} })).toBeNull();
    expect(
      parseSetup({ deskId: "desk-electric", chairId: 1, items: {} }),
    ).toBeNull();
    expect(
      parseSetup({ deskId: "desk-electric", chairId: null, items: { a: "1" } }),
    ).toBeNull();
    expect(
      parseSetup({ deskId: "desk-electric", chairId: null, items: [] }),
    ).toBeNull();
  });
});

describe("presets under the rules", () => {
  it.each(PRESETS.map((preset) => [preset.id, preset]))(
    "%s is valid under the rules",
    (_, preset) => {
      expect(normalizeSetup(preset.setup)).toEqual({
        setup: preset.setup,
        dropped: [],
      });
    },
  );
});
```

- [ ] **Step 2: Run the tests to verify they fail**

```bash
pnpm exec vitest run src/lib/setup.test.ts
```

Expected: FAIL — `Failed to resolve import "@/lib/setup"`.

- [ ] **Step 3: Implement**

`src/lib/setup.ts`:

```ts
import { CATALOG, findItem, getItem } from "@/data/catalog";
import {
  arrivalFor,
  effectiveCents,
  monthlySavingsCents,
  totalCents,
} from "@/lib/pricing";
import type {
  Arrival,
  CatalogItem,
  Notice,
  Plan,
  Posture,
  Setup,
  SetupLine,
  SlotId,
} from "@/lib/types";

export interface SetupResult {
  setup: Setup;
  notice?: Notice;
}

export interface SetupSummary {
  lines: SetupLine[];
  totalCents: number;
  savingsCents: number;
  arrival: Arrival;
}

const WIDE_DESK_CM = 160;
const DEFAULT_DESK_ID = "desk-electric";

export function monitorCapacity(deskId: string): number {
  return (findItem(deskId)?.widthCm ?? 0) >= WIDE_DESK_CM ? 3 : 2;
}

export function slotCapacity(setup: Setup, slot: SlotId): number {
  if (slot === "monitor") return monitorCapacity(setup.deskId);
  if (slot === "plant") return 2;
  return 1;
}

export function quantityOf(setup: Setup, id: string): number {
  if (id === setup.deskId || id === setup.chairId) return 1;
  return setup.items[id] ?? 0;
}

export function isSelected(setup: Setup, id: string): boolean {
  return quantityOf(setup, id) > 0;
}

export function usedUnits(setup: Setup, slot: SlotId): number {
  let units = 0;
  for (const [id, qty] of Object.entries(setup.items)) {
    const entry = findItem(id);
    if (entry?.slot === slot) units += entry.slotSize * qty;
  }
  return units;
}

// Desk first, then chair, then items in catalog order.
export function setupLines(setup: Setup): SetupLine[] {
  const lines: SetupLine[] = [{ item: getItem(setup.deskId), qty: 1 }];
  if (setup.chairId !== null)
    lines.push({ item: getItem(setup.chairId), qty: 1 });
  for (const entry of CATALOG) {
    const qty = setup.items[entry.id] ?? 0;
    if (qty > 0) lines.push({ item: entry, qty });
  }
  return lines;
}

export function summarize(setup: Setup): SetupSummary {
  const lines = setupLines(setup);
  return {
    lines,
    totalCents: totalCents(lines, setup.plan),
    savingsCents: monthlySavingsCents(lines),
    arrival: arrivalFor(lines),
  };
}

function omitKey(
  items: Record<string, number>,
  key: string,
): Record<string, number> {
  return Object.fromEntries(Object.entries(items).filter(([id]) => id !== key));
}

function decrement(
  items: Record<string, number>,
  id: string,
): Record<string, number> {
  const qty = items[id] ?? 0;
  return qty <= 1 ? omitKey(items, id) : { ...items, [id]: qty - 1 };
}

function withoutSlot(
  items: Record<string, number>,
  slot: SlotId,
): Record<string, number> {
  return Object.fromEntries(
    Object.entries(items).filter(([id]) => findItem(id)?.slot !== slot),
  );
}

function occupant(setup: Setup, slot: SlotId): CatalogItem | undefined {
  return CATALOG.find(
    (entry) => entry.slot === slot && (setup.items[entry.id] ?? 0) > 0,
  );
}

function wideDesk(): CatalogItem | undefined {
  return CATALOG.find(
    (entry) =>
      entry.category === "desk" && (entry.widthCm ?? 0) >= WIDE_DESK_CM,
  );
}

function fullSlotNotice(setup: Setup, entry: CatalogItem): Notice {
  if (entry.slot === "plant")
    return { message: "There's room for two plants." };
  if (entry.slot !== "monitor")
    return { message: "There's no room for that one." };
  const desk = getItem(setup.deskId);
  const upgrade = wideDesk();
  if (upgrade === undefined || (desk.widthCm ?? 0) >= WIDE_DESK_CM) {
    return { message: "Your desk is full. Swap a screen to try another one." };
  }
  return {
    message: `Your ${String(desk.widthCm)} cm desk has no room for another screen.`,
    action: {
      label: `Upgrade to the ${String(upgrade.widthCm)} cm desk`,
      deskId: upgrade.id,
      addItemId: entry.id,
    },
  };
}

// Drops items whose required slot became empty, e.g. a light bar without a monitor.
function dropOrphans(setup: Setup): SetupResult {
  const orphans = CATALOG.filter(
    (entry) =>
      entry.requires !== undefined &&
      (setup.items[entry.id] ?? 0) > 0 &&
      usedUnits(setup, entry.requires) === 0,
  );
  if (orphans.length === 0) return { setup };
  let items = setup.items;
  for (const orphan of orphans) items = omitKey(items, orphan.id);
  const names = orphans.map((orphan) => orphan.name).join(" and ");
  const subject = orphans.length === 1 ? "it needs" : "they need";
  return {
    setup: { ...setup, items },
    notice: { message: `Removed the ${names}: ${subject} a monitor.` },
  };
}

function afterAdd(setup: Setup, entry: CatalogItem): SetupResult {
  if (entry.slot === "underDesk" && setup.posture === "sit") {
    return {
      setup: { ...setup, posture: "stand" },
      notice: {
        message: "Walking pad added. We switched you to standing mode.",
      },
    };
  }
  return { setup };
}

export function setDesk(setup: Setup, deskId: string): SetupResult {
  if (findItem(deskId)?.category !== "desk") return { setup };
  let next: Setup = { ...setup, deskId };
  const capacity = monitorCapacity(deskId);
  let removed = 0;
  while (usedUnits(next, "monitor") > capacity) {
    const cheapest = CATALOG.filter(
      (entry) => entry.slot === "monitor" && (next.items[entry.id] ?? 0) > 0,
    ).sort(
      (a, b) => effectiveCents(a, "weekly") - effectiveCents(b, "weekly"),
    )[0];
    if (cheapest === undefined) break;
    next = { ...next, items: decrement(next.items, cheapest.id) };
    removed += 1;
  }
  if (removed === 0) return { setup: next };
  const screens = removed === 1 ? "1 screen" : `${String(removed)} screens`;
  return {
    setup: next,
    notice: { message: `Removed ${screens} so everything fits the new desk.` },
  };
}

export function setChair(setup: Setup, chairId: string | null): SetupResult {
  if (chairId !== null && findItem(chairId)?.category !== "chair")
    return { setup };
  return { setup: { ...setup, chairId } };
}

export function setPlan(setup: Setup, plan: Plan): Setup {
  return { ...setup, plan };
}

export function setPosture(setup: Setup, posture: Posture): SetupResult {
  const next = { ...setup, posture };
  if (posture === "sit" && (setup.items["walking-pad"] ?? 0) > 0) {
    return {
      setup: next,
      notice: { message: "Heads up: the walking pad is used while standing." },
    };
  }
  return { setup: next };
}

export function addItem(setup: Setup, id: string): SetupResult {
  const entry = findItem(id);
  if (entry === undefined) return { setup };
  if (entry.category === "desk") return setDesk(setup, id);
  if (entry.category === "chair") return setChair(setup, id);
  if (entry.requires !== undefined && usedUnits(setup, entry.requires) === 0) {
    return {
      setup,
      notice: { message: `The ${entry.name} needs a monitor. Add one first.` },
    };
  }
  const qty = setup.items[id] ?? 0;
  if (slotCapacity(setup, entry.slot) === 1) {
    if (qty > 0) return { setup };
    const items = { ...withoutSlot(setup.items, entry.slot), [id]: 1 };
    return afterAdd({ ...setup, items }, entry);
  }
  if (
    usedUnits(setup, entry.slot) + entry.slotSize >
    slotCapacity(setup, entry.slot)
  ) {
    return { setup, notice: fullSlotNotice(setup, entry) };
  }
  if (qty >= entry.maxQty) {
    return {
      setup,
      notice: { message: "You've added the maximum for this item." },
    };
  }
  return afterAdd(
    { ...setup, items: { ...setup.items, [id]: qty + 1 } },
    entry,
  );
}

export function removeItem(setup: Setup, id: string): SetupResult {
  const entry = findItem(id);
  if (entry === undefined || entry.category === "desk") return { setup };
  if (entry.category === "chair") {
    return setup.chairId === id
      ? { setup: { ...setup, chairId: null } }
      : { setup };
  }
  if ((setup.items[id] ?? 0) === 0) return { setup };
  return dropOrphans({ ...setup, items: decrement(setup.items, id) });
}

// Item-card tap: select, swap or deselect; multi-unit slots always add one more.
export function toggleItem(setup: Setup, id: string): SetupResult {
  const entry = findItem(id);
  if (entry === undefined) return { setup };
  const multi =
    entry.category !== "desk" &&
    entry.category !== "chair" &&
    slotCapacity(setup, entry.slot) > 1;
  if (!multi && isSelected(setup, id)) return removeItem(setup, id);
  return addItem(setup, id);
}

// Price change shown on an item card if the user taps it now.
export function deltaCents(setup: Setup, id: string): number {
  const entry = getItem(id);
  const price = effectiveCents(entry, setup.plan);
  const priceOf = (other: CatalogItem | undefined): number =>
    other === undefined ? 0 : effectiveCents(other, setup.plan);
  if (entry.category === "desk") return price - priceOf(getItem(setup.deskId));
  if (entry.category === "chair") {
    if (setup.chairId === id) return -price;
    return (
      price -
      priceOf(setup.chairId === null ? undefined : getItem(setup.chairId))
    );
  }
  if (slotCapacity(setup, entry.slot) > 1) return price;
  if (isSelected(setup, id)) return -price;
  return price - priceOf(occupant(setup, entry.slot));
}

// Rebuilds a setup from untrusted input (URL or storage) through the rules above.
export function normalizeSetup(raw: Setup): {
  setup: Setup;
  dropped: string[];
} {
  const dropped: string[] = [];
  const desk = findItem(raw.deskId);
  const deskId = desk?.category === "desk" ? desk.id : DEFAULT_DESK_ID;
  if (deskId !== raw.deskId) dropped.push(raw.deskId);
  let chairId: string | null = null;
  if (raw.chairId !== null) {
    if (findItem(raw.chairId)?.category === "chair") chairId = raw.chairId;
    else dropped.push(raw.chairId);
  }
  const posture: Posture = raw.posture === "stand" ? "stand" : "sit";
  const plan: Plan = raw.plan === "monthly" ? "monthly" : "weekly";
  let setup: Setup = { deskId, chairId, items: {}, plan, posture };
  for (const id of Object.keys(raw.items)) {
    const entry = findItem(id);
    if (
      entry === undefined ||
      entry.category === "desk" ||
      entry.category === "chair"
    ) {
      dropped.push(id);
    }
  }
  for (const entry of CATALOG) {
    const rawQty = raw.items[entry.id];
    if (
      rawQty === undefined ||
      entry.category === "desk" ||
      entry.category === "chair"
    )
      continue;
    const wanted =
      Number.isInteger(rawQty) && rawQty > 0
        ? Math.min(rawQty, entry.maxQty)
        : 1;
    for (let unit = 0; unit < wanted; unit += 1)
      setup = addItem(setup, entry.id).setup;
  }
  return { setup: { ...setup, posture }, dropped };
}

function isItemRecord(value: unknown): value is Record<string, number> {
  if (typeof value !== "object" || value === null || Array.isArray(value))
    return false;
  return Object.values(value).every((qty) => typeof qty === "number");
}

// Shape check for untrusted JSON (e.g. localStorage); rules are applied by normalizeSetup.
export function parseSetup(value: unknown): Setup | null {
  if (typeof value !== "object" || value === null) return null;
  const candidate = value as Record<string, unknown>;
  const { deskId, chairId, items, plan, posture } = candidate;
  if (typeof deskId !== "string") return null;
  if (chairId !== null && typeof chairId !== "string") return null;
  if (!isItemRecord(items)) return null;
  return {
    deskId,
    chairId,
    items,
    plan: plan === "monthly" ? "monthly" : "weekly",
    posture: posture === "stand" ? "stand" : "sit",
  };
}
```

- [ ] **Step 4: Run the tests to verify they pass**

```bash
pnpm exec vitest run src/lib/setup.test.ts
```

Expected: PASS — `Tests  33 passed`.

- [ ] **Step 5: Gate and commit**

```bash
pnpm lint && pnpm type-check && pnpm format:check && pnpm test
```

```bash
git add src/lib/setup.test.ts src/lib/setup.ts
git commit -F - <<'EOF'
feat: add setup rules for slots, capacity, swaps and normalisation

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```

---
### Task 7: Share links

**Files:**
- Create: `src/lib/share.ts`
- Test: `src/lib/share.test.ts`

**Interfaces:**
- Consumes: `CATALOG` (Task 4), `normalizeSetup` (Task 6).
- Produces: `DecodedSetup { setup; dropped }`, `encodeSetup(setup): string` (no leading `?`), `decodeSetup(search): DecodedSetup | null` (null when there is no `d` param; never throws), `shareUrl(setup, origin): string`.

- [ ] **Step 1: Write the failing tests**

`src/lib/share.test.ts`:

```ts
import { describe, expect, it } from "vitest";

import { PRESETS, presetSetup } from "@/data/presets";
import { decodeSetup, encodeSetup, shareUrl } from "@/lib/share";
import type { Setup } from "@/lib/types";

describe("encodeSetup", () => {
  it("writes a short, readable query and omits defaults", () => {
    expect(encodeSetup(presetSetup("essentials"))).toBe(
      "d=desk-electric&c=chair-ergo&i=power-strip-3",
    );
  });

  it("encodes quantities, no chair, monthly and standing", () => {
    const setup: Setup = {
      deskId: "desk-dual-motor",
      chairId: null,
      items: { "mon-27-4k": 2, "lamp-led": 1 },
      plan: "monthly",
      posture: "stand",
    };
    expect(encodeSetup(setup)).toBe(
      "d=desk-dual-motor&c=none&i=mon-27-4k:2,lamp-led&p=m&pos=stand",
    );
  });
});

describe("decodeSetup", () => {
  it.each(PRESETS.map((preset) => [preset.id]))(
    "round-trips the %s preset",
    (id) => {
      const setup = presetSetup(id);
      expect(decodeSetup(encodeSetup(setup))).toEqual({ setup, dropped: [] });
    },
  );

  it("round-trips an edge setup", () => {
    const setup: Setup = {
      deskId: "desk-dual-motor",
      chairId: null,
      items: {
        "mon-24-1c": 1,
        "mon-34-curved": 1,
        "walking-pad": 1,
        "plant-snake": 2,
      },
      plan: "monthly",
      posture: "stand",
    };
    expect(decodeSetup(encodeSetup(setup))?.setup).toEqual(setup);
  });

  it("returns null when the query has no setup", () => {
    expect(decodeSetup("")).toBeNull();
    expect(decodeSetup("?utm_source=x")).toBeNull();
  });

  it("accepts a leading question mark", () => {
    expect(decodeSetup("?d=desk-mechanical&c=none")?.setup.deskId).toBe(
      "desk-mechanical",
    );
  });

  it("reports unknown ids and survives malformed values", () => {
    const decoded = decodeSetup(
      "d=desk-electric&c=chair-ergo&i=ghost,mon-24-1c:abc,,:3&p=zz",
    );
    expect(decoded?.dropped).toEqual(["ghost"]);
    expect(decoded?.setup.items).toEqual({ "mon-24-1c": 1 });
    expect(decoded?.setup.plan).toBe("weekly");
  });
});

describe("shareUrl", () => {
  it("joins the origin and the encoded setup", () => {
    expect(shareUrl(presetSetup("essentials"), "https://example.com")).toBe(
      "https://example.com/?d=desk-electric&c=chair-ergo&i=power-strip-3",
    );
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

```bash
pnpm exec vitest run src/lib/share.test.ts
```

Expected: FAIL — `Failed to resolve import "@/lib/share"`.

- [ ] **Step 3: Implement**

`src/lib/share.ts`:

```ts
import { CATALOG } from "@/data/catalog";
import { normalizeSetup } from "@/lib/setup";
import type { Setup } from "@/lib/types";

export interface DecodedSetup {
  setup: Setup;
  dropped: string[];
}

// Stable, readable query string, e.g. "d=desk-electric&c=chair-ergo&i=mon-27-4k:2&p=m".
export function encodeSetup(setup: Setup): string {
  const params = new URLSearchParams();
  params.set("d", setup.deskId);
  params.set("c", setup.chairId ?? "none");
  const items = CATALOG.flatMap((entry) => {
    const qty = setup.items[entry.id] ?? 0;
    if (qty <= 0) return [];
    return [qty === 1 ? entry.id : `${entry.id}:${String(qty)}`];
  });
  if (items.length > 0) params.set("i", items.join(","));
  if (setup.plan === "monthly") params.set("p", "m");
  if (setup.posture === "stand") params.set("pos", "stand");
  return params.toString().replaceAll("%2C", ",").replaceAll("%3A", ":");
}

function parseItems(value: string | null): Record<string, number> {
  const items: Record<string, number> = {};
  if (value === null || value === "") return items;
  for (const token of value.split(",")) {
    const [id = "", rawQty] = token.split(":");
    if (id === "") continue;
    const qty = rawQty === undefined ? 1 : Number.parseInt(rawQty, 10);
    items[id] = (items[id] ?? 0) + (Number.isNaN(qty) ? 1 : qty);
  }
  return items;
}

// Returns null when the query carries no setup (no "d" param). Never throws.
export function decodeSetup(search: string): DecodedSetup | null {
  const params = new URLSearchParams(search);
  const deskId = params.get("d");
  if (deskId === null) return null;
  const chair = params.get("c");
  return normalizeSetup({
    deskId,
    chairId: chair === null || chair === "none" ? null : chair,
    items: parseItems(params.get("i")),
    plan: params.get("p") === "m" ? "monthly" : "weekly",
    posture: params.get("pos") === "stand" ? "stand" : "sit",
  });
}

export function shareUrl(setup: Setup, origin: string): string {
  return `${origin}/?${encodeSetup(setup)}`;
}
```

- [ ] **Step 4: Run the tests to verify they pass**

```bash
pnpm exec vitest run src/lib/share.test.ts
```

Expected: PASS — `Tests  11 passed`.

- [ ] **Step 5: Gate and commit**

```bash
pnpm lint && pnpm type-check && pnpm format:check && pnpm test
```

```bash
git add src/lib/share.test.ts src/lib/share.ts
git commit -F - <<'EOF'
feat: encode and decode setups as share links

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```

---
### Task 8: Scene layout

**Files:**
- Create: `src/lib/scene-layout.ts`
- Test: `src/lib/scene-layout.test.ts`

**Interfaces:**
- Consumes: `CATALOG`, `getItem` (Task 4); `monitorCapacity`, `usedUnits`, `addItem` (Task 6).
- Produces: constants `SCENE { width: 400; height: 250; floorY: 232 }`, `DESK_HEIGHT { sit: 74; stand: 110 }`, `DESK_TOP_THICKNESS`, `MONITOR_NECK`, `MONITOR_RISER`, `MONITOR_OVERHANG`; types `Point`, `PlacedMonitor { key; item; x; y; width; height; scaleX; raised }`, `SceneLayout { desk; monitors; chairCenterX; monitorHotspot }`; functions `monitorSize(item)`, `layoutMonitors(setup, desk)`, `layoutScene(setup)`.

The first test enumerates every monitor combination the rules accept on each desk and checks that the row stays within the desk plus a 10 cm overhang per side.

- [ ] **Step 1: Write the failing tests**

`src/lib/scene-layout.test.ts`:

```ts
import { describe, expect, it } from "vitest";

import { CATALOG, getItem } from "@/data/catalog";
import { emptySetup } from "@/data/presets";
import {
  DESK_HEIGHT,
  layoutScene,
  MONITOR_OVERHANG,
  monitorSize,
  SCENE,
} from "@/lib/scene-layout";
import { addItem } from "@/lib/setup";
import type { Setup } from "@/lib/types";

const MONITOR_IDS = CATALOG.filter((entry) => entry.slot === "monitor").map(
  (entry) => entry.id,
);
const DESK_IDS = CATALOG.filter((entry) => entry.category === "desk").map(
  (entry) => entry.id,
);

// Every multiset of monitors the rules accept on the given desk.
function validMonitorSetups(deskId: string): Setup[] {
  const results: Setup[] = [];
  const visit = (setup: Setup, start: number): void => {
    results.push(setup);
    MONITOR_IDS.slice(start).forEach((id, offset) => {
      const result = addItem(setup, id);
      if (result.setup !== setup) visit(result.setup, start + offset);
    });
  };
  visit({ ...emptySetup(), deskId }, 0);
  return results;
}

describe("monitorSize", () => {
  it("derives screen size from inches and aspect ratio", () => {
    expect(monitorSize(getItem("mon-24-1c"))).toEqual({
      width: 53,
      height: 30,
    });
    expect(monitorSize(getItem("mon-34-curved"))).toEqual({
      width: 81,
      height: 35,
    });
  });
});

describe("layoutScene", () => {
  it.each(DESK_IDS.map((id) => [id]))(
    "keeps every monitor row on the %s",
    (deskId) => {
      for (const setup of validMonitorSetups(deskId)) {
        const { desk, monitors } = layoutScene(setup);
        for (const monitor of monitors) {
          expect(monitor.x).toBeGreaterThanOrEqual(
            desk.x - MONITOR_OVERHANG - 0.01,
          );
          expect(monitor.x + monitor.width).toBeLessThanOrEqual(
            desk.x + desk.width + MONITOR_OVERHANG + 0.01,
          );
          expect(monitor.y + monitor.height).toBeLessThan(desk.y);
        }
      }
    },
  );

  it("centres the monitor row on the desk", () => {
    const setup = { ...emptySetup(), items: { "mon-27-4k": 2 } };
    const { desk, monitors } = layoutScene(setup);
    const first = monitors[0];
    const last = monitors.at(-1);
    expect(first && last).toBeTruthy();
    if (first && last) {
      expect((first.x + last.x + last.width) / 2).toBeCloseTo(
        desk.x + desk.width / 2,
        5,
      );
    }
  });

  it("puts the largest of three screens in the middle and angles the sides", () => {
    const setup: Setup = {
      ...emptySetup(),
      deskId: "desk-dual-motor",
      items: { "mon-24-1c": 1, "mon-32-qhd": 2 },
    };
    const { monitors } = layoutScene(setup);
    expect(monitors.map((monitor) => monitor.item.id)).toEqual([
      "mon-32-qhd",
      "mon-32-qhd",
      "mon-24-1c",
    ]);
    expect(monitors[1]?.scaleX).toBe(1);
    expect(monitors[0]?.scaleX).toBeLessThan(1);
  });

  it("raises one screen when a monitor stand is present", () => {
    const setup = {
      ...emptySetup(),
      items: { "mon-27-4k": 1, "monitor-stand": 1 },
    };
    expect(layoutScene(setup).monitors[0]?.raised).toBe(true);
  });

  it("lifts the desk and moves the chair aside when standing", () => {
    const sitting = layoutScene(emptySetup());
    const standing = layoutScene({ ...emptySetup(), posture: "stand" });
    expect(sitting.desk.y - standing.desk.y).toBe(
      DESK_HEIGHT.stand - DESK_HEIGHT.sit,
    );
    expect(sitting.chairCenterX).toBe(SCENE.width / 2);
    expect(standing.chairCenterX).toBeGreaterThan(sitting.chairCenterX);
  });

  it("offers a monitor hotspot only while there is room", () => {
    expect(layoutScene(emptySetup()).monitorHotspot).not.toBeNull();
    const full = { ...emptySetup(), items: { "mon-34-curved": 1 } };
    expect(layoutScene(full).monitorHotspot).toBeNull();
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

```bash
pnpm exec vitest run src/lib/scene-layout.test.ts
```

Expected: FAIL — `Failed to resolve import "@/lib/scene-layout"`.

- [ ] **Step 3: Implement**

`src/lib/scene-layout.ts`:

```ts
import { CATALOG, getItem } from "@/data/catalog";
import { monitorCapacity, usedUnits } from "@/lib/setup";
import type { CatalogItem, Setup } from "@/lib/types";

// Scene units are centimetres: a 160 cm desk is 160 units wide.
export const SCENE = { width: 400, height: 250, floorY: 232 } as const;
export const DESK_HEIGHT = { sit: 74, stand: 110 } as const;
export const DESK_TOP_THICKNESS = 4;
export const MONITOR_NECK = 12;
export const MONITOR_RISER = 8;
export const MONITOR_OVERHANG = 10;
const MONITOR_GAP = 4;
const MIN_SCALE = 0.5;
const CHAIR_STAND_SHIFT = 85;

export interface Point {
  x: number;
  y: number;
}

export interface PlacedMonitor {
  key: string;
  item: CatalogItem;
  x: number;
  y: number;
  width: number;
  height: number;
  scaleX: number;
  raised: boolean;
}

export interface SceneLayout {
  desk: { x: number; y: number; width: number; height: number };
  monitors: PlacedMonitor[];
  chairCenterX: number;
  monitorHotspot: Point | null;
}

export function monitorSize(item: CatalogItem): {
  width: number;
  height: number;
} {
  if (item.art.kind !== "monitor") return { width: 0, height: 0 };
  const width = Math.round(
    item.art.inches * (item.art.ultrawide ? 2.38 : 2.22),
  );
  const height = Math.round((width * 9) / (item.art.ultrawide ? 21 : 16));
  return { width, height };
}

// Largest screen in the middle; others alternate left and right of it.
function orderForDisplay(units: CatalogItem[]): CatalogItem[] {
  const bySize = [...units].sort(
    (a, b) => monitorSize(b).width - monitorSize(a).width,
  );
  if (bySize.length < 3) return bySize;
  const [first, second, third] = bySize;
  return [second, first, third].filter(
    (entry): entry is CatalogItem => entry !== undefined,
  );
}

// Side screens are drawn narrower, as if angled, when the row is wider than the desk.
function scalesFor(widths: number[], budget: number): number[] {
  const gaps = MONITOR_GAP * Math.max(0, widths.length - 1);
  const natural = widths.reduce((sum, width) => sum + width, 0);
  if (natural + gaps <= budget) return widths.map(() => 1);
  if (widths.length === 3) {
    const center = widths[1] ?? 0;
    const sides = natural - center;
    const scale = Math.max(MIN_SCALE, (budget - gaps - center) / sides);
    return [scale, 1, scale];
  }
  const scale = Math.max(MIN_SCALE, (budget - gaps) / natural);
  return widths.map(() => scale);
}

export function layoutMonitors(
  setup: Setup,
  desk: { x: number; y: number; width: number },
): PlacedMonitor[] {
  const units = CATALOG.filter((entry) => entry.slot === "monitor").flatMap(
    (entry) => Array.from({ length: setup.items[entry.id] ?? 0 }, () => entry),
  );
  const ordered = orderForDisplay(units);
  const widths = ordered.map((entry) => monitorSize(entry).width);
  const scales = scalesFor(widths, desk.width + 2 * MONITOR_OVERHANG);
  const drawn = widths.map((width, index) => width * (scales[index] ?? 1));
  const rowWidth =
    drawn.reduce((sum, width) => sum + width, 0) +
    MONITOR_GAP * Math.max(0, drawn.length - 1);
  const hasRiser = (setup.items["monitor-stand"] ?? 0) > 0;
  const raisedIndex = ordered.length === 3 ? 1 : 0;
  let cursor = desk.x + desk.width / 2 - rowWidth / 2;
  const counts = new Map<string, number>();
  return ordered.map((entry, index) => {
    const seen = counts.get(entry.id) ?? 0;
    counts.set(entry.id, seen + 1);
    const width = drawn[index] ?? 0;
    const height = monitorSize(entry).height;
    const raised = hasRiser && index === raisedIndex;
    const bottom = desk.y - MONITOR_NECK - (raised ? MONITOR_RISER : 0);
    const placed: PlacedMonitor = {
      key: `${entry.id}-${String(seen)}`,
      item: entry,
      x: cursor,
      y: bottom - height,
      width,
      height,
      scaleX: scales[index] ?? 1,
      raised,
    };
    cursor += width + MONITOR_GAP;
    return placed;
  });
}

export function layoutScene(setup: Setup): SceneLayout {
  const deskItem = getItem(setup.deskId);
  const width = deskItem.widthCm ?? 120;
  const height = DESK_HEIGHT[setup.posture];
  const desk = {
    x: SCENE.width / 2 - width / 2,
    y: SCENE.floorY - height,
    width,
    height,
  };
  const monitors = layoutMonitors(setup, desk);
  const last = monitors.at(-1);
  const free = monitorCapacity(setup.deskId) - usedUnits(setup, "monitor");
  const monitorHotspot =
    free <= 0
      ? null
      : last === undefined
        ? { x: desk.x + width / 2, y: desk.y - 60 }
        : {
            x: Math.min(last.x + last.width + 14, desk.x + width - 6),
            y: last.y + last.height / 2,
          };
  const chairCenterX =
    SCENE.width / 2 + (setup.posture === "stand" ? CHAIR_STAND_SHIFT : 0);
  return { desk, monitors, chairCenterX, monitorHotspot };
}
```

- [ ] **Step 4: Run the tests to verify they pass**

```bash
pnpm exec vitest run src/lib/scene-layout.test.ts
```

Expected: PASS — `Tests  9 passed`.

- [ ] **Step 5: Gate and commit**

```bash
pnpm lint && pnpm type-check && pnpm format:check && pnpm test
```

```bash
git add src/lib/scene-layout.test.ts src/lib/scene-layout.ts
git commit -F - <<'EOF'
feat: lay out desk, monitors and hotspots in scene units

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```

---
### Task 9: Setup store and PR B

**Files:**
- Create: `src/store/setup-store.ts`
- Test: `src/store/setup-store.test.ts`

**Interfaces:**
- Consumes: presets (Task 4), setup rules (Task 6), `decodeSetup` (Task 7).
- Produces: `useSetupStore` (Zustand hook with `persist`, key `STORAGE_KEY = "monis-builder"`, `skipHydration: true`), `SetupState`, `StoreNotice extends Notice { id }`. State: `setup`, `hydrated`, `activeCategory`, `notice`. Actions: `hydrate(): Promise<void>` (URL → storage → default), `applyPreset(id)` (keeps the plan), `startEmpty()`, `toggle(id)`, `add(id)`, `remove(id)`, `chooseDesk(id)`, `chooseChair(id | null)`, `choosePlan(plan)`, `choosePosture(posture)`, `showCategory(category)`.

- [ ] **Step 1: Write the failing tests**

`src/store/setup-store.test.ts`:

```ts
import { beforeEach, describe, expect, it } from "vitest";

import { defaultSetup, presetSetup } from "@/data/presets";
import { useSetupStore } from "@/store/setup-store";

const initial = useSetupStore.getState();

beforeEach(() => {
  useSetupStore.setState(
    { ...initial, setup: defaultSetup(), notice: null },
    true,
  );
});

describe("setup store", () => {
  it("starts on the Essentials preset", () => {
    expect(useSetupStore.getState().setup).toEqual(presetSetup("essentials"));
  });

  it("applies presets but keeps the chosen plan", () => {
    const store = useSetupStore.getState();
    store.choosePlan("monthly");
    store.applyPreset("founders");
    expect(useSetupStore.getState().setup).toEqual({
      ...presetSetup("founders"),
      plan: "monthly",
    });
  });

  it("starts empty with no chair and no items", () => {
    useSetupStore.getState().startEmpty();
    const { setup } = useSetupStore.getState();
    expect(setup.chairId).toBeNull();
    expect(setup.items).toEqual({});
  });

  it("stamps every notice with a fresh id", () => {
    const store = useSetupStore.getState();
    store.add("light-bar");
    const first = useSetupStore.getState().notice;
    store.add("light-bar");
    const second = useSetupStore.getState().notice;
    expect(first?.message).toMatch(/needs a monitor/);
    expect(second?.id).toBeGreaterThan(first?.id ?? 0);
  });

  it("clears the notice after a quiet action", () => {
    const store = useSetupStore.getState();
    store.add("light-bar");
    store.toggle("lamp-led");
    expect(useSetupStore.getState().notice).toBeNull();
    expect(useSetupStore.getState().setup.items["lamp-led"]).toBe(1);
  });

  it("routes desk, chair, posture and category changes", () => {
    const store = useSetupStore.getState();
    store.chooseDesk("desk-dual-motor");
    store.chooseChair(null);
    store.choosePosture("stand");
    store.showCategory("screen");
    const state = useSetupStore.getState();
    expect(state.setup.deskId).toBe("desk-dual-motor");
    expect(state.setup.chairId).toBeNull();
    expect(state.setup.posture).toBe("stand");
    expect(state.activeCategory).toBe("screen");
  });

  it("removes items", () => {
    const store = useSetupStore.getState();
    store.remove("power-strip-3");
    expect(useSetupStore.getState().setup.items).toEqual({});
  });
});
```

- [ ] **Step 2: Run to verify failure**

```bash
pnpm exec vitest run src/store/setup-store.test.ts
```

Expected: FAIL — `Failed to resolve import "@/store/setup-store"`.

- [ ] **Step 3: Implement**

`src/store/setup-store.ts`:

```ts
import { create } from "zustand";
import {
  createJSONStorage,
  persist,
  type StateStorage,
} from "zustand/middleware";

import { defaultSetup, emptySetup, presetSetup } from "@/data/presets";
import {
  addItem,
  normalizeSetup,
  parseSetup,
  removeItem,
  setChair,
  setDesk,
  setPlan,
  setPosture,
  type SetupResult,
  toggleItem,
} from "@/lib/setup";
import { decodeSetup } from "@/lib/share";
import type {
  CategoryId,
  Notice,
  Plan,
  Posture,
  PresetId,
  Setup,
} from "@/lib/types";

export interface StoreNotice extends Notice {
  id: number;
}

export interface SetupState {
  setup: Setup;
  hydrated: boolean;
  activeCategory: CategoryId;
  notice: StoreNotice | null;
  hydrate: () => Promise<void>;
  applyPreset: (id: PresetId) => void;
  startEmpty: () => void;
  toggle: (id: string) => void;
  add: (id: string) => void;
  remove: (id: string) => void;
  chooseDesk: (id: string) => void;
  chooseChair: (id: string | null) => void;
  choosePlan: (plan: Plan) => void;
  choosePosture: (posture: Posture) => void;
  showCategory: (category: CategoryId) => void;
}

let noticeSeq = 0;
function stamp(notice: Notice | undefined): StoreNotice | null {
  if (notice === undefined) return null;
  noticeSeq += 1;
  return { ...notice, id: noticeSeq };
}

// localStorage can be missing or blocked (private mode, SSR); never let that break the app.
const safeStorage: StateStorage = {
  getItem: (name) => {
    try {
      return window.localStorage.getItem(name);
    } catch {
      return null;
    }
  },
  setItem: (name, value) => {
    try {
      window.localStorage.setItem(name, value);
    } catch {
      // Storage unavailable: keep working in memory.
    }
  },
  removeItem: (name) => {
    try {
      window.localStorage.removeItem(name);
    } catch {
      // Storage unavailable: nothing to remove.
    }
  },
};

export const STORAGE_KEY = "monis-builder";

export const useSetupStore = create<SetupState>()(
  persist(
    (set, get) => {
      const apply = (result: SetupResult): void => {
        set({ setup: result.setup, notice: stamp(result.notice) });
      };
      return {
        setup: defaultSetup(),
        hydrated: false,
        activeCategory: "desk",
        notice: null,
        hydrate: async () => {
          if (get().hydrated) return;
          const shared = decodeSetup(window.location.search);
          if (shared !== null) {
            window.history.replaceState(null, "", window.location.pathname);
            const notice =
              shared.dropped.length > 0
                ? {
                    message: "Some items in this link are no longer available.",
                  }
                : undefined;
            set({ setup: shared.setup, hydrated: true, notice: stamp(notice) });
            return;
          }
          await useSetupStore.persist.rehydrate();
          set({ hydrated: true });
        },
        applyPreset: (id) => {
          set({
            setup: { ...presetSetup(id), plan: get().setup.plan },
            notice: null,
          });
        },
        startEmpty: () => {
          set({
            setup: { ...emptySetup(), plan: get().setup.plan },
            notice: null,
          });
        },
        toggle: (id) => {
          apply(toggleItem(get().setup, id));
        },
        add: (id) => {
          apply(addItem(get().setup, id));
        },
        remove: (id) => {
          apply(removeItem(get().setup, id));
        },
        chooseDesk: (id) => {
          apply(setDesk(get().setup, id));
        },
        chooseChair: (id) => {
          apply(setChair(get().setup, id));
        },
        choosePlan: (plan) => {
          set({ setup: setPlan(get().setup, plan) });
        },
        choosePosture: (posture) => {
          apply(setPosture(get().setup, posture));
        },
        showCategory: (category) => {
          set({ activeCategory: category });
        },
      };
    },
    {
      name: STORAGE_KEY,
      version: 1,
      storage: createJSONStorage(() => safeStorage),
      skipHydration: true,
      partialize: (state) => ({ setup: state.setup }),
      merge: (persisted, current) => {
        const raw = parseSetup(
          (persisted as { setup?: unknown } | undefined)?.setup,
        );
        return raw === null
          ? current
          : { ...current, setup: normalizeSetup(raw).setup };
      },
      migrate: () => ({ setup: defaultSetup() }),
    },
  ),
);
```

- [ ] **Step 4: Run to verify they pass**

```bash
pnpm exec vitest run src/store/setup-store.test.ts
pnpm test
```

Expected: `Tests  7 passed`, then the full unit suite `Tests  85 passed`.

- [ ] **Step 5: Gate and commit**

```bash
pnpm lint && pnpm type-check && pnpm format:check && pnpm build
```

```bash
git add src/store/setup-store.ts src/store/setup-store.test.ts
git commit -F - <<'EOF'
feat: add persisted setup store with shared-link hydration

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```

- [ ] **Step 6: Push, open PR B, wait for CI, merge**

```bash
git push -u origin feat/core-logic
gh pr create --base main --title "feat: core logic — catalog, pricing, setup rules, share links, scene layout, store" --body "$(cat <<'EOF'
Milestone 2 of the workspace builder (spec §14): pure domain logic with 85 unit tests.

- Catalog snapshot (38 real monis.rent items + 4 concept items) and presets mirroring the bundles
- Pricing in integer cents (sale %, weekly/monthly totals, savings, arrival)
- Setup rules (capacity, swaps, requirements, normalisation) and share-link encoding
- Scene layout and the persisted Zustand store

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
gh pr checks --watch
gh pr merge --squash --delete-branch
git switch main && git pull --ff-only
```

Expected: CI `pass`; `main` updated.

---
### Task 10: SVG scene

**Files:**
- Create: `src/components/scene/room.tsx`, `desk-art.tsx`, `chair-art.tsx`, `monitor-art.tsx`, `desk-items.tsx`, `floor-items.tsx`, `workspace-scene.tsx`
- Modify: `src/app/page.tsx` (interim scene preview)
- Test: `e2e/scene.spec.ts`

**Interfaces:**
- Consumes: `layoutScene`, `SCENE`, `DESK_HEIGHT`, `DESK_TOP_THICKNESS`, `MONITOR_RISER`, `PlacedMonitor` (Task 8); `getItem`, `CATALOG` (Task 4); `setupLines` (Task 6).
- Produces: `WorkspaceScene({ setup, onHotspot? })` — a client component rendering `svg[role=img][data-testid=workspace-scene][data-posture]` with an `aria-label` summary, plus "+" hotspot buttons only when `onHotspot` is given. Test ids: `scene-desk-<electric|mechanical|dualMotor>`, `scene-chair-<ergo|basic|premium>`, `scene-monitor-<id>`, `scene-item-<id>`, `scene-plant-<monstera|snake>`, `scene-own-laptop`, `scene-room`.

- [ ] **Step 0: Branch**

```bash
git switch main && git pull --ff-only
git switch -c feat/builder-rough
```

- [ ] **Step 1: Write the failing E2E test**

`e2e/scene.spec.ts`:

```ts
import { expect, test } from "@playwright/test";

test("the scene draws the default desk and chair", async ({ page }) => {
  await page.goto("/");
  const scene = page.getByTestId("workspace-scene");
  await expect(scene).toBeVisible();
  await expect(scene).toHaveAttribute(
    "aria-label",
    /Electrical Adjustable Desk, Ergonomic Office Chair/,
  );
  await expect(page.getByTestId("scene-desk-electric")).toBeVisible();
  await expect(page.getByTestId("scene-chair-ergo")).toBeVisible();
});
```

- [ ] **Step 2: Run to verify failure**

```bash
pnpm build && pnpm test:e2e e2e/scene.spec.ts
```

Expected: FAIL — `element(s) not found` for `getByTestId('workspace-scene')` (the hello page has no scene).

- [ ] **Step 3: Implement the scene components**

`src/components/scene/room.tsx`:

```tsx
import { SCENE } from "@/lib/scene-layout";

// Back wall, Bali window and wooden floor.
export function Room() {
  const { width, height, floorY } = SCENE;
  return (
    <g data-testid="scene-room">
      <defs>
        <linearGradient id="wall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FBF6EF" />
          <stop offset="1" stopColor="#F3E8DA" />
        </linearGradient>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8FCBFF" />
          <stop offset="1" stopColor="#DDF1FF" />
        </linearGradient>
        <linearGradient id="floor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#E7D3B8" />
          <stop offset="1" stopColor="#D9C09F" />
        </linearGradient>
      </defs>
      <rect width={width} height={floorY} fill="url(#wall)" />
      <g transform="translate(130 18)">
        <rect width="140" height="82" rx="6" fill="#FFFFFF" />
        <rect x="5" y="5" width="130" height="72" rx="3" fill="url(#sky)" />
        <circle cx="104" cy="24" r="9" fill="#FFD27A" />
        <path d="M5 52 Q40 40 75 50 T135 46 V77 H5 Z" fill="#A8D98F" />
        <path d="M5 62 Q45 54 85 62 T135 58 V77 H5 Z" fill="#8CC97E" />
        <path d="M5 70 Q50 64 95 71 T135 68 V77 H5 Z" fill="#6FB566" />
        <g fill="#2F6B4F">
          <rect x="24" y="30" width="2.5" height="26" rx="1" />
          <path d="M25 30 q-10 -2 -15 5 q8 -6 15 -3 q-6 -8 -14 -6 q9 -1 14 4 q2 -9 10 -10 q-7 4 -8 10 q8 -5 15 1 q-9 -3 -17 -1 Z" />
        </g>
        <rect x="68.5" y="5" width="3" height="72" fill="#FFFFFF" />
        <rect
          x="5"
          y="40"
          width="130"
          height="2.5"
          fill="#FFFFFF"
          opacity="0.8"
        />
      </g>
      <rect
        y={floorY}
        width={width}
        height={height - floorY}
        fill="url(#floor)"
      />
      {[0.25, 0.5, 0.75].map((fraction) => (
        <line
          key={fraction}
          x1="0"
          x2={width}
          y1={floorY + (height - floorY) * fraction}
          y2={floorY + (height - floorY) * fraction}
          stroke="#CDB291"
          strokeWidth="0.6"
        />
      ))}
      <rect y={floorY - 3} width={width} height="3" fill="#E4D2BB" />
    </g>
  );
}
```

`src/components/scene/desk-art.tsx`:

```tsx
import { DESK_TOP_THICKNESS, SCENE } from "@/lib/scene-layout";
import type { CatalogItem } from "@/lib/types";

interface DeskProps {
  item: CatalogItem;
  x: number;
  width: number;
  topY: number;
}

type Variant = "electric" | "mechanical" | "dualMotor";

const TOP_COLORS: Record<Variant, { top: string; edge: string }> = {
  electric: { top: "#D9B38C", edge: "#B98E63" },
  mechanical: { top: "#A87445", edge: "#86592F" },
  dualMotor: { top: "#F4F4F2", edge: "#D2D2CC" },
};

const OUTER_COLUMN_HEIGHT = 40;
const INNER_COLUMN_LENGTH = 68;

function variantOf(item: CatalogItem): Variant {
  return item.art.kind === "desk" ? item.art.variant : "electric";
}

function legXs(x: number, width: number): [number, number] {
  return [x + 14, x + width - 14];
}

// Moves with the desk top: tabletop plus the inner telescoping columns.
export function DeskTop({ item, x, width, topY }: DeskProps) {
  const variant = variantOf(item);
  const colors = TOP_COLORS[variant];
  const columnWidth = variant === "dualMotor" ? 7 : 5;
  return (
    <g data-testid={`scene-desk-${variant}`}>
      {legXs(x, width).map((legX) => (
        <rect
          key={legX}
          x={legX - columnWidth / 2}
          y={topY + DESK_TOP_THICKNESS}
          width={columnWidth}
          height={INNER_COLUMN_LENGTH}
          fill="#8C9AA3"
        />
      ))}
      <rect
        x={x}
        y={topY}
        width={width}
        height={DESK_TOP_THICKNESS}
        rx="1.5"
        fill={colors.top}
      />
      <rect
        x={x}
        y={topY + DESK_TOP_THICKNESS - 1.2}
        width={width}
        height="1.2"
        fill={colors.edge}
      />
      {variant === "dualMotor" ? (
        <g>
          <rect
            x={x + width - 34}
            y={topY + 4}
            width="18"
            height="4"
            rx="1"
            fill="#2B353C"
          />
          <rect
            x={x + width - 31}
            y={topY + 5}
            width="6"
            height="2"
            rx="0.5"
            fill="#63AEFD"
          />
        </g>
      ) : null}
      {variant === "electric" ? (
        <rect
          x={x + width - 26}
          y={topY + 4}
          width="10"
          height="3"
          rx="1"
          fill="#2B353C"
        />
      ) : null}
    </g>
  );
}

// Stays on the floor: outer columns, feet and (for the mechanical desk) the crank.
export function DeskLegs({ item, x, width }: Omit<DeskProps, "topY">) {
  const variant = variantOf(item);
  const { floorY } = SCENE;
  const columnWidth = variant === "dualMotor" ? 10 : 8;
  return (
    <g>
      {legXs(x, width).map((legX) => (
        <g key={legX}>
          <rect
            x={legX - columnWidth / 2}
            y={floorY - OUTER_COLUMN_HEIGHT}
            width={columnWidth}
            height={OUTER_COLUMN_HEIGHT}
            rx="1"
            fill="#3A4A54"
          />
          <rect
            x={legX - 24}
            y={floorY - 4}
            width="48"
            height="4"
            rx="2"
            fill="#2B353C"
          />
        </g>
      ))}
      {variant === "mechanical" ? (
        <g stroke="#2B353C" strokeWidth="1.6" fill="none" strokeLinecap="round">
          <path
            d={`M${String(x + width - 14)} ${String(floorY - 30)} h10 v8`}
          />
          <circle cx={x + width - 4} cy={floorY - 21} r="1.8" fill="#2B353C" />
        </g>
      ) : null}
    </g>
  );
}
```

`src/components/scene/chair-art.tsx`:

```tsx
import { SCENE } from "@/lib/scene-layout";
import type { CatalogItem } from "@/lib/types";

type Variant = "ergo" | "basic" | "premium";

const COLORS: Record<
  Variant,
  { frame: string; back: string; seat: string; accent: string }
> = {
  ergo: {
    frame: "#22313A",
    back: "#33454F",
    seat: "#2B3A43",
    accent: "#63AEFD",
  },
  basic: {
    frame: "#5D6A72",
    back: "#8A949B",
    seat: "#7A858C",
    accent: "#B7C0C6",
  },
  premium: {
    frame: "#15252E",
    back: "#1F3440",
    seat: "#1A2C36",
    accent: "#F2B544",
  },
};

// Office chair seen from the front, standing on the floor at centerX.
export function ChairArt({
  item,
  centerX,
}: {
  item: CatalogItem;
  centerX: number;
}) {
  const variant: Variant =
    item.art.kind === "chair" ? item.art.variant : "ergo";
  const color = COLORS[variant];
  const floor = SCENE.floorY;
  const seatY = floor - 48;
  const backTop = variant === "basic" ? seatY - 40 : seatY - 52;
  return (
    <g data-testid={`scene-chair-${variant}`}>
      <g stroke={color.frame} strokeWidth="2.4" strokeLinecap="round">
        <line x1={centerX} y1={floor - 6} x2={centerX - 22} y2={floor - 2} />
        <line x1={centerX} y1={floor - 6} x2={centerX + 22} y2={floor - 2} />
        <line x1={centerX} y1={floor - 6} x2={centerX - 9} y2={floor - 1} />
        <line x1={centerX} y1={floor - 6} x2={centerX + 9} y2={floor - 1} />
      </g>
      {[-22, -9, 9, 22].map((offset) => (
        <circle
          key={offset}
          cx={centerX + offset}
          cy={floor - 1.6}
          r="1.8"
          fill="#1B2329"
        />
      ))}
      <rect
        x={centerX - 2}
        y={seatY + 6}
        width="4"
        height="36"
        fill="#7D8A92"
      />
      <rect
        x={centerX - 3.5}
        y={seatY + 18}
        width="7"
        height="14"
        rx="1.5"
        fill={color.frame}
      />
      <rect
        x={centerX - 19}
        y={backTop}
        width="38"
        height={seatY - backTop + 2}
        rx="9"
        fill={color.back}
      />
      {variant === "basic" ? null : (
        <g stroke={color.frame} strokeWidth="0.5" opacity="0.6">
          {[0.25, 0.45, 0.65].map((fraction) => (
            <line
              key={fraction}
              x1={centerX - 15}
              x2={centerX + 15}
              y1={backTop + (seatY - backTop) * fraction}
              y2={backTop + (seatY - backTop) * fraction}
            />
          ))}
        </g>
      )}
      <rect
        x={centerX - 13}
        y={seatY - 18}
        width="26"
        height="5"
        rx="2.5"
        fill={color.accent}
      />
      {variant === "basic" ? null : (
        <rect
          x={centerX - 12}
          y={backTop - (variant === "premium" ? 14 : 11)}
          width="24"
          height={variant === "premium" ? 12 : 9}
          rx="4"
          fill={color.back}
        />
      )}
      <rect
        x={centerX - 24}
        y={seatY - 4}
        width="5"
        height="16"
        rx="2"
        fill={color.frame}
      />
      <rect
        x={centerX + 19}
        y={seatY - 4}
        width="5"
        height="16"
        rx="2"
        fill={color.frame}
      />
      <rect
        x={centerX - 26}
        y={seatY - 6}
        width="9"
        height="3"
        rx="1.5"
        fill={color.frame}
      />
      <rect
        x={centerX + 17}
        y={seatY - 6}
        width="9"
        height="3"
        rx="1.5"
        fill={color.frame}
      />
      <rect
        x={centerX - 22}
        y={seatY}
        width="44"
        height="8"
        rx="4"
        fill={color.seat}
      />
    </g>
  );
}
```

`src/components/scene/monitor-art.tsx`:

```tsx
import { MONITOR_RISER, type PlacedMonitor } from "@/lib/scene-layout";

const TONES = {
  dark: {
    bezel: "#1C252B",
    stand: "#2B353C",
    screenTop: "#2A3F57",
    screenBottom: "#3E6C9B",
  },
  silver: {
    bezel: "#C9CFD4",
    stand: "#AEB6BC",
    screenTop: "#4B3F8F",
    screenBottom: "#7FA6E8",
  },
} as const;

// One monitor on its stand; deskTopY is the desk surface it stands on.
export function MonitorArt({
  monitor,
  deskTopY,
}: {
  monitor: PlacedMonitor;
  deskTopY: number;
}) {
  const art = monitor.item.art;
  const tone = TONES[art.kind === "monitor" ? art.tone : "dark"];
  const { x, y, width, height } = monitor;
  const centerX = x + width / 2;
  const neckTop = y + height;
  const riserTop = deskTopY - (monitor.raised ? MONITOR_RISER : 0);
  const gradientId = `screen-${monitor.key}`;
  return (
    <g data-testid={`scene-monitor-${monitor.item.id}`}>
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={tone.screenTop} />
          <stop offset="1" stopColor={tone.screenBottom} />
        </linearGradient>
      </defs>
      {monitor.raised ? (
        <rect
          x={centerX - 26}
          y={riserTop}
          width="52"
          height={MONITOR_RISER}
          rx="1.5"
          fill="#D9C3A5"
        />
      ) : null}
      <rect
        x={centerX - 2}
        y={neckTop}
        width="4"
        height={riserTop - neckTop - 1}
        fill={tone.stand}
      />
      <rect
        x={centerX - 11}
        y={riserTop - 1.6}
        width="22"
        height="1.6"
        rx="0.8"
        fill={tone.stand}
      />
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx="1.6"
        fill={tone.bezel}
      />
      <rect
        x={x + 1.4}
        y={y + 1.4}
        width={width - 2.8}
        height={height - 2.8}
        rx="0.8"
        fill={`url(#${gradientId})`}
      />
      <g fill="#FFFFFF" opacity="0.35">
        {[0.22, 0.38, 0.54].map((fraction, index) => (
          <rect
            key={fraction}
            x={x + width * 0.1}
            y={y + height * fraction}
            width={width * (index === 1 ? 0.5 : 0.35)}
            height="1.6"
            rx="0.8"
          />
        ))}
      </g>
    </g>
  );
}
```

`src/components/scene/desk-items.tsx`:

```tsx
import type { PlacedMonitor } from "@/lib/scene-layout";
import type { Setup } from "@/lib/types";

interface DeskItemsProps {
  setup: Setup;
  desk: { x: number; y: number; width: number };
  monitors: PlacedMonitor[];
}

const has = (setup: Setup, id: string): boolean => (setup.items[id] ?? 0) > 0;
const DARK = "#2B353C";
const SILVER = "#D7DCE0";

// Items in front of the monitors on (or hanging from) the desk top.
export function DeskItems({ setup, desk, monitors }: DeskItemsProps) {
  const top = desk.y;
  const center = desk.x + desk.width / 2;
  const right = desk.x + desk.width;
  const middle = monitors[monitors.length === 3 ? 1 : 0];
  const ownLaptop = !has(setup, "mac-mini");
  const laptopWidth = 30;
  // Left of the chair back so the chair never hides it.
  const laptopX = Math.min(desk.x + 8, center - 28 - laptopWidth);
  const laptopLift = has(setup, "laptop-stand") ? 9 : 0;
  const keyboardTone = has(setup, "kb-magic") ? SILVER : DARK;
  const mouseTone = has(setup, "mouse-magic") ? SILVER : DARK;
  const keyboardSelected = has(setup, "kb-mx") || has(setup, "kb-magic");
  const mouseSelected =
    has(setup, "mouse-mx") ||
    has(setup, "mouse-silent") ||
    has(setup, "mouse-magic");
  const camAnchor = middle ?? {
    x: laptopX,
    y: top - laptopLift - 21,
    width: laptopWidth,
  };
  return (
    <g>
      {has(setup, "light-bar") && middle !== undefined ? (
        <rect
          data-testid="scene-item-light-bar"
          x={middle.x + middle.width / 2 - 18}
          y={middle.y - 3}
          width="36"
          height="2.6"
          rx="1.3"
          fill={DARK}
        />
      ) : null}
      {has(setup, "webcam") ? (
        <g data-testid="scene-item-webcam">
          <rect
            x={
              camAnchor.x +
              camAnchor.width / 2 -
              (has(setup, "light-bar") ? 26 : 5)
            }
            y={camAnchor.y - 4}
            width="10"
            height="4"
            rx="2"
            fill={DARK}
          />
        </g>
      ) : null}
      {has(setup, "mac-mini") ? (
        <rect
          data-testid="scene-item-mac-mini"
          x={right - 40}
          y={top - 4}
          width="20"
          height="4"
          rx="1.5"
          fill={SILVER}
        />
      ) : null}
      {has(setup, "dock") ? (
        <rect
          data-testid="scene-item-dock"
          x={laptopX + laptopWidth + 3}
          y={top - 3}
          width="10"
          height="3"
          rx="1"
          fill={DARK}
        />
      ) : null}
      {ownLaptop ? (
        <g data-testid="scene-own-laptop">
          {laptopLift > 0 ? (
            <path
              data-testid="scene-item-laptop-stand"
              d={`M${String(laptopX + 4)} ${String(top)} L${String(laptopX + 8)} ${String(top - laptopLift)} M${String(laptopX + laptopWidth - 4)} ${String(top)} L${String(laptopX + laptopWidth - 8)} ${String(top - laptopLift)}`}
              stroke="#AEB6BC"
              strokeWidth="1.6"
            />
          ) : null}
          <rect
            x={laptopX + 2}
            y={top - laptopLift - 21}
            width={laptopWidth - 4}
            height="19"
            rx="1.5"
            fill="#AEB6BC"
          />
          <rect
            x={laptopX + 3.5}
            y={top - laptopLift - 19.5}
            width={laptopWidth - 7}
            height="16"
            rx="0.8"
            fill="#33475B"
          />
          <rect
            x={laptopX}
            y={top - laptopLift - 2}
            width={laptopWidth}
            height="2"
            rx="1"
            fill="#C9CED3"
          />
        </g>
      ) : null}
      {keyboardSelected ? (
        <rect
          data-testid="scene-item-keyboard"
          x={center - 20}
          y={top - 2.6}
          width="40"
          height="2.6"
          rx="1"
          fill={keyboardTone}
        />
      ) : null}
      {has(setup, "mouse-pad") ? (
        <rect
          data-testid="scene-item-mouse-pad"
          x={center + 24}
          y={top - 0.8}
          width="20"
          height="0.8"
          fill="#3E4A52"
        />
      ) : null}
      {mouseSelected ? (
        <ellipse
          data-testid="scene-item-mouse"
          cx={center + 34}
          cy={top - 2}
          rx="3.5"
          ry="2"
          fill={mouseTone}
        />
      ) : null}
      {has(setup, "headphones") ? (
        <path
          data-testid="scene-item-headphones"
          d={`M${String(right - 10)} ${String(top + 18)} a7 7 0 0 1 14 0`}
          stroke={DARK}
          strokeWidth="2.2"
          fill="none"
        />
      ) : null}
    </g>
  );
}

// Tall items behind the monitors: lamps and the mic boom arm.
export function BackDeskItems({
  setup,
  desk,
}: Pick<DeskItemsProps, "setup" | "desk">) {
  const top = desk.y;
  const right = desk.x + desk.width;
  return (
    <g>
      {has(setup, "lamp-led") ? (
        <g data-testid="scene-item-lamp-led">
          <ellipse cx={desk.x + 8} cy={top - 1} rx="6" ry="1.6" fill={DARK} />
          <path
            d={`M${String(desk.x + 8)} ${String(top - 1)} L${String(desk.x + 12)} ${String(top - 40)} L${String(desk.x + 30)} ${String(top - 46)}`}
            stroke={DARK}
            strokeWidth="1.6"
            fill="none"
          />
          <ellipse
            cx={desk.x + 32}
            cy={top - 22}
            rx="14"
            ry="20"
            fill="#FFE29A"
            opacity="0.28"
          />
          <rect
            x={desk.x + 26}
            y={top - 48}
            width="12"
            height="3"
            rx="1.5"
            fill={DARK}
          />
        </g>
      ) : null}
      {has(setup, "lamp-hue") ? (
        <g data-testid="scene-item-lamp-hue">
          <defs>
            <linearGradient id="hue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#FF8FB1" />
              <stop offset="0.5" stopColor="#B98CFF" />
              <stop offset="1" stopColor="#63AEFD" />
            </linearGradient>
          </defs>
          <ellipse
            cx={right - 8}
            cy={top - 18}
            rx="12"
            ry="22"
            fill="#B98CFF"
            opacity="0.22"
          />
          <rect
            x={right - 10}
            y={top - 36}
            width="4"
            height="35"
            rx="2"
            fill="url(#hue)"
          />
          <rect
            x={right - 13}
            y={top - 2}
            width="10"
            height="2"
            rx="1"
            fill={DARK}
          />
        </g>
      ) : null}
      {has(setup, "mic-kit") ? (
        <g
          data-testid="scene-item-mic-kit"
          stroke={DARK}
          strokeWidth="1.4"
          fill="none"
        >
          <path
            d={`M${String(desk.x + 22)} ${String(top)} V${String(top - 30)} L${String(desk.x + 44)} ${String(top - 22)}`}
          />
          <rect
            x={desk.x + 42}
            y={top - 26}
            width="6"
            height="11"
            rx="3"
            fill={DARK}
            stroke="none"
          />
        </g>
      ) : null}
    </g>
  );
}
```

`src/components/scene/floor-items.tsx`:

```tsx
import { CATALOG } from "@/data/catalog";
import { SCENE } from "@/lib/scene-layout";
import type { Setup } from "@/lib/types";

const has = (setup: Setup, id: string): boolean => (setup.items[id] ?? 0) > 0;
const DARK = "#2B353C";
const WHITE = "#F7F8F9";

function Monstera({ x }: { x: number }) {
  const floor = SCENE.floorY;
  return (
    <g data-testid="scene-plant-monstera">
      <path
        d={`M${String(x - 9)} ${String(floor - 18)} h18 l-2 18 h-14 Z`}
        fill="#C8754B"
      />
      <g fill="#3E8E5A">
        <ellipse
          cx={x - 10}
          cy={floor - 38}
          rx="11"
          ry="7"
          transform={`rotate(-30 ${String(x - 10)} ${String(floor - 38)})`}
        />
        <ellipse
          cx={x + 10}
          cy={floor - 42}
          rx="12"
          ry="7"
          transform={`rotate(25 ${String(x + 10)} ${String(floor - 42)})`}
        />
        <ellipse cx={x} cy={floor - 56} rx="10" ry="8" />
      </g>
      <g stroke="#2F6B4F" strokeWidth="1.2">
        <line x1={x} y1={floor - 18} x2={x - 9} y2={floor - 36} />
        <line x1={x} y1={floor - 18} x2={x + 9} y2={floor - 40} />
        <line x1={x} y1={floor - 18} x2={x} y2={floor - 52} />
      </g>
    </g>
  );
}

function SnakePlant({ x }: { x: number }) {
  const floor = SCENE.floorY;
  return (
    <g data-testid="scene-plant-snake">
      <rect
        x={x - 7}
        y={floor - 14}
        width="14"
        height="14"
        rx="2"
        fill="#E9E2D8"
      />
      <g fill="#4F8F4A">
        <path
          d={`M${String(x - 5)} ${String(floor - 14)} q-2 -16 1 -30 q2 14 3 30 Z`}
        />
        <path
          d={`M${String(x - 1)} ${String(floor - 14)} q0 -22 3 -38 q2 20 1 38 Z`}
        />
        <path
          d={`M${String(x + 3)} ${String(floor - 14)} q2 -14 5 -26 q-1 14 -1 26 Z`}
        />
      </g>
    </g>
  );
}

// Floor-standing items, wall shelves and under-desk gear; these never move with the desk.
export function FloorItems({
  setup,
  desk,
}: {
  setup: Setup;
  desk: { x: number; width: number };
}) {
  const floor = SCENE.floorY;
  const right = desk.x + desk.width;
  const plants = CATALOG.filter((entry) => entry.slot === "plant").flatMap(
    (entry) =>
      Array.from({ length: setup.items[entry.id] ?? 0 }, () => entry.id),
  );
  const climate = ["tower-fan", "purifier", "dehumidifier"].filter((id) =>
    has(setup, id),
  );
  const internet = has(setup, "starlink")
    ? "starlink"
    : has(setup, "router")
      ? "router"
      : null;
  let cursor = right + 26;
  return (
    <g>
      {plants.map((id, index) => {
        const x = desk.x - 30 - index * 34;
        return id === "plant-monstera" ? (
          <Monstera key={`${id}-${String(index)}`} x={x} />
        ) : (
          <SnakePlant key={`${id}-${String(index)}`} x={x} />
        );
      })}
      {has(setup, "extension-cable") ? (
        <path
          data-testid="scene-item-extension-cable"
          d={`M${String(right - 30)} ${String(floor - 1.5)} Q${String(right + 20)} ${String(floor + 6)} 396 ${String(floor - 20)}`}
          stroke={DARK}
          strokeWidth="1"
          fill="none"
        />
      ) : null}
      {climate.map((id) => {
        const x = cursor;
        if (id === "tower-fan") {
          cursor += 22;
          return (
            <g key={id} data-testid="scene-item-tower-fan">
              <rect
                x={x - 6}
                y={floor - 72}
                width="12"
                height="68"
                rx="6"
                fill={WHITE}
                stroke="#DADFE3"
              />
              <rect
                x={x - 3}
                y={floor - 64}
                width="6"
                height="40"
                rx="3"
                fill="#E3E8EC"
              />
              <rect
                x={x - 9}
                y={floor - 4}
                width="18"
                height="4"
                rx="2"
                fill="#DADFE3"
              />
            </g>
          );
        }
        if (id === "purifier") {
          cursor += 30;
          return (
            <g key={id} data-testid="scene-item-purifier">
              <rect
                x={x - 11}
                y={floor - 46}
                width="22"
                height="46"
                rx="5"
                fill={WHITE}
                stroke="#DADFE3"
              />
              <circle cx={x} cy={floor - 38} r="4" fill="#9FD3B5" />
            </g>
          );
        }
        cursor += 34;
        return (
          <g key={id} data-testid="scene-item-dehumidifier">
            <rect
              x={x - 13}
              y={floor - 40}
              width="26"
              height="40"
              rx="4"
              fill={WHITE}
              stroke="#DADFE3"
            />
            <rect
              x={x - 9}
              y={floor - 34}
              width="18"
              height="3"
              rx="1.5"
              fill="#63AEFD"
            />
          </g>
        );
      })}
      {internet === null ? null : (
        <g data-testid={`scene-item-${internet}`}>
          <rect x="22" y="112" width="70" height="3" rx="1.5" fill="#C9A77F" />
          {internet === "router" ? (
            <g>
              <rect x="46" y="104" width="22" height="8" rx="2" fill={DARK} />
              <g stroke={DARK} strokeWidth="1.4">
                <line x1="49" y1="104" x2="47" y2="94" />
                <line x1="57" y1="104" x2="57" y2="92" />
                <line x1="65" y1="104" x2="67" y2="94" />
              </g>
            </g>
          ) : (
            <g>
              <rect
                x="34"
                y="102"
                width="16"
                height="10"
                rx="2"
                fill={WHITE}
                stroke="#DADFE3"
              />
              <path
                d="M58 112 L62 96 L82 92 L80 108 Z"
                fill={WHITE}
                stroke="#DADFE3"
              />
            </g>
          )}
        </g>
      )}
      {has(setup, "nespresso") ? (
        <g data-testid="scene-item-nespresso">
          <rect x="308" y="112" width="70" height="3" rx="1.5" fill="#C9A77F" />
          <rect x="334" y="94" width="16" height="18" rx="3" fill="#D94A3A" />
          <rect x="337" y="106" width="10" height="5" rx="1" fill={DARK} />
          <rect x="356" y="104" width="6" height="8" rx="1.5" fill="#FFFFFF" />
        </g>
      ) : null}
      {has(setup, "walking-pad") ? (
        <g data-testid="scene-item-walking-pad">
          <rect
            x={desk.x + desk.width / 2 - 42}
            y={floor - 6}
            width="84"
            height="6"
            rx="3"
            fill={DARK}
          />
          <rect
            x={desk.x + desk.width / 2 - 38}
            y={floor - 5}
            width="76"
            height="2"
            rx="1"
            fill="#55636C"
          />
        </g>
      ) : null}
      {has(setup, "power-strip-3") || has(setup, "power-strip-6") ? (
        <rect
          data-testid="scene-item-power-strip"
          x={right - 52}
          y={floor - 3}
          width="22"
          height="3"
          rx="1.5"
          fill={has(setup, "power-strip-6") ? WHITE : DARK}
          stroke="#AEB6BC"
          strokeWidth="0.4"
        />
      ) : null}
    </g>
  );
}
```

`src/components/scene/workspace-scene.tsx`:

```tsx
"use client";

import { Plus } from "lucide-react";

import { ChairArt } from "@/components/scene/chair-art";
import { DeskLegs, DeskTop } from "@/components/scene/desk-art";
import { BackDeskItems, DeskItems } from "@/components/scene/desk-items";
import { FloorItems } from "@/components/scene/floor-items";
import { MonitorArt } from "@/components/scene/monitor-art";
import { Room } from "@/components/scene/room";
import { getItem } from "@/data/catalog";
import { DESK_HEIGHT, layoutScene, SCENE } from "@/lib/scene-layout";
import { setupLines } from "@/lib/setup";
import type { CategoryId, Setup } from "@/lib/types";

interface Hotspot {
  label: string;
  category: CategoryId;
  x: number;
  y: number;
}

function sceneLabel(setup: Setup): string {
  const names = setupLines(setup).map((line) =>
    line.qty > 1 ? `${String(line.qty)} × ${line.item.name}` : line.item.name,
  );
  const posture = setup.posture === "stand" ? "standing" : "sitting";
  return `Your workspace, ${posture}: ${names.join(", ")}.`;
}

const percent = (value: number, total: number): string =>
  `${String((value / total) * 100)}%`;

export function WorkspaceScene({
  setup,
  onHotspot,
}: {
  setup: Setup;
  // Without a handler the scene is display-only (no "+" hotspots).
  onHotspot?: (category: CategoryId) => void;
}) {
  // Lay out at sitting height and lift with a CSS transform so posture changes animate.
  const sitting = layoutScene({ ...setup, posture: "sit" });
  const actual = layoutScene(setup);
  const lift =
    setup.posture === "stand" ? DESK_HEIGHT.stand - DESK_HEIGHT.sit : 0;
  const deskItem = getItem(setup.deskId);
  const hasLamp = (setup.items["lamp-led"] ?? 0) > 0;
  const plantCount =
    (setup.items["plant-monstera"] ?? 0) + (setup.items["plant-snake"] ?? 0);
  const hotspots: Hotspot[] = [];
  if (onHotspot !== undefined && actual.monitorHotspot !== null) {
    hotspots.push({
      label: "Add a screen",
      category: "screen",
      ...actual.monitorHotspot,
    });
  }
  if (onHotspot !== undefined && !hasLamp) {
    hotspots.push({
      label: "Add a lamp",
      category: "accessory",
      x: actual.desk.x + 10,
      y: actual.desk.y - 20,
    });
  }
  if (onHotspot !== undefined && plantCount < 2) {
    hotspots.push({
      label: "Add a plant",
      category: "accessory",
      x: actual.desk.x - 30 - plantCount * 34,
      y: SCENE.floorY - 24,
    });
  }
  return (
    <div
      className="relative w-full"
      style={{
        aspectRatio: `${String(SCENE.width)} / ${String(SCENE.height)}`,
      }}
    >
      <svg
        viewBox={`0 0 ${String(SCENE.width)} ${String(SCENE.height)}`}
        className="absolute inset-0 size-full"
        role="img"
        aria-label={sceneLabel(setup)}
        data-testid="workspace-scene"
        data-posture={setup.posture}
      >
        <Room />
        <FloorItems setup={setup} desk={sitting.desk} />
        <g
          style={{ transform: `translateY(${String(-lift)}px)` }}
          className="transition-transform duration-500 ease-out motion-reduce:transition-none"
        >
          <DeskTop
            item={deskItem}
            x={sitting.desk.x}
            width={sitting.desk.width}
            topY={sitting.desk.y}
          />
          <BackDeskItems setup={setup} desk={sitting.desk} />
          {sitting.monitors.map((monitor) => (
            <MonitorArt
              key={monitor.key}
              monitor={monitor}
              deskTopY={sitting.desk.y}
            />
          ))}
          <DeskItems
            setup={setup}
            desk={sitting.desk}
            monitors={sitting.monitors}
          />
        </g>
        <DeskLegs
          item={deskItem}
          x={sitting.desk.x}
          width={sitting.desk.width}
        />
        {setup.chairId === null ? null : (
          <g
            style={{
              transform: `translateX(${String(actual.chairCenterX - SCENE.width / 2)}px)`,
            }}
            className="transition-transform duration-500 ease-out motion-reduce:transition-none"
          >
            <ChairArt item={getItem(setup.chairId)} centerX={SCENE.width / 2} />
          </g>
        )}
      </svg>
      {hotspots.map((hotspot) => (
        <button
          key={hotspot.label}
          type="button"
          aria-label={hotspot.label}
          title={hotspot.label}
          onClick={() => {
            onHotspot?.(hotspot.category);
          }}
          className="absolute flex size-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-dashed border-primary/40 bg-white/80 text-primary shadow-sm transition hover:scale-110 hover:bg-white focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
          style={{
            left: percent(hotspot.x, SCENE.width),
            top: percent(hotspot.y, SCENE.height),
          }}
        >
          <Plus className="size-4" aria-hidden />
        </button>
      ))}
    </div>
  );
}
```

Replace `src/app/page.tsx` with the interim preview:

```tsx
import { WorkspaceScene } from "@/components/scene/workspace-scene";
import { defaultSetup } from "@/data/presets";

// Interim page: shows the scene for the default setup until the builder UI lands.
export default function HomePage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8">
      <h1 className="mb-4 text-3xl font-extrabold tracking-tight">
        Design your Bali workspace
      </h1>
      <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
        <WorkspaceScene setup={defaultSetup()} />
      </div>
    </main>
  );
}
```

- [ ] **Step 4: Run to verify it passes**

```bash
pnpm build && pnpm test:e2e e2e/scene.spec.ts e2e/smoke.spec.ts
```

Expected: `4 passed`.

- [ ] **Step 5: Gate and commit**

```bash
pnpm lint && pnpm type-check && pnpm format:check && pnpm test
```

```bash
git add src/components/scene src/app/page.tsx e2e/scene.spec.ts
git commit -F - <<'EOF'
feat: draw the workspace as a layered SVG scene

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```

---
### Task 11: Builder UI

**Files:**
- Create: `src/components/builder/use-setup-summary.ts`, `share-button.tsx`, `site-header.tsx`, `preset-bar.tsx`, `notice-toasts.tsx`, `item-card.tsx`, `category-picker.tsx`, `plan-toggle.tsx`, `posture-toggle.tsx`, `summary-panel.tsx`, `price-bar.tsx`, `builder.tsx`; `src/app/checkout/page.tsx` (placeholder until Plan 2)
- Modify: `src/app/page.tsx` (render `<Builder />`)
- Test: `e2e/helpers.ts`, `e2e/builder.spec.ts`

**Interfaces:**
- Consumes: `useSetupStore` (Task 9), `summarize`, `deltaCents`, `quantityOf`, `slotCapacity` (Task 6), `shareUrl` (Task 7), `matchingPresetId`, `PRESETS`, `itemsInCategory`, `monisProductUrl` (Task 4), `formatCents`, `formatDelta`, `effectiveCents` (Task 5), `WorkspaceScene` (Task 10).
- Produces (test ids used by E2E): `item-card-<id>`, `qty-<id>`, `summary-panel`, `summary-line-<id>`, `summary-total`, `summary-savings`, `summary-arrival`, `price-bar`, `share-button`. Accessible names: preset buttons by name with `aria-pressed`; tabs `Desk Chair Screens Accessories Bali`; radios `Weekly Monthly Sit Stand`; item buttons `Add <name>` / `Remove <name>` / `Add another <name>` / `Remove one <name>`.

- [ ] **Step 1: Write the failing E2E tests**

`e2e/helpers.ts`:

```ts
import { expect, type Locator, type Page } from "@playwright/test";

// The summary lives in a sidebar on desktop and in a drawer on mobile.
export async function openSummary(
  page: Page,
  isMobile: boolean,
): Promise<Locator> {
  if (isMobile) {
    await page.getByTestId("price-bar").click();
  }
  const panel = page.getByTestId("summary-panel").filter({ visible: true });
  await expect(panel).toBeVisible();
  return panel;
}

export async function closeSummary(
  page: Page,
  isMobile: boolean,
): Promise<void> {
  if (isMobile) await page.keyboard.press("Escape");
}

export async function addFromCard(page: Page, itemId: string): Promise<void> {
  await page
    .getByTestId(`item-card-${itemId}`)
    .getByRole("button")
    .first()
    .click();
}
```

`e2e/builder.spec.ts`:

```ts
import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

import { addFromCard, closeSummary, openSummary } from "./helpers";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await expect(page.getByTestId("workspace-scene")).toBeVisible();
});

test("first visit shows the Essentials setup with price and arrival", async ({
  page,
  isMobile,
}) => {
  await expect(page.getByTestId("scene-desk-electric")).toBeVisible();
  await expect(page.getByTestId("scene-chair-ergo")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Essentials" }),
  ).toHaveAttribute("aria-pressed", "true");
  const summary = await openSummary(page, isMobile);
  await expect(summary.getByTestId("summary-total")).toHaveText(
    "$12.70 / week",
  );
  await expect(summary.getByTestId("summary-arrival")).toHaveText(
    "Arrives tomorrow",
  );
});

test("swapping desk and chair updates the scene and summary", async ({
  page,
  isMobile,
}) => {
  await addFromCard(page, "desk-dual-motor");
  await expect(page.getByTestId("scene-desk-dualMotor")).toBeVisible();
  await page.getByRole("tab", { name: "Chair" }).click();
  await addFromCard(page, "chair-basic");
  await expect(page.getByTestId("scene-chair-basic")).toBeVisible();
  const summary = await openSummary(page, isMobile);
  await expect(
    summary.getByTestId("summary-line-desk-dual-motor"),
  ).toBeVisible();
  await expect(summary.getByTestId("summary-line-chair-basic")).toBeVisible();
});

test("a full desk offers an upgrade that adds the third screen", async ({
  page,
}) => {
  await page.getByRole("tab", { name: "Screens" }).click();
  await addFromCard(page, "mon-24-1c");
  await page
    .getByRole("button", { name: 'Add another 24" Full HD Office Monitor 1C' })
    .click();
  await addFromCard(page, "mon-27-4k");
  await page
    .getByRole("button", { name: "Upgrade to the 160 cm desk" })
    .click();
  await expect(page.getByTestId("scene-desk-dualMotor")).toBeVisible();
  await expect(page.locator('[data-testid^="scene-monitor-"]')).toHaveCount(3);
});

test("the plan toggle switches totals and savings", async ({
  page,
  isMobile,
}) => {
  const summary = await openSummary(page, isMobile);
  await summary.getByRole("radio", { name: "Monthly" }).click();
  await expect(summary.getByTestId("summary-total")).toHaveText(
    "$34.80 / month",
  );
  await expect(summary.getByTestId("summary-savings")).toHaveText(
    "You save $20.23 vs weekly billing.",
  );
});

test("standing raises the desk", async ({ page }) => {
  await page.getByRole("radio", { name: "Stand" }).click();
  await expect(page.getByTestId("workspace-scene")).toHaveAttribute(
    "data-posture",
    "stand",
  );
});

test("a shared link rebuilds the same setup", async ({
  page,
  context,
  browser,
  isMobile,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.getByRole("button", { name: "Founders" }).click();
  await page.getByTestId("share-button").click();
  const url = await page.evaluate(() => navigator.clipboard.readText());
  expect(url).toContain("i=mon-27-4k");

  const fresh = await browser.newContext(
    isMobile
      ? {
          viewport: { width: 412, height: 915 },
          isMobile: true,
          hasTouch: true,
        }
      : {},
  );
  const other = await fresh.newPage();
  await other.goto(url);
  await expect(other.getByRole("button", { name: "Founders" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(other).toHaveURL(/\/$/);
  await fresh.close();
});

test("the setup survives a reload", async ({ page, isMobile }) => {
  await page.getByRole("button", { name: "Trading" }).click();
  await page.reload();
  await expect(page.getByRole("button", { name: "Trading" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  const summary = await openSummary(page, isMobile);
  await expect(summary.getByTestId("summary-total")).toHaveText(
    "$48.20 / week",
  );
  await closeSummary(page, isMobile);
});

test("mobile shows a sticky price bar that opens the summary", async ({
  page,
  isMobile,
}) => {
  test.skip(!isMobile, "mobile only");
  await expect(page.getByTestId("price-bar")).toBeVisible();
  const summary = await openSummary(page, isMobile);
  await expect(
    summary.getByRole("link", { name: "Rent this setup" }),
  ).toBeVisible();
});

test("the builder has no serious accessibility violations", async ({
  page,
}) => {
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa"])
    .analyze();
  const serious = results.violations.filter(
    (violation) =>
      violation.impact === "serious" || violation.impact === "critical",
  );
  expect(serious.map((violation) => violation.id)).toEqual([]);
});
```

- [ ] **Step 2: Run to verify failure**

```bash
pnpm build && pnpm test:e2e e2e/builder.spec.ts
```

Expected: FAIL — the interim page has no preset buttons, tabs or summary (`element(s) not found`).

- [ ] **Step 3: Implement the builder components**

`src/components/builder/use-setup-summary.ts`:

```ts
import { useMemo } from "react";

import { type SetupSummary, summarize } from "@/lib/setup";
import { useSetupStore } from "@/store/setup-store";

export function useSetupSummary(): SetupSummary {
  const setup = useSetupStore((state) => state.setup);
  return useMemo(() => summarize(setup), [setup]);
}
```

`src/components/builder/share-button.tsx`:

```tsx
"use client";

import { Share2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { shareUrl } from "@/lib/share";
import { useSetupStore } from "@/store/setup-store";

export function ShareButton() {
  const setup = useSetupStore((state) => state.setup);
  const share = async (): Promise<void> => {
    const url = shareUrl(setup, window.location.origin);
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied. Send it to your team.");
    } catch {
      toast("Copy this link to share your setup", { description: url });
    }
  };
  return (
    <Button
      variant="outline"
      size="lg"
      onClick={() => void share()}
      data-testid="share-button"
    >
      <Share2 aria-hidden />
      Share setup
    </Button>
  );
}
```

`src/components/builder/site-header.tsx`:

```tsx
import { ShareButton } from "@/components/builder/share-button";

export function SiteHeader() {
  return (
    <header className="border-b bg-white/80 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between gap-3 px-4">
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-extrabold tracking-tight">
            monis.rent
          </span>
          <span className="hidden text-sm text-muted-foreground sm:inline">
            Workspace Builder
          </span>
        </div>
        <ShareButton />
      </div>
    </header>
  );
}
```

`src/components/builder/preset-bar.tsx`:

```tsx
"use client";

import { matchingPresetId, PRESETS } from "@/data/presets";
import { cn } from "@/lib/utils";
import { useSetupStore } from "@/store/setup-store";

export function PresetBar() {
  const setup = useSetupStore((state) => state.setup);
  const applyPreset = useSetupStore((state) => state.applyPreset);
  const startEmpty = useSetupStore((state) => state.startEmpty);
  const active = matchingPresetId(setup);
  const chip =
    "shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium transition focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none";
  return (
    <nav
      aria-label="Start from a preset"
      className="-mx-4 overflow-x-auto px-4 py-3"
    >
      <ul className="flex gap-2">
        {PRESETS.map((preset) => (
          <li key={preset.id}>
            <button
              type="button"
              title={preset.tagline}
              aria-pressed={active === preset.id}
              onClick={() => {
                applyPreset(preset.id);
              }}
              className={cn(
                chip,
                active === preset.id
                  ? "border-primary bg-primary text-primary-foreground"
                  : "bg-white hover:border-primary/40",
              )}
            >
              {preset.name}
            </button>
          </li>
        ))}
        <li>
          <button
            type="button"
            onClick={startEmpty}
            className={cn(
              chip,
              "border-dashed bg-transparent hover:border-primary/40",
            )}
          >
            Start empty
          </button>
        </li>
      </ul>
    </nav>
  );
}
```

`src/components/builder/notice-toasts.tsx`:

```tsx
"use client";

import { useEffect } from "react";
import { toast } from "sonner";

import { useSetupStore } from "@/store/setup-store";

// Shows each new store notice once, as a toast with an optional action.
export function NoticeToasts() {
  const notice = useSetupStore((state) => state.notice);
  const chooseDesk = useSetupStore((state) => state.chooseDesk);
  const add = useSetupStore((state) => state.add);
  useEffect(() => {
    if (notice === null) return;
    const { action } = notice;
    toast(notice.message, {
      id: notice.id,
      action:
        action === undefined
          ? undefined
          : {
              label: action.label,
              onClick: () => {
                chooseDesk(action.deskId);
                if (action.addItemId !== undefined) add(action.addItemId);
              },
            },
    });
  }, [notice, chooseDesk, add]);
  return null;
}
```

`src/components/builder/item-card.tsx`:

```tsx
"use client";

import { Armchair, Check, Minus, Plus, Sprout, Zap } from "lucide-react";
import Image from "next/image";

import { Badge } from "@/components/ui/badge";
import { monisProductUrl } from "@/data/catalog";
import { formatCents, formatDelta } from "@/lib/money";
import { effectiveCents } from "@/lib/pricing";
import type { CatalogItem, Plan } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ItemCardProps {
  item: CatalogItem;
  plan: Plan;
  qty: number;
  multi: boolean;
  delta: number;
  onToggle: () => void;
  onDecrement: () => void;
}

function Thumb({ item }: { item: CatalogItem }) {
  if (item.imageUrl !== undefined) {
    return (
      <Image
        src={item.imageUrl}
        alt=""
        width={56}
        height={56}
        unoptimized
        className="size-14 shrink-0 rounded-lg bg-white object-contain"
      />
    );
  }
  const Icon = item.category === "chair" ? Armchair : Sprout;
  return (
    <span className="flex size-14 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
      <Icon className="size-6" aria-hidden />
    </span>
  );
}

export function ItemCard({
  item,
  plan,
  qty,
  multi,
  delta,
  onToggle,
  onDecrement,
}: ItemCardProps) {
  const selected = qty > 0;
  const unit = plan === "weekly" ? "wk" : "mo";
  return (
    <div
      data-testid={`item-card-${item.id}`}
      data-selected={selected}
      className={cn(
        "rounded-xl border bg-card p-2.5 transition",
        selected
          ? "border-primary ring-2 ring-accent/50"
          : "hover:border-primary/30",
      )}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-pressed={multi ? undefined : selected}
        aria-label={`${multi || !selected ? "Add" : "Remove"} ${item.name}`}
        className="flex w-full items-start gap-3 rounded-lg text-left focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
      >
        <Thumb item={item} />
        <span className="min-w-0 flex-1">
          <span className="block text-sm leading-tight font-semibold">
            {item.name}
          </span>
          <span className="mt-0.5 line-clamp-2 block text-xs text-muted-foreground">
            {item.benefit}
          </span>
          <span className="mt-1.5 flex flex-wrap items-center gap-1.5">
            <span className="text-sm font-semibold">
              {formatCents(effectiveCents(item, plan))}
              <span className="text-xs font-normal text-muted-foreground">
                /{unit}
              </span>
            </span>
            {item.salePercent > 0 ? (
              <Badge className="bg-sale text-white">−{item.salePercent}%</Badge>
            ) : null}
            {item.instant ? (
              <Badge variant="outline">
                <Zap aria-hidden />
                Same-day
              </Badge>
            ) : null}
            {item.concept ? <Badge variant="secondary">Concept</Badge> : null}
          </span>
        </span>
        <span className="shrink-0 pt-0.5 text-xs font-semibold" aria-hidden>
          {selected && !multi ? (
            <Check className="size-4 text-primary" />
          ) : (
            formatDelta(delta)
          )}
        </span>
      </button>
      {multi && selected ? (
        <div className="mt-2 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onDecrement}
            aria-label={`Remove one ${item.name}`}
            className="flex size-7 items-center justify-center rounded-full border hover:bg-muted"
          >
            <Minus className="size-3.5" aria-hidden />
          </button>
          <span
            className="w-4 text-center text-sm font-semibold"
            data-testid={`qty-${item.id}`}
          >
            {qty}
          </span>
          <button
            type="button"
            onClick={onToggle}
            aria-label={`Add another ${item.name}`}
            className="flex size-7 items-center justify-center rounded-full border hover:bg-muted"
          >
            <Plus className="size-3.5" aria-hidden />
          </button>
        </div>
      ) : null}
      {item.slug === undefined ? null : (
        <a
          href={monisProductUrl(item.slug)}
          target="_blank"
          rel="noreferrer"
          className="mt-1.5 inline-block text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
        >
          View on monis.rent
        </a>
      )}
    </div>
  );
}
```

`src/components/builder/category-picker.tsx`:

```tsx
"use client";

import { Armchair } from "lucide-react";

import { ItemCard } from "@/components/builder/item-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { itemsInCategory } from "@/data/catalog";
import { deltaCents, quantityOf, slotCapacity } from "@/lib/setup";
import type { CatalogItem, CategoryId } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useSetupStore } from "@/store/setup-store";

const TABS: { id: CategoryId; label: string }[] = [
  { id: "desk", label: "Desk" },
  { id: "chair", label: "Chair" },
  { id: "screen", label: "Screens" },
  { id: "accessory", label: "Accessories" },
  { id: "extra", label: "Bali" },
];

function isCategoryId(value: string): value is CategoryId {
  return TABS.some((tab) => tab.id === value);
}

function groupByHeading(
  items: CatalogItem[],
): [string | null, CatalogItem[]][] {
  const groups = new Map<string | null, CatalogItem[]>();
  for (const entry of items) {
    const key = entry.group ?? null;
    groups.set(key, [...(groups.get(key) ?? []), entry]);
  }
  return [...groups.entries()];
}

function CategoryItems({ category }: { category: CategoryId }) {
  const setup = useSetupStore((state) => state.setup);
  const toggle = useSetupStore((state) => state.toggle);
  const remove = useSetupStore((state) => state.remove);
  const chooseChair = useSetupStore((state) => state.chooseChair);
  return (
    <div className="space-y-4">
      {category === "chair" ? (
        <button
          type="button"
          aria-pressed={setup.chairId === null}
          onClick={() => {
            chooseChair(null);
          }}
          className={cn(
            "flex w-full items-center gap-3 rounded-xl border bg-card p-2.5 text-left text-sm transition",
            setup.chairId === null
              ? "border-primary ring-2 ring-accent/50"
              : "hover:border-primary/30",
          )}
        >
          <span className="flex size-14 items-center justify-center rounded-lg bg-muted">
            <Armchair className="size-6 text-muted-foreground" aria-hidden />
          </span>
          <span>
            <span className="block font-semibold">No chair</span>
            <span className="text-xs text-muted-foreground">
              I already have a good one.
            </span>
          </span>
        </button>
      ) : null}
      {groupByHeading(itemsInCategory(category)).map(([heading, entries]) => (
        <section
          key={heading ?? "all"}
          aria-label={heading ?? undefined}
          className="space-y-2"
        >
          {heading === null ? null : (
            <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              {heading}
            </h3>
          )}
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
            {entries.map((entry) => (
              <ItemCard
                key={entry.id}
                item={entry}
                plan={setup.plan}
                qty={quantityOf(setup, entry.id)}
                multi={
                  category !== "desk" &&
                  category !== "chair" &&
                  slotCapacity(setup, entry.slot) > 1
                }
                delta={deltaCents(setup, entry.id)}
                onToggle={() => {
                  toggle(entry.id);
                }}
                onDecrement={() => {
                  remove(entry.id);
                }}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

export function CategoryPicker() {
  const active = useSetupStore((state) => state.activeCategory);
  const showCategory = useSetupStore((state) => state.showCategory);
  return (
    <Tabs
      id="picker"
      value={active}
      onValueChange={(value) => {
        if (isCategoryId(value)) showCategory(value);
      }}
      className="scroll-mt-20"
    >
      <div className="-mx-4 overflow-x-auto px-4 lg:mx-0 lg:px-0">
        <TabsList className="w-max lg:w-full">
          {TABS.map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className="text-muted-foreground data-active:text-foreground"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>
      {TABS.map((tab) => (
        <TabsContent key={tab.id} value={tab.id} className="mt-3">
          <CategoryItems category={tab.id} />
        </TabsContent>
      ))}
    </Tabs>
  );
}
```

`src/components/builder/plan-toggle.tsx`:

```tsx
"use client";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useSetupStore } from "@/store/setup-store";

export function PlanToggle() {
  const plan = useSetupStore((state) => state.setup.plan);
  const choosePlan = useSetupStore((state) => state.choosePlan);
  return (
    <ToggleGroup
      type="single"
      variant="outline"
      value={plan}
      onValueChange={(value) => {
        if (value === "weekly" || value === "monthly") choosePlan(value);
      }}
      aria-label="Billing plan"
      className="w-full"
    >
      <ToggleGroupItem value="weekly" className="flex-1">
        Weekly
      </ToggleGroupItem>
      <ToggleGroupItem value="monthly" className="flex-1">
        Monthly
      </ToggleGroupItem>
    </ToggleGroup>
  );
}
```

`src/components/builder/posture-toggle.tsx`:

```tsx
"use client";

import { Armchair, PersonStanding } from "lucide-react";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useSetupStore } from "@/store/setup-store";

export function PostureToggle() {
  const posture = useSetupStore((state) => state.setup.posture);
  const choosePosture = useSetupStore((state) => state.choosePosture);
  return (
    <ToggleGroup
      type="single"
      variant="outline"
      value={posture}
      onValueChange={(value) => {
        if (value === "sit" || value === "stand") choosePosture(value);
      }}
      aria-label="Desk height"
    >
      <ToggleGroupItem value="sit">
        <Armchair aria-hidden />
        Sit
      </ToggleGroupItem>
      <ToggleGroupItem value="stand">
        <PersonStanding aria-hidden />
        Stand
      </ToggleGroupItem>
    </ToggleGroup>
  );
}
```

`src/components/builder/summary-panel.tsx`:

```tsx
"use client";

import { Truck, X } from "lucide-react";
import Link from "next/link";

import { PlanToggle } from "@/components/builder/plan-toggle";
import { useSetupSummary } from "@/components/builder/use-setup-summary";
import { Button } from "@/components/ui/button";
import { matchingPresetId, PRESETS } from "@/data/presets";
import { formatCents } from "@/lib/money";
import { effectiveCents } from "@/lib/pricing";
import { useSetupStore } from "@/store/setup-store";

export function SummaryPanel() {
  const setup = useSetupStore((state) => state.setup);
  const remove = useSetupStore((state) => state.remove);
  const showCategory = useSetupStore((state) => state.showCategory);
  const { lines, totalCents, savingsCents, arrival } = useSetupSummary();
  const presetName = PRESETS.find(
    (preset) => preset.id === matchingPresetId(setup),
  )?.name;
  const unit = setup.plan === "weekly" ? "week" : "month";
  const count = lines.reduce((sum, line) => sum + line.qty, 0);
  return (
    <div className="space-y-4" data-testid="summary-panel">
      <div>
        <h2 className="text-base font-semibold">Your setup</h2>
        <p className="text-xs text-muted-foreground">
          {count} items · {presetName ?? "Custom"}
        </p>
      </div>
      <ul className="space-y-1.5 text-sm">
        {lines.map(({ item, qty }) => (
          <li
            key={item.id}
            className="flex items-center gap-2"
            data-testid={`summary-line-${item.id}`}
          >
            <span className="min-w-0 flex-1 truncate">
              {qty > 1 ? `${String(qty)} × ` : ""}
              {item.name}
            </span>
            <span className="tabular-nums">
              {formatCents(qty * effectiveCents(item, setup.plan))}
            </span>
            {item.category === "desk" ? (
              <button
                type="button"
                onClick={() => {
                  showCategory("desk");
                }}
                className="text-xs text-muted-foreground underline-offset-2 hover:underline"
              >
                Swap
              </button>
            ) : (
              <button
                type="button"
                aria-label={`Remove ${item.name}`}
                onClick={() => {
                  remove(item.id);
                }}
                className="rounded p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="size-3.5" aria-hidden />
              </button>
            )}
          </li>
        ))}
      </ul>
      <PlanToggle />
      <div aria-live="polite">
        <p
          className="text-2xl font-bold tabular-nums"
          data-testid="summary-total"
        >
          {formatCents(totalCents)}
          <span className="text-sm font-normal text-muted-foreground">
            {" "}
            / {unit}
          </span>
        </p>
        {savingsCents > 0 ? (
          <p
            className="text-xs text-muted-foreground"
            data-testid="summary-savings"
          >
            {setup.plan === "weekly"
              ? `Monthly saves ${formatCents(savingsCents)} vs 4.3 weeks.`
              : `You save ${formatCents(savingsCents)} vs weekly billing.`}
          </p>
        ) : null}
      </div>
      <p
        className="flex items-center gap-2 text-sm"
        data-testid="summary-arrival"
      >
        <Truck className="size-4 text-accent-foreground" aria-hidden />
        {arrival === "today" ? "Can arrive today" : "Arrives tomorrow"}
      </p>
      <p className="text-xs text-muted-foreground">
        Delivery fee calculated at checkout.
      </p>
      <Button asChild size="lg" className="w-full">
        <Link href="/checkout">Rent this setup</Link>
      </Button>
    </div>
  );
}
```

`src/components/builder/price-bar.tsx`:

```tsx
"use client";

import { ChevronUp } from "lucide-react";
import Link from "next/link";

import { SummaryPanel } from "@/components/builder/summary-panel";
import { useSetupSummary } from "@/components/builder/use-setup-summary";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { formatCents } from "@/lib/money";
import { useSetupStore } from "@/store/setup-store";

// Sticky bottom bar on small screens; opens the full summary in a drawer.
export function PriceBar() {
  const plan = useSetupStore((state) => state.setup.plan);
  const { totalCents, arrival } = useSetupSummary();
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-white/95 backdrop-blur lg:hidden">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3">
        <Drawer>
          <DrawerTrigger asChild>
            <button
              type="button"
              className="flex flex-1 items-center gap-2 text-left"
              data-testid="price-bar"
            >
              <span>
                <span className="block text-lg leading-tight font-bold tabular-nums">
                  {formatCents(totalCents)}
                  <span className="text-xs font-normal text-muted-foreground">
                    {" "}
                    / {plan === "weekly" ? "week" : "month"}
                  </span>
                </span>
                <span className="text-xs text-muted-foreground">
                  {arrival === "today"
                    ? "Can arrive today"
                    : "Arrives tomorrow"}{" "}
                  · View setup
                </span>
              </span>
              <ChevronUp className="size-4 text-muted-foreground" aria-hidden />
            </button>
          </DrawerTrigger>
          <DrawerContent>
            <div className="mx-auto w-full max-w-md overflow-y-auto px-4 pt-2 pb-6">
              <DrawerTitle className="sr-only">Your setup</DrawerTitle>
              <DrawerDescription className="sr-only">
                Items, plan and total price.
              </DrawerDescription>
              <SummaryPanel />
            </div>
          </DrawerContent>
        </Drawer>
        <Button asChild size="lg">
          <Link href="/checkout">Rent</Link>
        </Button>
      </div>
    </div>
  );
}
```

`src/components/builder/builder.tsx`:

```tsx
"use client";

import { useEffect } from "react";

import { CategoryPicker } from "@/components/builder/category-picker";
import { NoticeToasts } from "@/components/builder/notice-toasts";
import { PostureToggle } from "@/components/builder/posture-toggle";
import { PresetBar } from "@/components/builder/preset-bar";
import { PriceBar } from "@/components/builder/price-bar";
import { SiteHeader } from "@/components/builder/site-header";
import { SummaryPanel } from "@/components/builder/summary-panel";
import { WorkspaceScene } from "@/components/scene/workspace-scene";
import type { CategoryId } from "@/lib/types";
import { useSetupStore } from "@/store/setup-store";

function BuilderSkeleton() {
  return (
    <div
      className="grid animate-pulse gap-4 lg:grid-cols-[340px_minmax(0,1fr)_300px]"
      aria-busy="true"
    >
      <div className="hidden h-96 rounded-xl bg-muted lg:block" />
      <div className="aspect-[8/5] rounded-2xl bg-muted" />
      <div className="hidden h-96 rounded-xl bg-muted lg:block" />
    </div>
  );
}

export function Builder() {
  const hydrated = useSetupStore((state) => state.hydrated);
  const hydrate = useSetupStore((state) => state.hydrate);
  const setup = useSetupStore((state) => state.setup);
  const showCategory = useSetupStore((state) => state.showCategory);
  useEffect(() => {
    void hydrate();
  }, [hydrate]);
  const openCategory = (category: CategoryId): void => {
    showCategory(category);
    document
      .getElementById("picker")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 pb-28 lg:pb-10">
        <div className="pt-5">
          <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
            Design your Bali workspace
          </h1>
          <p className="text-sm text-muted-foreground">
            Pick a preset, swap anything, and rent it. Delivered and set up for
            you.
          </p>
        </div>
        <PresetBar />
        {hydrated ? (
          <div className="grid items-start gap-4 lg:grid-cols-[340px_minmax(0,1fr)_300px]">
            <section
              aria-label="Choose items"
              className="order-2 lg:order-1 lg:max-h-[calc(100dvh-7rem)] lg:overflow-y-auto lg:pr-1"
            >
              <CategoryPicker />
            </section>
            <section
              aria-label="Preview"
              className="order-1 space-y-3 lg:sticky lg:top-4 lg:order-2"
            >
              <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
                <WorkspaceScene setup={setup} onHotspot={openCategory} />
              </div>
              <div className="flex justify-center">
                <PostureToggle />
              </div>
            </section>
            <aside
              aria-label="Summary"
              className="order-3 hidden rounded-2xl border bg-card p-4 shadow-sm lg:sticky lg:top-4 lg:block"
            >
              <SummaryPanel />
            </aside>
          </div>
        ) : (
          <BuilderSkeleton />
        )}
      </main>
      {hydrated ? <PriceBar /> : null}
      <NoticeToasts />
    </div>
  );
}
```

`src/app/checkout/page.tsx`:

```tsx
import Link from "next/link";

// Placeholder until the checkout milestone (Plan 2).
export default function CheckoutPage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-3 px-4 text-center">
      <h1 className="text-2xl font-bold">Checkout is on its way</h1>
      <p className="text-sm text-muted-foreground">
        This build is the clickable preview. Checkout lands in the next
        milestone.
      </p>
      <Link
        href="/"
        className="text-sm font-medium underline underline-offset-4"
      >
        Back to your setup
      </Link>
    </main>
  );
}
```

`src/app/page.tsx`:

```tsx
import { Builder } from "@/components/builder/builder";

export default function HomePage() {
  return <Builder />;
}
```

- [ ] **Step 4: Run the whole E2E suite**

```bash
lsof -i :3000 || true
pnpm build && pnpm test:e2e
```

Expected: `21 passed, 1 skipped` (the mobile-only test is skipped on desktop). If axe reports `color-contrast`, list the offending nodes with a temporary spec that logs `violation.nodes[].target` and fix the colour tokens, not the test.

- [ ] **Step 5: Look at the result**

Capture screenshots for the review (not committed):

```bash
mkdir -p /tmp/monis-shots && cat > e2e/tmp-shots.spec.ts <<'EOF'
import { expect, test } from "@playwright/test";

test("shots", async ({ page }, info) => {
  await page.goto("/");
  await expect(page.getByTestId("workspace-scene")).toBeVisible();
  await page.waitForTimeout(800);
  await page.screenshot({ path: `/tmp/monis-shots/${info.project.name}-home.png`, fullPage: true });
});
EOF
pnpm test:e2e e2e/tmp-shots.spec.ts; rm e2e/tmp-shots.spec.ts
```

Open the PNGs and check: scene centred, chair not hiding the laptop, tabs fit the 340 px column on desktop, price bar pinned on mobile.

- [ ] **Step 6: Gate and commit**

```bash
pnpm lint && pnpm type-check && pnpm format:check && pnpm test
```

```bash
git add src/components/builder src/app e2e
git commit -F - <<'EOF'
feat: add the builder UI with presets, picker, summary and share links

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```

---
### Task 12: Milestone-3 record, PR C and the owner's UX review

**Files:**
- Create: `docs/qa/2026-10-11-milestone-3.md`
- Modify: `docs/product/brief.md` (must-have status), `README.md` (status line)

- [ ] **Step 1: Record the QA round**

Run `pnpm build && pnpm test:e2e` once more and write the result. Use the real commit SHA from `git rev-parse --short HEAD`:

````markdown
# Milestone 3 — clickable build — 2026-10-11

- **Build:** <short SHA> on local production build (`pnpm build && pnpm start`)
- **Command:** `pnpm test:e2e`

## Results

| Scenario (spec › test)                                     | Desktop | Mobile  | Evidence          |
| ---------------------------------------------------------- | ------- | ------- | ----------------- |
| smoke › home page loads                                    | Pass    | Pass    | Playwright report |
| scene › the scene draws the default desk and chair         | Pass    | Pass    | Playwright report |
| builder › first visit shows the Essentials setup           | Pass    | Pass    | Playwright report |
| builder › swapping desk and chair updates scene and summary | Pass    | Pass    | Playwright report |
| builder › a full desk offers an upgrade (third screen)     | Pass    | Pass    | Playwright report |
| builder › the plan toggle switches totals and savings      | Pass    | Pass    | Playwright report |
| builder › standing raises the desk                         | Pass    | Pass    | Playwright report |
| builder › a shared link rebuilds the same setup            | Pass    | Pass    | Playwright report |
| builder › the setup survives a reload                      | Pass    | Pass    | Playwright report |
| builder › mobile sticky price bar opens the summary        | n/a     | Pass    | Playwright report |
| builder › no serious accessibility violations (axe)        | Pass    | Pass    | Playwright report |

## Findings

None open.

## Notes

UX (spec §7) is provisional; the owner reviews it on the PR's Vercel preview before Plan 2.
````

- [ ] **Step 2: Update the must-have status and README**

In `docs/product/brief.md`, set the Status column to: M1 `Done`, M2 `Done`, M3 `Done`, M4 `Done`, M5 `Partial (summary panel; checkout in Plan 2)`, M6 `Done` (production URL from Task 3), M7 `Planned`.

In `README.md`, replace the status quote with:

```markdown
> **Status:** clickable build in review. Live: <production URL>. The full write-up (approach, tech choices, what we would improve) lands with the checkout milestone.
```

```bash
pnpm format && pnpm format:check
```

```bash
git add docs README.md
git commit -F - <<'EOF'
docs: record milestone 3 QA round and must-have status

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```

- [ ] **Step 3: Push, open PR C and wait for CI**

```bash
git push -u origin feat/builder-rough
gh pr create --base main --title "feat: clickable workspace builder (milestone 3)" --body "$(cat <<'EOF'
Milestone 3 of the workspace builder (spec §14): the first clickable build, for UX review.

- SVG scene (1 unit = 1 cm) with sit/stand animation and "+" hotspots
- Presets mirroring monis.rent bundles, category picker with price deltas, summary with Weekly/Monthly, arrival and share link
- Mobile sticky price bar with a summary drawer
- E2E: 21 tests on desktop and mobile, including axe

UX (spec §7) is provisional — please review on the Vercel preview before Plan 2.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
gh pr checks --watch
```

Expected: CI `pass` and a Vercel preview comment on the PR.

- [ ] **Step 4: Check the preview**

```bash
PREVIEW=<preview URL from the PR>
curl -sI "$PREVIEW" | head -1
BASE_URL="$PREVIEW" pnpm test:e2e
```

Expected: `HTTP/2 200` and `21 passed, 1 skipped`. (If the preview is protected by Vercel Authentication, ask the owner to disable "Vercel Authentication" for previews under Project → Settings → Deployment Protection, or run this step against production after merge.)

- [ ] **Step 5: Stop for the owner's UX review**

Send the owner the preview URL and the screenshots from Task 11 Step 5, and ask them to review spec §7 on it. Do **not** merge PR C or start Plan 2 until they answer. Their feedback becomes the input for Plan 2 (milestones 4–8).

---

## Changes made during execution

Recorded after execution on 2026-10-11, so the plan matches what shipped.

- **Scaffold review fixes** (Task 3, commit "fix: address scaffold review findings"): exact versions for the shadcn-added dependencies; `npx only-allow@1.2.2`; the Inter variable renamed to `--font-inter` (the theme had `--font-sans: var(--font-sans)`); a read-only `GITHUB_TOKEN` in CI; an empty `BASE_URL` treated as unset; `.claude/settings.local.json` ignored; the README states that MIT does not cover monis.rent data.
- **Owner review on localhost** (between Tasks 11 and 12), see `docs/qa/2026-10-11-milestone-3.md`:
  - Catalog search: `src/lib/search.ts` (+ tests), store `search` / `setSearch` (cleared by `showCategory`), `src/components/builder/catalog-search.tsx`, the shadcn `input` component, and search mode in `category-picker.tsx`.
  - App-shell layout: the page never scrolls; only the item list and the summary list scroll. Mobile-first sizing, sit/stand floats over the scene, larger touch targets. New `e2e/layout.spec.ts` checks seven viewport sizes.
  - Playwright serves the production build on port 3100 so `pnpm dev` can keep port 3000.
- **Totals after execution:** 96 unit tests; 25 E2E passes and 3 by-design skips.
