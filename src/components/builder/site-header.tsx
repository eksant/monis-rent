import type { ReactNode } from "react";

// Never scrolls away: every page is a fixed-height app shell.
export function SiteHeader({
  title = "Design your Bali workspace",
  subtitle,
  action,
}: {
  title?: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <header className="shrink-0 border-b bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-12 w-full max-w-[1600px] items-center gap-3 px-3 sm:h-14 sm:px-4 short:h-11">
        <span className="shrink-0 text-base font-extrabold tracking-tight sm:text-lg">
          monis.rent
        </span>
        <span className="hidden h-6 w-px bg-border sm:block" aria-hidden />
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-sm font-semibold sm:text-base">
            {title}
          </h1>
          {subtitle === undefined ? null : (
            <p className="hidden truncate text-xs text-muted-foreground lg:block">
              {subtitle}
            </p>
          )}
        </div>
        {action}
      </div>
    </header>
  );
}
