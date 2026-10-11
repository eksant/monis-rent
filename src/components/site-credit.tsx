import { Coffee } from "lucide-react";

const COFFEE_LINK =
  "mailto:eksant@gmail.com?subject=A%20coffee%20for%20the%20monis.rent%20builder";

// Copyright and a "buy me a coffee" note, shown under the summary and the checkout.
export function SiteCredit({ className }: { className?: string }) {
  return (
    <p className={className ?? "text-center text-xs text-muted-foreground"}>
      © 2026 eksant · Concept for monis.rent ·{" "}
      <a
        href={COFFEE_LINK}
        className="inline-flex min-h-8 items-center gap-1 font-medium text-foreground underline-offset-2 hover:underline"
      >
        <Coffee className="size-3.5" aria-hidden />
        Buy me a coffee
      </a>
    </p>
  );
}
