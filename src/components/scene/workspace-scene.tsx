"use client";

import { Plus } from "lucide-react";

import { ChairArt } from "@/components/scene/chair-art";
import { DeskLegs, DeskTop } from "@/components/scene/desk-art";
import { BackDeskItems, DeskItems } from "@/components/scene/desk-items";
import { FloorItems } from "@/components/scene/floor-items";
import { MonitorArt } from "@/components/scene/monitor-art";
import { Room } from "@/components/scene/room";
import { getItem } from "@/data/catalog";
import { DESK_HEIGHT, layoutScene, SCENE } from "@/lib/scene-layout";
import { setupLines } from "@/lib/setup";
import type { CategoryId, Setup } from "@/lib/types";

interface Hotspot {
  label: string;
  category: CategoryId;
  x: number;
  y: number;
}

function sceneLabel(setup: Setup): string {
  const names = setupLines(setup).map((line) =>
    line.qty > 1 ? `${String(line.qty)} × ${line.item.name}` : line.item.name,
  );
  const posture = setup.posture === "stand" ? "standing" : "sitting";
  return `Your workspace, ${posture}: ${names.join(", ")}.`;
}

const percent = (value: number, total: number): string =>
  `${String((value / total) * 100)}%`;

export function WorkspaceScene({
  setup,
  onHotspot,
}: {
  setup: Setup;
  // Without a handler the scene is display-only (no "+" hotspots).
  onHotspot?: (category: CategoryId) => void;
}) {
  // Lay out at sitting height and lift with a CSS transform so posture changes animate.
  const sitting = layoutScene({ ...setup, posture: "sit" });
  const actual = layoutScene(setup);
  const lift =
    setup.posture === "stand" ? DESK_HEIGHT.stand - DESK_HEIGHT.sit : 0;
  const deskItem = getItem(setup.deskId);
  const hasLamp = (setup.items["lamp-led"] ?? 0) > 0;
  const plantCount =
    (setup.items["plant-monstera"] ?? 0) + (setup.items["plant-snake"] ?? 0);
  const hotspots: Hotspot[] = [];
  if (onHotspot !== undefined && actual.monitorHotspot !== null) {
    hotspots.push({
      label: "Add a screen",
      category: "screen",
      ...actual.monitorHotspot,
    });
  }
  if (onHotspot !== undefined && !hasLamp) {
    hotspots.push({
      label: "Add a lamp",
      category: "accessory",
      x: actual.desk.x + 10,
      y: actual.desk.y - 20,
    });
  }
  if (onHotspot !== undefined && plantCount < 2) {
    hotspots.push({
      label: "Add a plant",
      category: "accessory",
      x: actual.desk.x - 30 - plantCount * 34,
      y: SCENE.floorY - 24,
    });
  }
  return (
    <div
      className="relative w-full"
      style={{
        aspectRatio: `${String(SCENE.width)} / ${String(SCENE.height)}`,
      }}
    >
      <svg
        viewBox={`0 0 ${String(SCENE.width)} ${String(SCENE.height)}`}
        className="absolute inset-0 size-full"
        role="img"
        aria-label={sceneLabel(setup)}
        data-testid="workspace-scene"
        data-posture={setup.posture}
      >
        <Room />
        <FloorItems setup={setup} desk={sitting.desk} />
        <g
          style={{ transform: `translateY(${String(-lift)}px)` }}
          className="transition-transform duration-500 ease-out motion-reduce:transition-none"
        >
          <DeskTop
            item={deskItem}
            x={sitting.desk.x}
            width={sitting.desk.width}
            topY={sitting.desk.y}
          />
          <BackDeskItems setup={setup} desk={sitting.desk} />
          {sitting.monitors.map((monitor) => (
            <MonitorArt
              key={monitor.key}
              monitor={monitor}
              deskTopY={sitting.desk.y}
            />
          ))}
          <DeskItems
            setup={setup}
            desk={sitting.desk}
            monitors={sitting.monitors}
          />
        </g>
        <DeskLegs
          item={deskItem}
          x={sitting.desk.x}
          width={sitting.desk.width}
        />
        {setup.chairId === null ? null : (
          <g
            style={{
              transform: `translateX(${String(actual.chairCenterX - SCENE.width / 2)}px)`,
            }}
            className="transition-transform duration-500 ease-out motion-reduce:transition-none"
          >
            <ChairArt item={getItem(setup.chairId)} centerX={SCENE.width / 2} />
          </g>
        )}
      </svg>
      {hotspots.map((hotspot) => (
        <button
          key={hotspot.label}
          type="button"
          aria-label={hotspot.label}
          title={hotspot.label}
          onClick={() => {
            onHotspot?.(hotspot.category);
          }}
          className="absolute flex size-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-dashed border-primary/40 bg-white/80 text-primary shadow-sm transition hover:scale-110 hover:bg-white focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
          style={{
            left: percent(hotspot.x, SCENE.width),
            top: percent(hotspot.y, SCENE.height),
          }}
        >
          <Plus className="size-4" aria-hidden />
        </button>
      ))}
    </div>
  );
}
