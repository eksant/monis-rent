import { describe, expect, it } from "vitest";

import { CATALOG, getItem } from "@/data/catalog";
import { emptySetup } from "@/data/presets";
import {
  DESK_HEIGHT,
  layoutScene,
  MONITOR_OVERHANG,
  monitorSize,
  SCENE,
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
