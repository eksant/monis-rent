# Workspace Builder for monis.rent: Design

- **Date:** 2026-10-11
- **Status:** Approved. Section 7 (UX and flows) was reviewed by the owner on the first clickable build (localhost, 2026-10-11) and updated with the outcome.
- **Context:** Desent Solutions developer challenge, built for their client monis.rent.

## 1. Context

monis.rent rents office equipment (desks, chairs, monitors, accessories and more) to digital nomads and startups in Bali, priced per week or per month. Desent asked for an **interactive tool where people design their dream workspace and then rent it**. It should feel visual and fun rather than like a product catalog: pick a desk, choose a chair, add monitors, a lamp and a plant, watch the setup come to life, then press "Rent".

The persona from the brief: a freelance developer who has just landed in Bali and needs a workspace by next week.

### Must-haves (from the brief)

| # | Requirement | Where this design covers it |
|---|---|---|
| M1 | Select a desk from at least 2 options | 3 real desks (§8.2) |
| M2 | Select a chair from at least 2 options | 1 real chair and 2 concept chairs (§8.2, §15) |
| M3 | Add accessories (monitors, lamps, plants, etc.) | Screens, Accessories and Bali extras tabs (§7, §8.2) |
| M4 | Preview updates visually as items are added or changed | SVG scene (§6.3) |
| M5 | Summary or checkout view of the selected setup | Summary panel, `/checkout`, `/checkout/success` (§7) |
| M6 | Deployed and reachable through a public URL | Vercel (§13.4) |
| M7 | Code on GitHub with `desent-bot` as a collaborator (Read) | `eksant/monis-rent` (§14) |

### Submission checklist

- Live URL that can be opened and used immediately, with no explanation needed.
- GitHub repository with `desent-bot` added as a Read collaborator.
- Short write-up in `README.md`: approach, tech choices, and what we would improve with more time.

### Constraints

- **Required:** Next.js, Tailwind CSS, Vercel. Everything else is our choice.
- **Time budget:** 4–8 hours. The brief prefers a polished MVP over a half-finished masterpiece.
- **What is judged:** user-centric thinking and a fun experience, more than code complexity. Reviewers will also read the code.

## 2. Goals and non-goals

### Goals

1. A first-time visitor sees a good-looking setup within a second and understands what to do without instructions.
2. Every change answers the user's three questions at once: **what am I getting, what does it cost, when does it arrive.**
3. It works well on a phone, where a nomad is most likely to open it.
4. A setup can be shared through a link, so a startup can decide as a team.
5. The code is small, typed, tested and easy to review.

### Non-goals

- Accounts, login, real payments or a real order backend.
- Free drag-and-drop placement. Items snap to slots so the scene always looks tidy.
- 3D rendering.
- More than one UI language. UI copy is English.
- Live catalog sync with monis.rent. We use a snapshot (§8).
- A real LLM. Smart setup is rule-based behind an interface an LLM can implement later (§10).

## 3. Users and key insights

- **They know their work, not their gear.** "I edit video" is easy to say; "I need a 4K grading monitor and a light bar" is not. Smart setup (§10) translates one into the other.
- **An empty desk is a burden.** Start from a sensible setup and let people edit it. Presets mirror the real monis.rent bundles.
- **Price and arrival must always be visible.** A sticky price bar shows the total for the chosen plan and when the setup can arrive.
- **Bali has real workspace pains:** unreliable internet, humidity and heat, and long days at a desk. The monis.rent catalog already has answers (Starlink, Wi-Fi 6 router, dehumidifier, air purifier, tower fan, walking pad, Nespresso). A "Bali extras" tab surfaces them, standing in for the sketch's lower zones (Coffee Station, Relax Zone, and so on).
- **Phone first.** Preview on top, item picker below, price bar pinned to the bottom.
- **Teams decide together.** "Share setup" copies a link that rebuilds the same setup.

## 4. Research: facts from monis.rent

Collected on 2026-10-11 from `www.monis.rent`. The page data embedded in the site holds `weekly_price`, `monthly_price` and `sale` per product.

- **Stack:** Next.js frontend with a Strapi CMS (`api.monis.rent`, images on `strapi.monis.rent`).
- **Pricing:**
  - Weekly or Monthly plans; monthly is advertised as "Save ~33%".
  - Prices are in USD. `sale` is a discount percentage applied to the list price. For example, the desk lamp at $4 with `sale` 20 shows as $3.20, which matches the site's "from $3/week".
- **Ordering:**
  - Pay upfront by card. The delivery fee is calculated at checkout from location and weight.
  - Rental starts when the items arrive.
  - A deposit applies only to large orders, and setup service is an optional add-on.
  - Items can be swapped, added or returned early, and notifications go out on WhatsApp.
  - Cancelling before delivery costs a 15% processing fee.
- **Delivery:**
  - Next-day delivery is standard. Products flagged `enable_instant` can arrive the same day.
  - Self pickup is available.
- **Catalog gaps:**
  - **Only one chair** (Ergonomic Office Chair) is listed, and **no plants**.
  - Desks: three models, all height-adjustable.
- **Bundles** (each shown with a "-20%" badge):
  - *Essentials:* Electrical Adjustable Desk, Ergonomic Office Chair, Smart Power Strip 3.
  - *Founders Setup:* Electrical Adjustable Desk, Ergonomic Office Chair, 27" 4K Multimedia Monitor, Ergonomic Laptop Stand, Logitech MX Keyboard, Logitech MX Master Mouse S3, Mouse Pad, Smart Power Strip 3, Monitor Light Bar.
  - *Trading Setup:* Electrical Adjustable Desk, Ergonomic Office Chair, 34" 4K Gaming Monitor, Logitech MX Keyboard, Logitech MX Master Mouse S3, Mouse Pad, Smart LED Desk Lamp 1S, Smart Power Strip 6, Extension Cable.
  - *Studio Setup:* Electrical Adjustable Desk, Ergonomic Office Chair, 27" 5K Apple Studio Display, Apple Magic Keyboard, Apple Magic Mouse, Mouse Pad, Smart Power Strip 6, Smart LED Desk Lamp 1S.
