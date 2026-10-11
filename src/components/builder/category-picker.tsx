"use client";

import { Armchair } from "lucide-react";

import { CatalogSearch } from "@/components/builder/catalog-search";
import { ItemCard } from "@/components/builder/item-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { itemsInCategory } from "@/data/catalog";
import { searchCatalog } from "@/lib/search";
import { deltaCents, isMultiUnit, quantityOf } from "@/lib/setup";
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

const RESULT_HEADINGS: Record<CategoryId, string> = {
  desk: "Desks",
  chair: "Chairs",
  screen: "Screens",
  accessory: "Accessories",
  extra: "Bali extras",
};

const SUGGESTIONS = ["monitor", "lamp", "coffee", "wifi", "plant"];

type Group = [string | null, CatalogItem[]];

function isCategoryId(value: string): value is CategoryId {
  return TABS.some((tab) => tab.id === value);
}

// Groups in order of first appearance, so search ranking is kept.
function groupItems(
  items: CatalogItem[],
  headingOf: (item: CatalogItem) => string | null,
): Group[] {
  const groups = new Map<string | null, CatalogItem[]>();
  for (const entry of items) {
    const key = headingOf(entry);
    groups.set(key, [...(groups.get(key) ?? []), entry]);
  }
  return [...groups.entries()];
}

function ItemGroups({ groups }: { groups: Group[] }) {
  const setup = useSetupStore((state) => state.setup);
  const toggle = useSetupStore((state) => state.toggle);
  const remove = useSetupStore((state) => state.remove);
  return groups.map(([heading, entries]) => (
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
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1 short:grid-cols-1">
        {entries.map((entry) => (
          <ItemCard
            key={entry.id}
            item={entry}
            plan={setup.plan}
            qty={quantityOf(setup, entry.id)}
            multi={isMultiUnit(setup, entry.id)}
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
  ));
}

function NoChairCard() {
  const chairId = useSetupStore((state) => state.setup.chairId);
  const chooseChair = useSetupStore((state) => state.chooseChair);
  return (
    <button
      type="button"
      aria-pressed={chairId === null}
      onClick={() => {
        chooseChair(null);
      }}
      className={cn(
        "flex w-full items-center gap-3 rounded-xl border bg-card p-2.5 text-left text-sm transition",
        chairId === null
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
  );
}

function SearchResults({ query }: { query: string }) {
  const setSearch = useSetupStore((state) => state.setSearch);
  const results = searchCatalog(query);
  const label =
    results.length === 1 ? "1 item" : `${String(results.length)} items`;
  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground" aria-live="polite">
        {results.length === 0 ? "" : `${label} found`}
      </p>
      {results.length === 0 ? (
        <div className="rounded-xl border border-dashed bg-card p-4 text-sm">
          <p className="font-semibold">No match for “{query.trim()}”</p>
          <p className="mt-1 text-muted-foreground">Try one of these:</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {SUGGESTIONS.map((word) => (
              <button
                key={word}
                type="button"
                onClick={() => {
                  setSearch(word);
                }}
                className="min-h-9 rounded-full border bg-white px-3 text-sm hover:border-primary/40"
              >
                {word}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <ItemGroups
          groups={groupItems(
            results,
            (entry) => entry.group ?? RESULT_HEADINGS[entry.category],
          )}
        />
      )}
    </div>
  );
}

// Search on top; below it either search results or the category tabs, in a scroll area.
export function CategoryPicker() {
  const active = useSetupStore((state) => state.activeCategory);
  const showCategory = useSetupStore((state) => state.showCategory);
  const query = useSetupStore((state) => state.search);
  const searching = query.trim() !== "";
  const scrollArea =
    "min-h-0 flex-1 overflow-y-auto overscroll-contain pb-2 lg:pr-1";
  return (
    <div id="picker" className="flex min-h-0 flex-1 flex-col gap-2">
      <CatalogSearch />
      {searching ? (
        <div className={scrollArea}>
          <SearchResults query={query} />
        </div>
      ) : (
        <Tabs
          value={active}
          onValueChange={(value) => {
            if (isCategoryId(value)) showCategory(value);
          }}
          className="min-h-0 flex-1"
        >
          <div className="-mx-3 shrink-0 overflow-x-auto px-3 sm:mx-0 sm:px-0">
            <TabsList className="h-10 w-max min-w-full sm:w-full">
              {TABS.map((tab) => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="px-3 text-muted-foreground sm:px-2 lg:px-1.5 lg:text-[13px] data-active:text-foreground"
                >
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
          {TABS.map((tab) => (
            <TabsContent
              key={tab.id}
              value={tab.id}
              className={cn(scrollArea, "space-y-4")}
            >
              {tab.id === "chair" ? <NoChairCard /> : null}
              <ItemGroups
                groups={groupItems(
                  itemsInCategory(tab.id),
                  (entry) => entry.group ?? null,
                )}
              />
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  );
}
