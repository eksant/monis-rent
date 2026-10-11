"use client";

import { Truck } from "lucide-react";

import { GroupedLines } from "@/components/builder/grouped-lines";
import { PlanToggle } from "@/components/builder/plan-toggle";
import { useSetupSummary } from "@/components/builder/use-setup-summary";
import { Badge } from "@/components/ui/badge";
import { formatCents } from "@/lib/money";
import { effectiveCents } from "@/lib/pricing";
import { countLabel } from "@/lib/text";
import { useSetupStore } from "@/store/setup-store";

export function OrderSummary() {
  const plan = useSetupStore((state) => state.setup.plan);
  const { lines, totalCents, savingsCents, arrival } = useSetupSummary();
  const unit = plan === "weekly" ? "week" : "month";
  const count = lines.reduce((sum, line) => sum + line.qty, 0);
  return (
    <div
      className="space-y-4 rounded-2xl border bg-card p-4 shadow-sm"
      data-testid="order-summary"
    >
      <div>
        <h2 className="text-base font-semibold">Your setup</h2>
        <p className="text-xs text-muted-foreground">
          {countLabel(count, "item")}
        </p>
      </div>
      <GroupedLines
        lines={lines}
        plan={plan}
        className="max-h-60 scroll-fade overflow-y-auto overscroll-contain pr-1 pb-4 lg:max-h-[45dvh]"
        renderLine={({ item, qty }) => (
          <li key={item.id} className="flex items-start gap-2">
            <span className="min-w-0 flex-1 leading-snug">
              {qty > 1 ? `${String(qty)} × ` : ""}
              {item.name}
              {item.concept ? (
                <Badge variant="secondary" className="ml-1.5 align-middle">
                  Concept
                </Badge>
              ) : null}
            </span>
            <span className="shrink-0 tabular-nums">
              {formatCents(qty * effectiveCents(item, plan))}
            </span>
          </li>
        )}
      />
      <div className="space-y-3 border-t pt-3">
        <PlanToggle />
        <div aria-live="polite">
          <p
            className="text-2xl font-bold tabular-nums"
            data-testid="checkout-total"
          >
            {formatCents(totalCents)}
            <span className="text-sm font-normal text-muted-foreground">
              {" "}
              / {unit}
            </span>
          </p>
          {savingsCents > 0 && plan === "monthly" ? (
            <p className="text-xs text-muted-foreground">
              You save {formatCents(savingsCents)} vs weekly billing.
            </p>
          ) : null}
        </div>
        <p className="flex items-center gap-2 text-sm">
          <Truck className="size-4 text-accent-foreground" aria-hidden />
          {arrival === "today"
            ? "Can arrive today"
            : "Arrives tomorrow at the earliest"}
        </p>
        <p className="text-xs text-muted-foreground">
          The delivery fee is calculated by monis.rent based on your location.
        </p>
      </div>
    </div>
  );
}
