import { describe, expect, it } from "vitest";

import { emptySetup, PRESETS, presetSetup } from "@/data/presets";
import {
  addItem,
  deltaCents,
  groupLines,
  isMultiUnit,
  monitorCapacity,
  normalizeSetup,
  parseSetup,
  removeItem,
  setDesk,
  setPosture,
  setupLines,
  summarize,
  toggleItem,
  usedUnits,
} from "@/lib/setup";
import type { Setup } from "@/lib/types";

function withItems(
  items: Record<string, number>,
  deskId = "desk-electric",
): Setup {
  return { ...emptySetup(), deskId, chairId: "chair-ergo", items };
}

describe("monitorCapacity", () => {
  it("gives 2 units to desks under 160 cm and 3 to 160 cm desks", () => {
    expect(monitorCapacity("desk-electric")).toBe(2);
    expect(monitorCapacity("desk-mechanical")).toBe(2);
    expect(monitorCapacity("desk-dual-motor")).toBe(3);
  });
});

describe("addItem", () => {
  it("adds monitors until the desk is full, then offers a wider desk", () => {
    let setup = withItems({});
    setup = addItem(setup, "mon-24-1c").setup;
    setup = addItem(setup, "mon-24-1c").setup;
    const result = addItem(setup, "mon-27-4k");
    expect(result.setup).toBe(setup);
    expect(result.notice?.action).toEqual({
      label: "Upgrade to the 160 cm desk",
      deskId: "desk-dual-motor",
      addItemId: "mon-27-4k",
    });
  });

  it("counts an ultrawide as two monitor units", () => {
    const setup = addItem(withItems({}), "mon-34-curved").setup;
    expect(usedUnits(setup, "monitor")).toBe(2);
    expect(addItem(setup, "mon-24-1c").notice?.message).toMatch(/no room/);
  });

  it("fits a third monitor on the 160 cm desk, then offers no upgrade", () => {
    let setup = withItems({ "mon-24-1c": 2 }, "desk-dual-motor");
    setup = addItem(setup, "mon-24-1c").setup;
    expect(setup.items["mon-24-1c"]).toBe(3);
    const result = addItem(setup, "mon-27-4k");
    expect(result.setup).toBe(setup);
    expect(result.notice?.action).toBeUndefined();
  });

  it("offers no wider desk when the screen would not fit there either", () => {
    const setup = withItems({ "mon-24-1c": 2 });
    const result = addItem(setup, "mon-34-curved");
    expect(result.setup).toBe(setup);
    expect(result.notice?.action).toBeUndefined();
    expect(result.notice?.message).toMatch(/no room/);
  });

  it("checks the per-item limit before the desk capacity", () => {
    const result = addItem(withItems({ "mon-34-gaming": 1 }), "mon-34-gaming");
    expect(result.notice?.action).toBeUndefined();
    expect(result.notice?.message).toBe(
      "You've added the maximum for this item.",
    );
  });

  it("swaps items in single-capacity slots", () => {
    const setup = addItem(withItems({ router: 1 }), "starlink").setup;
    expect(setup.items).toEqual({ starlink: 1 });
  });

  it("rejects a light bar without a monitor", () => {
    const result = addItem(withItems({}), "light-bar");
    expect(result.setup.items).toEqual({});
    expect(result.notice?.message).toBe(
      "The Monitor Light Bar needs a monitor. Add one first.",
    );
  });

  it("switches to standing when the walking pad is added", () => {
    const result = addItem(withItems({}), "walking-pad");
    expect(result.setup.posture).toBe("stand");
    expect(result.notice?.message).toMatch(/standing mode/);
  });

  it("allows two plants and no more", () => {
    let setup = addItem(withItems({}), "plant-monstera").setup;
    setup = addItem(setup, "plant-snake").setup;
    expect(addItem(setup, "plant-snake").notice?.message).toBe(
      "There's room for two plants.",
    );
  });

  it("routes desks and chairs to their setters", () => {
    expect(addItem(withItems({}), "desk-mechanical").setup.deskId).toBe(
      "desk-mechanical",
    );
    expect(addItem(withItems({}), "chair-basic").setup.chairId).toBe(
      "chair-basic",
    );
  });
});

