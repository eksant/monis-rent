import { describe, expect, it } from "vitest";

import { CATALOG, getItem } from "@/data/catalog";
import { emptySetup } from "@/data/presets";
import {
  DESK_HEIGHT,
  deskFocus,
  type FocusTransform,
  isInFrame,
  layoutScene,
  MONITOR_OVERHANG,
  monitorSize,
  projectPoint,
  ROOM_VIEW,
  SCENE,
  sceneTargets,
} from "@/lib/scene-layout";
import { addItem } from "@/lib/setup";
import type { Setup } from "@/lib/types";

const MONITOR_IDS = CATALOG.filter((entry) => entry.slot === "monitor").map(
  (entry) => entry.id,
);
const DESK_IDS = CATALOG.filter((entry) => entry.category === "desk").map(
  (entry) => entry.id,
);

// Every multiset of monitors the rules accept on the given desk.
function validMonitorSetups(deskId: string): Setup[] {
  const results: Setup[] = [];
  const visit = (setup: Setup, start: number): void => {
    results.push(setup);
    MONITOR_IDS.slice(start).forEach((id, offset) => {
      const result = addItem(setup, id);
      if (result.setup !== setup) visit(result.setup, start + offset);
    });
  };
  visit({ ...emptySetup(), deskId }, 0);
  return results;
}

describe("monitorSize", () => {
  it("derives screen size from inches and aspect ratio", () => {
    expect(monitorSize(getItem("mon-24-1c"))).toEqual({
      width: 53,
      height: 30,
    });
    expect(monitorSize(getItem("mon-34-curved"))).toEqual({
      width: 81,
      height: 35,
    });
  });
});

describe("layoutScene", () => {
  it.each(DESK_IDS.map((id) => [id]))(
    "keeps every monitor row on the %s",
    (deskId) => {
      for (const setup of validMonitorSetups(deskId)) {
        const { desk, monitors } = layoutScene(setup);
        for (const monitor of monitors) {
          expect(monitor.x).toBeGreaterThanOrEqual(
            desk.x - MONITOR_OVERHANG - 0.01,
          );
          expect(monitor.x + monitor.width).toBeLessThanOrEqual(
            desk.x + desk.width + MONITOR_OVERHANG + 0.01,
          );
          expect(monitor.y + monitor.height).toBeLessThan(desk.y);
        }
      }
    },
  );

  it("centres the monitor row on the desk", () => {
    const setup = { ...emptySetup(), items: { "mon-27-4k": 2 } };
    const { desk, monitors } = layoutScene(setup);
    const first = monitors[0];
    const last = monitors.at(-1);
    expect(first && last).toBeTruthy();
    if (first && last) {
      expect((first.x + last.x + last.width) / 2).toBeCloseTo(
        desk.x + desk.width / 2,
        5,
      );
    }
  });

  it("puts the largest of three screens in the middle and angles the sides", () => {
    const setup: Setup = {
      ...emptySetup(),
      deskId: "desk-dual-motor",
      items: { "mon-24-1c": 1, "mon-32-qhd": 2 },
    };
    const { monitors } = layoutScene(setup);
    expect(monitors.map((monitor) => monitor.item.id)).toEqual([
      "mon-32-qhd",
      "mon-32-qhd",
      "mon-24-1c",
    ]);
    expect(monitors[1]?.scaleX).toBe(1);
    expect(monitors[0]?.scaleX).toBeLessThan(1);
  });

  it("raises one screen when a monitor stand is present", () => {
    const setup = {
      ...emptySetup(),
      items: { "mon-27-4k": 1, "monitor-stand": 1 },
    };
    expect(layoutScene(setup).monitors[0]?.raised).toBe(true);
  });

  it("lifts the desk and moves the chair aside when standing", () => {
    const sitting = layoutScene(emptySetup());
    const standing = layoutScene({ ...emptySetup(), posture: "stand" });
    expect(sitting.desk.y - standing.desk.y).toBe(
      DESK_HEIGHT.stand - DESK_HEIGHT.sit,
    );
    expect(sitting.chairCenterX).toBe(SCENE.width / 2);
    expect(standing.chairCenterX).toBeGreaterThan(sitting.chairCenterX);
  });

  it("offers a monitor hotspot only while there is room", () => {
    expect(layoutScene(emptySetup()).monitorHotspot).not.toBeNull();
    const full = { ...emptySetup(), items: { "mon-34-curved": 1 } };
    expect(layoutScene(full).monitorHotspot).toBeNull();
  });
});

