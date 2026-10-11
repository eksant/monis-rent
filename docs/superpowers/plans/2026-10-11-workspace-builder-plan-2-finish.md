# Workspace Builder — Plan 2: Polish, Checkout, Smart Setup and Hand-off

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Finish the challenge: the desk close-up and tap-to-edit, motion polish, `/checkout` and `/checkout/success`, smart setup ("describe your work"), the bugs found in the sweep, the README write-up with screenshots, and the hand-off (`desent-bot` invited).

**Architecture:** Same as Plan 1. New pure modules in `src/lib` (`checkout.ts`, `suggest.ts`, `text.ts`, close-up geometry in `scene-layout.ts`) carry every rule and are unit-tested. The Zustand store gains UI state (scene view, one-step undo) and the persisted last order. Components stay thin. The pages remain an app shell where the page never scrolls.

**Tech Stack:** as Plan 1, plus react-hook-form 7.89.0, zod 4.6.5, @hookform/resolvers 5.9.1 and the shadcn `field`, `label` and `textarea` components (which bring `separator`).

**Spec:** `docs/superpowers/specs/2026-10-11-workspace-builder-design.md` §7 (as reviewed), §9–§12, §14 milestones 4–8.

**Validation:** every file in this plan was built and checked in a scratch worktree of `main` before the plan was written. Lint, type-check, Prettier, 140 unit tests, 58 Playwright passes (desktop + mobile, axe on every page, 9 viewport sizes) and a production build all pass.

## Global Constraints

- **Branch:** the owner keeps a single branch. Work on `main` only, with no feature branches and no PRs. Push after each task. Delete failed CI runs once fixed (see `AGENTS.md` → Shipping a change).
- **Toolchain:** pnpm 12.4.2 only; Node.js ≥ 22. Pinned versions from Plan 1 stay; do not upgrade TypeScript (5.9.3) or ESLint (9.39.5).
- **New pins:** react-hook-form 7.89.0, zod 4.6.5, @hookform/resolvers 5.9.1. shadcn components are added with `pnpm dlx shadcn@4.21.4 add`.
- **Quality gate before every push:** `pnpm lint && pnpm type-check && pnpm format:check && pnpm test && pnpm build && pnpm test:e2e`.
- **E2E** serves the production build on port 3100, so `pnpm dev` can keep port 3000.
- **Language:** English for code, comments (max 2 lines each), docs, commits and UI copy. Money in integer cents.
- **Honesty:** the checkout never takes payment and the success page says it is a concept demo. Smart setup suggests only real catalog items.
- **Commits:** Conventional Commits ending with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- **Outward actions** (push, repo settings, collaborator invite) follow `AGENTS.md`. The `desent-bot` invitation is sent **only after the owner confirms** in chat.
- **Repo root:** `/Users/eksa/Projects/monis-rent` on branch `main`.

## File Map

| File | Responsibility | Task |
| --- | --- | --- |
| `src/lib/scene-layout.ts` (+ test) | Close-up transform, `projectPoint`, `isInFrame`, tap targets; chair moves to the quieter side | 1 |
| `src/lib/text.ts` (+ test) | `countLabel()` | 1 |
| `src/lib/checkout.ts` (+ test) | Checkout schema, Bali dates, order references, stored-order parsing | 1 |
| `src/lib/suggest.ts` (+ test) | Smart setup rules | 1 |
| `src/store/setup-store.ts` (+ test) | Scene view, edit-from-scene, last order, start new setup, apply/undo suggestion | 2 |
| `src/components/builder/use-tweened-number.ts`, `summary-panel.tsx`, `price-bar.tsx` | Counting totals, singular counts | 3 |
| `src/app/globals.css`, `src/components/scene/*`, `scene-view-toggle.tsx`, `site-header.tsx`, `builder.tsx` | Drop-in animation, close-up, tap targets, chair hotspot, Hue lamp in front | 4 |
| `src/components/ui/{field,label,textarea,separator}.tsx`, `src/components/checkout/*`, `src/app/checkout/**` | Checkout and confirmation | 5 |
| `src/components/builder/smart-setup.tsx`, `preset-bar.tsx` | Smart setup sheet and toast | 6 |
| `README.md`, `docs/**`, `AGENTS.md` | Write-up, screenshots, QA record, docs | 7 |

---
### Task 1: Pure logic — close-up geometry, counts, checkout and smart setup

**Files:**
- Modify: `src/lib/scene-layout.ts`, `src/lib/scene-layout.test.ts`
- Create: `src/lib/text.ts`, `src/lib/text.test.ts`, `src/lib/checkout.ts`, `src/lib/checkout.test.ts`, `src/lib/suggest.ts`, `src/lib/suggest.test.ts`

**Interfaces:**
- Produces (scene-layout): `FocusTransform { scale; x; y }` (x/y are translate % of the scene), `ROOM_VIEW`, `deskFocus(layout)`, `projectPoint(focus, point)`, `isInFrame(point)`, `SceneTarget { key; label; category; x; y; width; height }`, `sceneTargets(setup, layout)`. `layoutScene` now moves a standing chair to the side with fewer floor items (BS-04).
- Produces (text): `countLabel(count, noun)`.
- Produces (checkout): `DELIVERY_AREAS`, `baliDate(now)`, `addDays(iso, n)`, `earliestDelivery(arrival, now)`, `formatDeliveryDate(iso)`, `checkoutSchema(earliest)`, `CheckoutValues` (form input, `area: string`), `CheckoutInput` (validated), `Order`, `orderReference(random?)`, `createOrder(input, setup, now, random?)`, `parseOrder(value)`.
- Produces (suggest): `Suggestion { setup; reasons; matched }`, `SUGGESTION_EXAMPLES`, `suggestSetup(text, current)`.

- [ ] **Step 1: Install the form dependencies**

```bash
cd /Users/eksa/Projects/monis-rent && git pull --ff-only
pnpm add react-hook-form@7.89.0 zod@4.6.5 @hookform/resolvers@5.9.1
```

- [ ] **Step 2: Write the failing tests**

`src/lib/scene-layout.test.ts` (whole file):

```ts
import { describe, expect, it } from "vitest";

import { CATALOG, getItem } from "@/data/catalog";
import { emptySetup } from "@/data/presets";
import {
  DESK_HEIGHT,
  deskFocus,
  type FocusTransform,
  isInFrame,
  layoutScene,
  MONITOR_OVERHANG,
  monitorSize,
  projectPoint,
  ROOM_VIEW,
  SCENE,
  sceneTargets,
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

describe("deskFocus", () => {
  const corners = (setup: Setup): { x: number; y: number }[] => {
    const { desk, monitors } = layoutScene(setup);
    return [
      { x: desk.x, y: desk.y },
      { x: desk.x + desk.width, y: desk.y },
      ...monitors.flatMap((monitor) => [
        { x: monitor.x, y: monitor.y },
        { x: monitor.x + monitor.width, y: monitor.y },
      ]),
    ];
  };
  const project = (focus: FocusTransform, point: { x: number; y: number }) => ({
    x: focus.scale * point.x + (focus.x / 100) * SCENE.width,
    y: focus.scale * point.y + (focus.y / 100) * SCENE.height,
  });

  it("is the identity for the room view", () => {
    expect(ROOM_VIEW).toEqual({ scale: 1, x: 0, y: 0 });
  });

  it.each([
    ["essentials sitting", emptySetup()],
    [
      "three screens standing",
      {
        ...emptySetup(),
        deskId: "desk-dual-motor",
        items: { "mon-32-qhd": 3 },
        posture: "stand" as const,
      },
    ],
  ])("zooms in and keeps the desk and screens in frame (%s)", (_, setup) => {
    const focus = deskFocus(layoutScene(setup));
    expect(focus.scale).toBeGreaterThan(1.5);
    for (const point of corners(setup)) {
      const shown = project(focus, point);
      expect(shown.x).toBeGreaterThanOrEqual(0);
      expect(shown.x).toBeLessThanOrEqual(SCENE.width);
      expect(shown.y).toBeGreaterThanOrEqual(0);
      expect(shown.y).toBeLessThanOrEqual(SCENE.height);
    }
  });

  it("never shows anything outside the scene", () => {
    const focus = deskFocus(layoutScene(emptySetup()));
    expect(focus.x).toBeLessThanOrEqual(0);
    expect(focus.x).toBeGreaterThanOrEqual(100 - 100 * focus.scale);
    expect(focus.y).toBeLessThanOrEqual(0);
    expect(focus.y).toBeGreaterThanOrEqual(100 - 100 * focus.scale);
  });
});

describe("sceneTargets", () => {
  it("covers the desk, the chair and each screen", () => {
    const setup: Setup = {
      ...emptySetup(),
      chairId: "chair-ergo",
      items: { "mon-24-1c": 2 },
    };
    const targets = sceneTargets(setup, layoutScene(setup));
    expect(targets.map((target) => target.label)).toEqual([
      "Change desk",
      "Change screens",
      "Change screens",
      "Change chair",
    ]);
    expect(targets.map((target) => target.category)).toEqual([
      "desk",
      "screen",
      "screen",
      "chair",
    ]);
  });

  it("leaves out the chair when there is none", () => {
    const setup = emptySetup();
    expect(
      sceneTargets(setup, layoutScene(setup)).map((target) => target.label),
    ).toEqual(["Change desk"]);
  });
});

describe("projectPoint", () => {
  it("maps scene points through the close-up transform", () => {
    expect(projectPoint(ROOM_VIEW, { x: 40, y: 50 })).toEqual({ x: 40, y: 50 });
    expect(
      projectPoint({ scale: 2, x: -50, y: -40 }, { x: 150, y: 100 }),
    ).toEqual({
      x: 100,
      y: 100,
    });
  });

  it("tells whether a point is inside the frame", () => {
    expect(isInFrame({ x: 10, y: 10 })).toBe(true);
    expect(isInFrame({ x: -1, y: 10 })).toBe(false);
    expect(isInFrame({ x: 10, y: SCENE.height + 1 })).toBe(false);
  });
});

describe("chair placement when standing", () => {
  it("moves the chair to the side with fewer floor items", () => {
    const climate: Setup = {
      ...emptySetup(),
      chairId: "chair-ergo",
      items: { "tower-fan": 1, purifier: 1 },
      posture: "stand",
    };
    const plants: Setup = { ...climate, items: { "plant-monstera": 2 } };
    expect(layoutScene(climate).chairCenterX).toBeLessThan(SCENE.width / 2);
    expect(layoutScene(plants).chairCenterX).toBeGreaterThan(SCENE.width / 2);
  });
});
```

`src/lib/text.test.ts`:

```ts
import { describe, expect, it } from "vitest";

import { countLabel } from "@/lib/text";

describe("countLabel", () => {
  it("uses the singular only for exactly one", () => {
    expect(countLabel(0, "item")).toBe("0 items");
    expect(countLabel(1, "item")).toBe("1 item");
    expect(countLabel(7, "item")).toBe("7 items");
  });
});
```

`src/lib/checkout.test.ts`:

```ts
import { describe, expect, it } from "vitest";

import { presetSetup } from "@/data/presets";
import {
  addDays,
  baliDate,
  type CheckoutInput,
  checkoutSchema,
  createOrder,
  earliestDelivery,
  formatDeliveryDate,
  orderReference,
  parseOrder,
} from "@/lib/checkout";

const VALID = {
  fullName: "Kadek Ayu",
  email: "kadek@example.com",
  whatsapp: "+62 812 3456 7890",
  area: "Canggu",
  address: "Villa Melati, Jl. Pantai Berawa 12",
  deliveryDate: "2026-10-13",
} satisfies CheckoutInput;

// A deterministic "random" that walks through the given numbers.
function sequence(...values: number[]): () => number {
  let index = 0;
  return () => values[index++ % values.length] ?? 0;
}

describe("dates in Bali", () => {
  it("uses the calendar date in Bali (UTC+8), not the visitor's time zone", () => {
    expect(baliDate(new Date("2026-10-11T15:59:00Z"))).toBe("2026-10-11");
    expect(baliDate(new Date("2026-10-11T16:00:00Z"))).toBe("2026-10-12");
  });

  it("adds days across month and year ends", () => {
    expect(addDays("2026-10-31", 1)).toBe("2026-11-01");
    expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
  });

  it("allows same-day delivery only when the whole setup can arrive today", () => {
    const now = new Date("2026-10-11T02:00:00Z");
    expect(earliestDelivery("today", now)).toBe("2026-10-11");
    expect(earliestDelivery("tomorrow", now)).toBe("2026-10-12");
  });

  it("formats a delivery date for people", () => {
    expect(formatDeliveryDate("2026-10-13")).toBe("Tue, 13 Oct 2026");
  });
});

describe("checkoutSchema", () => {
  const schema = checkoutSchema("2026-10-12");

  it("accepts a complete request and an empty WhatsApp number", () => {
    expect(schema.safeParse(VALID).success).toBe(true);
    expect(schema.safeParse({ ...VALID, whatsapp: "" }).success).toBe(true);
  });

  it("explains every missing or invalid field", () => {
    const result = schema.safeParse({
      fullName: " ",
      email: "nope",
      whatsapp: "call me",
      area: "",
      address: "x",
      deliveryDate: "",
    });
    expect(result.success).toBe(false);
    const messages = result.error?.issues.map((issue) => issue.message) ?? [];
    expect(messages).toEqual([
      "Please enter your name.",
      "Please enter a valid email.",
      "Use digits, spaces and an optional +.",
      "Choose a delivery area.",
      "Add a street, villa or landmark.",
      "Pick a delivery date.",
    ]);
  });

  it("rejects a delivery date before the earliest one", () => {
    const result = schema.safeParse({ ...VALID, deliveryDate: "2026-10-11" });
    expect(result.error?.issues[0]?.message).toBe(
      "The earliest delivery is Mon, 12 Oct 2026.",
    );
  });
});

describe("orders", () => {
  it("makes short, unambiguous references", () => {
    expect(orderReference(sequence(0, 0.5, 0.99, 0.25))).toBe("MR-AS9J");
    expect(orderReference()).toMatch(/^MR-[A-HJ-NP-Z2-9]{4}$/);
  });

  it("records the setup, its total and the customer", () => {
    const setup = presetSetup("essentials");
    const order = createOrder(
      VALID,
      setup,
      new Date("2026-10-11T02:00:00Z"),
      sequence(0),
    );
    expect(order).toEqual({
      reference: "MR-AAAA",
      placedAt: "2026-10-11T02:00:00.000Z",
      setup,
      totalCents: 1270,
      customer: VALID,
    });
  });

  it("parses a stored order and rejects anything else", () => {
    const order = createOrder(
      { ...VALID, area: "Ubud" as const },
      presetSetup("founders"),
      new Date("2026-10-11T02:00:00Z"),
      sequence(0.1),
    );
    expect(parseOrder(JSON.parse(JSON.stringify(order)))).toEqual(order);
    expect(parseOrder(null)).toBeNull();
    expect(parseOrder({ ...order, reference: "hello" })).toBeNull();
    expect(parseOrder({ ...order, setup: { deskId: 3 } })).toBeNull();
  });
});
```

`src/lib/suggest.test.ts`:

