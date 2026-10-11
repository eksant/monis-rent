import { describe, expect, it } from "vitest";

import { CATALOG } from "@/data/catalog";
import { searchCatalog } from "@/lib/search";

const ids = (query: string): string[] =>
  searchCatalog(query).map((entry) => entry.id);

describe("searchCatalog", () => {
  it("returns nothing for an empty or blank query", () => {
    expect(searchCatalog("")).toEqual([]);
    expect(searchCatalog("   ")).toEqual([]);
  });

  it("finds an item by name, ignoring case", () => {
    expect(ids("WEBCAM")).toEqual(["webcam"]);
    expect(ids("starlink")).toEqual(["starlink"]);
  });

  it("requires every word to match", () => {
    const result = ids("27 4k");
    expect(result).toContain("mon-27-4k");
    expect(result).toContain("mon-27-4k-grading");
    expect(result).not.toContain("mon-24-1c");
    expect(result).not.toContain("mon-27-a27i");
  });

  it("understands common synonyms", () => {
    const monitors = CATALOG.filter((entry) => entry.slot === "monitor").map(
      (entry) => entry.id,
    );
    expect(ids("screen")).toEqual(expect.arrayContaining(monitors));
    expect(ids("display")).toEqual(expect.arrayContaining(monitors));
    expect(ids("wifi")).toEqual(expect.arrayContaining(["router", "starlink"]));
    expect(ids("light")).toEqual(
      expect.arrayContaining(["lamp-led", "lamp-hue", "light-bar"]),
    );
    expect(ids("computer")).toContain("mac-mini");
  });

  it("matches plural words", () => {
    expect(ids("monitors")).toEqual(
      expect.arrayContaining(["mon-24-1c", "mon-studio"]),
    );
    expect(ids("plants")).toEqual(["plant-monstera", "plant-snake"]);
  });

  it("searches benefits and categories too", () => {
    expect(ids("humidity")).toEqual(["dehumidifier"]);
    expect(ids("chair")).toEqual([
      "chair-ergo",
      "chair-basic",
      "chair-premium",
    ]);
  });

  it("ranks name matches before other matches", () => {
    const result = ids("coffee");
    expect(result[0]).toBe("nespresso");
  });

  it("matches the start of words, not any substring", () => {
    expect(ids("ini")).toEqual([]);
    expect(ids("moni")).toContain("mon-24-1c");
  });

  it("ranks whole words before partial words", () => {
    const result = ids("mac");
    expect(result[0]).toBe("mac-mini");
    expect(result.at(-1)).toBe("nespresso");
  });

  it("returns nothing when no item matches", () => {
    expect(searchCatalog("xyzzy")).toEqual([]);
  });

  it("ignores words that are Object prototype keys", () => {
    expect(() => searchCatalog("constructor")).not.toThrow();
    expect(() =>
      searchCatalog("__proto__ constructors toString"),
    ).not.toThrow();
    expect(searchCatalog("constructor")).toEqual([]);
  });
});