- **Brand:**
  - Inter font, light theme.
  - Accent blue `#63aefd`, cream `#F9F2EA`, dark navy `#15252e`.
  - Clean product photos on white backgrounds.

## 5. Decisions

| # | Decision | Why |
|---|---|---|
| D1 | **Preview is a layered 2D illustration** (inline SVG, front view), not isometric and not 3D | Most controllable and polished within the time budget, and light on phones. Saved time goes into UX. |
| D2 | **Smart setup is rule-based, honestly named, and swappable for an LLM** | No API key, no cost, no abuse risk. Works for any input reviewers type. The interface is ready for an LLM later. |
| D3 | **No database or backend** | Static catalog snapshot, state in the browser, URL for sharing, localStorage for persistence. A database adds failure points without adding judged value. |
| D4 | **Vercel** through Git integration | Required by the brief. Every PR gets a preview URL. |
| D5 | **shadcn/ui** for UI primitives, themed to the monis brand | Accessible, consistent primitives. The custom SVG scene stays our own. |
| D6 | **Strict tooling:** pnpm only, strict ESLint, Prettier, Vitest and Playwright, CI on every PR | House standard. Keeps quality visible to reviewers. |
| D7 | **Real catalog first; gaps filled with clearly labelled "Concept" items** | M2 needs at least 2 chairs and the brief mentions plants. Labelling keeps us honest with a real client's brand. |
| D8 | **"Rent" ends on a success page that says it is a concept demo** | No real order is placed, so nobody should think they rented something. Each item links to its real monis.rent page. |
| D9 | **English** for all code, file names, comments (max 2 lines each), docs, commits and UI | House rule. Chat with the owner stays Indonesian. |
| D10 | **Presets mirror the real bundles, without the bundle discount** | Faithful to the client. Discount rules are unknown, so this is listed as future work. |

## 6. Architecture

### 6.1 Stack

- **Next.js** (latest stable, App Router) with **TypeScript** in strict mode.
- **Tailwind CSS** and **shadcn/ui**: Tabs, ToggleGroup, Drawer, Card, Badge, Button, Input, Select, Calendar and Popover, Form, Tooltip, Sonner.
- **CSS animations** (keyframes and transitions) plus a tiny `requestAnimationFrame` hook for counting totals. The Motion library turned out unnecessary.
- **Zustand** with the `persist` middleware for setup state.
- **react-hook-form** and **zod** for the checkout form, with native `<select>` and `<input type="date">` (best on phones).
- **Vitest** for unit tests, **Playwright** with `@axe-core/playwright` for end-to-end and accessibility tests.

Rendering is fully static. All logic runs in the browser and nothing needs server secrets.

### 6.2 Module layout

```
src/
  app/
    layout.tsx                 # fonts, theme, Toaster
    page.tsx                   # builder
    checkout/page.tsx          # summary and form
    checkout/success/page.tsx  # confirmation (concept demo)
  data/
    catalog.ts                 # CatalogItem[] snapshot and concept items
    presets.ts                 # Essentials, Founders, Trading, Studio
  lib/
    types.ts                   # shared types (CatalogItem, Setup, Notice, …)
    money.ts                   # cents helpers and USD formatting
    pricing.ts                 # effective price, totals, monthly savings, arrival
    setup.ts                   # Setup model and slot rules (pure)
    share.ts                   # Setup <-> URL search params
    scene-layout.ts            # layoutScene(setup): desk, monitor and hotspot positions (pure)
    suggest.ts                 # suggestSetup(text, current) -> Suggestion (pure, rule-based)
  store/
    setup-store.ts             # Zustand store: thin wrapper over lib/setup, one-step undo
  components/
    ui/                        # shadcn primitives
    scene/                     # SVG scene: Room, Desk, Chair, Monitor, Lamp, Plant, extras
    builder/                   # PresetChips, SmartSetup, CategoryTabs, ItemCard, SummaryPanel, PriceBar
    checkout/                  # OrderSummary, CheckoutForm
e2e/                           # Playwright specs
```

**Boundary rule:**
- `lib/` and `data/` are pure TypeScript with no React, so they can be unit-tested directly.
- Components read state from the store and call store actions.
- The store calls `lib/` functions and holds no business rules of its own.

### 6.3 The scene

- **Coordinate system:** one SVG `viewBox` where **1 unit = 1 cm**, so a 120 cm desk is visibly narrower than a 160 cm desk.
- **Layers, from back to front:**
  1. Room: wall, window with a Bali view, floor.
  2. Floor items: purifier, fan, dehumidifier.
  3. Desk.
  4. Under-desk items: walking pad, power strip.
  5. Desk-top items: monitors, lamp, laptop, keyboard, mouse, accessories.
  6. Chair.
  7. Ambient items: plants, Hue lamp.
- **Layout:**
  - A pure function `layoutScene(setup)` returns the position of each item from its slot.
  - Monitors spread evenly across the desk width, centred, with ultrawides taking 2 slots.
- **Posture:** "Sit / Stand" animates the desk height (sit about 74 cm, stand about 110 cm). Desk-top items move with the desk, and the chair slides aside when standing.
- **Your laptop:** a non-rentable laptop is drawn on the desk to show the user's own machine. It is hidden when a computer (Mac mini) is in the setup.
- **Art:**
  - Flat style with rounded corners, a limited palette from the brand tokens, and a consistent stroke.
  - Parametric components (`<Monitor size curved bezel />`, `<Desk width variant />`) keep the item count manageable.
  - Minor items (cables, power strips, mouse pad) use simple shapes.