```ts
import { describe, expect, it } from "vitest";

import { getItem } from "@/data/catalog";
import { defaultSetup, presetSetup } from "@/data/presets";
import { weeklyEquivalentCents } from "@/lib/pricing";
import { normalizeSetup, setupLines, usedUnits } from "@/lib/setup";
import { suggestSetup } from "@/lib/suggest";
import type { Setup } from "@/lib/types";

const current = defaultSetup();

function weekly(setup: Setup): number {
  return weeklyEquivalentCents(setupLines(setup), setup.plan);
}

function has(setup: Setup, id: string): boolean {
  return (setup.items[id] ?? 0) > 0;
}

describe("suggestSetup", () => {
  it("builds a developer setup on a monthly plan within budget", () => {
    const { setup, reasons, matched } = suggestSetup(
      "Full-stack dev, 6 weeks, $50/wk",
      current,
    );
    expect(matched).toBe(true);
    expect(has(setup, "mon-27-4k")).toBe(true);
    expect(has(setup, "kb-mx")).toBe(true);
    expect(setup.plan).toBe("monthly");
    expect(weekly(setup)).toBeLessThanOrEqual(5000);
    expect(reasons.some((reason) => reason.startsWith("Monthly plan"))).toBe(
      true,
    );
    expect(reasons.length).toBeGreaterThanOrEqual(2);
    expect(reasons.length).toBeLessThanOrEqual(4);
  });

  it("gives a video editor the Studio setup for a two-month stay", () => {
    const { setup } = suggestSetup(
      "Video editor in Canggu for 2 months",
      current,
    );
    expect(has(setup, "mon-studio")).toBe(true);
    expect(setup.plan).toBe("monthly");
  });

  it("keeps a cheap calls setup under $25 a week", () => {
    const { setup, matched, reasons } = suggestSetup(
      "Lots of calls, bad wifi, cheap",
      current,
    );
    expect(matched).toBe(true);
    expect(has(setup, "headphones")).toBe(true);
    expect(weekly(setup)).toBeLessThanOrEqual(2500);
    // Reasons describe the final setup and say what was left out.
    expect(
      reasons.some((reason) => reason.includes("Wi-Fi 6 router for")),
    ).toBe(false);
    expect(reasons).toContain(
      "Left out the Logitech 4K Webcam and Dual-Band Wi-Fi 6 Router to stay on budget.",
    );
  });

  it("puts three screens on the wide desk for a trader", () => {
    const { setup } = suggestSetup("Day trader, three screens", current);
    expect(setup.deskId).toBe("desk-dual-motor");
    expect(setup.items["mon-27-4k"]).toBe(3);
    expect(has(setup, "mon-34-gaming")).toBe(false);
  });

  it("equips a podcast host", () => {
    const { setup } = suggestSetup("Podcast host", current);
    for (const id of ["mic-kit", "webcam", "headphones", "lamp-led"]) {
      expect(has(setup, id), id).toBe(true);
    }
  });

  it("adds a computer when there is no laptop", () => {
    const { setup } = suggestSetup("No laptop, designer", current);
    expect(has(setup, "mac-mini")).toBe(true);
    expect(has(setup, "mon-studio")).toBe(true);
  });

  it("stands and walks for long days", () => {
    const { setup } = suggestSetup(
      "Standing, back pain, I like to walk",
      current,
    );
    expect(setup.posture).toBe("stand");
    expect(has(setup, "walking-pad")).toBe(true);
  });

  it("handles Bali climate and coffee", () => {
    const { setup } = suggestSetup("Humid villa, coffee addict", current);
    expect(has(setup, "dehumidifier")).toBe(true);
    expect(has(setup, "nespresso")).toBe(true);
  });

  it("brings Starlink to a villa without internet", () => {
    const { setup } = suggestSetup("Remote villa with no internet", current);
    expect(has(setup, "starlink")).toBe(true);
  });

  it("respects a small weekly budget", () => {
    const { setup, matched, reasons } = suggestSetup("$20 per week", current);
    expect(matched).toBe(true);
    expect(weekly(setup)).toBeLessThanOrEqual(2000);
    expect(reasons).toContain("Fits your $20.00 a week budget.");
  });

  it("upgrades the desk for a premium monthly budget", () => {
    const { setup } = suggestSetup("$200/month for a premium setup", current);
    expect(setup.deskId).toBe("desk-dual-motor");
    expect(weekly(setup)).toBeLessThanOrEqual(Math.round((20000 * 12) / 52));
  });

  it("steps prices down before dropping anything", () => {
    const { setup } = suggestSetup("Designer, $40 a week", current);
    expect(has(setup, "mon-studio")).toBe(false);
    expect(usedUnits(setup, "monitor")).toBeGreaterThan(0);
    expect(has(setup, "kb-magic") || has(setup, "kb-mx")).toBe(true);
    expect(
      has(setup, "mouse-magic") ||
        has(setup, "mouse-mx") ||
        has(setup, "mouse-silent"),
    ).toBe(true);
    expect(weekly(setup)).toBeLessThanOrEqual(4000);
  });

  it("falls back to Essentials when nothing is recognised", () => {
    const result = suggestSetup("asdf", current);
    expect(result.matched).toBe(false);
    expect(result.setup).toEqual(presetSetup("essentials"));
    expect(result.reasons).toEqual([
      "We couldn't tell your role, so here's a solid start. Tweak away.",
    ]);
  });

  it("never throws and only suggests valid, real items", () => {
    for (const text of [
      "",
      "constructor __proto__",
      "x".repeat(1000),
      "10 screens $1/wk",
    ]) {
      const { setup } = suggestSetup(text, current);
      expect(normalizeSetup(setup).setup).toEqual(setup);
      for (const line of setupLines(setup)) {
        expect(getItem(line.item.id).concept, line.item.id).toBe(false);
      }
    }
  });
});
```

- [ ] **Step 3: Run them to verify they fail**

```bash
pnpm exec vitest run src/lib
```

Expected: FAIL — `Cannot find package '@/lib/text'`, `'@/lib/checkout'`, `'@/lib/suggest'`, and `deskFocus is not a function` style errors in `scene-layout.test.ts`.

- [ ] **Step 4: Implement**

`src/lib/scene-layout.ts` (whole file):

```ts
import { CATALOG, getItem } from "@/data/catalog";
import { monitorCapacity, usedUnits } from "@/lib/setup";
import type { CatalogItem, CategoryId, Setup } from "@/lib/types";

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

const FLOOR_RIGHT = ["tower-fan", "purifier", "dehumidifier"];
const FLOOR_LEFT = ["plant-monstera", "plant-snake"];

// Standing moves the chair aside: to the right, unless that side is busier.
function standSide(setup: Setup): 1 | -1 {
  const count = (ids: string[]): number =>
    ids.reduce((sum, id) => sum + (setup.items[id] ?? 0), 0);
  return count(FLOOR_RIGHT) > count(FLOOR_LEFT) ? -1 : 1;
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
    SCENE.width / 2 +
    (setup.posture === "stand" ? CHAIR_STAND_SHIFT * standSide(setup) : 0);
  return { desk, monitors, chairCenterX, monitorHotspot };
}

// Scale, then translate (in % of the scene) — the CSS transform for the close-up view.
export interface FocusTransform {
  scale: number;
  x: number;
  y: number;
}

export const ROOM_VIEW: FocusTransform = { scale: 1, x: 0, y: 0 };
const FOCUS_MAX_SCALE = 2.4;
const FOCUS_SIDE_MARGIN = 22;
const FOCUS_HEADROOM = 50;
const FOCUS_BELOW_DESK = 30;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

// Close-up of the desk: its top, the screens and anything up to lamp height.
export function deskFocus(layout: SceneLayout): FocusTransform {
  const { desk, monitors } = layout;
  const top =
    Math.min(
      desk.y - FOCUS_HEADROOM,
      ...monitors.map((monitor) => monitor.y - 6),
    ) - 8;
  const box = {
    x: desk.x - FOCUS_SIDE_MARGIN,
    y: top,
    width: desk.width + 2 * FOCUS_SIDE_MARGIN,
    height: desk.y + FOCUS_BELOW_DESK - top,
  };
  const scale = Math.min(
    SCENE.width / box.width,
    SCENE.height / box.height,
    FOCUS_MAX_SCALE,
  );
  const tx = clamp(
    SCENE.width / 2 - scale * (box.x + box.width / 2),
    SCENE.width - scale * SCENE.width,
    0,
  );
  const ty = clamp(
    SCENE.height / 2 - scale * (box.y + box.height / 2),
    SCENE.height - scale * SCENE.height,
    0,
  );
  return { scale, x: (tx / SCENE.width) * 100, y: (ty / SCENE.height) * 100 };
}

// Where a scene point ends up on screen (in scene units) under a transform.
export function projectPoint(focus: FocusTransform, point: Point): Point {
  return {
    x: focus.scale * point.x + (focus.x / 100) * SCENE.width,
    y: focus.scale * point.y + (focus.y / 100) * SCENE.height,
  };
}

export function isInFrame(point: Point): boolean {
  return (
    point.x >= 0 &&
    point.x <= SCENE.width &&
    point.y >= 0 &&
    point.y <= SCENE.height
  );
}

export interface SceneTarget {
  key: string;
  label: string;
  category: CategoryId;
  x: number;
  y: number;
  width: number;
  height: number;
}

const CHAIR_HALF_WIDTH = 26;
const CHAIR_HEIGHT = 114;

// Tap areas over the desk, each screen and the chair that open their category.
export function sceneTargets(setup: Setup, layout: SceneLayout): SceneTarget[] {
  const { desk } = layout;
  const targets: SceneTarget[] = [
    {
      key: "desk",
      label: "Change desk",
      category: "desk",
      x: desk.x,
      y: desk.y - 2,
      width: desk.width,
      height: 14,
    },
    ...layout.monitors.map((monitor) => ({
      key: monitor.key,
      label: "Change screens",
      category: "screen" as const,
      x: monitor.x,
      y: monitor.y,
      width: monitor.width,
      height: monitor.height,
    })),
  ];
  if (setup.chairId !== null) {
    targets.push({
      key: "chair",
      label: "Change chair",
      category: "chair",
      x: layout.chairCenterX - CHAIR_HALF_WIDTH,
      y: SCENE.floorY - CHAIR_HEIGHT,
      width: 2 * CHAIR_HALF_WIDTH,
      height: CHAIR_HEIGHT,
    });
  }
  return targets;
}
```

`src/lib/text.ts`:

```ts
// "1 item", "2 items": English plural for a simple count.
export function countLabel(count: number, noun: string): string {
  return `${String(count)} ${noun}${count === 1 ? "" : "s"}`;
}
```

`src/lib/checkout.ts`:

```ts
import { z } from "zod";

import { totalCents } from "@/lib/pricing";
import { normalizeSetup, parseSetup, setupLines } from "@/lib/setup";
import type { Arrival, Setup } from "@/lib/types";

export const DELIVERY_AREAS = [
  "Canggu",
  "Seminyak",
  "Ubud",
  "Uluwatu",
  "Sanur",
  "Denpasar",
  "Kuta",
  "Other",
] as const;

const BALI_TIME_ZONE = "Asia/Makassar";
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const WHATSAPP = /^\+?[0-9 ()-]{7,20}$/;

// Calendar date in Bali (UTC+8) as YYYY-MM-DD, whatever the visitor's time zone.
export function baliDate(now: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: BALI_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

export function addDays(isoDate: string, days: number): string {
  const [year = 1970, month = 1, day = 1] = isoDate.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day + days))
    .toISOString()
    .slice(0, 10);
}

export function earliestDelivery(arrival: Arrival, now: Date): string {
  const today = baliDate(now);
  return arrival === "today" ? today : addDays(today, 1);
}

export function formatDeliveryDate(isoDate: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${isoDate}T00:00:00Z`));
}

export function checkoutSchema(earliest: string) {
  return z.object({
    fullName: z.string().trim().min(2, "Please enter your name.").max(80),
    email: z.string().trim().pipe(z.email("Please enter a valid email.")),
    whatsapp: z
      .string()
      .trim()
      .refine((value) => value === "" || WHATSAPP.test(value), {
        message: "Use digits, spaces and an optional +.",
      }),
    area: z
      .string()
      .pipe(z.enum(DELIVERY_AREAS, { message: "Choose a delivery area." })),
    address: z
      .string()
      .trim()
      .min(5, "Add a street, villa or landmark.")
      .max(300),
    deliveryDate: z
      .string()
      .regex(ISO_DATE, "Pick a delivery date.")
      .refine((value) => !ISO_DATE.test(value) || value >= earliest, {
        message: `The earliest delivery is ${formatDeliveryDate(earliest)}.`,
      }),
  });
}

// Form values (input) and validated request (output): `area` starts as "".
export type CheckoutValues = z.input<ReturnType<typeof checkoutSchema>>;
export type CheckoutInput = z.output<ReturnType<typeof checkoutSchema>>;

export interface Order {
  reference: string;
  placedAt: string;
  setup: Setup;
  totalCents: number;
  customer: CheckoutInput;
}

// No I, O, 0 or 1, so a reference can be read out over the phone.
const REFERENCE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function orderReference(random: () => number = Math.random): string {
  let code = "";
  for (let index = 0; index < 4; index += 1) {
    code +=
      REFERENCE_ALPHABET[Math.floor(random() * REFERENCE_ALPHABET.length)] ??
      "A";
  }
  return `MR-${code}`;
}

export function createOrder(
  customer: CheckoutInput,
  setup: Setup,
  now: Date,
  random: () => number = Math.random,
): Order {
  return {
    reference: orderReference(random),
    placedAt: now.toISOString(),
    setup,
    totalCents: totalCents(setupLines(setup), setup.plan),
    customer,
  };
}

const storedOrder = z.object({
  reference: z.string().regex(/^MR-[A-Z0-9]{4}$/),
  placedAt: z.string(),
  setup: z.unknown(),
  totalCents: z.number().int().nonnegative(),
  customer: z.object({
    fullName: z.string(),
    email: z.string(),
    whatsapp: z.string(),
    area: z.enum(DELIVERY_AREAS),
    address: z.string(),
    deliveryDate: z.string().regex(ISO_DATE),
  }),
});

// Shape check for an order read back from localStorage.
export function parseOrder(value: unknown): Order | null {
  const result = storedOrder.safeParse(value);
  if (!result.success) return null;
  const setup = parseSetup(result.data.setup);
  if (setup === null) return null;
  return { ...result.data, setup: normalizeSetup(setup).setup };
}
```

`src/lib/suggest.ts`:

```ts
import { CATALOG, getItem } from "@/data/catalog";
import { presetSetup } from "@/data/presets";
import { formatCents } from "@/lib/money";
import {
  effectiveCents,
  monthlySavingsCents,
  weeklyEquivalentCents,
} from "@/lib/pricing";
import {
  addItem,
  monitorCapacity,
  normalizeSetup,
  removeItem,
  setDesk,
  setupLines,
  usedUnits,
} from "@/lib/setup";
import type { CatalogItem, PresetId, Setup } from "@/lib/types";

export interface Suggestion {
  setup: Setup;
  reasons: string[];
  matched: boolean;
}

export const SUGGESTION_EXAMPLES = [
  "Full-stack dev, 6 weeks, $50/wk",
  "Lots of calls, bad wifi",
  "Video editor in Canggu, 2 months",
  "Day trader, three screens",
] as const;

const MAX_INPUT = 300;
const CHEAP_WEEKLY_CENTS = 2500;
const WEEKS_PER_MONTH = 52 / 12;
const WIDE_DESK = "desk-dual-motor";
const NUMBER_WORDS: Record<string, number> = {
  a: 1,
  an: 1,
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  dual: 2,
  double: 2,
  triple: 3,
};

type Role = "developer" | "creative" | "trading";

interface Signals {
  role: Role | null;
  calls: boolean;
  creator: boolean;
  budgetCents: number | null;
  premium: boolean;
  weeks: number | null;
  screens: number | null;
  standing: boolean;
  walking: boolean;
  internet: "router" | "starlink" | null;
  humid: boolean;
  hot: boolean;
  dusty: boolean;
  coffee: boolean;
  computer: boolean;
}

const ROLE_PATTERNS: [Role, RegExp][] = [
  ["trading", /\b(trader|trading|crypto|stocks?|forex)\b/],
  [
    "creative",
    /\b(designer|design|video|editor|editing|photographer|photo|colou?rist|creative)\b/,
  ],
  [
    "developer",
    /\b(dev|developer|engineer|coder|programmer|full[- ]?stack|software)\b/,
  ],
];

const ROLE_BASE: Record<Role, PresetId> = {
  developer: "founders",
  creative: "studio",
  trading: "trading",
};

const ROLE_REASON: Record<Role | "none", string> = {
  developer: "Founders base for long build days.",
  creative: "Studio base for creative work.",
  trading: "Trading base for charts and early opens.",
  none: "Essentials base: desk, chair and power.",
};

function toNumber(token: string): number {
  return NUMBER_WORDS[token] ?? Number.parseInt(token, 10);
}

function parseBudget(text: string): number | null {
  const match =
    /\$\s?(\d+(?:\.\d+)?)\s*(?:\/|per|a|an)?\s*(weeks?|wk|w|months?|mo|m)?\b/.exec(
      text,
    ) ??
    /(\d+(?:\.\d+)?)\s*(?:usd|dollars?)?\s*(?:\/|per|a)\s*(weeks?|wk|months?|mo)\b/.exec(
      text,
    );
  if (match === null) return null;
  const amount = Number.parseFloat(match[1] ?? "");
  if (!Number.isFinite(amount) || amount <= 0) return null;
  const monthly = (match[2] ?? "").startsWith("m");
  return Math.round((monthly ? amount / WEEKS_PER_MONTH : amount) * 100);
}

function parseWeeks(text: string): number | null {
  const match =
    /\b(\d+|an?|one|two|three|four|five|six)\s*(weeks?|wks?|months?|mos?)\b/.exec(
      text,
    );
  if (match === null) return null;
  const count = toNumber(match[1] ?? "");
  if (!Number.isFinite(count)) return null;
  return (match[2] ?? "").startsWith("m") ? count * WEEKS_PER_MONTH : count;
}

function parseScreens(text: string): number | null {
  const match =
    /\b(\d+|one|two|three|four|five|six|dual|double|triple)\s*(?:monitors?|screens?|displays?)\b/.exec(
      text,
    );
  if (match === null) return null;
  const count = toNumber(match[1] ?? "");
  return Number.isFinite(count) ? Math.min(3, Math.max(1, count)) : null;
}