describe("removeItem", () => {
  it("decrements quantities and never removes the desk", () => {
    const setup = withItems({ "mon-24-1c": 2 });
    expect(removeItem(setup, "mon-24-1c").setup.items).toEqual({
      "mon-24-1c": 1,
    });
    expect(removeItem(setup, "desk-electric").setup).toBe(setup);
  });

  it("removes monitor accessories with the last monitor", () => {
    const setup = withItems({
      "mon-27-4k": 1,
      "light-bar": 1,
      "monitor-stand": 1,
    });
    const result = removeItem(setup, "mon-27-4k");
    expect(result.setup.items).toEqual({});
    expect(result.notice?.message).toBe(
      "Removed the Monitor Light Bar and Adjustable Monitor Stand: they need a monitor.",
    );
  });

  it("clears the chair", () => {
    expect(removeItem(withItems({}), "chair-ergo").setup.chairId).toBeNull();
  });
});

describe("setDesk", () => {
  it("removes the cheapest monitors that no longer fit", () => {
    const setup = withItems(
      { "mon-24-1c": 1, "mon-34-gaming": 1 },
      "desk-dual-motor",
    );
    const result = setDesk(setup, "desk-electric");
    expect(result.setup.items).toEqual({ "mon-34-gaming": 1 });
    expect(result.notice?.message).toBe(
      "Removed 1 screen so everything fits the new desk.",
    );
  });

  it("ignores ids that are not desks", () => {
    const setup = withItems({});
    expect(setDesk(setup, "chair-ergo").setup).toBe(setup);
  });
});

describe("setPosture", () => {
  it("warns when sitting with a walking pad", () => {
    const result = setPosture(withItems({ "walking-pad": 1 }), "sit");
    expect(result.setup.posture).toBe("sit");
    expect(result.notice?.message).toMatch(/used while standing/);
  });
});

describe("toggleItem", () => {
  it("deselects a selected single item and adds to multi-unit slots", () => {
    expect(
      toggleItem(withItems({ "lamp-led": 1 }), "lamp-led").setup.items,
    ).toEqual({});
    expect(
      toggleItem(withItems({ "mon-24-1c": 1 }), "mon-24-1c").setup.items,
    ).toEqual({
      "mon-24-1c": 2,
    });
  });

  it("keeps the current desk when its own card is tapped", () => {
    expect(toggleItem(withItems({}), "desk-electric").setup.deskId).toBe(
      "desk-electric",
    );
  });
});

describe("isMultiUnit", () => {
  it("is true only for items that can be added more than once", () => {
    const setup = withItems({});
    expect(isMultiUnit(setup, "mon-24-1c")).toBe(true);
    expect(isMultiUnit(setup, "plant-snake")).toBe(true);
    expect(isMultiUnit(setup, "mon-34-gaming")).toBe(false);
    expect(isMultiUnit(setup, "lamp-led")).toBe(false);
    expect(isMultiUnit(setup, "desk-electric")).toBe(false);
    expect(isMultiUnit(setup, "unknown")).toBe(false);
  });

  it("lets a selected single-unit monitor be deselected by tapping it", () => {
    const trading = withItems({ "mon-34-gaming": 1 });
    expect(toggleItem(trading, "mon-34-gaming").setup.items).toEqual({});
    expect(deltaCents(trading, "mon-34-gaming")).toBe(-1840);
  });
});

describe("deltaCents", () => {
  it("shows the swap difference within a slot", () => {
    // MX Master 400 → Silent mouse 200
    expect(deltaCents(withItems({ "mouse-mx": 1 }), "mouse-silent")).toBe(-200);
  });

  it("shows a negative price for a selected single item", () => {
    expect(deltaCents(withItems({ "lamp-led": 1 }), "lamp-led")).toBe(-320);
  });

  it("shows the full price for a monitor added next to another one", () => {
    expect(deltaCents(withItems({ "mon-34-gaming": 1 }), "mon-34-curved")).toBe(
      2300,
    );
  });

  it("shows the full price for one more monitor", () => {
    expect(deltaCents(withItems({ "mon-24-1c": 1 }), "mon-24-1c")).toBe(560);
  });

  it("compares desks and chairs with the current choice", () => {
    expect(deltaCents(withItems({}), "desk-dual-motor")).toBe(1110);
    expect(deltaCents({ ...withItems({}), chairId: null }, "chair-basic")).toBe(
      500,
    );
  });
});

