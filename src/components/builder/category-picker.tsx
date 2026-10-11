"use client";

import { Armchair } from "lucide-react";

import { ItemCard } from "@/components/builder/item-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { itemsInCategory } from "@/data/catalog";
import { deltaCents, quantityOf, slotCapacity } from "@/lib/setup";
import type { CatalogItem, CategoryId } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useSetupStore } from "@/store/setup-store";

const TABS: { id: CategoryId; label: string }[] = [
  { id: "desk", label: "Desk" },
  { id: "chair", label: "Chair" },
  { id: "screen", label: "Screens" },
  { id: "accessory", label: "Accessories" },
  { id: "extra", label: "Bali" },
];

function isCategoryId(value: string): value is CategoryId {
  return TABS.some((tab) => tab.id === value);
}

function groupByHeading(
  items: CatalogItem[],
): [string | null, CatalogItem[]][] {
  const groups = new Map<string | null, CatalogItem[]>();
  for (const entry of items) {
    const key = entry.group ?? null;
    groups.set(key, [...(groups.get(key) ?? []), entry]);
  }
  return [...groups.entries()];
}

function CategoryItems({ category }: { category: CategoryId }) {
  const setup = useSetupStore((state) => state.setup);
  const toggle = useSetupStore((state) => state.toggle);
  const remove = useSetupStore((state) => state.remove);
  const chooseChair = useSetupStore((state) => state.chooseChair);
  return (
    <div className="space-y-4">
      {category === "chair" ? (
        <button
          type="button"
          aria-pressed={setup.chairId === null}
          onClick={() => {
            chooseChair(null);
          }}
          className={cn(
            "flex w-full items-center gap-3 rounded-xl border bg-card p-2.5 text-left text-sm transition",
            setup.chairId === null
              ? "border-primary ring-2 ring-accent/50"
              : "hover:border-primary/30",
          )}
        >
          <span className="flex size-14 items-center justify-center rounded-lg bg-muted">
            <Armchair className="size-6 text-muted-foreground" aria-hidden />
          </span>
          <span>
            <span className="block font-semibold">No chair</span>
            <span className="text-xs text-muted-foreground">
              I already have a good one.
            </span>
          </span>
        </button>
      ) : null}
      {groupByHeading(itemsInCategory(category)).map(([heading, entries]) => (
        <section
          key={heading ?? "all"}
          aria-label={heading ?? undefined}
          className="space-y-2"
        >
          {heading === null ? null : (
            <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              {heading}
            </h3>
          )}
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
            {entries.map((entry) => (
              <ItemCard
                key={entry.id}
                item={entry}
                plan={setup.plan}
                qty={quantityOf(setup, entry.id)}
                multi={
                  category !== "desk" &&
                  category !== "chair" &&
                  slotCapacity(setup, entry.slot) > 1
                }
                delta={deltaCents(setup, entry.id)}
                onToggle={() => {
                  toggle(entry.id);
                }}
                onDecrement={() => {
                  remove(entry.id);
                }}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

export function CategoryPicker() {
  const active = useSetupStore((state) => state.activeCategory);
  const showCategory = useSetupStore((state) => state.showCategory);
  return (
    <Tabs
      id="picker"
      value={active}
      onValueChange={(value) => {
        if (isCategoryId(value)) showCategory(value);
      }}
      className="scroll-mt-20"
    >
      <div className="-mx-4 overflow-x-auto px-4 lg:mx-0 lg:px-0">
        <TabsList className="w-max lg:w-full">
          {TABS.map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className="text-muted-foreground data-active:text-foreground"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>
      {TABS.map((tab) => (
        <TabsContent key={tab.id} value={tab.id} className="mt-3">
          <CategoryItems category={tab.id} />
        </TabsContent>
      ))}
    </Tabs>
  );
}