- **Accessibility:** the scene is `role="img"` with an `aria-label` that summarises the setup.
- **Motion:**
  - Items enter with a spring drop, swaps cross-fade, and price numbers tween.
  - With `prefers-reduced-motion`, everything switches instantly.

## 7. UX and flows

> Reviewed with the owner on the clickable build (milestone 3, 2026-10-11). Outcome: catalog search, an app-shell layout where the page never scrolls, mobile-first sizing, and a two-position close-up view (planned for milestone 4).

### 7.1 Layout principles

- **App shell:** the header stays in place and the page itself never scrolls, on any screen from 375×667 up. Only the item list and the summary's item list scroll.
- **Mobile first:** below `lg` (1024 px) the scene sits on top, the picker fills the rest, and a price bar is pinned to the bottom. From `lg` the layout has three columns.
- **Touch targets** are at least 32 px (36 px for steppers, 44 px for Rent).

### 7.2 Builder (`/`) on desktop (≥ 1024 px)

The sketches show the Founders preset.

```
┌ monis.rent │ Design your Bali workspace ────────────────── [Share setup] ┐
│ [Essentials] [Founders] [Trading] [Studio] [Start empty]                 │
├──────────────────┬───────────────────────────────┬──────────────────────┤
│ 🔍 Search …   /  │   window: Bali view            │ Your setup           │
│ Desk Chair …     │   monitors · lamp · plant      │ · items (×)  ↕ scroll │
│ item cards       │   ═══════ desk ═══════         │──────────────────────│
│   ↕ scroll       │        chair      [Sit|Stand]  │ [Weekly|Monthly]     │
│                  │                                │ $47.45 / week        │
│                  │                                │ Arrives tomorrow     │
│                  │                                │ [ Rent this setup ]  │
└──────────────────┴───────────────────────────────┴──────────────────────┘
```

Column widths: 300 / flexible / 260 px at `lg`, 340 / flexible / 300 px at `xl`. The scene keeps its 8:5 ratio and fits the space it gets.

### 7.3 Builder on phones and tablets (< 1024 px)

```
monis.rent  Design your Bali workspace   [⇪]
[Essentials][Founders][Trading]…  (scroll-x)
┌ SCENE (8:5, ≤ 34% of the screen height) ┐
│                         [Sit|Stand]     │
└─────────────────────────────────────────┘
🔍 Search desks, screens, gear…
[Desk][Chair][Screens][Accessories][Bali]
item cards (1 column; 2 on tablets)  ↕ scroll
▬ $47.45 / week · 9 items · Arrives tomorrow ⌃   [Rent]   ← pinned; tap opens the summary drawer
```

### 7.4 Interactions

- **Search** sits above the tabs and searches every category: prefix matches on names, benefits, tags and groups, a few synonyms (screen/display/monitor, wifi/internet, light/lamp, computer/mac, coffee/espresso) and plurals. Whole-word and name matches rank first. Results replace the tabs, grouped by category, with a count. No results shows suggestion chips. `/` focuses the search on desktop; Esc, the × button or opening a category clears it.
- **Close-up view (milestone 4):** a two-position toggle switches the scene between the whole room and a close-up of the desk, with a smooth transition. Tapping an item in the scene opens its category and switches to the close-up. In the close-up, dragging (mouse or touch) pans around the scene within its edges; a drag never counts as a tap. There is no free zoom.
- **Tapping an item in the scene** (desk, screens, chair, plants, shelves, climate gear) opens its tab, scrolls the list to its card and flashes it. Desk-level items also switch to the close-up.
- **(+) hotspots** sit on empty slots: monitor slots, desk lamp, plant.
- **Tapping an item card** toggles it: add, or remove when already added. In a slot with capacity 1 it swaps. Multi-unit items (monitors, plants) show a − / + stepper.
- **When a limit is reached**, a friendly notice with an action appears. Example: "Your 120 cm desk has no room for another screen. **Upgrade to the 160 cm desk**" (switches the desk and adds the screen).
- **Item cards show:**
  - the monis.rent photo and the name;
  - one benefit line;
  - the effective price for the plan, and the price change as a delta ("+$4.90", or "−$2.00" when swapping);
  - badges: sale % (e.g. −30%), "Same-day", "Concept";
  - a "View on monis.rent" link for real items.
- **Summary and price bar:**
  - Items grouped like the tabs; each group folds, shows its count and subtotal, and lists items with dots.
  - Removing a line (×) removes all of its units and offers **Undo** in a toast; there is no confirmation modal. Switching preset or starting empty from a custom setup also offers Undo.
  - Weekly / Monthly toggle and the total for the chosen plan.
  - When it is positive, the hint "Monthly saves $X vs 4.3 weeks".
  - Arrival line ("Can arrive today" / "Arrives tomorrow") and "Delivery fee calculated at checkout".
- **Share** copies the setup URL and shows a toast.

### 7.5 Smart setup

1. A **"Describe your work"** chip, first in the preset row, opens a sheet. The user types a sentence or taps an example chip, e.g. "Full-stack dev, 6 weeks, $50/wk", "Lots of calls, bad wifi", "Video editor in Canggu, 2 months".
2. A short staged message runs (about 0.8 s, instant with reduced motion): "Reading your brief… Picking a desk… Fitting screens and extras…".
3. The sheet closes and the new items drop into the scene.
4. A toast titled **"Here's your setup"** lists 2–4 reasons that describe the final setup, for example "Webcam and headset for clear calls." If the budget forced items out, it says so ("Left out the … to stay on budget.").
5. The toast's **Undo** restores the previous setup (one step).

