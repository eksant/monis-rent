import { beforeEach, describe, expect, it } from "vitest";

import { defaultSetup, presetSetup } from "@/data/presets";
import { createOrder } from "@/lib/checkout";
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

  it("keeps a search query and clears it when a category is opened", () => {
    const store = useSetupStore.getState();
    store.setSearch("webcam");
    expect(useSetupStore.getState().search).toBe("webcam");
    store.showCategory("screen");
    expect(useSetupStore.getState().search).toBe("");
  });

  it("switches between the room view and the desk close-up", () => {
    const store = useSetupStore.getState();
    expect(useSetupStore.getState().view).toBe("room");
    store.setView("desk");
    expect(useSetupStore.getState().view).toBe("desk");
  });

  it("edits from the scene: opens the category in the close-up view", () => {
    const store = useSetupStore.getState();
    store.setSearch("lamp");
    store.editFromScene("chair");
    const state = useSetupStore.getState();
    expect(state.activeCategory).toBe("chair");
    expect(state.view).toBe("desk");
    expect(state.search).toBe("");
  });

  it("keeps the last order and starts a new setup after it", () => {
    const store = useSetupStore.getState();
    store.applyPreset("founders");
    const order = createOrder(
      {
        fullName: "Kadek Ayu",
        email: "kadek@example.com",
        whatsapp: "",
        area: "Ubud",
        address: "Villa Melati",
        deliveryDate: "2026-10-13",
      },
      useSetupStore.getState().setup,
      new Date("2026-10-11T02:00:00Z"),
    );
    store.placeOrder(order);
    expect(useSetupStore.getState().lastOrder).toEqual(order);
    store.setView("desk");
    store.startNewSetup();
    const state = useSetupStore.getState();
    expect(state.setup).toEqual(presetSetup("essentials"));
    expect(state.view).toBe("room");
    expect(state.lastOrder).toEqual(order);
  });

  it("applies a suggestion and undoes it once", () => {
    const store = useSetupStore.getState();
    store.applyPreset("trading");
    const before = useSetupStore.getState().setup;
    store.applySuggestion(presetSetup("studio"));
    expect(useSetupStore.getState().setup).toEqual(presetSetup("studio"));
    store.undo();
    expect(useSetupStore.getState().setup).toEqual(before);
    expect(useSetupStore.getState().previousSetup).toBeNull();
    store.undo();
    expect(useSetupStore.getState().setup).toEqual(before);
  });

  it("asks the picker to show a tapped floor item without zooming in", () => {
    const store = useSetupStore.getState();
    store.editFromScene("extra", "nespresso", false);
    const first = useSetupStore.getState();
    expect(first.activeCategory).toBe("extra");
    expect(first.view).toBe("room");
    expect(first.focusRequest?.itemId).toBe("nespresso");
    store.editFromScene("extra", "nespresso", false);
    expect(useSetupStore.getState().focusRequest?.seq).toBeGreaterThan(
      first.focusRequest?.seq ?? 0,
    );
  });

  it("removes a whole line from the summary and can undo it", () => {
    const store = useSetupStore.getState();
    store.applyPreset("founders");
    store.add("mon-27-4k");
    const before = useSetupStore.getState().setup;
    store.removeLine("mon-27-4k");
    const after = useSetupStore.getState();
    expect(after.setup.items["mon-27-4k"]).toBeUndefined();
    // The light bar needs a monitor, so it goes too.
    expect(after.setup.items["light-bar"]).toBeUndefined();
    expect(after.notice?.message).toMatch(
      /^Removed the 27" 4K Multimedia Monitor\./,
    );
    expect(after.notice?.action).toEqual({ kind: "undo", label: "Undo" });
    store.undo();
    expect(useSetupStore.getState().setup).toEqual(before);
  });

  it("offers undo when a preset replaces a custom setup, not a preset", () => {
    const store = useSetupStore.getState();
    store.applyPreset("trading");
    expect(useSetupStore.getState().notice).toBeNull();
    store.add("nespresso");
    const custom = useSetupStore.getState().setup;
    store.applyPreset("studio");
    expect(useSetupStore.getState().notice?.action).toEqual({
      kind: "undo",
      label: "Undo",
    });
    store.undo();
    expect(useSetupStore.getState().setup).toEqual(custom);
    store.startEmpty();
    expect(useSetupStore.getState().notice?.message).toBe(
      "Started from an empty desk.",
    );
  });
});
