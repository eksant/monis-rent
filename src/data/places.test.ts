import { describe, expect, it } from "vitest";

import { BALI_AREAS, DELIVERY_AREAS } from "@/data/bali-areas";
import { DIAL_CODES, findDialCode, flagOf } from "@/data/dial-codes";

describe("Bali delivery areas", () => {
  it("covers the nomad hubs, grouped by region, without duplicates", () => {
    expect(new Set(DELIVERY_AREAS).size).toBe(DELIVERY_AREAS.length);
    for (const area of [
      "Canggu",
      "Seminyak",
      "Ubud",
      "Uluwatu",
      "Sanur",
      "Pererenan",
      "Amed",
    ]) {
      expect(DELIVERY_AREAS).toContain(area);
    }
    expect(BALI_AREAS.at(-1)?.areas).toEqual(["Somewhere else in Bali"]);
  });
});

describe("dial codes", () => {
  it("starts with Indonesia and finds countries by ISO code", () => {
    expect(DIAL_CODES[0]).toEqual({ iso: "ID", name: "Indonesia", dial: "62" });
    expect(findDialCode("AU")?.dial).toBe("61");
    expect(findDialCode("XX")).toBeUndefined();
    expect(new Set(DIAL_CODES.map((entry) => entry.iso)).size).toBe(
      DIAL_CODES.length,
    );
  });

  it("turns an ISO code into a flag emoji", () => {
    expect(flagOf("ID")).toBe("🇮🇩");
    expect(flagOf("GB")).toBe("🇬🇧");
  });
});