Unrecognised input falls back to Essentials with a friendly note. It never dead-ends.

### 7.6 Checkout (`/checkout`)

- **Order summary:**
  - Items grouped like the builder tabs (foldable), plan toggle, total, and savings hint.
  - An "Edit setup" link back to the builder, with state kept.
- **Form** (react-hook-form and zod, shadcn components):
  - Full name and email, both required.
  - WhatsApp, optional: a searchable country-code picker (Indonesia first, then the countries most nomads come from) plus the national number; stored as "+62 812…" with the local leading 0 dropped.
  - Delivery area: a searchable list of about 45 Bali areas grouped by region (Canggu & the west coast, Seminyak & Kuta, Bukit, Denpasar & Sanur, Ubud & Gianyar, Tabanan, East, North, Islands, Other).
  - Delivery date: a calendar in a popover; the earliest day is today when the setup can arrive today, otherwise tomorrow (Bali time), up to 180 days ahead.
  - Address or villa notes.
- **Notes shown:**
  - "Delivery fee is calculated by monis.rent based on your location."
  - "No payment is taken: this is a concept demo."
- **Missing or invalid stored setup:** redirect to `/`.

### 7.7 Success (`/checkout/success`)

- A small celebration animation, a reference such as `MR-7K2Q`, and the order summary.
- **"What happens next"**, following monis.rent's real flow: confirmation, delivery on the chosen date, the rental starts on arrival, swap or return any time.
- A prominent **"Concept demo — no order was placed"** banner.
- Actions: Share setup, Start a new setup, Browse monis.rent.

## 8. Data model and catalog

### 8.1 Types

```ts
type CategoryId = "desk" | "chair" | "screen" | "accessory" | "extra";
type SlotId =
  | "desk" | "chair" | "monitor" | "monitorStand" | "lightBar" | "deskLamp" | "ambientLamp"
  | "keyboard" | "mouse" | "mousePad" | "laptopStand" | "webcam" | "headphones" | "mic"
  | "computer" | "dock" | "power" | "cable" | "plant"
  | "internet" | "dehumidifier" | "purifier" | "fan" | "coffee" | "underDesk";

// Which scene component draws an item; a discriminated union so each kind carries typed parameters.
type ArtSpec =
  | { kind: "desk"; variant: "electric" | "mechanical" | "dualMotor" }
  | { kind: "chair"; variant: "ergo" | "basic" | "premium" }
  | { kind: "monitor"; inches: number; ultrawide: boolean; tone: "dark" | "silver" }
  | { kind: "keyboard" | "mouse"; tone: "dark" | "silver" }
  | { kind: "plant"; variant: "monstera" | "snake" }
  | { kind: "deskLamp" | "hueLamp" | "lightBar" | /* …one kind per remaining item */ "walkingPad" };

interface CatalogItem {
  id: string;              // stable short id used in URLs, e.g. "desk-electric"
  slug?: string;           // monis.rent product slug; absent for concept items
  name: string;
  category: CategoryId;
  group?: string;          // sub-heading inside Accessories, e.g. "Lighting"
  slot: SlotId;
  slotSize: number;        // units taken in the slot; 34" ultrawide = 2
  maxQty: number;
  requires?: SlotId;       // e.g. light bar requires a monitor
  weeklyCents: number;     // list price
  monthlyCents: number;
  salePercent: number;     // 0 when none
  instant: boolean;        // same-day eligible on monis.rent
  concept: boolean;
  imageUrl?: string;       // absolute strapi.monis.rent URL; concept items use scene art
  benefit: string;         // one human sentence
  widthCm?: number;        // desks only
  art: ArtSpec;            // which scene component draws it, with parameters
  tags: string[];          // keywords for suggestSetup
}

interface Setup {
  deskId: string;                 // always set
  chairId: string | null;         // null = "I have my own"
  items: Record<string, number>;  // other items: id -> qty
  plan: "weekly" | "monthly";
  posture: "sit" | "stand";
}

interface Preset {
  id: "essentials" | "founders" | "trading" | "studio";
  name: string;
  tagline: string;
  setup: Setup;
}
```

### 8.2 Catalog snapshot

Prices are list prices in USD. "Eff." is after `sale`, which is assumed to apply to both plans (§15). Images come from `https://strapi.monis.rent/uploads/…`; full URLs live in `catalog.ts`.

**Desks** (`slot: desk`, required, capacity 1)

| id | Name | slug | wk | mo | sale | Eff. wk / mo | instant | width |
|---|---|---|---|---|---|---|---|---|
| desk-electric | Electrical Adjustable Desk | electrical-adjustable-desk | 7 | 20 | 30 | 4.90 / 14.00 | no | 120 (assumed) |
| desk-mechanical | Mechanical Adjustable Desk | adjustable-wooden-desk | 13 | 36 | 0 | 13.00 / 36.00 | no | 140 (assumed) |
| desk-dual-motor | Dual-Motor Electric Standing Desk | dual-motor-electric-standing-desk | 16 | 36 | 0 | 16.00 / 36.00 | no | 160 (largest variant) |

**Chairs** (`slot: chair`, capacity 1, may be empty)

| id | Name | slug | wk | mo | sale | Eff. wk / mo | instant | concept |
|---|---|---|---|---|---|---|---|---|
| chair-ergo | Ergonomic Office Chair | ergonomic-office-chair | 9 | 24 | 30 | 6.30 / 16.80 | no | no |
| chair-basic | Basic Task Chair | none | 5 | 14 | 0 | 5.00 / 14.00 | no | **yes** (indicative price) |
| chair-premium | Premium Ergo Chair | none | 15 | 40 | 0 | 15.00 / 40.00 | no | **yes** (indicative price) |

**Screens** (`slot: monitor`, capacity from desk width, `maxQty` 3)

