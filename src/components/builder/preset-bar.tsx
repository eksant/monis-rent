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
