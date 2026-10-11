import { CATALOG, getItem } from "@/data/catalog";
import { monitorCapacity, usedUnits } from "@/lib/setup";
import type { CatalogItem, Setup } from "@/lib/types";

// Scene units are centimetres: a 160 cm desk is 160 units wide.
export const SCENE = { width: 400, height: 250, floorY: 232 } as const;
export const DESK_HEIGHT = { sit: 74, stand: 110 } as const;
export const DESK_TOP_THICKNESS = 4;
export const MONITOR_NECK = 12;
export const MONITOR_RISER = 8;
export const MONITOR_OVERHANG = 10;
const MONITOR_GAP = 4;
const MIN_SCALE = 0.5;
const CHAIR_STAND_SHIFT = 85;

export interface Point {
  x: number;
  y: number;
}

export interface PlacedMonitor {
  key: string;
  item: CatalogItem;
  x: number;
  y: number;
  width: number;
  height: number;
  scaleX: number;
  raised: boolean;
}

export interface SceneLayout {
  desk: { x: number; y: number; width: number; height: number };
  monitors: PlacedMonitor[];
  chairCenterX: number;
  monitorHotspot: Point | null;
}

export function monitorSize(item: CatalogItem): {
  width: number;
  height: number;
} {
  if (item.art.kind !== "monitor") return { width: 0, height: 0 };
  const width = Math.round(
    item.art.inches * (item.art.ultrawide ? 2.38 : 2.22),
  );
  const height = Math.round((width * 9) / (item.art.ultrawide ? 21 : 16));
  return { width, height };
}

// Largest screen in the middle; others alternate left and right of it.
function orderForDisplay(units: CatalogItem[]): CatalogItem[] {
  const bySize = [...units].sort(
    (a, b) => monitorSize(b).width - monitorSize(a).width,
  );
  if (bySize.length < 3) return bySize;
  const [first, second, third] = bySize;
  return [second, first, third].filter(
    (entry): entry is CatalogItem => entry !== undefined,
  );
}

// Side screens are drawn narrower, as if angled, when the row is wider than the desk.
function scalesFor(widths: number[], budget: number): number[] {
  const gaps = MONITOR_GAP * Math.max(0, widths.length - 1);
  const natural = widths.reduce((sum, width) => sum + width, 0);
  if (natural + gaps <= budget) return widths.map(() => 1);
  if (widths.length === 3) {
    const center = widths[1] ?? 0;
    const sides = natural - center;
    const scale = Math.max(MIN_SCALE, (budget - gaps - center) / sides);
    return [scale, 1, scale];
  }
  const scale = Math.max(MIN_SCALE, (budget - gaps) / natural);
  return widths.map(() => scale);
}

export function layoutMonitors(
  setup: Setup,
  desk: { x: number; y: number; width: number },
): PlacedMonitor[] {
  const units = CATALOG.filter((entry) => entry.slot === "monitor").flatMap(
    (entry) => Array.from({ length: setup.items[entry.id] ?? 0 }, () => entry),
  );
  const ordered = orderForDisplay(units);
  const widths = ordered.map((entry) => monitorSize(entry).width);
  const scales = scalesFor(widths, desk.width + 2 * MONITOR_OVERHANG);
  const drawn = widths.map((width, index) => width * (scales[index] ?? 1));
  const rowWidth =
    drawn.reduce((sum, width) => sum + width, 0) +
    MONITOR_GAP * Math.max(0, drawn.length - 1);
  const hasRiser = (setup.items["monitor-stand"] ?? 0) > 0;
  const raisedIndex = ordered.length === 3 ? 1 : 0;
  let cursor = desk.x + desk.width / 2 - rowWidth / 2;
  const counts = new Map<string, number>();
  return ordered.map((entry, index) => {
    const seen = counts.get(entry.id) ?? 0;
    counts.set(entry.id, seen + 1);
    const width = drawn[index] ?? 0;
    const height = monitorSize(entry).height;
    const raised = hasRiser && index === raisedIndex;
    const bottom = desk.y - MONITOR_NECK - (raised ? MONITOR_RISER : 0);
    const placed: PlacedMonitor = {
      key: `${entry.id}-${String(seen)}`,
      item: entry,
      x: cursor,
      y: bottom - height,
      width,
      height,
      scaleX: scales[index] ?? 1,
      raised,
    };
    cursor += width + MONITOR_GAP;
    return placed;
  });
}

export function layoutScene(setup: Setup): SceneLayout {
  const deskItem = getItem(setup.deskId);
  const width = deskItem.widthCm ?? 120;
  const height = DESK_HEIGHT[setup.posture];
  const desk = {
    x: SCENE.width / 2 - width / 2,
    y: SCENE.floorY - height,
    width,
    height,
  };
  const monitors = layoutMonitors(setup, desk);
  const last = monitors.at(-1);
  const free = monitorCapacity(setup.deskId) - usedUnits(setup, "monitor");
  const monitorHotspot =
    free <= 0
      ? null
      : last === undefined
        ? { x: desk.x + width / 2, y: desk.y - 60 }
        : {
            x: Math.min(last.x + last.width + 14, desk.x + width - 6),
            y: last.y + last.height / 2,
          };
  const chairCenterX =
    SCENE.width / 2 + (setup.posture === "stand" ? CHAIR_STAND_SHIFT : 0);
  return { desk, monitors, chairCenterX, monitorHotspot };
}