| id | Name | slug | wk | mo | sale | Eff. wk | instant | slotSize |
|---|---|---|---|---|---|---|---|---|
| mon-24-1c | 24" Full HD Office Monitor 1C | full-hd-office-24 | 7 | 20 | 20 | 5.60 | yes | 1 |
| mon-27-a27i | 27" Full HD Office Monitor A27i | 27-work-monitor-a27i | 10 | 32 | 0 | 10.00 | yes | 1 |
| mon-27-4k | 27" 4K Multimedia Monitor | 27-4-k-multimedia-monitor | 21 | 52 | 25 | 15.75 | yes | 1 |
| mon-27-4k-grading | 27" 4K+ Grading Monitor | 4k-grading-monitor-27 | 24 | 72 | 0 | 24.00 | yes | 1 |
| mon-32-qhd | 32" QHD Ergonomic Monitor | 32-4-k-ergonomic-monitor | 26 | 76 | 20 | 20.80 | yes | 1 |
| mon-34-gaming | 34" 4K Gaming Monitor | 34-4-k-curved-monitor-180-hz | 23 | 76 | 20 | 18.40 | yes | 2 |
| mon-34-curved | 34" 4K Curved Monitor | 4-k-ultra-wide-34 | 23 | 76 | 0 | 23.00 | yes | 2 |
| mon-studio | 27" 5K Apple Studio Display | apple-studio-display | 99 | 300 | 0 | 99.00 | no | 1 |

**Accessories** (each slot capacity 1 unless noted)

| id | Name | slug | group | slot | wk | mo | sale | Eff. wk | instant |
|---|---|---|---|---|---|---|---|---|---|
| lamp-led | Smart LED Desk Lamp 1S | smart-led-desk-lamp-1-s | Lighting | deskLamp | 4 | 12 | 20 | 3.20 | yes |
| lamp-hue | Hue Signe Gradient Lamp | hue-signe-gradient-lamp | Lighting | ambientLamp | 12 | 32 | 0 | 12.00 | yes |
| light-bar | Monitor Light Bar | metal-monitor-light-bar | Lighting | lightBar (requires monitor) | 5 | 12 | 0 | 5.00 | yes |
| kb-mx | Logitech MX Keyboard | logitech-mx-keyboard | Keyboard & mouse | keyboard | 7 | 28 | 20 | 5.60 | yes |
| kb-magic | Apple Magic Keyboard | apple-magic-keyboard | Keyboard & mouse | keyboard | 12 | 32 | 0 | 12.00 | yes |
| mouse-mx | Logitech MX Master Mouse S3 | logitech-mx-master-mouse-s3 | Keyboard & mouse | mouse | 5 | 12 | 20 | 4.00 | yes |
| mouse-silent | Logitech M331 Silent Mouse | logitech-mx-mouse | Keyboard & mouse | mouse | 2.5 | 6 | 20 | 2.00 | yes |
| mouse-magic | Apple Magic Mouse | apple-magic-mouse | Keyboard & mouse | mouse | 9 | 24 | 0 | 9.00 | yes |
| mouse-pad | Mouse Pad | mouse-pad | Keyboard & mouse | mousePad | 2 | 4 | 0 | 2.00 | yes |
| laptop-stand | Ergonomic Laptop Stand | ergonomic-laptop-stand | Ergonomics | laptopStand | 3 | 8 | 20 | 2.40 | yes |
| monitor-stand | Adjustable Monitor Stand | adjustable-monitor-stand | Ergonomics | monitorStand (requires monitor) | 3 | 8 | 0 | 3.00 | yes |
| webcam | Logitech 4K Webcam | logitech-4-k-webcam | Calls & creator | webcam | 9 | 24 | 0 | 9.00 | yes |
| headphones | Wireless Headphones | logitech-wireless-headphones | Calls & creator | headphones | 7 | 16 | 0 | 7.00 | yes |
| mic-kit | Podcast Microphone Kit | podcast-microphone-kit | Calls & creator | mic | 18 | 48 | 0 | 18.00 | yes |
| mac-mini | Apple Mac Mini M4 | apple-mac-mini-m4 | Computer | computer | 39 | 116 | 30 | 27.30 | yes |
| dock | Display Docking Station | display-docking-station | Power & cables | dock | 8 | 18 | 0 | 8.00 | yes |
| power-strip-3 | Smart Power Strip 3 | international-power-strip | Power & cables | power | 1.5 | 4 | 0 | 1.50 | yes |
| power-strip-6 | Smart Power Strip 6 | smart-power-strip-6 | Power & cables | power | 3 | 8 | 0 | 3.00 | yes |
| extension-cable | Extension Cable | extension-cable | Power & cables | cable | 0.8 | 3.2 | 0 | 0.80 | yes |
| plant-monstera | Monstera Plant | none | Decor | plant (capacity 2) | 2 | 6 | 0 | 2.00 | no, **concept** |
| plant-snake | Snake Plant | none | Decor | plant (capacity 2) | 1.5 | 4 | 0 | 1.50 | no, **concept** |

**Bali extras** (`category: extra`)

