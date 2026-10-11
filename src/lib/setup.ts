import { CATALOG, findItem, getItem } from "@/data/catalog";
import {
  arrivalFor,
  effectiveCents,
  monthlySavingsCents,
  totalCents,
} from "@/lib/pricing";
import type {
  Arrival,
  CatalogItem,
  Notice,
  Plan,
  Posture,
  Setup,
  SetupLine,
  SlotId,
} from "@/lib/types";

export interface SetupResult {
  setup: Setup;
  notice?: Notice;
}

export interface SetupSummary {
  lines: SetupLine[];
  totalCents: number;
  savingsCents: number;
  arrival: Arrival;
}

const WIDE_DESK_CM = 160;
const DEFAULT_DESK_ID = "desk-electric";

export function monitorCapacity(deskId: string): number {
  return (findItem(deskId)?.widthCm ?? 0) >= WIDE_DESK_CM ? 3 : 2;
}

export function slotCapacity(setup: Setup, slot: SlotId): number {
  if (slot === "monitor") return monitorCapacity(setup.deskId);
  if (slot === "plant") return 2;
  return 1;
}

export function quantityOf(setup: Setup, id: string): number {
  if (id === setup.deskId || id === setup.chairId) return 1;
  return setup.items[id] ?? 0;
}

export function isSelected(setup: Setup, id: string): boolean {
  return quantityOf(setup, id) > 0;
}

export function usedUnits(setup: Setup, slot: SlotId): number {
  let units = 0;
  for (const [id, qty] of Object.entries(setup.items)) {
    const entry = findItem(id);
    if (entry?.slot === slot) units += entry.slotSize * qty;
  }
  return units;
}

// Desk first, then chair, then items in catalog order.
export function setupLines(setup: Setup): SetupLine[] {
  const lines: SetupLine[] = [{ item: getItem(setup.deskId), qty: 1 }];
  if (setup.chairId !== null)
    lines.push({ item: getItem(setup.chairId), qty: 1 });
  for (const entry of CATALOG) {
    const qty = setup.items[entry.id] ?? 0;
    if (qty > 0) lines.push({ item: entry, qty });
  }
  return lines;
}

export function summarize(setup: Setup): SetupSummary {
  const lines = setupLines(setup);
  return {
    lines,
    totalCents: totalCents(lines, setup.plan),
    savingsCents: monthlySavingsCents(lines),
    arrival: arrivalFor(lines),
  };
}

function omitKey(
  items: Record<string, number>,
  key: string,
): Record<string, number> {
  return Object.fromEntries(Object.entries(items).filter(([id]) => id !== key));
}

function decrement(
  items: Record<string, number>,
  id: string,
): Record<string, number> {
  const qty = items[id] ?? 0;
  return qty <= 1 ? omitKey(items, id) : { ...items, [id]: qty - 1 };
}

function withoutSlot(
  items: Record<string, number>,
  slot: SlotId,
): Record<string, number> {
  return Object.fromEntries(
    Object.entries(items).filter(([id]) => findItem(id)?.slot !== slot),
  );
}

function occupant(setup: Setup, slot: SlotId): CatalogItem | undefined {
  return CATALOG.find(
    (entry) => entry.slot === slot && (setup.items[entry.id] ?? 0) > 0,
  );
}

function wideDesk(): CatalogItem | undefined {
  return CATALOG.find(
    (entry) =>
      entry.category === "desk" && (entry.widthCm ?? 0) >= WIDE_DESK_CM,
  );
}

function fullSlotNotice(setup: Setup, entry: CatalogItem): Notice {
  if (entry.slot === "plant")
    return { message: "There's room for two plants." };
  if (entry.slot !== "monitor")
    return { message: "There's no room for that one." };
  const desk = getItem(setup.deskId);
  if ((desk.widthCm ?? 0) >= WIDE_DESK_CM) {
    return { message: "Your desk is full. Swap a screen to try another one." };
  }
  const upgrade = wideDesk();
  const needed = usedUnits(setup, "monitor") + entry.slotSize;
  if (upgrade === undefined || needed > monitorCapacity(upgrade.id)) {
    return {
      message: `Your ${String(desk.widthCm)} cm desk has no room for another screen. Remove one first.`,
    };
  }
  return {
    message: `Your ${String(desk.widthCm)} cm desk has no room for another screen.`,
    action: {
      label: `Upgrade to the ${String(upgrade.widthCm)} cm desk`,
      deskId: upgrade.id,
      addItemId: entry.id,
    },
  };
}

