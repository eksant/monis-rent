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