| id | Name | slug | slot | wk | mo | sale | Eff. wk | instant | Pain it solves |
|---|---|---|---|---|---|---|---|---|---|
| starlink | Starlink Kit (incl. plan) | starlink-kit-incl-plan | internet | 68 | 236 | 20 | 54.40 | yes | No reliable internet at the villa |
| router | Dual-Band Wi-Fi 6 Router | wi-fi-6-router-5-g | internet | 12 | 28 | 0 | 12.00 | yes | Weak villa Wi-Fi |
| dehumidifier | Smart Dehumidifier Lite | smart-dehumidifier-lite | dehumidifier | 9 | 24 | 0 | 9.00 | no | Humidity, damp gear |
| purifier | Smart Air Purifier | smart-air-purifier | purifier | 11 | 28 | 0 | 11.00 | yes | Dust and burning-season smoke |
| tower-fan | Smart Tower Fan | smart-tower-fan | fan | 8 | 20 | 0 | 8.00 | yes | Heat |
| nespresso | Nespresso Essenza Coffee Machine | nespresso-essenza-coffee-machine | coffee | 12 | 28 | 20 | 9.60 | yes | Coffee without leaving the desk |
| walking-pad | Foldable Walking Pad R2 Pro | foldable-walk-pad | underDesk | 28 | 72 | 20 | 22.40 | no | Long days sitting |

`starlink` and `router` share the `internet` slot because the Starlink kit already includes a Wi-Fi 6 router.

### 8.3 Presets (mirroring the monis.rent bundles)

| Preset | Items | Eff. weekly | Eff. monthly |
|---|---|---|---|
| Essentials (default) | desk-electric, chair-ergo, power-strip-3 | $12.70 | $34.80 |
| Founders | desk-electric, chair-ergo, mon-27-4k, laptop-stand, kb-mx, mouse-mx, mouse-pad, power-strip-3, light-bar | $47.45 | $128.20 |
| Trading | desk-electric, chair-ergo, mon-34-gaming, kb-mx, mouse-mx, mouse-pad, lamp-led, power-strip-6, extension-cable | $48.20 | $148.40 |
| Studio | desk-electric, chair-ergo, mon-studio, kb-magic, mouse-magic, mouse-pad, power-strip-6, lamp-led | $139.40 | $408.40 |

All presets start with `plan: weekly` and `posture: sit`. "Start empty" keeps `desk-electric`, sets the chair to `null` and clears the items.

## 9. Rules

### 9.1 Setup rules (`lib/setup.ts`, pure)

Every mutation returns `{ setup, notice? }`. A notice is a short user-facing message, optionally with an action `{ label, deskId, addItemId? }`: the "Upgrade desk" action switches the desk and then retries adding the item that did not fit.

**Capacity**
- **Desk:** exactly one. It can be swapped but never removed.
- **Chair:** zero or one.
- **Monitor capacity:** desks narrower than 160 cm hold **2 units**, 160 cm desks hold **3 units**. Each monitor uses its `slotSize`.
- **Other slots:** capacity 1, except `plant`, which holds 2.
- **`maxQty`:** caps the quantity of one item id.

**Adding**
- **Adding to a full slot of capacity 1** swaps the existing item.
- **Adding a monitor beyond capacity** is rejected with a notice. If a wider desk exists, the notice offers "Upgrade to the 160 cm desk".

**Requirements**
- Adding an item whose `requires` slot is empty is rejected with a notice, e.g. "The light bar mounts on a monitor. Add a monitor first."
- **Removing the last monitor** also removes the light bar and monitor stand, with a notice.

**Desk changes**
- **Switching to a narrower desk** that overflows the monitors removes the cheapest monitors until they fit, with a notice ("Removed 1 monitor: the new desk fits 2").

**Posture**
- **Adding the walking pad** sets `posture: stand`, with a notice.
- **Choosing Sit with a walking pad** keeps the pad and shows the hint "The walking pad is used while standing".

### 9.2 Pricing (`lib/pricing.ts`, pure, integer cents)

```
effective(item, plan) = round(listCents(plan) × (100 − salePercent) / 100)
total(setup)          = Σ qty × effective(item, setup.plan)
monthlySavings(setup) = round(total(weekly) × 52 / 12) − total(monthly)   // shown only if > 0
arrival(setup)        = every item instant ? "today" : "tomorrow"          // concept items are not instant
```

- Money is formatted with `Intl.NumberFormat("en-US", { style: "currency", currency: "USD" })`.
- The delivery fee is never computed. The UI says "Delivery fee calculated at checkout".
- **Card deltas:**
  - Adding shows `+effective`.
  - Swapping shows `effective(new) − effective(old)`.
  - Removing shows `−effective`.

### 9.3 Sharing and persistence (`lib/share.ts`)

**URL format**

```
/?d=desk-electric&c=chair-ergo&i=mon-27-4k:2,lamp-led,plant-monstera&p=m&pos=stand
```

- `d` is the desk id and `c` the chair id, or `none` for no chair.
- `i` is a comma list of `id` or `id:qty`.
- `p` is `w` or `m`. `pos` is `sit` or `stand`.

**Encoding:** fields are emitted in a stable order, and default values are omitted.

**Decoding:**
- Unknown ids are dropped and reported.
- Quantities are clamped by running the decoded setup through the `lib/setup` rules.
- A malformed value falls back to its default. Decoding never throws.

**Load order:**
1. URL params, if any are present.
2. Otherwise, persisted state.
3. Otherwise, the Essentials preset.

When the setup comes from the URL, the builder replaces the URL with a clean path after loading, so later edits do not keep stale params.

**Persistence:**
- Zustand `persist` under the key `monis-builder`, with a `version` and a `migrate` function.
- All storage access is wrapped so that blocked storage never breaks the app.

## 10. Smart setup (`lib/suggest.ts`)

```ts
interface Suggestion {
  setup: Setup;
  reasons: string[];   // 2–4 short lines shown in "Why this setup"
  matched: boolean;    // false when nothing was recognised (fallback used)
}
function suggestSetup(text: string, current: Setup): Suggestion;
```

The function is deterministic and pure. A future `LlmSuggester` can implement the same signature.

**Step 1: parse signals** (case-insensitive keyword and regex matching on input trimmed to 300 characters)

