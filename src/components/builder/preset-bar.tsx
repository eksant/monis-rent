"use client";

import { matchingPresetId, PRESETS } from "@/data/presets";
import { cn } from "@/lib/utils";
import { useSetupStore } from "@/store/setup-store";

export function PresetBar() {
  const setup = useSetupStore((state) => state.setup);
  const applyPreset = useSetupStore((state) => state.applyPreset);
  const startEmpty = useSetupStore((state) => state.startEmpty);
  const active = matchingPresetId(setup);
  const chip =
    "shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium transition focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none";
  return (
    <nav
      aria-label="Start from a preset"
      className="-mx-4 overflow-x-auto px-4 py-3"
    >
      <ul className="flex gap-2">
        {PRESETS.map((preset) => (
          <li key={preset.id}>
            <button
              type="button"
              title={preset.tagline}
              aria-pressed={active === preset.id}
              onClick={() => {
                applyPreset(preset.id);
              }}
              className={cn(
                chip,
                active === preset.id
                  ? "border-primary bg-primary text-primary-foreground"
                  : "bg-white hover:border-primary/40",
              )}
            >
              {preset.name}
            </button>
          </li>
        ))}
        <li>
          <button
            type="button"
            onClick={startEmpty}
            className={cn(
              chip,
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
