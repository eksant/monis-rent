import { ShareButton } from "@/components/builder/share-button";

// Never scrolls away: the page is a fixed-height app shell.
export function SiteHeader() {
  return (
    <header className="shrink-0 border-b bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-12 w-full max-w-[1600px] items-center gap-3 px-3 sm:h-14 sm:px-4 short:h-11">
        <span className="shrink-0 text-base font-extrabold tracking-tight sm:text-lg">
          monis.rent
        </span>
        <span className="hidden h-6 w-px bg-border sm:block" aria-hidden />
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-sm font-semibold sm:text-base">
            Design your Bali workspace
          </h1>
          <p className="hidden truncate text-xs text-muted-foreground lg:block">
            Pick a preset, swap anything, see the price, and rent it.
          </p>
        </div>
        <ShareButton />
      </div>
    </header>
  );
}
