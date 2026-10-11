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
