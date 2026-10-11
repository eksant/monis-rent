import { CATALOG } from "@/data/catalog";
import { normalizeSetup } from "@/lib/setup";
import type { Setup } from "@/lib/types";

export interface DecodedSetup {
  setup: Setup;
  dropped: string[];
}

// Stable, readable query string, e.g. "d=desk-electric&c=chair-ergo&i=mon-27-4k:2&p=m".
export function encodeSetup(setup: Setup): string {
  const params = new URLSearchParams();
  params.set("d", setup.deskId);
  params.set("c", setup.chairId ?? "none");
  const items = CATALOG.flatMap((entry) => {
    const qty = setup.items[entry.id] ?? 0;
    if (qty <= 0) return [];
    return [qty === 1 ? entry.id : `${entry.id}:${String(qty)}`];
  });
  if (items.length > 0) params.set("i", items.join(","));
  if (setup.plan === "monthly") params.set("p", "m");
  if (setup.posture === "stand") params.set("pos", "stand");
  return params.toString().replaceAll("%2C", ",").replaceAll("%3A", ":");
}

function parseItems(value: string | null): Record<string, number> {
  const items: Record<string, number> = {};
  if (value === null || value === "") return items;
  for (const token of value.split(",")) {
    const [id = "", rawQty] = token.split(":");
    if (id === "") continue;
    const qty = rawQty === undefined ? 1 : Number.parseInt(rawQty, 10);
    items[id] = (items[id] ?? 0) + (Number.isNaN(qty) ? 1 : qty);
  }
  return items;
}

// Returns null when the query carries no setup (no "d" param). Never throws.
export function decodeSetup(search: string): DecodedSetup | null {
  const params = new URLSearchParams(search);
  const deskId = params.get("d");
  if (deskId === null) return null;
  const chair = params.get("c");
  return normalizeSetup({
    deskId,
    chairId: chair === null || chair === "none" ? null : chair,
    items: parseItems(params.get("i")),
    plan: params.get("p") === "m" ? "monthly" : "weekly",
    posture: params.get("pos") === "stand" ? "stand" : "sit",
  });
}

export function shareUrl(setup: Setup, origin: string): string {
  return `${origin}/?${encodeSetup(setup)}`;
}
