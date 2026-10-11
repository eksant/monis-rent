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