function readSignals(input: string): Signals {
  const text = input.toLowerCase().slice(0, MAX_INPUT);
  const cheap = /\b(cheap|budget|tight|affordable|low[- ]cost)\b/.test(text);
  return {
    role: ROLE_PATTERNS.find(([, pattern]) => pattern.test(text))?.[0] ?? null,
    calls:
      /\b(calls?|meetings?|zoom|sales|support|interviews?|clients?)\b/.test(
        text,
      ),
    creator:
      /\b(podcast(er)?|stream(er|ing)?|youtube(r)?|content|creator)\b/.test(
        text,
      ),
    budgetCents: parseBudget(text) ?? (cheap ? CHEAP_WEEKLY_CENTS : null),
    premium: /\b(premium|high[- ]end|luxury|the best)\b/.test(text),
    weeks: parseWeeks(text),
    screens: parseScreens(text),
    standing: /\b(standing|stand up|back pain|long days?|posture)\b/.test(text),
    walking: /\b(walk|walking|steps|active|treadmill)\b/.test(text),
    internet:
      /\b(no (internet|wifi|wi-fi)|remote villa|starlink|off[- ]grid)\b/.test(
        text,
      )
        ? "starlink"
        : /\b(wifi|wi-fi|internet|connection)\b/.test(text)
          ? "router"
          : null,
    humid: /\b(humid|humidity|damp|mou?ld|rainy?)\b/.test(text),
    hot: /\b(hot|heat|warm)\b/.test(text),
    dusty: /\b(dusty?|smoke|smoky|allerg(y|ies))\b/.test(text),
    coffee: /\b(coffee|espresso|caffeine)\b/.test(text),
    computer:
      /\b(no laptop|without (a )?laptop|need a computer|desktop computer)\b/.test(
        text,
      ),
  };
}

function recognised(signals: Signals): boolean {
  return (
    signals.role !== null ||
    signals.budgetCents !== null ||
    signals.weeks !== null ||
    signals.screens !== null ||
    signals.internet !== null ||
    [
      signals.calls,
      signals.creator,
      signals.premium,
      signals.standing,
      signals.walking,
      signals.humid,
      signals.hot,
      signals.dusty,
      signals.coffee,
      signals.computer,
    ].some(Boolean)
  );
}

function addAll(setup: Setup, ids: string[]): Setup {
  return ids.reduce((next, id) => addItem(next, id).setup, setup);
}

function hasSlot(setup: Setup, slot: CatalogItem["slot"]): boolean {
  return usedUnits(setup, slot) > 0;
}

// Replaces every monitor with `count` copies of one single-slot model.
function withScreens(setup: Setup, count: number): Setup {
  const current = CATALOG.find(
    (entry) => entry.slot === "monitor" && (setup.items[entry.id] ?? 0) > 0,
  );
  const model =
    current === undefined
      ? "mon-27-a27i"
      : current.slotSize === 1
        ? current.id
        : "mon-27-4k";
  const items = Object.fromEntries(
    Object.entries(setup.items).filter(
      ([id]) => getItem(id).slot !== "monitor",
    ),
  );
  let next: Setup = { ...setup, items };
  if (count > monitorCapacity(next.deskId))
    next = setDesk(next, WIDE_DESK).setup;
  for (let unit = 0; unit < count; unit += 1) next = addItem(next, model).setup;
  return normalizeSetup(next).setup;
}

function weeklyCost(setup: Setup): number {
  return weeklyEquivalentCents(setupLines(setup), setup.plan);
}

// One notch cheaper in the same slot (real items only), if the desk still fits it.
function stepDown(setup: Setup, item: CatalogItem): Setup | null {
  const price = effectiveCents(item, "weekly");
  const cheaper = CATALOG.filter(
    (entry) =>
      entry.slot === item.slot &&
      !entry.concept &&
      effectiveCents(entry, "weekly") < price,
  ).sort((a, b) => effectiveCents(b, "weekly") - effectiveCents(a, "weekly"));
  for (const option of cheaper) {
    if (item.category === "desk") {
      if (usedUnits(setup, "monitor") <= monitorCapacity(option.id)) {
        return { ...setup, deskId: option.id };
      }
      continue;
    }
    const qty = setup.items[item.id] ?? 0;
    const rest = Object.fromEntries(
      Object.entries(setup.items).filter(([id]) => id !== item.id),
    );
    const items = {
      ...rest,
      ...(qty > 1 ? { [item.id]: qty - 1 } : {}),
      [option.id]: (setup.items[option.id] ?? 0) + 1,
    };
    const candidate = { ...setup, items };
    const fits =
      (candidate.items[option.id] ?? 0) <= option.maxQty &&
      (item.slot !== "monitor" ||
        usedUnits(candidate, "monitor") <= monitorCapacity(candidate.deskId));
    if (fits) return normalizeSetup(candidate).setup;
  }
  return null;
}

// Steps the priciest items down, then drops optional ones, until the budget fits.
function fitBudget(
  setup: Setup,
  budgetCents: number,
): { setup: Setup; fits: boolean } {
  let next = setup;
  for (
    let guard = 0;
    guard < 200 && weeklyCost(next) > budgetCents;
    guard += 1
  ) {
    const byPrice = setupLines(next)
      .map((line) => line.item)
      .sort(
        (a, b) => effectiveCents(b, "weekly") - effectiveCents(a, "weekly"),
      );
    const stepped = byPrice.reduce<Setup | null>(
      (found, item) => found ?? stepDown(next, item),
      null,
    );
    if (stepped !== null) {
      next = stepped;
      continue;
    }
    const optional = byPrice.find(
      (item) => item.category !== "desk" && item.category !== "chair",
    );
    if (optional === undefined) break;
    next = removeItem(next, optional.id).setup;
  }
  return { setup: next, fits: weeklyCost(next) <= budgetCents };
}

// A reason stays only while at least one of its items is still in the setup.
interface Reason {
  text: string;
  items: string[];
}

function isPresent(setup: Setup, id: string): boolean {
  return setup.deskId === id || (setup.items[id] ?? 0) > 0;
}

function joinNames(ids: string[]): string {
  const names = ids.map((id) => getItem(id).name);
  return names.length <= 1
    ? (names[0] ?? "")
    : `${names.slice(0, -1).join(", ")} and ${names.at(-1) ?? ""}`;
}

// Rule-based stand-in for an LLM: same signature an LLM-backed version would have.
export function suggestSetup(text: string, current: Setup): Suggestion {
  const signals = readSignals(text);
  if (!recognised(signals)) {
    return {
      setup: presetSetup("essentials"),
      reasons: [
        "We couldn't tell your role, so here's a solid start. Tweak away.",
      ],
      matched: false,
    };
  }
  const core: Reason[] = [
    { text: ROLE_REASON[signals.role ?? "none"], items: [] },
  ];
  let setup: Setup = {
    ...presetSetup(
      signals.role === null ? "essentials" : ROLE_BASE[signals.role],
    ),
    plan: current.plan,
  };
  const want = (ids: string[], reason: string): void => {
    setup = addAll(setup, ids);
    core.push({ text: reason, items: ids });
  };
  if (signals.calls)
    want(["webcam", "headphones"], "Webcam and headset for clear calls.");
  if (signals.creator) {
    want(
      ["mic-kit", "webcam", "headphones", "lamp-led"],
      "Mic, camera and light for recording.",
    );
  }
  if (signals.computer) {
    setup = addAll(setup, ["mac-mini"]);
    if (!hasSlot(setup, "keyboard")) setup = addAll(setup, ["kb-mx"]);
    if (!hasSlot(setup, "mouse")) setup = addAll(setup, ["mouse-mx"]);
    if (!hasSlot(setup, "monitor")) setup = addAll(setup, ["mon-27-a27i"]);
    core.push({
      text: "A Mac mini with a screen, keyboard and mouse, since you have no laptop.",
      items: ["mac-mini"],
    });
  }
  if (signals.screens !== null) {
    setup = withScreens(setup, signals.screens);
    core.push({
      text: `${String(signals.screens)} matching screens side by side.`,
      items: [],
    });
  }
  if (signals.premium) {
    setup = setDesk(setup, WIDE_DESK).setup;
    core.push({
      text: "The dual-motor desk: the sturdiest one we have.",
      items: [WIDE_DESK],
    });
  }
  if (signals.internet === "starlink") {
    want(["starlink"], "Starlink, so you are online anywhere.");
  } else if (signals.internet === "router") {
    want(["router"], "A Wi-Fi 6 router for a stronger connection.");
  }
  const climate = [
    signals.humid ? "dehumidifier" : null,
    signals.hot ? "tower-fan" : null,
    signals.dusty ? "purifier" : null,
    signals.coffee ? "nespresso" : null,
  ].filter((id): id is string => id !== null);
  if (climate.length > 0)
    want(climate, `${joinNames(climate)} for life in Bali.`);
  if (signals.walking)
    want(["walking-pad"], "A walking pad under the desk to keep moving.");
  if (signals.standing || signals.walking) {
    setup = { ...setup, posture: "stand" };
    if (!signals.walking)
      core.push({ text: "Standing height for long days.", items: [] });
  }
  const tail: string[] = [];
  if (signals.weeks !== null && signals.weeks >= 4)
    setup = { ...setup, plan: "monthly" };
  setup = normalizeSetup(setup).setup;
  if (signals.budgetCents !== null) {
    const fitted = fitBudget(setup, signals.budgetCents);
    setup = fitted.setup;
    const asked = [...new Set(core.flatMap((reason) => reason.items))];
    const dropped = asked.filter((id) => !isPresent(setup, id));
    if (dropped.length > 0)
      tail.push(`Left out the ${joinNames(dropped)} to stay on budget.`);
    tail.push(
      fitted.fits
        ? `Fits your ${formatCents(signals.budgetCents)} a week budget.`
        : "This is the leanest setup we can do.",
    );
  }
  if (
    setup.plan === "monthly" &&
    signals.weeks !== null &&
    signals.weeks >= 4
  ) {
    const savings = monthlySavingsCents(setupLines(setup));
    tail.unshift(
      savings > 0
        ? `Monthly plan: you're staying a while, so you save ${formatCents(savings)} a month.`
        : "Monthly plan: you're staying a while.",
    );
  }
  const kept = core
    .filter(
      (reason) =>
        reason.items.length === 0 ||
        reason.items.some((id) => isPresent(setup, id)),
    )
    .map((reason) => reason.text);
  const room = Math.max(1, 4 - tail.length);
  return {
    setup,
    reasons: [...kept.slice(0, room), ...tail].slice(0, 4),
    matched: true,
  };
}
```

- [ ] **Step 5: Run the tests to verify they pass**

```bash
pnpm exec vitest run src/lib
pnpm lint && pnpm type-check && pnpm format:check && pnpm test
```

Expected: all `src/lib` tests pass (scene-layout 18, text 1, checkout 10, suggest 14), then the full unit suite passes.

- [ ] **Step 6: Commit and push**

```bash
git add package.json pnpm-lock.yaml src/lib
git commit -F - <<'EOF'
feat: add close-up geometry, checkout rules and smart setup logic

Pure, tested modules for the desk close-up and tap targets, Bali delivery
dates and checkout validation, order references, count labels, and the
rule-based smart setup. A standing chair now moves to the quieter side (BS-04).

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```
```bash
pnpm build && pnpm test:e2e
git push
gh run watch $(gh run list --branch main --limit 1 --json databaseId --jq '.[0].databaseId') --exit-status
# If the run failed: fix, push again, then delete the failed run(s):
#   gh run list --status failure --json databaseId --jq '.[].databaseId' | xargs -n1 gh run delete
```

---
### Task 2: Store additions

**Files:**
- Modify: `src/store/setup-store.ts`, `src/store/setup-store.test.ts`

**Interfaces:**
- Consumes: `Order`, `parseOrder` (Task 1); presets and setup rules (Plan 1).
- Produces: `SceneView = "room" | "desk"`; state `view`, `lastOrder` (persisted with `setup`), `previousSetup`; actions `setView(view)`, `editFromScene(category)` (opens the category, clears search, switches to close-up), `placeOrder(order)`, `startNewSetup()` (Essentials, room view, cleared search), `applySuggestion(setup)` (keeps the previous setup), `undoSuggestion()`.

- [ ] **Step 1: Write the failing tests**

`src/store/setup-store.test.ts` (whole file):

```ts
import { beforeEach, describe, expect, it } from "vitest";

import { defaultSetup, presetSetup } from "@/data/presets";
import { createOrder } from "@/lib/checkout";
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

  it("keeps a search query and clears it when a category is opened", () => {
    const store = useSetupStore.getState();
    store.setSearch("webcam");
    expect(useSetupStore.getState().search).toBe("webcam");
    store.showCategory("screen");
    expect(useSetupStore.getState().search).toBe("");
  });

  it("switches between the room view and the desk close-up", () => {
    const store = useSetupStore.getState();
    expect(useSetupStore.getState().view).toBe("room");
    store.setView("desk");
    expect(useSetupStore.getState().view).toBe("desk");
  });

  it("edits from the scene: opens the category in the close-up view", () => {
    const store = useSetupStore.getState();
    store.setSearch("lamp");
    store.editFromScene("chair");
    const state = useSetupStore.getState();
    expect(state.activeCategory).toBe("chair");
    expect(state.view).toBe("desk");
    expect(state.search).toBe("");
  });

  it("keeps the last order and starts a new setup after it", () => {
    const store = useSetupStore.getState();
    store.applyPreset("founders");
    const order = createOrder(
      {
        fullName: "Kadek Ayu",
        email: "kadek@example.com",
        whatsapp: "",
        area: "Ubud",
        address: "Villa Melati",
        deliveryDate: "2026-10-13",
      },
      useSetupStore.getState().setup,
      new Date("2026-10-11T02:00:00Z"),
    );
    store.placeOrder(order);
    expect(useSetupStore.getState().lastOrder).toEqual(order);
    store.setView("desk");
    store.startNewSetup();
    const state = useSetupStore.getState();
    expect(state.setup).toEqual(presetSetup("essentials"));
    expect(state.view).toBe("room");
    expect(state.lastOrder).toEqual(order);
  });

  it("applies a suggestion and undoes it once", () => {
    const store = useSetupStore.getState();
    store.applyPreset("trading");
    const before = useSetupStore.getState().setup;
    store.applySuggestion(presetSetup("studio"));
    expect(useSetupStore.getState().setup).toEqual(presetSetup("studio"));
    store.undoSuggestion();
    expect(useSetupStore.getState().setup).toEqual(before);
    expect(useSetupStore.getState().previousSetup).toBeNull();
    store.undoSuggestion();
    expect(useSetupStore.getState().setup).toEqual(before);
  });
});
```

- [ ] **Step 2: Run to verify failure**

```bash
pnpm exec vitest run src/store
```

Expected: FAIL — `store.setView is not a function` (and the order and suggestion tests fail).

- [ ] **Step 3: Implement**

`src/store/setup-store.ts` (whole file):

```ts
import { create } from "zustand";
import {
  createJSONStorage,
  persist,
  type StateStorage,
} from "zustand/middleware";

import { defaultSetup, emptySetup, presetSetup } from "@/data/presets";
import { type Order, parseOrder } from "@/lib/checkout";
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

export type SceneView = "room" | "desk";