| Signal | Examples | Effect |
|---|---|---|
| Role: developer | dev, engineer, coder, programmer, full-stack | Base Founders |
| Role: creative | designer, video, editor, photographer, colorist | Base Studio |
| Role: trading | trader, trading, crypto, stocks | Base Trading |
| Role: calls | calls, meetings, sales, support, interviews | Add webcam and headphones |
| Role: creator | podcast, streamer, youtube, content | Add mic-kit, webcam, headphones, lamp-led |
| Budget | `$50/wk`, `50 a week`, `$200/month`, cheap, budget, premium | Explicit amounts set a weekly cap (monthly amounts × 12 / 52). "cheap" or "budget" without an amount sets a $25/week cap. "premium" switches the desk to desk-dual-motor. |
| Duration | `6 weeks`, `2 months`, `a month` | Duration of 4 weeks or more selects Monthly |
| Screens | `2 monitors`, `three screens`, `dual screen` | Sets the monitor count, clamped to 3. Uses the base monitor if it takes one slot, otherwise mon-27-4k (mon-27-a27i when the base has none). A count of 3 switches the desk to desk-dual-motor. |
| Posture | standing, back pain, long days | `posture: stand` |
| Movement | walk, steps, active | Add walking-pad |
| Internet | bad wifi, slow internet | Add router. Phrases like "no internet" or "remote villa" add Starlink instead. |
| Climate | humid, damp, mold | Add dehumidifier. "hot" or "heat" adds the tower fan. "dust" or "smoke" adds the purifier. |
| Coffee | coffee, espresso | Add nespresso |
| Computer | no laptop, need a computer | Add mac-mini, plus a keyboard (kb-mx), a mouse (mouse-mx) and a monitor (mon-27-a27i) when missing |

**Step 2: compose**
1. Start from the role's base preset, or Essentials when no role is found.
2. Apply the add signals.
3. Apply the screens, posture and plan signals.
4. Run the result through the `lib/setup` rules, so the suggestion is always valid.

Smart setup only suggests real catalog items, never concept items.

**Step 3: fit the budget.** While the weekly-equivalent total exceeds the budget:
1. Step the most expensive optional item down to the next cheaper real item in the same slot that still fits the desk. For example, Studio Display becomes the 27" 4K+ Grading Monitor.
2. When nothing can step down, drop optional items, most expensive first.
3. The desk and chair are never dropped. The desk may step down to a cheaper desk if the monitors still fit.

The weekly equivalent of a monthly plan is `monthly × 12 / 52`. If the budget still cannot be met, keep the minimum setup and add the reason "This is the leanest setup we can do".

**Step 4: explain.** Produce 2–4 reasons tied to the signals actually matched, in plain words, for example "Monthly plan: you're staying 2 months, which saves $38".

**Step 5: no match.** If nothing matched, return Essentials with `matched: false` and the reason "We couldn't tell your role, so here's a solid start. Tweak away."

The UI keeps the previous setup for a one-step **Undo**.

## 11. Error handling and accessibility

**Error handling**
- **Invalid share links:** unknown ids are dropped, and the toast "Some items in this link are no longer available" appears. The app never crashes on bad params.
- **Storage blocked or corrupt:** fall back to the defaults. A version mismatch runs `migrate` or resets.
- **Image fails to load:** show the item's scene art or a neutral placeholder.
- **Checkout with an invalid state:** redirect to `/`.
- **Rendering errors:** a route-level error boundary shows a friendly retry.

**Accessibility**
- Keyboard reachable throughout, with visible focus.
- Tabs and toggles use the shadcn (Radix) semantics.
- An `aria-live="polite"` region announces price changes and smart-setup results.
- The scene has a summary label, colour contrast is AA, and `prefers-reduced-motion` is respected.
- Target: no serious or critical axe violations.

## 12. Testing strategy

### 12.1 Unit tests (Vitest)

- **`pricing`:**
  - sale rounding, for example 7.00 at −30% gives 4.90;
  - plan totals, using the preset totals in §8.3 as fixtures;
  - monthly savings sign;
  - arrival, including concept items.
- **`setup`:**
  - monitor capacity by desk width, ultrawide slot size, swaps in capacity-1 slots;
  - `requires` handling and the cascade when the last monitor is removed;
  - overflow when switching to a narrower desk;
  - posture with the walking pad.
- **`share`:**
  - encode then decode gives the same setup for every preset and for edge setups;
  - malformed input never throws;
  - unknown ids are reported.
- **`suggest`:** a table of about 12 sentences with expected key items, plan and `matched`. Examples:
  - "Full-stack dev, 6 weeks, $50/wk"
  - "Video editor in Canggu for 2 months"
  - "Lots of calls, bad wifi, cheap"
  - "Day trader, three screens"
  - "Podcast host"
  - "No laptop, designer"
  - "Standing, back pain, I like to walk"
  - "Humid villa, coffee addict"
  - "Remote villa with no internet"
  - "$20 per week"
  - "asdf"
- **`catalog` integrity:**
  - ids are unique;
  - real items have a `slug` and `imageUrl`, and concept items have neither;
  - preset ids resolve;
  - every slot has an art mapping.

### 12.2 End-to-end tests (Playwright)

**Projects:** Desktop Chrome and a Pixel 7 viewport.

**Scenarios:**
1. The first load shows Essentials, its total and arrival.
2. Swapping the desk and chair updates the scene (checked through `data-testid` on scene nodes) and the summary.
3. Adding monitors up to the limit shows the notice. Upgrading the desk unlocks a third monitor.
4. The Weekly / Monthly toggle changes the total and the savings hint.
5. Opening a share link in a fresh context reproduces the setup.
6. Smart setup applies items and shows reasons, and Undo restores the previous setup.
7. Checkout: validation errors show, then a valid submit reaches the success page with a reference and the concept banner.
8. On mobile, the sticky bar and summary Drawer work.
9. A reload keeps the setup.
10. Axe finds no serious violations on `/` and `/checkout`.
11. Search finds items across categories, suggests words when empty, and clears with Esc; `/` focuses it on desktop.
12. At 375×667, 390×844, 820×1180, 1024×768, 1280×720, 1440×900 and 1920×1080 the page does not scroll in either direction, and the header, scene, search and Rent button are on screen.

