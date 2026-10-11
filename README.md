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
