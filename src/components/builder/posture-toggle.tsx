"use client";

import { Armchair, PersonStanding } from "lucide-react";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useSetupStore } from "@/store/setup-store";

// Floats over the scene's bottom-right corner to save vertical space.
export function PostureToggle() {
  const posture = useSetupStore((state) => state.setup.posture);
  const choosePosture = useSetupStore((state) => state.choosePosture);
  return (
    <ToggleGroup
      type="single"
      variant="outline"
      size="sm"
      value={posture}
      onValueChange={(value) => {
        if (value === "sit" || value === "stand") choosePosture(value);
      }}
      aria-label="Desk height"
      className="rounded-lg bg-white/90 shadow-sm backdrop-blur"
    >
      <ToggleGroupItem value="sit" className="h-8 px-2.5">
        <Armchair aria-hidden />
        Sit
      </ToggleGroupItem>
      <ToggleGroupItem value="stand" className="h-8 px-2.5">
        <PersonStanding aria-hidden />
        Stand
      </ToggleGroupItem>
    </ToggleGroup>
  );
}