export interface SetupState {
  setup: Setup;
  hydrated: boolean;
  activeCategory: CategoryId;
  notice: StoreNotice | null;
  search: string;
  view: SceneView;
  lastOrder: Order | null;
  previousSetup: Setup | null;
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
  setSearch: (query: string) => void;
  setView: (view: SceneView) => void;
  editFromScene: (category: CategoryId) => void;
  placeOrder: (order: Order) => void;
  startNewSetup: () => void;
  applySuggestion: (setup: Setup) => void;
  undoSuggestion: () => void;
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
        search: "",
        view: "room",
        lastOrder: null,
        previousSetup: null,
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
        // Opening a category (tab or "+" hotspot) leaves search mode.
        showCategory: (category) => {
          set({ activeCategory: category, search: "" });
        },
        setSearch: (query) => {
          set({ search: query });
        },
        setView: (view) => {
          set({ view });
        },
        // Smart setup keeps the setup it replaced, for a one-step undo.
        applySuggestion: (next) => {
          set({
            previousSetup: get().setup,
            setup: next,
            notice: null,
            search: "",
          });
        },
        undoSuggestion: () => {
          const previous = get().previousSetup;
          if (previous !== null) set({ setup: previous, previousSetup: null });
        },
        placeOrder: (order) => {
          set({ lastOrder: order });
        },
        startNewSetup: () => {
          set({
            setup: defaultSetup(),
            view: "room",
            search: "",
            activeCategory: "desk",
            notice: null,
          });
        },
        // Tapping the desk, a screen or the chair in the scene.
        editFromScene: (category) => {
          set({ activeCategory: category, search: "", view: "desk" });
        },
      };
    },
    {
      name: STORAGE_KEY,
      version: 1,
      storage: createJSONStorage(() => safeStorage),
      skipHydration: true,
      partialize: (state) => ({
        setup: state.setup,
        lastOrder: state.lastOrder,
      }),
      merge: (persisted, current) => {
        const stored = persisted as
          { setup?: unknown; lastOrder?: unknown } | undefined;
        const raw = parseSetup(stored?.setup);
        return {
          ...current,
          setup: raw === null ? current.setup : normalizeSetup(raw).setup,
          lastOrder: parseOrder(stored?.lastOrder),
        };
      },
      migrate: () => ({ setup: defaultSetup() }),
    },
  ),
);
```

- [ ] **Step 4: Verify**

```bash
pnpm exec vitest run src/store
pnpm lint && pnpm type-check && pnpm format:check && pnpm test
```

Expected: `Tests  12 passed` for the store, then the full suite passes.

- [ ] **Step 5: Commit and push**

```bash
git add src/store
git commit -F - <<'EOF'
feat: store scene view, last order and smart-setup undo

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```
```bash
pnpm build && pnpm test:e2e
git push
gh run watch $(gh run list --branch main --limit 1 --json databaseId --jq '.[0].databaseId') --exit-status
# If the run failed: fix, push again, then delete the failed run(s):
#   gh run list --status failure --json databaseId --jq '.[].databaseId' | xargs -n1 gh run delete
```

---
### Task 3: Counting totals and singular counts

**Files:**
- Create: `src/components/builder/use-tweened-number.ts`
- Modify: `src/components/builder/summary-panel.tsx`, `src/components/builder/price-bar.tsx`, `e2e/builder.spec.ts`

**Interfaces:**
- Consumes: `countLabel` (Task 1).
- Produces: `useTweenedNumber(target)` — counts to the new value in 350 ms with an ease-out curve, instantly under reduced motion. Totals keep their test ids; screen readers get the final total from a separate `sr-only` live region.

- [ ] **Step 1: Write the failing E2E test** (BS-02: "1 items")

`e2e/builder.spec.ts` (whole file; the new test is "counts use the singular for one item"):

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

test("search finds items across categories", async ({ page }) => {
  const search = page.getByTestId("catalog-search");
  await search.fill("webcam");
  await expect(page.getByRole("tab", { name: "Desk" })).toBeHidden();
  await addFromCard(page, "webcam");
  await expect(page.getByTestId("item-card-webcam")).toHaveAttribute(
    "data-selected",
    "true",
  );
  await expect(page.getByTestId("scene-item-webcam")).toBeVisible();
  await search.fill("xyzzy");
  await expect(page.getByText("No match for “xyzzy”")).toBeVisible();
  await page.getByRole("button", { name: "lamp", exact: true }).click();
  await expect(page.getByTestId("item-card-lamp-led")).toBeVisible();
  await search.press("Escape");
  await expect(page.getByRole("tab", { name: "Desk" })).toBeVisible();
});

test("slash focuses the search on desktop", async ({ page, isMobile }) => {
  test.skip(isMobile, "keyboard shortcut is desktop only");
  await page.keyboard.press("/");
  await expect(page.getByTestId("catalog-search")).toBeFocused();
});

test("a selected single-unit screen is removed by tapping its card", async ({
  page,
  isMobile,
}) => {
  await page.getByRole("button", { name: "Trading" }).click();
  await page.getByRole("tab", { name: "Screens" }).click();
  await expect(page.getByTestId("qty-mon-34-gaming")).toHaveCount(0);
  await addFromCard(page, "mon-34-gaming");
  await expect(page.getByTestId("scene-monitor-mon-34-gaming")).toHaveCount(0);
  const summary = await openSummary(page, isMobile);
  await expect(summary.getByTestId("summary-line-mon-34-gaming")).toHaveCount(
    0,
  );
});

test("item cards expose price and badges to assistive tech", async ({
  page,
}) => {
  const card = page
    .getByTestId("item-card-desk-electric")
    .getByRole("button")
    .first();
  await expect(card).toHaveAccessibleName("Electrical Adjustable Desk");
  await expect(card).toHaveAccessibleDescription(/\$4\.90/);
  await expect(card).toHaveAccessibleDescription(/−30%/);
});

test("concept items are labelled in the summary", async ({
  page,
  isMobile,
}) => {
  await page.getByRole("tab", { name: "Chair" }).click();
  await addFromCard(page, "chair-basic");
  const summary = await openSummary(page, isMobile);
  await expect(summary.getByTestId("summary-line-chair-basic")).toContainText(
    "Concept",
  );
});

test("cards fall back to an icon when product photos fail", async ({
  page,
}) => {
  await page.route("https://strapi.monis.rent/**", (route) => route.abort());
  await page.reload();
  await expect(
    page.getByTestId("item-card-desk-electric").getByTestId("thumb-fallback"),
  ).toBeVisible();
});

test("the mobile price bar announces total changes", async ({
  page,
  isMobile,
}) => {
  test.skip(!isMobile, "mobile only");
  const live = page.getByTestId("price-bar-live");
  await expect(live).toHaveAttribute("aria-live", "polite");
  await expect(live).toHaveText("$12.70 per week");
  await page.getByRole("button", { name: "Founders" }).click();
  await expect(live).toHaveText("$47.45 per week");
});

test("counts use the singular for one item", async ({ page, isMobile }) => {
  await page.getByRole("button", { name: "Start empty" }).click();
  const summary = await openSummary(page, isMobile);
  await expect(summary).toContainText("1 item ·");
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
pnpm build && pnpm test:e2e e2e/builder.spec.ts -g "singular"
```

Expected: FAIL — the summary reads "1 items ·".

- [ ] **Step 3: Implement**

`src/components/builder/use-tweened-number.ts`:

```ts
import { useEffect, useRef, useState } from "react";

const DURATION_MS = 350;

// Counts smoothly from the previous value to `target` (instantly with reduced motion).
export function useTweenedNumber(target: number): number {
  const [value, setValue] = useState(target);
  const current = useRef(target);
  useEffect(() => {
    const from = current.current;
    if (from === target) return;
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const start = performance.now();
    let frame = 0;
    const step = (now: number): void => {
      const progress = reduce ? 1 : Math.min(1, (now - start) / DURATION_MS);
      const eased = 1 - (1 - progress) ** 3;
      const next = Math.round(from + (target - from) * eased);
      current.current = next;
      setValue(next);
      if (progress < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => {
      cancelAnimationFrame(frame);
    };
  }, [target]);
  return value;
}
```

`src/components/builder/summary-panel.tsx` (whole file):

```tsx
"use client";

import { Truck, X } from "lucide-react";
import Link from "next/link";

import { PlanToggle } from "@/components/builder/plan-toggle";
import { useSetupSummary } from "@/components/builder/use-setup-summary";
import { useTweenedNumber } from "@/components/builder/use-tweened-number";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { matchingPresetId, PRESETS } from "@/data/presets";
import { formatCents } from "@/lib/money";
import { effectiveCents } from "@/lib/pricing";
import { countLabel } from "@/lib/text";
import { useSetupStore } from "@/store/setup-store";

// The item list scrolls; plan, total and the Rent button stay pinned below it.
export function SummaryPanel() {
  const setup = useSetupStore((state) => state.setup);
  const remove = useSetupStore((state) => state.remove);
  const showCategory = useSetupStore((state) => state.showCategory);
  const { lines, totalCents, savingsCents, arrival } = useSetupSummary();
  const shownTotal = useTweenedNumber(totalCents);
  const presetName = PRESETS.find(
    (preset) => preset.id === matchingPresetId(setup),
  )?.name;
  const unit = setup.plan === "weekly" ? "week" : "month";
  const count = lines.reduce((sum, line) => sum + line.qty, 0);
  return (
    <div
      className="flex min-h-0 flex-1 flex-col gap-3"
      data-testid="summary-panel"
    >
      <div className="shrink-0">
        <h2 className="text-base font-semibold">Your setup</h2>
        <p className="text-xs text-muted-foreground">
          {countLabel(count, "item")} · {presetName ?? "Custom"}
        </p>
      </div>
      <ul className="min-h-0 flex-1 space-y-2 overflow-y-auto overscroll-contain pr-1 text-sm">
        {lines.map(({ item, qty }) => (
          <li
            key={item.id}
            className="flex items-start gap-2"
            data-testid={`summary-line-${item.id}`}
          >
            <span className="line-clamp-2 min-w-0 flex-1 leading-snug">
              {qty > 1 ? `${String(qty)} × ` : ""}
              {item.name}
              {item.concept ? (
                <Badge variant="secondary" className="ml-1.5 align-middle">
                  Concept
                </Badge>
              ) : null}
            </span>
            <span className="shrink-0 tabular-nums">
              {formatCents(qty * effectiveCents(item, setup.plan))}
            </span>
            {item.category === "desk" ? (
              <button
                type="button"
                onClick={() => {
                  showCategory("desk");
                }}
                className="-my-1.5 min-h-8 shrink-0 rounded px-2 text-xs text-muted-foreground underline-offset-2 hover:underline"
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
                className="-my-1.5 flex size-8 shrink-0 items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="size-3.5" aria-hidden />
              </button>
            )}
          </li>
        ))}
      </ul>
      <div className="shrink-0 space-y-3 border-t pt-3">
        <PlanToggle />
        <div>
          {/* Screen readers get the final total; the visible one counts up. */}
          <p className="sr-only" aria-live="polite">
            {formatCents(totalCents)} per {unit}
          </p>
          <p
            className="text-2xl font-bold tabular-nums"
            data-testid="summary-total"
            aria-hidden
          >
            {formatCents(shownTotal)}
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
        <Button asChild size="lg" className="h-11 w-full">
          <Link href="/checkout">Rent this setup</Link>
        </Button>
      </div>
    </div>
  );
}
```

`src/components/builder/price-bar.tsx` (whole file):

```tsx
"use client";

import { ChevronUp } from "lucide-react";
import Link from "next/link";

import { SummaryPanel } from "@/components/builder/summary-panel";
import { useSetupSummary } from "@/components/builder/use-setup-summary";
import { useTweenedNumber } from "@/components/builder/use-tweened-number";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { formatCents } from "@/lib/money";
import { countLabel } from "@/lib/text";
import { useSetupStore } from "@/store/setup-store";

// Pinned to the bottom below lg; tapping the total opens the full summary.
export function PriceBar() {
  const plan = useSetupStore((state) => state.setup.plan);
  const { lines, totalCents, arrival } = useSetupSummary();
  const shownTotal = useTweenedNumber(totalCents);
  const count = lines.reduce((sum, line) => sum + line.qty, 0);
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-white/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_16px_rgb(21_37_46/0.06)] backdrop-blur lg:hidden">
      <div className="mx-auto flex h-16 max-w-3xl items-center gap-3 px-3 sm:px-4 short:h-14">
        <Drawer>
          <DrawerTrigger asChild>
            <button
              type="button"
              className="flex min-w-0 flex-1 items-center gap-2 rounded-lg py-1 text-left"
              data-testid="price-bar"
            >
              <span className="min-w-0">
                <span className="block text-lg leading-tight font-bold tabular-nums">
                  {formatCents(shownTotal)}
                  <span className="text-xs font-normal text-muted-foreground">
                    {" "}
                    / {plan === "weekly" ? "week" : "month"}
                  </span>
                </span>
                <span className="block truncate text-xs text-muted-foreground">
                  {countLabel(count, "item")} ·{" "}
                  {arrival === "today"
                    ? "Can arrive today"
                    : "Arrives tomorrow"}
                </span>
              </span>
              <ChevronUp
                className="size-5 shrink-0 text-muted-foreground"
                aria-hidden
              />
              <span className="sr-only">View setup</span>
              <span
                className="sr-only"
                aria-live="polite"
                data-testid="price-bar-live"
              >
                {formatCents(totalCents)} per{" "}
                {plan === "weekly" ? "week" : "month"}
              </span>
            </button>
          </DrawerTrigger>
          <DrawerContent>
            <div className="mx-auto flex max-h-[78dvh] w-full max-w-md flex-col px-4 pt-2 pb-[calc(1rem+env(safe-area-inset-bottom))]">
              <DrawerTitle className="sr-only">Your setup</DrawerTitle>
              <DrawerDescription className="sr-only">
                Items, plan and total price.
              </DrawerDescription>
              <SummaryPanel />
            </div>
          </DrawerContent>
        </Drawer>
        <Button asChild size="lg" className="h-11 px-5">
          <Link href="/checkout">Rent</Link>
        </Button>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Verify**

```bash
pnpm lint && pnpm type-check && pnpm format:check && pnpm test
pnpm build && pnpm test:e2e
```

Expected: the whole E2E suite passes; the totals still read e.g. `$34.80 / month` after the count finishes.

- [ ] **Step 5: Commit and push**

```bash
git add src/components/builder e2e/builder.spec.ts
git commit -F - <<'EOF'
feat: count totals up smoothly and fix singular item counts

BS-02: "1 items" now reads "1 item" in the summary and the price bar.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```
```bash
pnpm build && pnpm test:e2e
git push
gh run watch $(gh run list --branch main --limit 1 --json databaseId --jq '.[0].databaseId') --exit-status
# If the run failed: fix, push again, then delete the failed run(s):
#   gh run list --status failure --json databaseId --jq '.[].databaseId' | xargs -n1 gh run delete
```

---
### Task 4: Scene — close-up, tap-to-edit, chair hotspot, Hue lamp, drop-in

**Files:**
- Modify: `src/app/globals.css`, `src/components/scene/{workspace-scene,desk-items,floor-items,monitor-art,chair-art,desk-art}.tsx`, `src/components/builder/{site-header,builder}.tsx`, `e2e/scene.spec.ts`
- Create: `src/components/builder/scene-view-toggle.tsx`

**Interfaces:**
- Consumes: `deskFocus`, `ROOM_VIEW`, `projectPoint`, `isInFrame`, `sceneTargets` (Task 1); `view`, `setView`, `editFromScene` (Task 2).
- Produces: `WorkspaceScene({ setup, view?, onHotspot?, onEdit? })` with `data-testid="scene-frame"` (`data-view`) and `scene-camera`; buttons "Change desk", "Change screens", "Change chair"; hotspot "Add a chair" when there is none (BS-03); the Hue lamp in front of the screens (BS-01); `SceneViewToggle` (radios "Room" / "Close-up"); `SiteHeader({ title?, subtitle?, action? })`; `animate-drop-in` utility.

- [ ] **Step 1: Write the failing E2E tests**

`e2e/scene.spec.ts` (whole file):

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

test("the close-up view zooms into the desk and back", async ({ page }) => {
  await page.goto("/");
  const frame = page.getByTestId("scene-frame");
  const desk = page.getByTestId("scene-desk-electric");
  await expect(frame).toHaveAttribute("data-view", "room");
  const roomWidth = (await desk.boundingBox())?.width ?? 0;
  await page.getByRole("radio", { name: "Close-up" }).click();
  await expect(frame).toHaveAttribute("data-view", "desk");
  await expect
    .poll(async () => (await desk.boundingBox())?.width ?? 0)
    .toBeGreaterThan(roomWidth * 1.5);
  await page.getByRole("radio", { name: "Room" }).click();
  await expect(frame).toHaveAttribute("data-view", "room");
});

test("tapping the chair in the scene opens the chair tab in close-up", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Change chair" }).click();
  await expect(page.getByRole("tab", { name: "Chair" })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await expect(page.getByTestId("scene-frame")).toHaveAttribute(
    "data-view",
    "desk",
  );
});

test("an empty setup offers a chair hotspot", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Start empty" }).click();
  await page.getByRole("button", { name: "Add a chair" }).click();
  await expect(page.getByRole("tab", { name: "Chair" })).toHaveAttribute(
    "aria-selected",
    "true",
  );
});
```

- [ ] **Step 2: Run to verify failure**

```bash
pnpm build && pnpm test:e2e e2e/scene.spec.ts
```

Expected: FAIL — `scene-frame` not found, no "Close-up" radio, no "Change chair" or "Add a chair" button.

- [ ] **Step 3: Implement**

`src/app/globals.css` (adds the `drop-in` keyframes and the reduced-motion rule):

```diff
diff --git a/src/app/globals.css b/src/app/globals.css
index 31f987e..f0ac270 100644
--- a/src/app/globals.css
+++ b/src/app/globals.css
@@ -34,6 +34,28 @@
   --radius-2xl: calc(var(--radius) * 1.8);
 }
 
+/* Scene items drop in when added (and on first load). */
+@theme {
+  --animate-drop-in: drop-in 420ms cubic-bezier(0.34, 1.56, 0.64, 1) both;
+
+  @keyframes drop-in {
+    from {
+      opacity: 0;
+      transform: translateY(-14px);
+    }
+    to {
+      opacity: 1;
+      transform: translateY(0);
+    }
+  }
+}
+
+@media (prefers-reduced-motion: reduce) {
+  .animate-drop-in {
+    animation: none;
+  }
+}
+
 /* monis.rent brand: navy #15252e, blue #63aefd, cream #f9f2ea. Light theme only. */
 :root {
   --background: #f9f2ea;
```

