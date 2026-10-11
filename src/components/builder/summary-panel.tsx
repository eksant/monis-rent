"use client";

import { Truck, X } from "lucide-react";
import Link from "next/link";

import { GroupedLines } from "@/components/builder/grouped-lines";
import { PlanToggle } from "@/components/builder/plan-toggle";
import { useSetupSummary } from "@/components/builder/use-setup-summary";
import { useTweenedNumber } from "@/components/builder/use-tweened-number";
import { SiteCredit } from "@/components/site-credit";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { matchingPresetId, PRESETS } from "@/data/presets";
import { formatCents } from "@/lib/money";
import { effectiveCents } from "@/lib/pricing";
import { countLabel } from "@/lib/text";
import { useSetupStore } from "@/store/setup-store";

// The item list scrolls; plan, total and the Rent button stay pinned below it.
export function SummaryPanel() {
  const setup = useSetupStore((state) => state.setup);
  const removeLine = useSetupStore((state) => state.removeLine);
  const showCategory = useSetupStore((state) => state.showCategory);
  const { lines, totalCents, savingsCents, arrival } = useSetupSummary();
  const plan = setup.plan;
  const shownTotal = useTweenedNumber(totalCents);
  const presetName = PRESETS.find(
    (preset) => preset.id === matchingPresetId(setup),
  )?.name;
  const unit = setup.plan === "weekly" ? "week" : "month";
  const count = lines.reduce((sum, line) => sum + line.qty, 0);
  return (
    <div
      className="flex min-h-0 flex-1 flex-col gap-3"
      data-testid="summary-panel"
    >
      <div className="shrink-0">
        <h2 className="text-base font-semibold">Your setup</h2>
        <p className="text-xs text-muted-foreground">
          {countLabel(count, "item")} · {presetName ?? "Custom"}
        </p>
      </div>
      <GroupedLines
        lines={lines}
        plan={plan}
        className="min-h-0 flex-1 scroll-fade overflow-y-auto overscroll-contain pr-1 pb-4"
        renderLine={({ item, qty }) => (
          <li
            key={item.id}
            className="flex items-start gap-2"
            data-testid={`summary-line-${item.id}`}
          >
            <span className="line-clamp-2 min-w-0 flex-1 leading-snug">
              {qty > 1 ? `${String(qty)} × ` : ""}
              {item.name}
              {item.concept ? (
                <Badge variant="secondary" className="ml-1.5 align-middle">
                  Concept
                </Badge>
              ) : null}
            </span>
            <span className="shrink-0 tabular-nums">
              {formatCents(qty * effectiveCents(item, setup.plan))}
            </span>
            {item.category === "desk" ? (
              <button
                type="button"
                onClick={() => {
                  showCategory("desk");
                }}
                className="-my-1.5 min-h-8 shrink-0 rounded px-2 text-xs text-muted-foreground underline-offset-2 hover:underline"
              >
                Swap
              </button>
            ) : (
              <button
                type="button"
                aria-label={`Remove ${item.name}`}
                onClick={() => {
                  removeLine(item.id);
                }}
                className="-my-1.5 flex size-8 shrink-0 items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="size-3.5" aria-hidden />
              </button>
            )}
          </li>
        )}
      />
      <div className="shrink-0 space-y-3 border-t pt-3">
        <PlanToggle />
        <div>
          {/* Screen readers get the final total; the visible one counts up. */}
          <p className="sr-only" aria-live="polite">
            {formatCents(totalCents)} per {unit}
          </p>
          <p
            className="text-2xl font-bold tabular-nums"
            data-testid="summary-total"
            aria-hidden
          >
            {formatCents(shownTotal)}
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
        <Button asChild size="lg" className="h-11 w-full">
          <Link href="/checkout">Rent this setup</Link>
        </Button>
        <SiteCredit />
      </div>
    </div>
  );
}