describe("setupLines and summarize", () => {
  it("lists desk, chair, then items in catalog order", () => {
    const ids = setupLines(presetSetup("founders")).map((line) => line.item.id);
    expect(ids.slice(0, 3)).toEqual([
      "desk-electric",
      "chair-ergo",
      "mon-27-4k",
    ]);
  });

  it("summarizes the Essentials preset", () => {
    expect(summarize(presetSetup("essentials"))).toMatchObject({
      totalCents: 1270,
      savingsCents: 2023,
      arrival: "tomorrow",
    });
  });
});

describe("normalizeSetup", () => {
  it("keeps a valid preset unchanged", () => {
    const founders = presetSetup("founders");
    expect(normalizeSetup(founders)).toEqual({ setup: founders, dropped: [] });
  });

  it("drops unknown ids and falls back to the default desk", () => {
    const raw: Setup = {
      deskId: "desk-gold",
      chairId: "chair-throne",
      items: { "mon-24-1c": 1, unicorn: 2 },
      plan: "monthly",
      posture: "sit",
    };
    const result = normalizeSetup(raw);
    expect(result.setup).toEqual({
      deskId: "desk-electric",
      chairId: null,
      items: { "mon-24-1c": 1 },
      plan: "monthly",
      posture: "sit",
    });
    expect(result.dropped).toEqual(["desk-gold", "chair-throne", "unicorn"]);
  });

  it("clamps quantities to what the desk fits", () => {
    const raw = withItems({ "mon-24-1c": 9, "light-bar": 1 });
    expect(normalizeSetup(raw).setup.items).toEqual({
      "mon-24-1c": 2,
      "light-bar": 1,
    });
  });

  it("keeps the requested posture even with a walking pad", () => {
    const raw = { ...withItems({ "walking-pad": 1 }), posture: "sit" as const };
    expect(normalizeSetup(raw).setup.posture).toBe("sit");
  });
});

describe("parseSetup", () => {
  it("accepts a well-formed setup and defaults plan and posture", () => {
    expect(
      parseSetup({
        deskId: "desk-electric",
        chairId: null,
        items: { "lamp-led": 1 },
      }),
    ).toEqual({
      deskId: "desk-electric",
      chairId: null,
      items: { "lamp-led": 1 },
      plan: "weekly",
      posture: "sit",
    });
  });

  it("rejects malformed input", () => {
    expect(parseSetup(null)).toBeNull();
    expect(parseSetup("desk")).toBeNull();
    expect(parseSetup({ deskId: 3, chairId: null, items: {} })).toBeNull();
    expect(
      parseSetup({ deskId: "desk-electric", chairId: 1, items: {} }),
    ).toBeNull();
    expect(
      parseSetup({ deskId: "desk-electric", chairId: null, items: { a: "1" } }),
    ).toBeNull();
    expect(
      parseSetup({ deskId: "desk-electric", chairId: null, items: [] }),
    ).toBeNull();
  });
});

describe("presets under the rules", () => {
  it.each(PRESETS.map((preset) => [preset.id, preset]))(
    "%s is valid under the rules",
    (_, preset) => {
      expect(normalizeSetup(preset.setup)).toEqual({
        setup: preset.setup,
        dropped: [],
      });
    },
  );
});

describe("groupLines", () => {
  it("groups lines by the builder's categories, in tab order", () => {
    const setup: Setup = {
      ...emptySetup(),
      chairId: "chair-ergo",
      items: { nespresso: 1, "mon-24-1c": 2, "lamp-led": 1 },
    };
    const groups = groupLines(setupLines(setup));
    expect(groups.map((group) => [group.label, group.count])).toEqual([
      ["Desk", 1],
      ["Chair", 1],
      ["Screens", 2],
      ["Accessories", 1],
      ["Bali extras", 1],
    ]);
    expect(groups[2]?.lines.map((line) => line.item.id)).toEqual(["mon-24-1c"]);
  });

  it("leaves out empty categories", () => {
    expect(
      groupLines(setupLines(emptySetup())).map((group) => group.label),
    ).toEqual(["Desk"]);
  });
});
