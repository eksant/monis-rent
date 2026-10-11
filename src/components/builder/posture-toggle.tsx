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
      className="bg-transparent"
    >
      <ToggleGroupItem
        value="sit"
        className="h-8 bg-white/90 px-2.5 shadow-sm backdrop-blur"
      >
        <Armchair aria-hidden />
        Sit
      </ToggleGroupItem>
      <ToggleGroupItem
        value="stand"
        className="h-8 bg-white/90 px-2.5 shadow-sm backdrop-blur"
      >
        <PersonStanding aria-hidden />
        Stand
      </ToggleGroupItem>
    </ToggleGroup>
  );
}