// Drops items whose required slot became empty, e.g. a light bar without a monitor.
function dropOrphans(setup: Setup): SetupResult {
  const orphans = CATALOG.filter(
    (entry) =>
      entry.requires !== undefined &&
      (setup.items[entry.id] ?? 0) > 0 &&
      usedUnits(setup, entry.requires) === 0,
  );
  if (orphans.length === 0) return { setup };
  let items = setup.items;
  for (const orphan of orphans) items = omitKey(items, orphan.id);
  const names = orphans.map((orphan) => orphan.name).join(" and ");
  const subject = orphans.length === 1 ? "it needs" : "they need";
  return {
    setup: { ...setup, items },
    notice: { message: `Removed the ${names}: ${subject} a monitor.` },
  };
}

function afterAdd(setup: Setup, entry: CatalogItem): SetupResult {
  if (entry.slot === "underDesk" && setup.posture === "sit") {
    return {
      setup: { ...setup, posture: "stand" },
      notice: {
        message: "Walking pad added. We switched you to standing mode.",
      },
    };
  }
  return { setup };
}

export function setDesk(setup: Setup, deskId: string): SetupResult {
  if (findItem(deskId)?.category !== "desk") return { setup };
  let next: Setup = { ...setup, deskId };
  const capacity = monitorCapacity(deskId);
  let removed = 0;
  while (usedUnits(next, "monitor") > capacity) {
    const cheapest = CATALOG.filter(
      (entry) => entry.slot === "monitor" && (next.items[entry.id] ?? 0) > 0,
    ).sort(
      (a, b) => effectiveCents(a, "weekly") - effectiveCents(b, "weekly"),
    )[0];
    if (cheapest === undefined) break;
    next = { ...next, items: decrement(next.items, cheapest.id) };
    removed += 1;
  }
  if (removed === 0) return { setup: next };
  const screens = removed === 1 ? "1 screen" : `${String(removed)} screens`;
  return {
    setup: next,
    notice: { message: `Removed ${screens} so everything fits the new desk.` },
  };
}

export function setChair(setup: Setup, chairId: string | null): SetupResult {
  if (chairId !== null && findItem(chairId)?.category !== "chair")
    return { setup };
  return { setup: { ...setup, chairId } };
}

export function setPlan(setup: Setup, plan: Plan): Setup {
  return { ...setup, plan };
}

export function setPosture(setup: Setup, posture: Posture): SetupResult {
  const next = { ...setup, posture };
  if (posture === "sit" && (setup.items["walking-pad"] ?? 0) > 0) {
    return {
      setup: next,
      notice: { message: "Heads up: the walking pad is used while standing." },
    };
  }
  return { setup: next };
}

export function addItem(setup: Setup, id: string): SetupResult {
  const entry = findItem(id);
  if (entry === undefined) return { setup };
  if (entry.category === "desk") return setDesk(setup, id);
  if (entry.category === "chair") return setChair(setup, id);
  if (entry.requires !== undefined && usedUnits(setup, entry.requires) === 0) {
    return {
      setup,
      notice: { message: `The ${entry.name} needs a monitor. Add one first.` },
    };
  }
  const qty = setup.items[id] ?? 0;
  if (slotCapacity(setup, entry.slot) === 1) {
    if (qty > 0) return { setup };
    const items = { ...withoutSlot(setup.items, entry.slot), [id]: 1 };
    return afterAdd({ ...setup, items }, entry);
  }
  if (qty >= entry.maxQty) {
    return {
      setup,
      notice: { message: "You've added the maximum for this item." },
    };
  }
  if (
    usedUnits(setup, entry.slot) + entry.slotSize >
    slotCapacity(setup, entry.slot)
  ) {
    return { setup, notice: fullSlotNotice(setup, entry) };
  }
  return afterAdd(
    { ...setup, items: { ...setup.items, [id]: qty + 1 } },
    entry,
  );
}

