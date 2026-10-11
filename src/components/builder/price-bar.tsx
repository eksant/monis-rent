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

// Sticky bottom bar on small screens; opens the full summary in a drawer.
export function PriceBar() {
  const plan = useSetupStore((state) => state.setup.plan);
  const { totalCents, arrival } = useSetupSummary();
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-white/95 backdrop-blur lg:hidden">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3">
        <Drawer>
          <DrawerTrigger asChild>
            <button
              type="button"
              className="flex flex-1 items-center gap-2 text-left"
              data-testid="price-bar"
            >
              <span>
                <span className="block text-lg leading-tight font-bold tabular-nums">
                  {formatCents(totalCents)}
                  <span className="text-xs font-normal text-muted-foreground">
                    {" "}
                    / {plan === "weekly" ? "week" : "month"}
                  </span>
                </span>
                <span className="text-xs text-muted-foreground">
                  {arrival === "today"
                    ? "Can arrive today"
                    : "Arrives tomorrow"}{" "}
                  · View setup
                </span>
              </span>
              <ChevronUp className="size-4 text-muted-foreground" aria-hidden />
            </button>
          </DrawerTrigger>
          <DrawerContent>
            <div className="mx-auto w-full max-w-md overflow-y-auto px-4 pt-2 pb-6">
              <DrawerTitle className="sr-only">Your setup</DrawerTitle>
              <DrawerDescription className="sr-only">
                Items, plan and total price.
              </DrawerDescription>
              <SummaryPanel />
            </div>
          </DrawerContent>
        </Drawer>
        <Button asChild size="lg">
          <Link href="/checkout">Rent</Link>
        </Button>
      </div>
    </div>
  );
}
