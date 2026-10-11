import type { Arrival, CatalogItem, Plan, SetupLine } from "@/lib/types";

const WEEKS_PER_MONTH = 52 / 12;

// List price for the plan minus the item's sale percentage, in integer cents.
export function effectiveCents(item: CatalogItem, plan: Plan): number {
  const list = plan === "weekly" ? item.weeklyCents : item.monthlyCents;
  return Math.round((list * (100 - item.salePercent)) / 100);
}

export function totalCents(lines: readonly SetupLine[], plan: Plan): number {
  return lines.reduce(
    (sum, line) => sum + line.qty * effectiveCents(line.item, plan),
    0,
  );
}

// What a month costs on weekly billing minus the monthly plan; may be negative.
export function monthlySavingsCents(lines: readonly SetupLine[]): number {
  return (
    Math.round(totalCents(lines, "weekly") * WEEKS_PER_MONTH) -
    totalCents(lines, "monthly")
  );
}

export function weeklyEquivalentCents(
  lines: readonly SetupLine[],
  plan: Plan,
): number {
  const total = totalCents(lines, plan);
  return plan === "weekly" ? total : Math.round(total / WEEKS_PER_MONTH);
}

export function arrivalFor(lines: readonly SetupLine[]): Arrival {
  return lines.every((line) => line.item.instant) ? "today" : "tomorrow";
}