export function removeItem(setup: Setup, id: string): SetupResult {
  const entry = findItem(id);
  if (entry === undefined || entry.category === "desk") return { setup };
  if (entry.category === "chair") {
    return setup.chairId === id
      ? { setup: { ...setup, chairId: null } }
      : { setup };
  }
  if ((setup.items[id] ?? 0) === 0) return { setup };
  return dropOrphans({ ...setup, items: decrement(setup.items, id) });
}

// Monitors and plants can be added more than once; everything else toggles.
export function isMultiUnit(setup: Setup, id: string): boolean {
  const entry = findItem(id);
  if (
    entry === undefined ||
    entry.category === "desk" ||
    entry.category === "chair"
  ) {
    return false;
  }
  return entry.maxQty > 1 && slotCapacity(setup, entry.slot) > 1;
}

// Item-card tap: select, swap or deselect; multi-unit items always add one more.
export function toggleItem(setup: Setup, id: string): SetupResult {
  if (!isMultiUnit(setup, id) && isSelected(setup, id))
    return removeItem(setup, id);
  return addItem(setup, id);
}

// Price change shown on an item card if the user taps it now.
export function deltaCents(setup: Setup, id: string): number {
  const entry = getItem(id);
  const price = effectiveCents(entry, setup.plan);
  const priceOf = (other: CatalogItem | undefined): number =>
    other === undefined ? 0 : effectiveCents(other, setup.plan);
  if (entry.category === "desk") return price - priceOf(getItem(setup.deskId));
  if (entry.category === "chair") {
    if (setup.chairId === id) return -price;
    return (
      price -
      priceOf(setup.chairId === null ? undefined : getItem(setup.chairId))
    );
  }
  if (isMultiUnit(setup, id)) return price;
  if (isSelected(setup, id)) return -price;
  if (slotCapacity(setup, entry.slot) > 1) return price;
  return price - priceOf(occupant(setup, entry.slot));
}

// Rebuilds a setup from untrusted input (URL or storage) through the rules above.
export function normalizeSetup(raw: Setup): {
  setup: Setup;
  dropped: string[];
} {
  const dropped: string[] = [];
  const desk = findItem(raw.deskId);
  const deskId = desk?.category === "desk" ? desk.id : DEFAULT_DESK_ID;
  if (deskId !== raw.deskId) dropped.push(raw.deskId);
  let chairId: string | null = null;
  if (raw.chairId !== null) {
    if (findItem(raw.chairId)?.category === "chair") chairId = raw.chairId;
    else dropped.push(raw.chairId);
  }
  const posture: Posture = raw.posture === "stand" ? "stand" : "sit";
  const plan: Plan = raw.plan === "monthly" ? "monthly" : "weekly";
  let setup: Setup = { deskId, chairId, items: {}, plan, posture };
  for (const id of Object.keys(raw.items)) {
    const entry = findItem(id);
    if (
      entry === undefined ||
      entry.category === "desk" ||
      entry.category === "chair"
    ) {
      dropped.push(id);
    }
  }
  for (const entry of CATALOG) {
    const rawQty = raw.items[entry.id];
    if (
      rawQty === undefined ||
      entry.category === "desk" ||
      entry.category === "chair"
    )
      continue;
    const wanted =
      Number.isInteger(rawQty) && rawQty > 0
        ? Math.min(rawQty, entry.maxQty)
        : 1;
    for (let unit = 0; unit < wanted; unit += 1)
      setup = addItem(setup, entry.id).setup;
  }
  return { setup: { ...setup, posture }, dropped };
}

function isItemRecord(value: unknown): value is Record<string, number> {
  if (typeof value !== "object" || value === null || Array.isArray(value))
    return false;
  return Object.values(value).every((qty) => typeof qty === "number");
}

// Shape check for untrusted JSON (e.g. localStorage); rules are applied by normalizeSetup.
export function parseSetup(value: unknown): Setup | null {
  if (typeof value !== "object" || value === null) return null;
  const candidate = value as Record<string, unknown>;
  const { deskId, chairId, items, plan, posture } = candidate;
  if (typeof deskId !== "string") return null;
  if (chairId !== null && typeof chairId !== "string") return null;
  if (!isItemRecord(items)) return null;
  return {
    deskId,
    chairId,
    items,
    plan: plan === "monthly" ? "monthly" : "weekly",
    posture: posture === "stand" ? "stand" : "sit",
  };
}
