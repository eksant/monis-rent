import { beforeEach, describe, expect, it } from "vitest";

import { defaultSetup, presetSetup } from "@/data/presets";
import { useSetupStore } from "@/store/setup-store";

const initial = useSetupStore.getState();

beforeEach(() => {
  useSetupStore.setState(
    { ...initial, setup: defaultSetup(), notice: null },
    true,
  );
});

describe("setup store", () => {
  it("starts on the Essentials preset", () => {
    expect(useSetupStore.getState().setup).toEqual(presetSetup("essentials"));
  });

  it("applies presets but keeps the chosen plan", () => {
    const store = useSetupStore.getState();
    store.choosePlan("monthly");
    store.applyPreset("founders");
    expect(useSetupStore.getState().setup).toEqual({
      ...presetSetup("founders"),
      plan: "monthly",
    });
  });

  it("starts empty with no chair and no items", () => {
    useSetupStore.getState().startEmpty();
    const { setup } = useSetupStore.getState();
    expect(setup.chairId).toBeNull();
    expect(setup.items).toEqual({});
  });

  it("stamps every notice with a fresh id", () => {
    const store = useSetupStore.getState();
    store.add("light-bar");
    const first = useSetupStore.getState().notice;
    store.add("light-bar");
    const second = useSetupStore.getState().notice;
    expect(first?.message).toMatch(/needs a monitor/);
    expect(second?.id).toBeGreaterThan(first?.id ?? 0);
  });

  it("clears the notice after a quiet action", () => {
    const store = useSetupStore.getState();
    store.add("light-bar");
    store.toggle("lamp-led");
    expect(useSetupStore.getState().notice).toBeNull();
    expect(useSetupStore.getState().setup.items["lamp-led"]).toBe(1);
  });

  it("routes desk, chair, posture and category changes", () => {
    const store = useSetupStore.getState();
    store.chooseDesk("desk-dual-motor");
    store.chooseChair(null);
    store.choosePosture("stand");
    store.showCategory("screen");
    const state = useSetupStore.getState();
    expect(state.setup.deskId).toBe("desk-dual-motor");
    expect(state.setup.chairId).toBeNull();
    expect(state.setup.posture).toBe("stand");
    expect(state.activeCategory).toBe("screen");
  });

  it("removes items", () => {
    const store = useSetupStore.getState();
    store.remove("power-strip-3");
    expect(useSetupStore.getState().setup.items).toEqual({});
  });
});