describe("deskFocus", () => {
  const corners = (setup: Setup): { x: number; y: number }[] => {
    const { desk, monitors } = layoutScene(setup);
    return [
      { x: desk.x, y: desk.y },
      { x: desk.x + desk.width, y: desk.y },
      ...monitors.flatMap((monitor) => [
        { x: monitor.x, y: monitor.y },
        { x: monitor.x + monitor.width, y: monitor.y },
      ]),
    ];
  };
  const project = (focus: FocusTransform, point: { x: number; y: number }) => ({
    x: focus.scale * point.x + (focus.x / 100) * SCENE.width,
    y: focus.scale * point.y + (focus.y / 100) * SCENE.height,
  });

  it("is the identity for the room view", () => {
    expect(ROOM_VIEW).toEqual({ scale: 1, x: 0, y: 0 });
  });

  it.each([
    ["essentials sitting", emptySetup()],
    [
      "three screens standing",
      {
        ...emptySetup(),
        deskId: "desk-dual-motor",
        items: { "mon-32-qhd": 3 },
        posture: "stand" as const,
      },
    ],
  ])("zooms in and keeps the desk and screens in frame (%s)", (_, setup) => {
    const focus = deskFocus(layoutScene(setup));
    expect(focus.scale).toBeGreaterThan(1.5);
    for (const point of corners(setup)) {
      const shown = project(focus, point);
      expect(shown.x).toBeGreaterThanOrEqual(0);
      expect(shown.x).toBeLessThanOrEqual(SCENE.width);
      expect(shown.y).toBeGreaterThanOrEqual(0);
      expect(shown.y).toBeLessThanOrEqual(SCENE.height);
    }
  });

  it("never shows anything outside the scene", () => {
    const focus = deskFocus(layoutScene(emptySetup()));
    expect(focus.x).toBeLessThanOrEqual(0);
    expect(focus.x).toBeGreaterThanOrEqual(100 - 100 * focus.scale);
    expect(focus.y).toBeLessThanOrEqual(0);
    expect(focus.y).toBeGreaterThanOrEqual(100 - 100 * focus.scale);
  });
});

describe("sceneTargets", () => {
  it("covers the desk, the chair and each screen", () => {
    const setup: Setup = {
      ...emptySetup(),
      chairId: "chair-ergo",
      items: { "mon-24-1c": 2 },
    };
    const targets = sceneTargets(setup, layoutScene(setup));
    expect(targets.map((target) => target.label)).toEqual([
      "Change desk",
      "Change screens",
      "Change screens",
      "Change chair",
    ]);
    expect(targets.map((target) => target.category)).toEqual([
      "desk",
      "screen",
      "screen",
      "chair",
    ]);
  });

  it("leaves out the chair when there is none", () => {
    const setup = emptySetup();
    expect(
      sceneTargets(setup, layoutScene(setup)).map((target) => target.label),
    ).toEqual(["Change desk"]);
  });
});

describe("projectPoint", () => {
  it("maps scene points through the close-up transform", () => {
    expect(projectPoint(ROOM_VIEW, { x: 40, y: 50 })).toEqual({ x: 40, y: 50 });
    expect(
      projectPoint({ scale: 2, x: -50, y: -40 }, { x: 150, y: 100 }),
    ).toEqual({
      x: 100,
      y: 100,
    });
  });

  it("tells whether a point is inside the frame", () => {
    expect(isInFrame({ x: 10, y: 10 })).toBe(true);
    expect(isInFrame({ x: -1, y: 10 })).toBe(false);
    expect(isInFrame({ x: 10, y: SCENE.height + 1 })).toBe(false);
  });
});

describe("chair placement when standing", () => {
  it("moves the chair to the side with fewer floor items", () => {
    const climate: Setup = {
      ...emptySetup(),
      chairId: "chair-ergo",
      items: { "tower-fan": 1, purifier: 1 },
      posture: "stand",
    };
    const plants: Setup = { ...climate, items: { "plant-monstera": 2 } };
    expect(layoutScene(climate).chairCenterX).toBeLessThan(SCENE.width / 2);
    expect(layoutScene(plants).chairCenterX).toBeGreaterThan(SCENE.width / 2);
  });
});