`src/components/scene/workspace-scene.tsx` (whole file):

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
import {
  DESK_HEIGHT,
  deskFocus,
  isInFrame,
  layoutScene,
  projectPoint,
  ROOM_VIEW,
  SCENE,
  sceneTargets,
} from "@/lib/scene-layout";
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
  view = "room",
  onHotspot,
  onEdit,
}: {
  setup: Setup;
  view?: "room" | "desk";
  // Without handlers the scene is display-only (no "+" hotspots, no tap targets).
  onHotspot?: (category: CategoryId) => void;
  onEdit?: (category: CategoryId) => void;
}) {
  // Lay out at sitting height and lift with a CSS transform so posture changes animate.
  const sitting = layoutScene({ ...setup, posture: "sit" });
  const actual = layoutScene(setup);
  const lift =
    setup.posture === "stand" ? DESK_HEIGHT.stand - DESK_HEIGHT.sit : 0;
  const deskItem = getItem(setup.deskId);
  const focus = view === "desk" ? deskFocus(actual) : ROOM_VIEW;
  const hasLamp = (setup.items["lamp-led"] ?? 0) > 0;
  const plantCount =
    (setup.items["plant-monstera"] ?? 0) + (setup.items["plant-snake"] ?? 0);
  const candidates: Hotspot[] = [];
  if (actual.monitorHotspot !== null) {
    candidates.push({
      label: "Add a screen",
      category: "screen",
      ...actual.monitorHotspot,
    });
  }
  if (!hasLamp) {
    candidates.push({
      label: "Add a lamp",
      category: "accessory",
      // Where the lamp head would be, clear of the laptop.
      x: actual.desk.x + 8,
      y: actual.desk.y - 48,
    });
  }
  if (setup.chairId === null) {
    candidates.push({
      label: "Add a chair",
      category: "chair",
      x: SCENE.width / 2,
      y: SCENE.floorY - 60,
    });
  }
  if (plantCount < 2) {
    candidates.push({
      label: "Add a plant",
      category: "accessory",
      x: actual.desk.x - 30 - plantCount * 34,
      y: SCENE.floorY - 24,
    });
  }
  // Hotspots cut off by the close-up are hidden rather than half-shown.
  const hotspots =
    onHotspot === undefined
      ? []
      : candidates.filter((hotspot) => isInFrame(projectPoint(focus, hotspot)));
  const targets = onEdit === undefined ? [] : sceneTargets(setup, actual);
  return (
    <div
      className="relative w-full overflow-hidden"
      style={{
        aspectRatio: `${String(SCENE.width)} / ${String(SCENE.height)}`,
      }}
      data-testid="scene-frame"
      data-view={view}
    >
      <div
        className="absolute inset-0 origin-top-left transition-transform duration-500 ease-out motion-reduce:transition-none"
        style={{
          transform: `translate(${String(focus.x)}%, ${String(focus.y)}%) scale(${String(focus.scale)})`,
        }}
        data-testid="scene-camera"
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
              key={setup.deskId}
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
              <ChairArt
                key={setup.chairId}
                item={getItem(setup.chairId)}
                centerX={SCENE.width / 2}
              />
            </g>
          )}
        </svg>
        {targets.map((target) => (
          <button
            key={target.key}
            type="button"
            aria-label={target.label}
            title={target.label}
            onClick={() => {
              onEdit?.(target.category);
            }}
            className="absolute rounded-md transition hover:bg-accent/10 hover:ring-2 hover:ring-accent/50 focus-visible:ring-3 focus-visible:ring-ring/60 focus-visible:outline-none"
            style={{
              left: percent(target.x, SCENE.width),
              top: percent(target.y, SCENE.height),
              width: percent(target.width, SCENE.width),
              height: percent(target.height, SCENE.height),
            }}
          />
        ))}
        {hotspots.map((hotspot) => (
          <button
            key={hotspot.label}
            type="button"
            aria-label={hotspot.label}
            title={hotspot.label}
            onClick={() => {
              onHotspot?.(hotspot.category);
            }}
            className="absolute flex size-8 items-center justify-center rounded-full border-2 border-dashed border-primary/40 bg-white/80 text-primary shadow-sm transition-colors hover:bg-white focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
            style={{
              left: percent(hotspot.x, SCENE.width),
              top: percent(hotspot.y, SCENE.height),
              // Centre on the point and stay the same size in the close-up.
              transform: `translate(-50%, -50%) scale(${String(1 / focus.scale)})`,
            }}
          >
            <Plus className="size-4" aria-hidden />
          </button>
        ))}
      </div>
    </div>
  );
}
```

`src/components/scene/desk-items.tsx` (whole file):

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
      {/* In front of the screens so it is never hidden behind them. */}
      {has(setup, "lamp-hue") ? (
        <g className="animate-drop-in" data-testid="scene-item-lamp-hue">
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
      {has(setup, "light-bar") && middle !== undefined ? (
        <rect
          className="animate-drop-in"
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
        <g className="animate-drop-in" data-testid="scene-item-webcam">
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
          className="animate-drop-in"
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
          className="animate-drop-in"
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
              className="animate-drop-in"
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
          className="animate-drop-in"
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
          className="animate-drop-in"
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
          className="animate-drop-in"
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
          className="animate-drop-in"
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
  return (
    <g>
      {has(setup, "lamp-led") ? (
        <g className="animate-drop-in" data-testid="scene-item-lamp-led">
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

      {has(setup, "mic-kit") ? (
        <g
          className="animate-drop-in"
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

`src/components/scene/floor-items.tsx` (whole file):

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
    <g className="animate-drop-in" data-testid="scene-plant-monstera">
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
    <g className="animate-drop-in" data-testid="scene-plant-snake">
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
          className="animate-drop-in"
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
        <g className="animate-drop-in" data-testid={`scene-item-${internet}`}>
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
        <g className="animate-drop-in" data-testid="scene-item-nespresso">
          <rect x="308" y="112" width="70" height="3" rx="1.5" fill="#C9A77F" />
          <rect x="334" y="94" width="16" height="18" rx="3" fill="#D94A3A" />
          <rect x="337" y="106" width="10" height="5" rx="1" fill={DARK} />
          <rect x="356" y="104" width="6" height="8" rx="1.5" fill="#FFFFFF" />
        </g>
      ) : null}
      {has(setup, "walking-pad") ? (
        <g className="animate-drop-in" data-testid="scene-item-walking-pad">
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
          className="animate-drop-in"
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

`src/components/scene/monitor-art.tsx` (whole file):

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
    <g
      className="animate-drop-in"
      data-testid={`scene-monitor-${monitor.item.id}`}
    >
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

`src/components/scene/chair-art.tsx` (whole file):

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
    <g className="animate-drop-in" data-testid={`scene-chair-${variant}`}>
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

`src/components/scene/desk-art.tsx` (whole file):

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
    <g className="animate-drop-in" data-testid={`scene-desk-${variant}`}>
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

`src/components/builder/scene-view-toggle.tsx` (whole file):

```tsx
"use client";

import { Maximize2, ZoomIn } from "lucide-react";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useSetupStore } from "@/store/setup-store";

// Two positions only: the whole room, or a close-up of the desk.
export function SceneViewToggle() {
  const view = useSetupStore((state) => state.view);
  const setView = useSetupStore((state) => state.setView);
  return (
    <ToggleGroup
      type="single"
      variant="outline"
      size="sm"
      value={view}
      onValueChange={(value) => {
        if (value === "room" || value === "desk") setView(value);
      }}
      aria-label="Scene view"
      className="rounded-lg bg-white/90 shadow-sm backdrop-blur"
    >
      <ToggleGroupItem value="room" className="h-8 px-2.5">
        <Maximize2 aria-hidden />
        Room
      </ToggleGroupItem>
      <ToggleGroupItem value="desk" className="h-8 px-2.5">
        <ZoomIn aria-hidden />
        Close-up
      </ToggleGroupItem>
    </ToggleGroup>
  );
}
```

`src/components/builder/site-header.tsx` (whole file):

```tsx
import type { ReactNode } from "react";

// Never scrolls away: every page is a fixed-height app shell.
export function SiteHeader({
  title = "Design your Bali workspace",
  subtitle,
  action,
}: {
  title?: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <header className="shrink-0 border-b bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-12 w-full max-w-[1600px] items-center gap-3 px-3 sm:h-14 sm:px-4 short:h-11">
        <span className="shrink-0 text-base font-extrabold tracking-tight sm:text-lg">
          monis.rent
        </span>
        <span className="hidden h-6 w-px bg-border sm:block" aria-hidden />
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-sm font-semibold sm:text-base">
            {title}
          </h1>
          {subtitle === undefined ? null : (
            <p className="hidden truncate text-xs text-muted-foreground lg:block">
              {subtitle}
            </p>
          )}
        </div>
        {action}
      </div>
    </header>
  );
}
```

`src/components/builder/builder.tsx` (whole file):

```tsx
"use client";

import { useEffect } from "react";

import { CategoryPicker } from "@/components/builder/category-picker";
import { NoticeToasts } from "@/components/builder/notice-toasts";
import { PostureToggle } from "@/components/builder/posture-toggle";
import { PresetBar } from "@/components/builder/preset-bar";
import { PriceBar } from "@/components/builder/price-bar";
import { SceneViewToggle } from "@/components/builder/scene-view-toggle";
import { ShareButton } from "@/components/builder/share-button";
import { SiteHeader } from "@/components/builder/site-header";
import { SummaryPanel } from "@/components/builder/summary-panel";
import { WorkspaceScene } from "@/components/scene/workspace-scene";
import { useSetupStore } from "@/store/setup-store";

// Below lg: scene on top, picker below, price bar pinned to the bottom (landscape
// phones: scene | picker). From lg: picker | scene | summary. The page never scrolls.
const GRID =
  "mx-auto grid min-h-0 w-full max-w-[1600px] flex-1 grid-rows-[auto_minmax(0,1fr)] gap-3 px-3 pb-[calc(4.5rem+env(safe-area-inset-bottom))] sm:px-4 short:pb-[calc(4rem+env(safe-area-inset-bottom))] short:grid-cols-2 short:grid-rows-1 lg:grid-cols-[300px_minmax(0,1fr)_260px] lg:grid-rows-1 lg:gap-4 lg:pb-4 xl:grid-cols-[340px_minmax(0,1fr)_300px]";

// The scene keeps its 8:5 ratio and fits inside whatever box it gets.
const SCENE_BOX =
  "flex h-[min(56vw,34dvh)] min-h-0 items-center justify-center [container-type:size] short:h-auto short:flex-1 lg:h-auto lg:flex-1";

function BuilderSkeleton() {
  return (
    <div className={GRID} aria-busy="true">
      <div className="h-[min(56vw,34dvh)] animate-pulse rounded-2xl bg-muted lg:order-2 lg:h-full" />
      <div className="animate-pulse rounded-xl bg-muted lg:order-1" />
      <div className="hidden animate-pulse rounded-2xl bg-muted lg:order-3 lg:block" />
    </div>
  );
}

export function Builder() {
  const hydrated = useSetupStore((state) => state.hydrated);
  const hydrate = useSetupStore((state) => state.hydrate);
  const setup = useSetupStore((state) => state.setup);
  const showCategory = useSetupStore((state) => state.showCategory);
  const editFromScene = useSetupStore((state) => state.editFromScene);
  const view = useSetupStore((state) => state.view);
  useEffect(() => {
    void hydrate();
  }, [hydrate]);
  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      <SiteHeader
        subtitle="Pick a preset, swap anything, see the price, and rent it."
        action={<ShareButton />}
      />
      <PresetBar />
      {hydrated ? (
        <main className={GRID}>
          <section
            aria-label="Preview"
            className="flex min-h-0 flex-col lg:order-2"
          >
            <div className={SCENE_BOX}>
              <div className="relative w-[min(100cqw,160cqh)] overflow-hidden rounded-2xl border bg-white shadow-sm">
                <WorkspaceScene
                  setup={setup}
                  view={view}
                  onHotspot={showCategory}
                  onEdit={editFromScene}
                />
                <div className="absolute top-2 right-2">
                  <SceneViewToggle />
                </div>
                <div className="absolute right-2 bottom-2">
                  <PostureToggle />
                </div>
              </div>
            </div>
          </section>
          <section
            aria-label="Choose items"
            className="flex min-h-0 flex-col lg:order-1"
          >
            <CategoryPicker />
          </section>
          <aside
            aria-label="Summary"
            className="hidden min-h-0 flex-col rounded-2xl border bg-card p-4 shadow-sm lg:order-3 lg:flex"
          >
            <SummaryPanel />
          </aside>
        </main>
      ) : (
        <BuilderSkeleton />
      )}
      {hydrated ? <PriceBar /> : null}
      <NoticeToasts />
    </div>
  );
}
```

- [ ] **Step 4: Verify**

```bash
pnpm lint && pnpm type-check && pnpm format:check && pnpm test
pnpm build && pnpm test:e2e
```

Expected: the whole E2E suite passes, including the 4 scene tests per project.

- [ ] **Step 5: Look at it**

Screenshot the room and close-up views at 1280×720 and 390×844 (temporary spec, not committed) and check that the desk, screens, lamps and keyboard fill the close-up and the toggles do not cover the hotspots.

- [ ] **Step 6: Commit and push**

```bash
git add src/app/globals.css src/components e2e/scene.spec.ts
git commit -F - <<'EOF'
feat: desk close-up, tap-to-edit and livelier scene

Two-position view (room / close-up) with the scene zooming as one layer;
tapping the desk, a screen or the chair opens its options in close-up.
Items drop in. BS-01: the Hue lamp is drawn in front of the screens.
BS-03: an empty setup offers an "Add a chair" hotspot.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```
```bash
pnpm build && pnpm test:e2e
git push
gh run watch $(gh run list --branch main --limit 1 --json databaseId --jq '.[0].databaseId') --exit-status
# If the run failed: fix, push again, then delete the failed run(s):
#   gh run list --status failure --json databaseId --jq '.[].databaseId' | xargs -n1 gh run delete
```

---
### Task 5: Checkout and confirmation pages

**Files:**
- Generated: `src/components/ui/{field,label,textarea,separator}.tsx`
- Create: `src/components/checkout/{order-summary,checkout-form,checkout,order-success}.tsx`, `src/app/checkout/success/page.tsx`, `e2e/checkout.spec.ts`
- Modify: `src/app/checkout/page.tsx` (replaces the placeholder), `e2e/layout.spec.ts`

**Interfaces:**
- Consumes: checkout module (Task 1), `placeOrder`, `lastOrder`, `startNewSetup` (Task 2), `SiteHeader` props (Task 4), `PlanToggle`, `ShareButton`, `useSetupSummary` (Plan 1).
- Produces: `/checkout` (summary + form: Full name, Email, WhatsApp (optional), Delivery area, Delivery date, Address or villa; button "Send rental request"); `/checkout/success` (concept banner, reference `MR-XXXX`, total, delivery, next steps; "Start a new setup", "Browse monis.rent"); test ids `order-summary`, `checkout-total`, `concept-banner`, `order-reference`, `order-total`, `order-delivery`; `BackToBuilder` link.

- [ ] **Step 1: Add the shadcn components**

```bash
CI=1 pnpm dlx shadcn@4.21.4 add -y field label textarea </dev/null
pnpm lint:fix && pnpm format
```

Expected: `field.tsx`, `label.tsx`, `textarea.tsx` and `separator.tsx` in `src/components/ui/`; `pnpm lint` clean afterwards.

- [ ] **Step 2: Write the failing E2E tests**

`e2e/checkout.spec.ts`:

```ts
import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, test } from "@playwright/test";

async function goToCheckout(page: Page): Promise<void> {
  await page.goto("/");
  await expect(page.getByTestId("workspace-scene")).toBeVisible();
  await page
    .getByRole("link", { name: /^Rent/ })
    .filter({ visible: true })
    .click();
  await expect(page.getByRole("heading", { name: "Checkout" })).toBeVisible();
}

async function fillValidRequest(page: Page): Promise<void> {
  await page.getByLabel("Full name").fill("Kadek Ayu");
  await page.getByLabel("Email").fill("kadek@example.com");
  await page.getByLabel("Delivery area").selectOption("Canggu");
  await page
    .getByLabel("Address or villa")
    .fill("Villa Melati, Jl. Pantai Berawa 12");
}

test("Rent opens checkout with the setup and its total", async ({ page }) => {
  await goToCheckout(page);
  await expect(page.getByTestId("checkout-total")).toHaveText("$12.70 / week");
  await expect(page.getByTestId("order-summary")).toContainText(
    "Electrical Adjustable Desk",
  );
});

test("checkout explains what is missing", async ({ page }) => {
  await goToCheckout(page);
  await page.getByRole("button", { name: "Send rental request" }).click();
  for (const message of [
    "Please enter your name.",
    "Please enter a valid email.",
    "Choose a delivery area.",
    "Add a street, villa or landmark.",
  ]) {
    await expect(page.getByText(message)).toBeVisible();
  }
  await expect(page).toHaveURL(/\/checkout$/);
});

