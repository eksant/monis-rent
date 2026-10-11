import { CATALOG, getItem } from "@/data/catalog";
import { monitorCapacity, usedUnits } from "@/lib/setup";
import type { CatalogItem, CategoryId, Setup } from "@/lib/types";

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

const FLOOR_RIGHT = ["tower-fan", "purifier", "dehumidifier"];
const FLOOR_LEFT = ["plant-monstera", "plant-snake"];

// Standing moves the chair aside: to the right, unless that side is busier.
function standSide(setup: Setup): 1 | -1 {
  const count = (ids: string[]): number =>
    ids.reduce((sum, id) => sum + (setup.items[id] ?? 0), 0);
  return count(FLOOR_RIGHT) > count(FLOOR_LEFT) ? -1 : 1;
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
    SCENE.width / 2 +
    (setup.posture === "stand" ? CHAIR_STAND_SHIFT * standSide(setup) : 0);
  return { desk, monitors, chairCenterX, monitorHotspot };
}

// Scale, then translate (in % of the scene) — the CSS transform for the close-up view.
export interface FocusTransform {
  scale: number;
  x: number;
  y: number;
}

export const ROOM_VIEW: FocusTransform = { scale: 1, x: 0, y: 0 };
const FOCUS_MAX_SCALE = 2.4;
const FOCUS_SIDE_MARGIN = 22;
const FOCUS_HEADROOM = 50;
const FOCUS_BELOW_DESK = 30;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

// Close-up of the desk: its top, the screens and anything up to lamp height.
export function deskFocus(layout: SceneLayout): FocusTransform {
  const { desk, monitors } = layout;
  const top =
    Math.min(
      desk.y - FOCUS_HEADROOM,
      ...monitors.map((monitor) => monitor.y - 6),
    ) - 8;
  const box = {
    x: desk.x - FOCUS_SIDE_MARGIN,
    y: top,
    width: desk.width + 2 * FOCUS_SIDE_MARGIN,
    height: desk.y + FOCUS_BELOW_DESK - top,
  };
  const scale = Math.min(
    SCENE.width / box.width,
    SCENE.height / box.height,
    FOCUS_MAX_SCALE,
  );
  const tx = clamp(
    SCENE.width / 2 - scale * (box.x + box.width / 2),
    SCENE.width - scale * SCENE.width,
    0,
  );
  const ty = clamp(
    SCENE.height / 2 - scale * (box.y + box.height / 2),
    SCENE.height - scale * SCENE.height,
    0,
  );
  return { scale, x: (tx / SCENE.width) * 100, y: (ty / SCENE.height) * 100 };
}

// Shifts a view by (dx, dy) % of the scene, never past the scene edges.
export function panFocus(
  focus: FocusTransform,
  dx: number,
  dy: number,
): FocusTransform {
  return {
    scale: focus.scale,
    x: clamp(focus.x + dx, 100 - 100 * focus.scale, 0),
    y: clamp(focus.y + dy, 100 - 100 * focus.scale, 0),
  };
}

// Where a scene point ends up on screen (in scene units) under a transform.
export function projectPoint(focus: FocusTransform, point: Point): Point {
  return {
    x: focus.scale * point.x + (focus.x / 100) * SCENE.width,
    y: focus.scale * point.y + (focus.y / 100) * SCENE.height,
  };
}

export function isInFrame(point: Point): boolean {
  return (
    point.x >= 0 &&
    point.x <= SCENE.width &&
    point.y >= 0 &&
    point.y <= SCENE.height
  );
}

export interface SceneTarget {
  key: string;
  label: string;
  category: CategoryId;
  x: number;
  y: number;
  width: number;
  height: number;
}

const CHAIR_HALF_WIDTH = 26;
const CHAIR_HEIGHT = 114;

// Tap areas over the desk, each screen and the chair that open their category.
export function sceneTargets(setup: Setup, layout: SceneLayout): SceneTarget[] {
  const { desk } = layout;
  const targets: SceneTarget[] = [
    {
      key: "desk",
      label: "Change desk",
      category: "desk",
      x: desk.x,
      y: desk.y - 2,
      width: desk.width,
      height: 14,
    },
    ...layout.monitors.map((monitor) => ({
      key: monitor.key,
      label: "Change screens",
      category: "screen" as const,
      x: monitor.x,
      y: monitor.y,
      width: monitor.width,
      height: monitor.height,
    })),
  ];
  if (setup.chairId !== null) {
    targets.push({
      key: "chair",
      label: "Change chair",
      category: "chair",
      x: layout.chairCenterX - CHAIR_HALF_WIDTH,
      y: SCENE.floorY - CHAIR_HEIGHT,
      width: 2 * CHAIR_HALF_WIDTH,
      height: CHAIR_HEIGHT,
    });
  }
  return targets;
}
