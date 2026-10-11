"use client";

import { ChevronUp } from "lucide-react";
import Link from "next/link";

import { SummaryPanel } from "@/components/builder/summary-panel";
import { useSetupSummary } from "@/components/builder/use-setup-summary";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { formatCents } from "@/lib/money";
import { useSetupStore } from "@/store/setup-store";

// Pinned to the bottom below lg; tapping the total opens the full summary.
export function PriceBar() {
  const plan = useSetupStore((state) => state.setup.plan);
  const { lines, totalCents, arrival } = useSetupSummary();
  const count = lines.reduce((sum, line) => sum + line.qty, 0);
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-white/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_16px_rgb(21_37_46/0.06)] backdrop-blur lg:hidden">
      <div className="mx-auto flex h-16 max-w-3xl items-center gap-3 px-3 sm:px-4">
        <Drawer>
          <DrawerTrigger asChild>
            <button
              type="button"
              className="flex min-w-0 flex-1 items-center gap-2 rounded-lg py-1 text-left"
              data-testid="price-bar"
            >
              <span className="min-w-0">
                <span className="block text-lg leading-tight font-bold tabular-nums">
                  {formatCents(totalCents)}
                  <span className="text-xs font-normal text-muted-foreground">
                    {" "}
                    / {plan === "weekly" ? "week" : "month"}
                  </span>
                </span>
                <span className="block truncate text-xs text-muted-foreground">
                  {count} items ·{" "}
                  {arrival === "today"
                    ? "Can arrive today"
                    : "Arrives tomorrow"}
                </span>
              </span>
              <ChevronUp
                className="size-5 shrink-0 text-muted-foreground"
                aria-hidden
              />
              <span className="sr-only">View setup</span>
            </button>
          </DrawerTrigger>
          <DrawerContent>
            <div className="mx-auto flex max-h-[78dvh] w-full max-w-md flex-col px-4 pt-2 pb-[calc(1rem+env(safe-area-inset-bottom))]">
              <DrawerTitle className="sr-only">Your setup</DrawerTitle>
              <DrawerDescription className="sr-only">
                Items, plan and total price.
              </DrawerDescription>
              <SummaryPanel />
            </div>
          </DrawerContent>
        </Drawer>
        <Button asChild size="lg" className="h-11 px-5">
          <Link href="/checkout">Rent</Link>
        </Button>
      </div>
    </div>
  );
}