**Targets:** a local production build (`next build && next start --port 3100`, so `pnpm dev` can keep :3000) in CI and locally, and the deployed URL through `BASE_URL` for a post-deploy smoke run.

**Evidence:** the Playwright HTML report and screenshots. Each QA round is summarised in `docs/qa/`.

## 13. Repository, tooling and docs

### 13.1 Tooling

- **pnpm only:** `packageManager` is pinned, and a `preinstall` hook runs `npx only-allow pnpm`.
- **ESLint** (flat config):
  - Rule sets: `next/core-web-vitals`, `typescript-eslint` strictTypeChecked and stylisticTypeChecked, `jsx-a11y`, `react-hooks`, `simple-import-sort`.
  - `no-console` is an error, and `--max-warnings=0`. No `any`, no unused code.
  - shadcn components follow the same rules. Any exception is narrowed to a file and documented.
- **Prettier** with `prettier-plugin-tailwindcss` is the formatting authority, checked with `format:check`.
- **Husky and lint-staged** format and lint staged files before each commit.
- **Scripts:** `dev`, `build`, `start`, `lint`, `type-check`, `format`, `format:check`, `test`, `test:e2e`.
- **GitHub Actions:** on every PR and on push to `main`, run install, lint, type-check, format:check, unit tests, build and E2E (Chromium), and upload the Playwright report.

### 13.2 Docs layout

```
README.md            # challenge write-up: approach, tech choices, what's next, live URL, screenshots
AGENTS.md            # agent rules (source of truth): stack, commands, conventions, ship flow, QA procedure
CLAUDE.md            # imports @AGENTS.md, plus Claude-specific notes
LICENSE              # MIT
docs/
  overview/          # architecture.md, deployment.md
  product/           # brief.md (must-haves and status), catalog-notes.md (snapshot source, assumptions, concept items)
  superpowers/specs/ # this design
  superpowers/plans/ # implementation plan
  qa/                # E2E rounds: scenarios, results, evidence
  bugs/bug-log.md    # symptom, root cause, fix, prevention, regression test
  assets/            # README screenshots
```

### 13.3 What AGENTS.md defines (inputs for the `qa-fix-round` procedure)

- **How a change ships** (owner decision, 2026-10-11): a single branch, `main`. Commit and push to `main` after the full quality gate; CI runs on the push and Vercel deploys production. Failed CI runs are deleted once fixed.
- **Where test scenarios and results live:** `e2e/` for the specs, `docs/qa/` for round results, `docs/bugs/bug-log.md` for bug history.
- **Which data may be written:** none on any server. The app writes only to the visitor's localStorage.
- **House rules:**
  - Code, comments (max 2 lines each), docs and commits in English, using conventional commits.
  - No `any`, and zero lint warnings.

### 13.4 Deployment

- Vercel project linked to `eksant/monis-rent` through Git integration: `main` deploys production, every PR gets a preview.
- No environment variables are needed.
- The README carries the production URL.
- Product photos use plain `<img>` (lazy-loaded with explicit width and height) so they do not consume the Vercel image-optimisation quota.

## 14. Delivery plan

| # | Milestone | Outcome |
|---|---|---|
| 1 | Scaffold | Next.js, Tailwind, shadcn, tooling, CI, AGENTS.md and CLAUDE.md, LICENSE, a "hello" page deployed on Vercel |
| 2 | Core logic | `catalog`, `presets`, `money`, `pricing`, `setup`, `share`, and their unit tests |
| 3 | **Clickable rough build** | Rough scene, picker, summary and price bar on a preview URL. **Review UX (§7) with the owner here.** |
| 4 | Polish (incl. close-up view, tap-to-edit) | Final scene art, animations, posture, hotspots, notices, mobile Drawer |
| 5 | Checkout | `/checkout` and `/checkout/success` |
| 6 | Smart setup | `suggest` with table tests, then the UI with reasons and Undo |
| 7 | Quality and docs | E2E suite with axe, `docs/qa` round, README write-up with screenshots, docs |
| 8 | Hand-off | Production check, then invite `desent-bot` (Read) **after the owner confirms** |

**Cut order if time runs short:** smart setup, then Bali extras, then posture animation. Must-haves M1–M7 are never cut.

**Plans:** milestones 1–3 are planned in `docs/superpowers/plans/2026-10-11-workspace-builder-plan-1-foundation.md`. Milestones 4–8 get a second plan, written after the UX review at milestone 3 (done 2026-10-11, see §7).

## 15. Assumptions and open points

- **`sale` on monthly prices:** we assume the discount applies to monthly prices too. To be verified against a live product page; documented in `catalog-notes.md`.
- **Desk widths:** Electrical 120 cm and Mechanical 140 cm are assumptions, since monis.rent does not list them. For the Dual-Motor desk we use the largest variant, 160 cm.
- **Concept items:**
  - Two chairs and two plants carry indicative prices and a visible "Concept" badge.
  - The README notes that monis.rent lists only one chair. This is a product insight for the client.
- **Bundle discounts:** the -20% bundle pricing is not applied, because the exact rule is unknown. Listed as future work.
- **Snapshot date:** the catalog was captured on 2026-10-11. Future work: read the catalog live from the monis.rent Strapi API, which uses the same stack.
- **UX (§7):** reviewed by the owner on 2026-10-11; close-up view and tap-to-edit land in milestone 4.
