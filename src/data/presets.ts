import type { Preset, PresetId, Setup } from "@/lib/types";

// Mirrors the monis.rent bundles (contents only; the bundle discount is not applied).
export const PRESETS: readonly Preset[] = [
  {
    id: "essentials",
    name: "Essentials",
    tagline: "Desk, chair, power. Bring your laptop.",
    setup: {
      deskId: "desk-electric",
      chairId: "chair-ergo",
      items: { "power-strip-3": 1 },
      plan: "weekly",
      posture: "sit",
    },
  },
  {
    id: "founders",
    name: "Founders",
    tagline: "A 4K screen and pro peripherals for long build days.",
    setup: {
      deskId: "desk-electric",
      chairId: "chair-ergo",
      items: {
        "mon-27-4k": 1,
        "laptop-stand": 1,
        "kb-mx": 1,
        "mouse-mx": 1,
        "mouse-pad": 1,
        "power-strip-3": 1,
        "light-bar": 1,
      },
      plan: "weekly",
      posture: "sit",
    },
  },
  {
    id: "trading",
    name: "Trading",
    tagline: "An ultrawide for charts and a lamp for the early open.",
    setup: {
      deskId: "desk-electric",
      chairId: "chair-ergo",
      items: {
        "mon-34-gaming": 1,
        "kb-mx": 1,
        "mouse-mx": 1,
        "mouse-pad": 1,
        "lamp-led": 1,
        "power-strip-6": 1,
        "extension-cable": 1,
      },
      plan: "weekly",
      posture: "sit",
    },
  },
  {
    id: "studio",
    name: "Studio",
    tagline: "A 5K Studio Display and Apple peripherals for creatives.",
    setup: {
      deskId: "desk-electric",
      chairId: "chair-ergo",
      items: {
        "mon-studio": 1,
        "kb-magic": 1,
        "mouse-magic": 1,
        "mouse-pad": 1,
        "power-strip-6": 1,
        "lamp-led": 1,
      },
      plan: "weekly",
      posture: "sit",
    },
  },
];

export const DEFAULT_PRESET_ID: PresetId = "essentials";

export function presetSetup(id: PresetId): Setup {
  const preset = PRESETS.find((entry) => entry.id === id);
  if (preset === undefined) throw new Error(`Unknown preset: ${id}`);
  return { ...preset.setup, items: { ...preset.setup.items } };
}

export function defaultSetup(): Setup {
  return presetSetup(DEFAULT_PRESET_ID);
}

export function emptySetup(): Setup {
  return {
    deskId: "desk-electric",
    chairId: null,
    items: {},
    plan: "weekly",
    posture: "sit",
  };
}

// The preset whose desk, chair and items equal the setup (plan and posture ignored).
export function matchingPresetId(setup: Setup): PresetId | null {
  const key = (items: Record<string, number>): string =>
    JSON.stringify(
      Object.entries(items).sort(([a], [b]) => a.localeCompare(b)),
    );
  const match = PRESETS.find(
    (preset) =>
      preset.setup.deskId === setup.deskId &&
      preset.setup.chairId === setup.chairId &&
      key(preset.setup.items) === key(setup.items),
  );
  return match?.id ?? null;
}
