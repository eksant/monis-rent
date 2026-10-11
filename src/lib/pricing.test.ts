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
