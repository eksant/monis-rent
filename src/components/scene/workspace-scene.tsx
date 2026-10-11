"use client";

import { Plus } from "lucide-react";

import { ChairArt } from "@/components/scene/chair-art";
import { DeskLegs, DeskTop } from "@/components/scene/desk-art";
import { BackDeskItems, DeskItems } from "@/components/scene/desk-items";
import { FloorItems } from "@/components/scene/floor-items";
import { MonitorArt } from "@/components/scene/monitor-art";
import { Room } from "@/components/scene/room";
import { getItem } from "@/data/catalog";
import {
  DESK_HEIGHT,
  deskFocus,
  isInFrame,
  layoutScene,
  projectPoint,
  ROOM_VIEW,
  SCENE,
  sceneTargets,
} from "@/lib/scene-layout";
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
  view = "room",
  onHotspot,
  onEdit,
}: {
  setup: Setup;
  view?: "room" | "desk";
  // Without handlers the scene is display-only (no "+" hotspots, no tap targets).
  onHotspot?: (category: CategoryId) => void;
  onEdit?: (category: CategoryId) => void;
}) {
  // Lay out at sitting height and lift with a CSS transform so posture changes animate.
  const sitting = layoutScene({ ...setup, posture: "sit" });
  const actual = layoutScene(setup);
  const lift =
    setup.posture === "stand" ? DESK_HEIGHT.stand - DESK_HEIGHT.sit : 0;
  const deskItem = getItem(setup.deskId);
  const focus = view === "desk" ? deskFocus(actual) : ROOM_VIEW;
  const hasLamp = (setup.items["lamp-led"] ?? 0) > 0;
  const plantCount =
    (setup.items["plant-monstera"] ?? 0) + (setup.items["plant-snake"] ?? 0);
  const candidates: Hotspot[] = [];
  if (actual.monitorHotspot !== null) {
    candidates.push({
      label: "Add a screen",
      category: "screen",
      ...actual.monitorHotspot,
    });
  }
  if (!hasLamp) {
    candidates.push({
      label: "Add a lamp",
      category: "accessory",
      // Where the lamp head would be, clear of the laptop.
      x: actual.desk.x + 8,
      y: actual.desk.y - 48,
    });
  }
  if (setup.chairId === null) {
    candidates.push({
      label: "Add a chair",
      category: "chair",
      x: SCENE.width / 2,
      y: SCENE.floorY - 60,
    });
  }
  if (plantCount < 2) {
    candidates.push({
      label: "Add a plant",
      category: "accessory",
      x: actual.desk.x - 30 - plantCount * 34,
      y: SCENE.floorY - 24,
    });
  }
  // Hotspots cut off by the close-up are hidden rather than half-shown.
  const hotspots =
    onHotspot === undefined
      ? []
      : candidates.filter((hotspot) => isInFrame(projectPoint(focus, hotspot)));
  const targets = onEdit === undefined ? [] : sceneTargets(setup, actual);
  return (
    <div
      className="relative w-full overflow-hidden"
      style={{
        aspectRatio: `${String(SCENE.width)} / ${String(SCENE.height)}`,
      }}
      data-testid="scene-frame"
      data-view={view}
    >
      <div
        className="absolute inset-0 origin-top-left transition-transform duration-500 ease-out motion-reduce:transition-none"
        style={{
          transform: `translate(${String(focus.x)}%, ${String(focus.y)}%) scale(${String(focus.scale)})`,
        }}
        data-testid="scene-camera"
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
              key={setup.deskId}
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
              <ChairArt
                key={setup.chairId}
                item={getItem(setup.chairId)}
                centerX={SCENE.width / 2}
              />
            </g>
          )}
        </svg>
        {targets.map((target) => (
          <button
            key={target.key}
            type="button"
            aria-label={target.label}
            title={target.label}
            onClick={() => {
              onEdit?.(target.category);
            }}
            className="absolute rounded-md transition hover:bg-accent/10 hover:ring-2 hover:ring-accent/50 focus-visible:ring-3 focus-visible:ring-ring/60 focus-visible:outline-none"
            style={{
              left: percent(target.x, SCENE.width),
              top: percent(target.y, SCENE.height),
              width: percent(target.width, SCENE.width),
              height: percent(target.height, SCENE.height),
            }}
          />
        ))}
        {hotspots.map((hotspot) => (
          <button
            key={hotspot.label}
            type="button"
            aria-label={hotspot.label}
            title={hotspot.label}
            onClick={() => {
              onHotspot?.(hotspot.category);
            }}
            className="absolute flex size-8 items-center justify-center rounded-full border-2 border-dashed border-primary/40 bg-white/80 text-primary shadow-sm transition-colors hover:bg-white focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
            style={{
              left: percent(hotspot.x, SCENE.width),
              top: percent(hotspot.y, SCENE.height),
              // Centre on the point and stay the same size in the close-up.
              transform: `translate(-50%, -50%) scale(${String(1 / focus.scale)})`,
            }}
          >
            <Plus className="size-4" aria-hidden />
          </button>
        ))}
      </div>
    </div>
  );
}
