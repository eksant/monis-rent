"use client";

import { Maximize2, ZoomIn } from "lucide-react";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useSetupStore } from "@/store/setup-store";

// Two positions only: the whole room, or a close-up of the desk.
export function SceneViewToggle() {
  const view = useSetupStore((state) => state.view);
  const setView = useSetupStore((state) => state.setView);
  return (
    <ToggleGroup
      type="single"
      variant="outline"
      size="sm"
      value={view}
      onValueChange={(value) => {
        if (value === "room" || value === "desk") setView(value);
      }}
      aria-label="Scene view"
      className="bg-transparent"
    >
      <ToggleGroupItem
        value="room"
        className="h-8 bg-white/90 px-2.5 shadow-sm backdrop-blur"
      >
        <Maximize2 aria-hidden />
        Room
      </ToggleGroupItem>
      <ToggleGroupItem
        value="desk"
        className="h-8 bg-white/90 px-2.5 shadow-sm backdrop-blur"
      >
        <ZoomIn aria-hidden />
        Close-up
      </ToggleGroupItem>
    </ToggleGroup>
  );
}
