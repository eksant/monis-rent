"use client";

import { Armchair, PersonStanding } from "lucide-react";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useSetupStore } from "@/store/setup-store";

export function PostureToggle() {
  const posture = useSetupStore((state) => state.setup.posture);
  const choosePosture = useSetupStore((state) => state.choosePosture);
  return (
    <ToggleGroup
      type="single"
      variant="outline"
      value={posture}
      onValueChange={(value) => {
        if (value === "sit" || value === "stand") choosePosture(value);
      }}
      aria-label="Desk height"
    >
      <ToggleGroupItem value="sit">
        <Armchair aria-hidden />
        Sit
      </ToggleGroupItem>
      <ToggleGroupItem value="stand">
        <PersonStanding aria-hidden />
        Stand
      </ToggleGroupItem>
    </ToggleGroup>
  );
}
