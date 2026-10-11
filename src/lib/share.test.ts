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
