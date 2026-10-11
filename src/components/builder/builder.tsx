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
import type { CategoryId } from "@/lib/types";
import { useSetupStore } from "@/store/setup-store";

function BuilderSkeleton() {
  return (
    <div
      className="grid animate-pulse gap-4 lg:grid-cols-[340px_minmax(0,1fr)_300px]"
      aria-busy="true"
    >
      <div className="hidden h-96 rounded-xl bg-muted lg:block" />
      <div className="aspect-[8/5] rounded-2xl bg-muted" />
      <div className="hidden h-96 rounded-xl bg-muted lg:block" />
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
  const openCategory = (category: CategoryId): void => {
    showCategory(category);
    document
      .getElementById("picker")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 pb-28 lg:pb-10">
        <div className="pt-5">
          <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
            Design your Bali workspace
          </h1>
          <p className="text-sm text-muted-foreground">
            Pick a preset, swap anything, and rent it. Delivered and set up for
            you.
          </p>
        </div>
        <PresetBar />
        {hydrated ? (
          <div className="grid items-start gap-4 lg:grid-cols-[340px_minmax(0,1fr)_300px]">
            <section
              aria-label="Choose items"
              className="order-2 lg:order-1 lg:max-h-[calc(100dvh-7rem)] lg:overflow-y-auto lg:pr-1"
            >
              <CategoryPicker />
            </section>
            <section
              aria-label="Preview"
              className="order-1 space-y-3 lg:sticky lg:top-4 lg:order-2"
            >
              <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
                <WorkspaceScene setup={setup} onHotspot={openCategory} />
              </div>
              <div className="flex justify-center">
                <PostureToggle />
              </div>
            </section>
            <aside
              aria-label="Summary"
              className="order-3 hidden rounded-2xl border bg-card p-4 shadow-sm lg:sticky lg:top-4 lg:block"
            >
              <SummaryPanel />
            </aside>
          </div>
        ) : (
          <BuilderSkeleton />
        )}
      </main>
      {hydrated ? <PriceBar /> : null}
      <NoticeToasts />
    </div>
  );
}
