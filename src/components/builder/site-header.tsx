import { ShareButton } from "@/components/builder/share-button";

export function SiteHeader() {
  return (
    <header className="border-b bg-white/80 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between gap-3 px-4">
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-extrabold tracking-tight">
            monis.rent
          </span>
          <span className="hidden text-sm text-muted-foreground sm:inline">
            Workspace Builder
          </span>
        </div>
        <ShareButton />
      </div>
    </header>
  );
}
