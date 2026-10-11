"use client";

import { Truck, X } from "lucide-react";
import Link from "next/link";

import { PlanToggle } from "@/components/builder/plan-toggle";
import { useSetupSummary } from "@/components/builder/use-setup-summary";
import { Button } from "@/components/ui/button";
import { matchingPresetId, PRESETS } from "@/data/presets";
import { formatCents } from "@/lib/money";
import { effectiveCents } from "@/lib/pricing";
import { useSetupStore } from "@/store/setup-store";

export function SummaryPanel() {
  const setup = useSetupStore((state) => state.setup);
  const remove = useSetupStore((state) => state.remove);
  const showCategory = useSetupStore((state) => state.showCategory);
  const { lines, totalCents, savingsCents, arrival } = useSetupSummary();
  const presetName = PRESETS.find(
    (preset) => preset.id === matchingPresetId(setup),
  )?.name;
  const unit = setup.plan === "weekly" ? "week" : "month";
  const count = lines.reduce((sum, line) => sum + line.qty, 0);
  return (
    <div className="space-y-4" data-testid="summary-panel">
      <div>
        <h2 className="text-base font-semibold">Your setup</h2>
        <p className="text-xs text-muted-foreground">
          {count} items · {presetName ?? "Custom"}
        </p>
      </div>
      <ul className="space-y-1.5 text-sm">
        {lines.map(({ item, qty }) => (
          <li
            key={item.id}
            className="flex items-center gap-2"
            data-testid={`summary-line-${item.id}`}
          >
            <span className="min-w-0 flex-1 truncate">
              {qty > 1 ? `${String(qty)} × ` : ""}
              {item.name}
            </span>
            <span className="tabular-nums">
              {formatCents(qty * effectiveCents(item, setup.plan))}
            </span>
            {item.category === "desk" ? (
              <button
                type="button"
                onClick={() => {
                  showCategory("desk");
                }}
                className="text-xs text-muted-foreground underline-offset-2 hover:underline"
              >
                Swap
              </button>
            ) : (
              <button
                type="button"
                aria-label={`Remove ${item.name}`}
                onClick={() => {
                  remove(item.id);
                }}
                className="rounded p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="size-3.5" aria-hidden />
              </button>
            )}
          </li>
        ))}
      </ul>
      <PlanToggle />
      <div aria-live="polite">
        <p
          className="text-2xl font-bold tabular-nums"
          data-testid="summary-total"
        >
          {formatCents(totalCents)}
          <span className="text-sm font-normal text-muted-foreground">
            {" "}
            / {unit}
          </span>
        </p>
        {savingsCents > 0 ? (
          <p
            className="text-xs text-muted-foreground"
            data-testid="summary-savings"
          >
            {setup.plan === "weekly"
              ? `Monthly saves ${formatCents(savingsCents)} vs 4.3 weeks.`
              : `You save ${formatCents(savingsCents)} vs weekly billing.`}
          </p>
        ) : null}
      </div>
      <p
        className="flex items-center gap-2 text-sm"
        data-testid="summary-arrival"
      >
        <Truck className="size-4 text-accent-foreground" aria-hidden />
        {arrival === "today" ? "Can arrive today" : "Arrives tomorrow"}
      </p>
      <p className="text-xs text-muted-foreground">
        Delivery fee calculated at checkout.
      </p>
      <Button asChild size="lg" className="w-full">
        <Link href="/checkout">Rent this setup</Link>
      </Button>
    </div>
  );
}