test("a valid request ends on the success page and survives a reload", async ({
  page,
}) => {
  await goToCheckout(page);
  await fillValidRequest(page);
  await page.getByRole("button", { name: "Send rental request" }).click();
  await expect(page).toHaveURL(/\/checkout\/success$/);
  await expect(page.getByTestId("concept-banner")).toBeVisible();
  await expect(page.getByTestId("order-reference")).toHaveText(
    /^MR-[A-HJ-NP-Z2-9]{4}$/,
  );
  const reference = await page.getByTestId("order-reference").textContent();
  await expect(page.getByTestId("order-total")).toHaveText("$12.70 / week");
  await expect(page.getByTestId("order-delivery")).toContainText("Canggu");
  await page.reload();
  await expect(page.getByTestId("order-reference")).toHaveText(reference ?? "");
  await page.getByRole("button", { name: "Start a new setup" }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(
    page.getByRole("button", { name: "Essentials" }),
  ).toHaveAttribute("aria-pressed", "true");
});

test("the success page without a request points back to the builder", async ({
  page,
}) => {
  await page.goto("/checkout/success");
  await expect(page.getByText("No request yet")).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Design my workspace" }),
  ).toBeVisible();
});

test("checkout pages have no serious accessibility violations", async ({
  page,
}) => {
  await goToCheckout(page);
  const scan = async (): Promise<string[]> => {
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .analyze();
    return results.violations
      .filter((v) => v.impact === "serious" || v.impact === "critical")
      .map((v) => v.id);
  };
  expect(await scan()).toEqual([]);
  await fillValidRequest(page);
  await page.getByRole("button", { name: "Send rental request" }).click();
  await expect(page.getByTestId("order-reference")).toBeVisible();
  expect(await scan()).toEqual([]);
});
```

`e2e/layout.spec.ts` (whole file; adds "checkout keeps the header and scrolls only its content"):

```ts
import { expect, test } from "@playwright/test";

const SIZES = [
  { width: 375, height: 667 },
  { width: 390, height: 844 },
  { width: 820, height: 1180 },
  { width: 1024, height: 768 },
  { width: 1280, height: 720 },
  { width: 1440, height: 900 },
  { width: 1920, height: 1080 },
  { width: 844, height: 390 },
  { width: 667, height: 375 },
];

test("the builder fits every viewport without page scroll", async ({
  page,
  isMobile,
}) => {
  test.skip(isMobile, "viewport sizes are set explicitly");
  for (const size of SIZES) {
    const label = `${String(size.width)}x${String(size.height)}`;
    await page.setViewportSize(size);
    await page.goto("/");
    await expect(page.getByTestId("workspace-scene")).toBeVisible();
    const overflow = await page.evaluate(() => ({
      vertical: document.documentElement.scrollHeight - window.innerHeight,
      horizontal: document.documentElement.scrollWidth - window.innerWidth,
    }));
    expect(overflow.vertical, label).toBeLessThanOrEqual(0);
    expect(overflow.horizontal, label).toBeLessThanOrEqual(0);
    await expect(page.getByRole("banner"), label).toBeInViewport();
    await expect(page.getByTestId("workspace-scene"), label).toBeInViewport();
    await expect(
      page.getByRole("link", { name: /^Rent/ }).filter({ visible: true }),
      label,
    ).toBeInViewport();
    await expect(page.getByTestId("catalog-search"), label).toBeInViewport();
    await expect(
      page.locator('[data-testid^="item-card-"]').first(),
      label,
    ).toBeInViewport({ ratio: 0.5 });
  }
});

test("touch targets are at least 32 px on phones", async ({
  page,
  isMobile,
}) => {
  test.skip(!isMobile, "phone only");
  await page.goto("/");
  await expect(page.getByTestId("workspace-scene")).toBeVisible();
  await page.getByRole("tab", { name: "Screens" }).click();
  await page
    .getByTestId("item-card-mon-24-1c")
    .getByRole("button")
    .first()
    .click();
  const targets = [
    page.getByRole("button", { name: /^Add another/ }).first(),
    page.getByRole("button", { name: /^Remove one/ }).first(),
    page.getByRole("link", { name: "View on monis.rent" }).first(),
    page.getByTestId("share-button"),
  ];
  for (const target of targets) {
    const box = await target.boundingBox();
    expect(box?.height ?? 0).toBeGreaterThanOrEqual(32);
    expect(box?.width ?? 0).toBeGreaterThanOrEqual(32);
  }
  await page.getByTestId("price-bar").click();
  const remove = page
    .getByTestId("summary-panel")
    .filter({ visible: true })
    .getByRole("button", { name: /^Remove/ })
    .first();
  const box = await remove.boundingBox();
  expect(box?.height ?? 0).toBeGreaterThanOrEqual(32);
});

test("checkout keeps the header and scrolls only its content", async ({
  page,
  isMobile,
}) => {
  test.skip(isMobile, "viewport sizes are set explicitly");
  for (const size of [SIZES[0], SIZES[4]]) {
    if (size === undefined) continue;
    const label = `${String(size.width)}x${String(size.height)}`;
    await page.setViewportSize(size);
    await page.goto("/checkout");
    const submit = page.getByRole("button", { name: "Send rental request" });
    await expect(submit, label).toBeAttached();
    const vertical = await page.evaluate(
      () => document.documentElement.scrollHeight - window.innerHeight,
    );
    expect(vertical, label).toBeLessThanOrEqual(0);
    await submit.scrollIntoViewIfNeeded();
    await expect(submit, label).toBeInViewport();
    await expect(page.getByRole("banner"), label).toBeInViewport();
  }
});
```

- [ ] **Step 3: Run to verify failure**

```bash
pnpm build && pnpm test:e2e e2e/checkout.spec.ts
```

Expected: FAIL — the placeholder page has no "Checkout" heading or form.

- [ ] **Step 4: Implement**

`src/components/checkout/order-summary.tsx`:

```tsx
"use client";

import { Truck } from "lucide-react";

import { PlanToggle } from "@/components/builder/plan-toggle";
import { useSetupSummary } from "@/components/builder/use-setup-summary";
import { Badge } from "@/components/ui/badge";
import { formatCents } from "@/lib/money";
import { effectiveCents } from "@/lib/pricing";
import { countLabel } from "@/lib/text";
import { useSetupStore } from "@/store/setup-store";

export function OrderSummary() {
  const plan = useSetupStore((state) => state.setup.plan);
  const { lines, totalCents, savingsCents, arrival } = useSetupSummary();
  const unit = plan === "weekly" ? "week" : "month";
  const count = lines.reduce((sum, line) => sum + line.qty, 0);
  return (
    <div
      className="space-y-4 rounded-2xl border bg-card p-4 shadow-sm"
      data-testid="order-summary"
    >
      <div>
        <h2 className="text-base font-semibold">Your setup</h2>
        <p className="text-xs text-muted-foreground">
          {countLabel(count, "item")}
        </p>
      </div>
      <ul className="max-h-52 space-y-2 overflow-y-auto overscroll-contain pr-1 text-sm lg:max-h-[40dvh]">
        {lines.map(({ item, qty }) => (
          <li key={item.id} className="flex items-start gap-2">
            <span className="min-w-0 flex-1 leading-snug">
              {qty > 1 ? `${String(qty)} × ` : ""}
              {item.name}
              {item.concept ? (
                <Badge variant="secondary" className="ml-1.5 align-middle">
                  Concept
                </Badge>
              ) : null}
            </span>
            <span className="shrink-0 tabular-nums">
              {formatCents(qty * effectiveCents(item, plan))}
            </span>
          </li>
        ))}
      </ul>
      <div className="space-y-3 border-t pt-3">
        <PlanToggle />
        <div aria-live="polite">
          <p
            className="text-2xl font-bold tabular-nums"
            data-testid="checkout-total"
          >
            {formatCents(totalCents)}
            <span className="text-sm font-normal text-muted-foreground">
              {" "}
              / {unit}
            </span>
          </p>
          {savingsCents > 0 && plan === "monthly" ? (
            <p className="text-xs text-muted-foreground">
              You save {formatCents(savingsCents)} vs weekly billing.
            </p>
          ) : null}
        </div>
        <p className="flex items-center gap-2 text-sm">
          <Truck className="size-4 text-accent-foreground" aria-hidden />
          {arrival === "today"
            ? "Can arrive today"
            : "Arrives tomorrow at the earliest"}
        </p>
        <p className="text-xs text-muted-foreground">
          The delivery fee is calculated by monis.rent based on your location.
        </p>
      </div>
    </div>
  );
}
```

`src/components/checkout/checkout-form.tsx`:

```tsx
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { useForm } from "react-hook-form";

import { useSetupSummary } from "@/components/builder/use-setup-summary";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  type CheckoutInput,
  checkoutSchema,
  type CheckoutValues,
  createOrder,
  DELIVERY_AREAS,
  earliestDelivery,
} from "@/lib/checkout";
import { useSetupStore } from "@/store/setup-store";

const SELECT =
  "h-10 w-full rounded-lg border border-input bg-white px-2.5 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive sm:text-sm";

export function CheckoutForm() {
  const router = useRouter();
  const setup = useSetupStore((state) => state.setup);
  const placeOrder = useSetupStore((state) => state.placeOrder);
  const { arrival } = useSetupSummary();
  const earliest = useMemo(
    () => earliestDelivery(arrival, new Date()),
    [arrival],
  );
  const schema = useMemo(() => checkoutSchema(earliest), [earliest]);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutValues, unknown, CheckoutInput>({
    resolver: zodResolver(schema),
    mode: "onTouched",
    defaultValues: {
      fullName: "",
      email: "",
      whatsapp: "",
      area: "",
      address: "",
      deliveryDate: earliest,
    },
  });
  const onSubmit = (values: CheckoutInput): void => {
    placeOrder(createOrder(values, setup, new Date()));
    router.push("/checkout/success");
  };
  return (
    <form
      noValidate
      onSubmit={(event) => void handleSubmit(onSubmit)(event)}
      className="space-y-5 rounded-2xl border bg-card p-4 shadow-sm"
      aria-label="Delivery details"
    >
      <div>
        <h2 className="text-base font-semibold">Where should we bring it?</h2>
        <p className="text-sm text-muted-foreground">
          monis.rent then confirms availability and the delivery fee.
        </p>
      </div>
      <FieldGroup>
        <Field data-invalid={errors.fullName !== undefined}>
          <FieldLabel htmlFor="fullName">Full name</FieldLabel>
          <Input
            id="fullName"
            autoComplete="name"
            aria-invalid={errors.fullName !== undefined}
            className="h-10 text-base sm:text-sm"
            {...register("fullName")}
          />
          <FieldError errors={[errors.fullName]} />
        </Field>
        <Field data-invalid={errors.email !== undefined}>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            aria-invalid={errors.email !== undefined}
            className="h-10 text-base sm:text-sm"
            {...register("email")}
          />
          <FieldError errors={[errors.email]} />
        </Field>
        <Field data-invalid={errors.whatsapp !== undefined}>
          <FieldLabel htmlFor="whatsapp">
            WhatsApp{" "}
            <span className="font-normal text-muted-foreground">
              (optional)
            </span>
          </FieldLabel>
          <Input
            id="whatsapp"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="+62 812 3456 7890"
            aria-invalid={errors.whatsapp !== undefined}
            className="h-10 text-base sm:text-sm"
            {...register("whatsapp")}
          />
          <FieldError errors={[errors.whatsapp]} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field data-invalid={errors.area !== undefined}>
            <FieldLabel htmlFor="area">Delivery area</FieldLabel>
            <select
              id="area"
              aria-invalid={errors.area !== undefined}
              className={SELECT}
              {...register("area")}
            >
              <option value="">Choose an area</option>
              {DELIVERY_AREAS.map((area) => (
                <option key={area} value={area}>
                  {area}
                </option>
              ))}
            </select>
            <FieldError errors={[errors.area]} />
          </Field>
          <Field data-invalid={errors.deliveryDate !== undefined}>
            <FieldLabel htmlFor="deliveryDate">Delivery date</FieldLabel>
            <Input
              id="deliveryDate"
              type="date"
              min={earliest}
              aria-invalid={errors.deliveryDate !== undefined}
              className="h-10 text-base sm:text-sm"
              {...register("deliveryDate")}
            />
            <FieldError errors={[errors.deliveryDate]} />
          </Field>
        </div>
        <Field data-invalid={errors.address !== undefined}>
          <FieldLabel htmlFor="address">Address or villa</FieldLabel>
          <Textarea
            id="address"
            rows={3}
            autoComplete="street-address"
            placeholder="Villa name, street, or a Google Maps link"
            aria-invalid={errors.address !== undefined}
            className="text-base sm:text-sm"
            {...register("address")}
          />
          <FieldError errors={[errors.address]} />
        </Field>
      </FieldGroup>
      <div className="space-y-2">
        <Button
          type="submit"
          size="lg"
          className="h-11 w-full"
          disabled={isSubmitting}
        >
          Send rental request
        </Button>
        <p className="text-center text-xs text-muted-foreground">
          No payment is taken: this is a concept demo.
        </p>
      </div>
    </form>
  );
}
```

`src/components/checkout/checkout.tsx`:

```tsx
"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

import { SiteHeader } from "@/components/builder/site-header";
import { CheckoutForm } from "@/components/checkout/checkout-form";
import { OrderSummary } from "@/components/checkout/order-summary";
import { Button } from "@/components/ui/button";
import { useSetupStore } from "@/store/setup-store";

export function BackToBuilder() {
  return (
    <Button
      asChild
      variant="outline"
      size="lg"
      className="h-10 shrink-0 sm:h-9"
    >
      <Link href="/">
        <ArrowLeft aria-hidden />
        Edit setup
      </Link>
    </Button>
  );
}

// Same app shell as the builder: the header stays put and only <main> scrolls.
export function Checkout() {
  const hydrated = useSetupStore((state) => state.hydrated);
  const hydrate = useSetupStore((state) => state.hydrate);
  useEffect(() => {
    void hydrate();
  }, [hydrate]);
  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      <SiteHeader title="Checkout" action={<BackToBuilder />} />
      <main className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        {hydrated ? (
          <div className="mx-auto grid w-full max-w-5xl items-start gap-4 px-3 py-4 sm:px-4 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-6 lg:py-6">
            <section
              aria-label="Order summary"
              className="lg:sticky lg:top-0 lg:order-2"
            >
              <OrderSummary />
            </section>
            <section aria-label="Delivery" className="lg:order-1">
              <CheckoutForm />
            </section>
          </div>
        ) : (
          <div
            className="mx-auto h-96 max-w-5xl animate-pulse rounded-2xl bg-muted"
            aria-busy="true"
          />
        )}
      </main>
    </div>
  );
}
```

`src/components/checkout/order-success.tsx`:

```tsx
"use client";

import { CircleCheck, ExternalLink, TriangleAlert } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { ShareButton } from "@/components/builder/share-button";
import { SiteHeader } from "@/components/builder/site-header";
import { BackToBuilder } from "@/components/checkout/checkout";
import { Button } from "@/components/ui/button";
import { formatDeliveryDate } from "@/lib/checkout";
import { formatCents } from "@/lib/money";
import { useSetupStore } from "@/store/setup-store";

const NEXT_STEPS = [
  "monis.rent confirms availability and the delivery fee.",
  "Your setup arrives on the date you chose. The rental starts on arrival.",
  "Swap, add or return items any time from your monis.rent account.",
  "Book the pickup when you leave. Nothing to pack or ship.",
];

function NoOrder() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-3 px-4 py-16 text-center">
      <h2 className="text-xl font-bold">No request yet</h2>
      <p className="text-sm text-muted-foreground">
        Design your workspace first, then send a rental request.
      </p>
      <Button asChild size="lg">
        <Link href="/">Design my workspace</Link>
      </Button>
    </div>
  );
}

