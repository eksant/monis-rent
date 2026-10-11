"use client";

import { useEffect } from "react";

import { CategoryPicker } from "@/components/builder/category-picker";
import { NoticeToasts } from "@/components/builder/notice-toasts";
import { PostureToggle } from "@/components/builder/posture-toggle";
import { PresetBar } from "@/components/builder/preset-bar";
import { PriceBar } from "@/components/builder/price-bar";
import { SiteHeader } from "@/components/builder/site-header";
import { SummaryPanel } from "@/components/builder/summary-panel";
import { WorkspaceScene } from "@/components/scene/workspace-scene";
import { useSetupStore } from "@/store/setup-store";

// Below lg: scene on top, picker below, price bar pinned to the bottom (landscape
// phones: scene | picker). From lg: picker | scene | summary. The page never scrolls.
const GRID =
  "mx-auto grid min-h-0 w-full max-w-[1600px] flex-1 grid-rows-[auto_minmax(0,1fr)] gap-3 px-3 pb-[calc(4.5rem+env(safe-area-inset-bottom))] sm:px-4 short:pb-[calc(4rem+env(safe-area-inset-bottom))] short:grid-cols-2 short:grid-rows-1 lg:grid-cols-[300px_minmax(0,1fr)_260px] lg:grid-rows-1 lg:gap-4 lg:pb-4 xl:grid-cols-[340px_minmax(0,1fr)_300px]";

// The scene keeps its 8:5 ratio and fits inside whatever box it gets.
const SCENE_BOX =
  "flex h-[min(56vw,34dvh)] min-h-0 items-center justify-center [container-type:size] short:h-auto short:flex-1 lg:h-auto lg:flex-1";

function BuilderSkeleton() {
  return (
    <div className={GRID} aria-busy="true">
      <div className="h-[min(56vw,34dvh)] animate-pulse rounded-2xl bg-muted lg:order-2 lg:h-full" />
      <div className="animate-pulse rounded-xl bg-muted lg:order-1" />
      <div className="hidden animate-pulse rounded-2xl bg-muted lg:order-3 lg:block" />
    </div>
  );
}

export function Builder() {
  const hydrated = useSetupStore((state) => state.hydrated);
  const hydrate = useSetupStore((state) => state.hydrate);
  const setup = useSetupStore((state) => state.setup);
  const showCategory = useSetupStore((state) => state.showCategory);
  useEffect(() => {
    void hydrate();
  }, [hydrate]);
  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      <SiteHeader />
      <PresetBar />
      {hydrated ? (
        <main className={GRID}>
          <section
            aria-label="Preview"
            className="flex min-h-0 flex-col lg:order-2"
          >
            <div className={SCENE_BOX}>
              <div className="relative w-[min(100cqw,160cqh)] overflow-hidden rounded-2xl border bg-white shadow-sm">
                <WorkspaceScene setup={setup} onHotspot={showCategory} />
                <div className="absolute right-2 bottom-2">
                  <PostureToggle />
                </div>
              </div>
            </div>
          </section>
          <section
            aria-label="Choose items"
            className="flex min-h-0 flex-col lg:order-1"
          >
            <CategoryPicker />
          </section>
          <aside
            aria-label="Summary"
            className="hidden min-h-0 flex-col rounded-2xl border bg-card p-4 shadow-sm lg:order-3 lg:flex"
          >
            <SummaryPanel />
          </aside>
        </main>
      ) : (
        <BuilderSkeleton />
      )}
      {hydrated ? <PriceBar /> : null}
      <NoticeToasts />
    </div>
  );
}
