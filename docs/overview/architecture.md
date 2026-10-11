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

## Layout

- App shell: `h-dvh` with the header and preset bar on top; the page itself never scrolls. Only the item list and the summary list have their own scroll areas.
- Below `lg`: scene on top (8:5, at most 34% of the screen height), picker below, price bar pinned to the bottom with the summary in a drawer. From `lg`: picker | scene | summary.
- The scene box uses CSS container units (`w-[min(100cqw,160cqh)]`) so it keeps its ratio inside any space, and the "+" hotspot overlay stays aligned.

## Scene

- One SVG `viewBox` of 400 × 250 where 1 unit = 1 cm, so desk widths are true to scale.
- The scene is laid out at sitting height; standing lifts the desk group with a CSS transform so the change animates (and is instant with reduced motion).
- Monitors are centred on the desk with the largest one in the middle. When a row is wider than the desk, side screens are drawn narrower, as if angled.
- The "+" hotspots are real HTML buttons positioned over the SVG, which itself is a single `role="img"` with a text summary.