export function OrderSuccess() {
  const router = useRouter();
  const hydrated = useSetupStore((state) => state.hydrated);
  const hydrate = useSetupStore((state) => state.hydrate);
  const order = useSetupStore((state) => state.lastOrder);
  const startNewSetup = useSetupStore((state) => state.startNewSetup);
  useEffect(() => {
    void hydrate();
  }, [hydrate]);
  const unit = order?.setup.plan === "monthly" ? "month" : "week";
  const firstName = order?.customer.fullName.split(" ")[0] ?? "";
  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      <SiteHeader title="Request received" action={<BackToBuilder />} />
      <main className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        {!hydrated ? null : order === null ? (
          <NoOrder />
        ) : (
          <div className="mx-auto w-full max-w-2xl space-y-4 px-3 py-4 sm:px-4 lg:py-8">
            <p
              role="note"
              className="flex items-start gap-2 rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900"
              data-testid="concept-banner"
            >
              <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
              <span>
                <strong>Concept demo.</strong> No order was placed, no payment
                was taken and nobody will contact you.
              </span>
            </p>
            <section className="space-y-4 rounded-2xl border bg-card p-5 text-center shadow-sm">
              <CircleCheck
                className="mx-auto size-12 animate-drop-in text-primary"
                aria-hidden
              />
              <div>
                <h2 className="text-2xl font-extrabold tracking-tight">
                  Thanks, {firstName}!
                </h2>
                <p className="text-sm text-muted-foreground">
                  Your request reference is{" "}
                  <strong
                    className="font-mono text-foreground"
                    data-testid="order-reference"
                  >
                    {order.reference}
                  </strong>
                </p>
              </div>
              <dl className="grid gap-3 text-left text-sm sm:grid-cols-2">
                <div className="rounded-lg bg-muted/60 p-3">
                  <dt className="text-xs text-muted-foreground">Total</dt>
                  <dd
                    className="font-semibold tabular-nums"
                    data-testid="order-total"
                  >
                    {formatCents(order.totalCents)} / {unit}
                  </dd>
                </div>
                <div className="rounded-lg bg-muted/60 p-3">
                  <dt className="text-xs text-muted-foreground">Delivery</dt>
                  <dd className="font-semibold" data-testid="order-delivery">
                    {formatDeliveryDate(order.customer.deliveryDate)} ·{" "}
                    {order.customer.area}
                  </dd>
                </div>
              </dl>
            </section>
            <section className="rounded-2xl border bg-card p-5 shadow-sm">
              <h2 className="text-base font-semibold">What happens next</h2>
              <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm">
                {NEXT_STEPS.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            </section>
            <div className="flex flex-wrap justify-center gap-2 pb-4">
              <ShareButton />
              <Button
                size="lg"
                className="h-10"
                onClick={() => {
                  startNewSetup();
                  router.push("/");
                }}
              >
                Start a new setup
              </Button>
              <Button asChild variant="outline" size="lg" className="h-10">
                <a
                  href="https://www.monis.rent"
                  target="_blank"
                  rel="noreferrer"
                >
                  Browse monis.rent
                  <ExternalLink aria-hidden />
                </a>
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
```

`src/app/checkout/page.tsx`:

```tsx
import type { Metadata } from "next";

import { Checkout } from "@/components/checkout/checkout";

export const metadata: Metadata = { title: "Checkout · monis.rent" };

export default function CheckoutPage() {
  return <Checkout />;
}
```

`src/app/checkout/success/page.tsx`:

```tsx
import type { Metadata } from "next";

import { OrderSuccess } from "@/components/checkout/order-success";

export const metadata: Metadata = { title: "Request received · monis.rent" };

export default function CheckoutSuccessPage() {
  return <OrderSuccess />;
}
```

- [ ] **Step 5: Verify**

```bash
pnpm lint && pnpm type-check && pnpm format:check && pnpm test
pnpm build && pnpm test:e2e
```

Expected: the whole suite passes, including 5 checkout tests per project and the checkout layout test.

- [ ] **Step 6: Commit and push**

```bash
git add src/components src/app e2e
git commit -F - <<'EOF'
feat: checkout and confirmation pages

A delivery form validated with zod (Bali dates, native select and date
inputs), an order summary with the plan toggle, and a confirmation that
survives a reload and states clearly that it is a concept demo.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```
```bash
pnpm build && pnpm test:e2e
git push
gh run watch $(gh run list --branch main --limit 1 --json databaseId --jq '.[0].databaseId') --exit-status
# If the run failed: fix, push again, then delete the failed run(s):
#   gh run list --status failure --json databaseId --jq '.[].databaseId' | xargs -n1 gh run delete
```

---
### Task 6: Smart setup UI

**Files:**
- Create: `src/components/builder/smart-setup.tsx`, `e2e/smart-setup.spec.ts`
- Modify: `src/components/builder/preset-bar.tsx`

**Interfaces:**
- Consumes: `suggestSetup`, `SUGGESTION_EXAMPLES` (Task 1); `applySuggestion`, `undoSuggestion` (Task 2).
- Produces: a "Describe your work" chip (short label "Describe" on phones) that opens a sheet with a "How do you work?" field, example chips and "Build my setup"; the result is a toast "Here's your setup" with the reasons and an "Undo" action.

- [ ] **Step 1: Write the failing E2E tests**

`e2e/smart-setup.spec.ts`:

```ts
import { expect, test } from "@playwright/test";

import { closeSummary, openSummary } from "./helpers";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await expect(page.getByTestId("workspace-scene")).toBeVisible();
});

test("a sentence becomes a setup with reasons, and Undo restores the old one", async ({
  page,
  isMobile,
}) => {
  await page.getByRole("button", { name: /^Describe/ }).click();
  await page.getByLabel("How do you work?").fill("Lots of calls, bad wifi");
  await page.getByRole("button", { name: "Build my setup" }).click();
  await expect(
    page.getByText("Webcam and headset for clear calls."),
  ).toBeVisible();
  const summary = await openSummary(page, isMobile);
  await expect(summary.getByTestId("summary-line-router")).toBeVisible();
  await expect(summary.getByTestId("summary-line-webcam")).toBeVisible();
  await closeSummary(page, isMobile);
  await page.getByRole("button", { name: "Undo" }).click();
  await expect(
    page.getByRole("button", { name: "Essentials" }),
  ).toHaveAttribute("aria-pressed", "true");
});

test("example chips fill in the sentence", async ({ page }) => {
  await page.getByRole("button", { name: /^Describe/ }).click();
  await page.getByRole("button", { name: "Day trader, three screens" }).click();
  await expect(page.getByLabel("How do you work?")).toHaveValue(
    "Day trader, three screens",
  );
  await page.getByRole("button", { name: "Build my setup" }).click();
  await expect(page.locator('[data-testid^="scene-monitor-"]')).toHaveCount(3);
});
```

- [ ] **Step 2: Run to verify failure**

```bash
pnpm build && pnpm test:e2e e2e/smart-setup.spec.ts
```

Expected: FAIL — no "Describe" button.

- [ ] **Step 3: Implement**

`src/components/builder/smart-setup.tsx`:

```tsx
"use client";

import { Sparkles } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Textarea } from "@/components/ui/textarea";
import { SUGGESTION_EXAMPLES, suggestSetup } from "@/lib/suggest";
import { useSetupStore } from "@/store/setup-store";

const STEPS = [
  "Reading your brief…",
  "Picking a desk…",
  "Fitting screens and extras…",
];
const STEP_MS = 270;

// "Describe your work": one sentence in, a whole setup out, with reasons and Undo.
export function SmartSetup() {
  const setup = useSetupStore((state) => state.setup);
  const applySuggestion = useSetupStore((state) => state.applySuggestion);
  const undoSuggestion = useSetupStore((state) => state.undoSuggestion);
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [step, setStep] = useState<number | null>(null);
  const timers = useRef<number[]>([]);
  const fieldId = useId();
  useEffect(
    () => () => {
      timers.current.forEach((timer) => {
        window.clearTimeout(timer);
      });
    },
    [],
  );
  const build = (): void => {
    const suggestion = suggestSetup(text, setup);
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const finish = (): void => {
      setStep(null);
      setOpen(false);
      applySuggestion(suggestion.setup);
      toast(suggestion.matched ? "Here's your setup" : "Here's a solid start", {
        description: (
          <ul className="mt-1 list-disc space-y-0.5 pl-4">
            {suggestion.reasons.map((reason) => (
              <li key={reason}>{reason}</li>
            ))}
          </ul>
        ),
        action: { label: "Undo", onClick: undoSuggestion },
        duration: 10_000,
      });
    };
    if (reduce) {
      finish();
      return;
    }
    setStep(0);
    timers.current = [
      window.setTimeout(() => {
        setStep(1);
      }, STEP_MS),
      window.setTimeout(() => {
        setStep(2);
      }, STEP_MS * 2),
      window.setTimeout(finish, STEP_MS * 3),
    ];
  };
  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <button
          type="button"
          className="flex min-h-9 shrink-0 items-center gap-1.5 rounded-full border border-accent bg-accent/15 px-3.5 text-sm font-semibold text-accent-foreground transition hover:bg-accent/25 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
        >
          <Sparkles className="size-4" aria-hidden />
          <span className="sm:hidden">Describe</span>
          <span className="hidden sm:inline">Describe your work</span>
        </button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="mx-auto w-full max-w-lg">
          <DrawerHeader>
            <DrawerTitle>Tell us how you work</DrawerTitle>
            <DrawerDescription>
              One sentence is enough: your job, how long you stay, your budget,
              what Bali throws at you.
            </DrawerDescription>
          </DrawerHeader>
          <div className="space-y-3 px-4">
            <label htmlFor={fieldId} className="sr-only">
              How do you work?
            </label>
            <Textarea
              id={fieldId}
              rows={3}
              maxLength={300}
              value={text}
              onChange={(event) => {
                setText(event.target.value);
              }}
              placeholder="e.g. Video editor in Canggu for 2 months, humid villa"
              className="text-base sm:text-sm"
              disabled={step !== null}
            />
            <div className="flex flex-wrap gap-2">
              {SUGGESTION_EXAMPLES.map((example) => (
                <button
                  key={example}
                  type="button"
                  onClick={() => {
                    setText(example);
                  }}
                  disabled={step !== null}
                  className="min-h-8 rounded-full border bg-white px-3 text-xs hover:border-primary/40"
                >
                  {example}
                </button>
              ))}
            </div>
            <p
              className="min-h-5 text-sm text-muted-foreground"
              aria-live="polite"
            >
              {step === null ? "" : STEPS[step]}
            </p>
          </div>
          <DrawerFooter>
            <Button
              size="lg"
              className="h-11"
              onClick={build}
              disabled={text.trim() === "" || step !== null}
            >
              <Sparkles aria-hidden />
              Build my setup
            </Button>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
```

`src/components/builder/preset-bar.tsx` (whole file):

```tsx
"use client";

import { SmartSetup } from "@/components/builder/smart-setup";
import { matchingPresetId, PRESETS } from "@/data/presets";
import { cn } from "@/lib/utils";
import { useSetupStore } from "@/store/setup-store";

const CHIP =
  "flex min-h-9 shrink-0 items-center rounded-full border px-3.5 text-sm font-medium transition focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none";

export function PresetBar() {
  const setup = useSetupStore((state) => state.setup);
  const applyPreset = useSetupStore((state) => state.applyPreset);
  const startEmpty = useSetupStore((state) => state.startEmpty);
  const active = matchingPresetId(setup);
  return (
    <nav
      aria-label="Start from a preset"
      className="mx-auto w-full max-w-[1600px] shrink-0"
    >
      <ul className="flex snap-x gap-2 overflow-x-auto px-3 py-2 sm:px-4 short:py-1 [&::-webkit-scrollbar]:hidden">
        <li className="snap-start">
          <SmartSetup />
        </li>
        {PRESETS.map((preset) => (
          <li key={preset.id} className="snap-start">
            <button
              type="button"
              title={preset.tagline}
              aria-pressed={active === preset.id}
              onClick={() => {
                applyPreset(preset.id);
              }}
              className={cn(
                CHIP,
                active === preset.id
                  ? "border-primary bg-primary text-primary-foreground"
                  : "bg-white hover:border-primary/40",
              )}
            >
              {preset.name}
            </button>
          </li>
        ))}
        <li className="snap-start">
          <button
            type="button"
            onClick={startEmpty}
            className={cn(
              CHIP,
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

- [ ] **Step 4: Verify**

```bash
pnpm lint && pnpm type-check && pnpm format:check && pnpm test
pnpm build && pnpm test:e2e
```

Expected: 58 passed, 6 skipped by design.

- [ ] **Step 5: Commit and push**

```bash
git add src/components/builder e2e/smart-setup.spec.ts
git commit -F - <<'EOF'
feat: describe your work to get a setup, with reasons and undo

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```
```bash
pnpm build && pnpm test:e2e
git push
gh run watch $(gh run list --branch main --limit 1 --json databaseId --jq '.[0].databaseId') --exit-status
# If the run failed: fix, push again, then delete the failed run(s):
#   gh run list --status failure --json databaseId --jq '.[].databaseId' | xargs -n1 gh run delete
```

---
### Task 7: README write-up, screenshots, docs and the QA record

**Files:**
- Replace: `README.md`
- Create: `docs/assets/builder-desktop.png`, `docs/assets/builder-phone.png`, `docs/qa/2026-10-11-milestones-4-6.md`
- Modify: `AGENTS.md`, `docs/overview/architecture.md`, `docs/product/brief.md`, `docs/bugs/bug-log.md`, `docs/superpowers/specs/2026-10-11-workspace-builder-design.md`

- [ ] **Step 1: Capture the README screenshots**

```bash
mkdir -p docs/assets && cat > e2e/tmp-shots.spec.ts <<'EOF'
import { expect, test } from "@playwright/test";

const setupUrl =
  "/?d=desk-dual-motor&c=chair-ergo&i=mon-27-4k:2,light-bar,lamp-led,kb-mx,mouse-mx,mouse-pad,laptop-stand,headphones,power-strip-3,plant-monstera,router,nespresso,dehumidifier";

test("readme shots", async ({ page, isMobile }) => {
  test.skip(isMobile);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(setupUrl);
  await expect(page.getByTestId("workspace-scene")).toBeVisible();
  await page.getByRole("tab", { name: "Screens" }).click();
  await page.waitForTimeout(1200);
  await page.screenshot({ path: "docs/assets/builder-desktop.png" });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload();
  await expect(page.getByTestId("workspace-scene")).toBeVisible();
  await page.getByRole("tab", { name: "Screens" }).click();
  await page.waitForTimeout(1200);
  await page.screenshot({ path: "docs/assets/builder-phone.png" });
});
EOF
pnpm build && pnpm test:e2e e2e/tmp-shots.spec.ts --project=desktop; rm e2e/tmp-shots.spec.ts
```

Expected: two PNGs in `docs/assets/` (about 250 KB and 100 KB). Open them and check they look right.

- [ ] **Step 2: Write the README and the QA record**

`README.md` (whole file):

````markdown
# monis.rent Workspace Builder

**Live:** https://monis-rent-theta.vercel.app

Design your Bali workspace visually, see the price instantly, and rent it. Built for the Desent Solutions developer challenge, for their client [monis.rent](https://www.monis.rent), which rents office equipment to digital nomads and startups in Bali.

| Desktop                                                | Phone                                                |
| ------------------------------------------------------ | ---------------------------------------------------- |
| ![Builder on desktop](docs/assets/builder-desktop.png) | ![Builder on a phone](docs/assets/builder-phone.png) |

## What you can do

- **Start from a real bundle** (Essentials, Founders, Trading, Studio) or **describe your work** in one sentence ("Video editor in Canggu, 2 months, $120/wk") and get a setup with the reasons behind it, plus Undo.
- **Swap anything:** 3 desks, 3 chairs, 8 screens, lamps, peripherals, plants and Bali extras (Starlink, dehumidifier, coffee). Search finds items across all categories.
- **Watch it come to life:** an SVG scene drawn to scale (1 unit = 1 cm). Items drop in, the desk rises when you switch to standing, and screens line up and angle themselves when the desk gets crowded.
- **Close-up view:** one tap zooms into the desk. Tap the desk, a screen or the chair to jump to its options.
- **Always know the price and timing:** weekly or monthly total, monthly savings, and "can arrive today" or "arrives tomorrow" from the monis.rent delivery data.
- **Share the setup** as a link, then **rent it** through a checkout that ends with a clear confirmation.

## Approach

I started from the persona in the brief: a freelancer who just landed in Bali and needs a desk by next week. They ask three things: _what do I get, what does it cost, when does it arrive?_ Every screen answers all three at once.

- **No empty desk.** The builder opens on a sensible setup, because editing is easier than starting from nothing. Presets mirror monis.rent's real bundles.
- **People know their work, not their gear.** Smart setup turns "lots of calls, bad wifi" into a webcam, a headset and a router, and explains why.
- **Phone first.** The page never scrolls. The header stays put, the scene sits on top, items scroll underneath, and the price bar is pinned to the bottom. It also works on tablets, landscape phones and desktops.
- **Honest with a real client's brand.** Prices, photos and delivery rules come from monis.rent (a dated snapshot). Their catalog has one chair and no plants, so two chairs and two plants are clearly marked **Concept**. Checkout says plainly that it is a demo, and no delivery promise is invented.

## Tech choices

- **Next.js 16 (App Router) + Tailwind CSS 4 + shadcn/ui (Radix)**, deployed on **Vercel**. The app is fully static, with no backend, database or secrets.
- **Inline SVG instead of 3D:** polished, light on phones, and fast to iterate. The geometry lives in a pure, tested `layoutScene()`.
- **Pure domain core** (`src/lib`): pricing in integer cents, slot and capacity rules, share links, search, smart setup and checkout validation. React only calls it.
- **Zustand** for state, persisted to `localStorage`. A share link rebuilds any setup.
- **Smart setup is rule-based** on purpose: no API key, no cost, deterministic and tested. `suggestSetup(text, current)` has the same signature an LLM-backed version would need.
- **Quality gate:** strict type-checked ESLint (zero warnings), Prettier, 140+ Vitest unit tests, and Playwright E2E on desktop and mobile with axe accessibility checks. A layout test proves the page fits nine screen sizes without scrolling. CI runs all of it on every push.

## What I'd improve with more time

- **Live catalog:** read products, prices and stock from monis.rent's Strapi API instead of a snapshot, including the real bundle discount.
- **Real checkout:** hand the setup to the monis.rent cart, or send it via WhatsApp, with a delivery-fee estimate by area.
- **An LLM behind smart setup** (same interface), with the rule-based version as a fallback.
- **Richer scene:** more art variants per product and drag-to-reorder screens.
- **Analytics** on which presets and items people pick, to inform monis.rent's catalog (for example, offering more chairs).

## Run it locally

Requires Node.js 22+ and pnpm.

```bash
pnpm install
pnpm dev            # http://localhost:3000
```

Quality checks:

```bash
pnpm lint && pnpm type-check && pnpm format:check && pnpm test
pnpm build && pnpm test:e2e     # serves the build on :3100
```

## Docs

- [Design spec](docs/superpowers/specs/2026-10-11-workspace-builder-design.md) and [implementation plans](docs/superpowers/plans/)
- [Architecture](docs/overview/architecture.md) · [Deployment](docs/overview/deployment.md)
- [Challenge brief and must-haves](docs/product/brief.md) · [Catalog notes](docs/product/catalog-notes.md)
- [QA rounds](docs/qa/) · [Bug log](docs/bugs/bug-log.md)

## License

The code is [MIT](LICENSE)-licensed. The MIT grant does not cover monis.rent product names, prices or photos (in `src/data/catalog.ts` and on `strapi.monis.rent`). They belong to monis.rent and are used here for the challenge only.
````

`docs/qa/2026-10-11-milestones-4-6.md`:

```markdown
# Milestones 4–6 — polish, checkout, smart setup — 2026-10-11

- **Build:** local production build (`pnpm build && pnpm start --port 3100`), then production after the push
- **Command:** `pnpm test && pnpm test:e2e`
- **Result:** 140 unit tests pass; E2E 58 passed, 6 skipped by design (desktop + mobile, axe on every page)

## New scenarios

| Scenario (spec › test)                                                               | Desktop | Mobile                         |
| ------------------------------------------------------------------------------------ | ------- | ------------------------------ |
| scene › the close-up view zooms into the desk and back                               | Pass    | Pass                           |
| scene › tapping the chair in the scene opens the chair tab in close-up               | Pass    | Pass                           |
| scene › an empty setup offers a chair hotspot                                        | Pass    | Pass                           |
| checkout › Rent opens checkout with the setup and its total                          | Pass    | Pass                           |
| checkout › checkout explains what is missing                                         | Pass    | Pass                           |
| checkout › a valid request ends on the success page and survives a reload            | Pass    | Pass                           |
| checkout › the success page without a request points back to the builder             | Pass    | Pass                           |
| checkout › checkout pages have no serious accessibility violations                   | Pass    | Pass                           |
| layout › checkout keeps the header and scrolls only its content                      | Pass    | Skipped (sizes set explicitly) |
| smart-setup › a sentence becomes a setup with reasons, and Undo restores the old one | Pass    | Pass                           |
| smart-setup › example chips fill in the sentence                                     | Pass    | Pass                           |

## Bug sweep

Screens checked at 390×844, 820×1180, 844×390, 1280×720 and 1440×900 in edge states (empty setup, standing with a walking pad, close-up on a tablet, landscape close-up).

| ID    | Severity | What happened                                               | Status | Test                                           |
| ----- | -------- | ----------------------------------------------------------- | ------ | ---------------------------------------------- |
| BS-01 | Low      | The Hue lamp was hidden behind the right monitor            | Fixed  | Visual check (drawn in front of the screens)   |
| BS-02 | Low      | "1 items" in the summary, price bar and checkout            | Fixed  | `text.test.ts`; E2E empty setup shows "1 item" |
| BS-03 | Medium   | After "Start empty" the scene offered no way to add a chair | Fixed  | E2E chair hotspot                              |
| BS-04 | Low      | Standing moved the chair in front of the fan and purifier   | Fixed  | `scene-layout.test.ts` chair placement         |

## Notes

The Mac mini can sit behind the chair in the close-up; it is still listed and priced. A future art pass could move it.
```

- [ ] **Step 3: Update the docs** (apply with `git apply`)

````diff
diff --git a/AGENTS.md b/AGENTS.md
index dc3f93e..eba2291 100644
--- a/AGENTS.md
+++ b/AGENTS.md
@@ -41,13 +41,15 @@ Next.js 16 (App Router, TypeScript strict), Tailwind CSS 4, shadcn/ui (Radix bas
 ## Code layout
 
 ```
-src/app/              routes: / (builder), /checkout
+src/app/              routes: / (builder), /checkout, /checkout/success; error.tsx
 src/data/             catalog snapshot and presets (pure data + lookups)
-src/lib/              pure logic: money, pricing, setup rules, share URL, search, scene layout
+src/lib/              pure logic: money, pricing, setup rules, share URL, search, smart setup,
+                      checkout validation, scene layout
 src/store/            Zustand store: a thin wrapper over src/lib/setup.ts
 src/components/ui/    vendored shadcn/ui primitives
 src/components/scene/ SVG scene (1 unit = 1 cm)
 src/components/builder/ builder UI
+src/components/checkout/ checkout and confirmation UI
 e2e/                  Playwright specs
 docs/                 overview, product notes, specs and plans, QA rounds, bug log
 ```
diff --git a/docs/bugs/bug-log.md b/docs/bugs/bug-log.md
index cf748a0..484d1a7 100644
--- a/docs/bugs/bug-log.md
+++ b/docs/bugs/bug-log.md
@@ -8,6 +8,15 @@ History of reported bugs with root cause, fix, prevention and regression test. N
 
 ---
 
+## 2026-10-11 — [FIXED] Bug sweep: chair hotspot, "1 items", chair placement, Hue lamp (BS-01…BS-04)
+
+- **Symptom:** after "Start empty" there was no way to add a chair from the scene; counts read "1 items"; standing pushed the chair in front of the fan and purifier; the Hue lamp hid behind the right monitor.
+- **Repro:** screenshots of edge states at five viewport sizes (`docs/qa/2026-10-11-milestones-4-6.md`).
+- **Root cause:** hotspots only covered screens, lamp and plant; counts were hard-coded plurals; the chair always moved right; the Hue lamp was drawn behind the monitors.
+- **Fix:** "Add a chair" hotspot (`workspace-scene.tsx`); `countLabel()` (`src/lib/text.ts`); the chair moves to the side with fewer floor items (`scene-layout.ts`); the Hue lamp is drawn in front (`desk-items.tsx`).
+- **Prevention:** edge-state screenshots are part of every milestone's QA round.
+- **Regression test:** `e2e/scene.spec.ts` › an empty setup offers a chair hotspot; `text.test.ts`; `scene-layout.test.ts` › chair placement when standing.
+
 ## 2026-10-11 — [FIXED] Landscape phones and a stretched page (CR-07, CR-08)
 
 - **Symptom:** at 844×390 the item list had almost no height. Strengthening the layout test then showed the page was 143 px taller than the screen at 375×667.
diff --git a/docs/overview/architecture.md b/docs/overview/architecture.md
index a72054d..a8df37b 100644
--- a/docs/overview/architecture.md
+++ b/docs/overview/architecture.md
@@ -35,6 +35,7 @@ user action ─▶ store action ─▶ lib/setup rule ─▶ { setup, notice? }
 ## State, persistence and sharing
 
 - `Setup` = desk id, chair id or `null`, item quantities, plan (`weekly` | `monthly`) and posture (`sit` | `stand`).
+- The store also holds UI state that is not persisted (active category, search, scene view, one-step undo for smart setup) and the last order, which is persisted with the setup.
 - On first load the store hydrates in this order: URL query (shared link), then localStorage (`monis-builder`, version 1), then the Essentials preset.
 - A shared link is cleaned from the address bar after loading. Unknown ids are dropped and reported with a toast.
 - Untrusted input (URL, storage) always passes through `parseSetup` and `normalizeSetup`, so the rules hold for every setup the UI sees.
@@ -47,6 +48,13 @@ user action ─▶ store action ─▶ lib/setup rule ─▶ { setup, notice? }
 
 `d` desk, `c` chair (`none` for no chair), `i` items (`id` or `id:qty`), `p=m` monthly, `pos=stand` standing. Defaults are omitted.
 
+## Routes
+
+- `/`: the builder.
+- `/checkout`: order summary and the delivery form (react-hook-form + zod; native select and date inputs for phones).
+- `/checkout/success`: the confirmation, read from the last order in the store; it survives a reload. It says clearly that this is a concept demo.
+- `src/app/error.tsx`: route error boundary with "Try again" and "Start over".
+
 ## Layout
 
 - App shell: `h-dvh` with the header and preset bar on top; the page itself never scrolls. Only the item list and the summary list have their own scroll areas.
@@ -58,4 +66,6 @@ user action ─▶ store action ─▶ lib/setup rule ─▶ { setup, notice? }
 - One SVG `viewBox` of 400 × 250 where 1 unit = 1 cm, so desk widths are true to scale.
 - The scene is laid out at sitting height; standing lifts the desk group with a CSS transform so the change animates (and is instant with reduced motion).
 - Monitors are centred on the desk with the largest one in the middle. When a row is wider than the desk, side screens are drawn narrower, as if angled.
-- The "+" hotspots are real HTML buttons positioned over the SVG, which itself is a single `role="img"` with a text summary.
+- The "+" hotspots and the tap targets (desk, screens, chair) are real HTML buttons positioned over the SVG, which itself is a single `role="img"` with a text summary.
+- **Close-up:** a two-position view. `deskFocus()` computes a CSS `translate() scale()` for a wrapper around the SVG and the buttons, so everything zooms together; hotspots are counter-scaled and hidden when out of frame.
+- **Motion:** items drop in with a CSS keyframe animation, totals count up with `useTweenedNumber`, and everything is instant under `prefers-reduced-motion`.
diff --git a/docs/product/brief.md b/docs/product/brief.md
index 8542f8c..7a74717 100644
--- a/docs/product/brief.md
+++ b/docs/product/brief.md
@@ -10,18 +10,18 @@
 
 ## Must-haves
 
-| #   | Requirement                                               | Status                           | Where                                  |
-| --- | --------------------------------------------------------- | -------------------------------- | -------------------------------------- |
-| M1  | Select a desk from at least 2 options                     | Done                             | Desk tab: 3 real desks                 |
-| M2  | Select a chair from at least 2 options                    | Done                             | Chair tab: 1 real and 2 concept chairs |
-| M3  | Add accessories (monitors, lamps, plants, etc.)           | Done                             | Screens, Accessories and Bali tabs     |
-| M4  | Workspace preview updates visually as items change        | Done                             | SVG scene                              |
-| M5  | Summary or checkout view of the selected setup            | Partial (summary; checkout next) | Summary panel, `/checkout`             |
-| M6  | Deployed and reachable through a public URL               | Done                             | https://monis-rent-theta.vercel.app    |
-| M7  | Code on GitHub with `desent-bot` as a collaborator (Read) | Planned                          | `eksant/monis-rent`                    |
+| #   | Requirement                                               | Status                       | Where                                           |
+| --- | --------------------------------------------------------- | ---------------------------- | ----------------------------------------------- |
+| M1  | Select a desk from at least 2 options                     | Done                         | Desk tab: 3 real desks                          |
+| M2  | Select a chair from at least 2 options                    | Done                         | Chair tab: 1 real and 2 concept chairs          |
+| M3  | Add accessories (monitors, lamps, plants, etc.)           | Done                         | Screens, Accessories and Bali tabs              |
+| M4  | Workspace preview updates visually as items change        | Done                         | SVG scene                                       |
+| M5  | Summary or checkout view of the selected setup            | Done                         | Summary panel, `/checkout`, `/checkout/success` |
+| M6  | Deployed and reachable through a public URL               | Done                         | https://monis-rent-theta.vercel.app             |
+| M7  | Code on GitHub with `desent-bot` as a collaborator (Read) | Planned (invite at hand-off) | `eksant/monis-rent`                             |
 
 ## Submission checklist
 
 - [x] Live URL that works immediately: https://monis-rent-theta.vercel.app
 - [ ] GitHub repository with `desent-bot` (Read access)
-- [ ] Short write-up in `README.md`: approach, tech choices, what we would improve
+- [x] Short write-up in `README.md`: approach, tech choices, what we would improve
diff --git a/docs/superpowers/specs/2026-10-11-workspace-builder-design.md b/docs/superpowers/specs/2026-10-11-workspace-builder-design.md
index b1c39fb..1dfa1b6 100644
--- a/docs/superpowers/specs/2026-10-11-workspace-builder-design.md
+++ b/docs/superpowers/specs/2026-10-11-workspace-builder-design.md
@@ -113,9 +113,9 @@ Collected on 2026-10-11 from `www.monis.rent`. The page data embedded in the sit
 
 - **Next.js** (latest stable, App Router) with **TypeScript** in strict mode.
 - **Tailwind CSS** and **shadcn/ui**: Tabs, ToggleGroup, Drawer, Card, Badge, Button, Input, Select, Calendar and Popover, Form, Tooltip, Sonner.
-- **Motion** (`motion/react`) for animations.
+- **CSS animations** (keyframes and transitions) plus a tiny `requestAnimationFrame` hook for counting totals. The Motion library turned out unnecessary.
 - **Zustand** with the `persist` middleware for setup state.
-- **react-hook-form** and **zod** for the checkout form.
+- **react-hook-form** and **zod** for the checkout form, with native `<select>` and `<input type="date">` (best on phones).
 - **Vitest** for unit tests, **Playwright** with `@axe-core/playwright` for end-to-end and accessibility tests.
 
 Rendering is fully static. All logic runs in the browser and nothing needs server secrets.
@@ -246,11 +246,11 @@ item cards (1 column; 2 on tablets)  ↕ scroll
 
 ### 7.5 Smart setup
 
-1. The user types a sentence or taps an example chip, e.g. "Full-stack dev, 6 weeks, $50/wk", "Lots of calls, bad wifi", "Video editor in Canggu, 2 months".
-2. A short staged animation runs (about 0.8 s): "Reading your brief… Picking a desk… Fitting monitors…".
-3. Items enter the scene one by one.
-4. A **"Why this setup"** card lists 2–4 reasons, for example "Standing desk: you mentioned long days" or "Monthly plan: saves $38 over 2 months".
-5. **Undo** restores the previous setup (one step).
+1. A **"Describe your work"** chip, first in the preset row, opens a sheet. The user types a sentence or taps an example chip, e.g. "Full-stack dev, 6 weeks, $50/wk", "Lots of calls, bad wifi", "Video editor in Canggu, 2 months".
+2. A short staged message runs (about 0.8 s, instant with reduced motion): "Reading your brief… Picking a desk… Fitting screens and extras…".
+3. The sheet closes and the new items drop into the scene.
+4. A toast titled **"Here's your setup"** lists 2–4 reasons that describe the final setup, for example "Webcam and headset for clear calls." If the budget forced items out, it says so ("Left out the … to stay on budget.").
+5. The toast's **Undo** restores the previous setup (one step).
 
 Unrecognised input falls back to Essentials with a friendly note. It never dead-ends.
````

- [ ] **Step 4: Gate, commit, push and check production**

```bash
pnpm format && pnpm lint && pnpm type-check && pnpm format:check && pnpm test
```
```bash
git add README.md AGENTS.md docs
git commit -F - <<'EOF'
docs: README write-up, screenshots and the milestone 4-6 QA record

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```
```bash
pnpm build && pnpm test:e2e
git push
gh run watch $(gh run list --branch main --limit 1 --json databaseId --jq '.[0].databaseId') --exit-status
# If the run failed: fix, push again, then delete the failed run(s):
#   gh run list --status failure --json databaseId --jq '.[].databaseId' | xargs -n1 gh run delete
```
```bash
BASE_URL=https://monis-rent-theta.vercel.app pnpm test:e2e
```

Expected: 58 passed, 6 skipped by design, against production.

---
### Task 8: Hand-off

**Files:** `docs/product/brief.md` (M7 status)

- [ ] **Step 1: Ask the owner to confirm the invitation**

Ask in chat: "Shall I invite `desent-bot` to `eksant/monis-rent` with Read access now?" Wait for a yes.

- [ ] **Step 2: Invite `desent-bot` (Read)**

```bash
gh api -X PUT repos/eksant/monis-rent/collaborators/desent-bot -f permission=pull
gh api repos/eksant/monis-rent/invitations --jq '.[] | [.invitee.login, .permissions] | @tsv'
```

Expected: an invitation for `desent-bot` with `read` permission.

- [ ] **Step 3: Mark M7 done and push**

In `docs/product/brief.md` set M7 to `Done (invited, Read)` and tick the submission checklist line for the repository.

```bash
git add docs/product/brief.md
git commit -F - <<'EOF'
docs: mark the collaborator must-have as done

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```
```bash
pnpm build && pnpm test:e2e
git push
gh run watch $(gh run list --branch main --limit 1 --json databaseId --jq '.[0].databaseId') --exit-status
# If the run failed: fix, push again, then delete the failed run(s):
#   gh run list --status failure --json databaseId --jq '.[].databaseId' | xargs -n1 gh run delete
```

- [ ] **Step 4: Final check and report**

Run `BASE_URL=https://monis-rent-theta.vercel.app pnpm test:e2e` once more. Report to the owner in Indonesian:
- the live URL;
- what shipped;
- the test results;
- that `desent-bot` was invited;
- the submission checklist status (live URL, repo with `desent-bot`, README write-up).
