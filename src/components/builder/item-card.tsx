"use client";

import {
  Armchair,
  Check,
  Minus,
  Monitor,
  Package,
  Plus,
  Sprout,
  Zap,
} from "lucide-react";
import Image from "next/image";
import { useId, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { monisProductUrl } from "@/data/catalog";
import { formatCents, formatDelta } from "@/lib/money";
import { effectiveCents } from "@/lib/pricing";
import type { CatalogItem, Plan } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ItemCardProps {
  item: CatalogItem;
  plan: Plan;
  qty: number;
  multi: boolean;
  delta: number;
  onToggle: () => void;
  onDecrement: () => void;
}

function FallbackIcon({ item }: { item: CatalogItem }) {
  const Icon =
    item.category === "chair"
      ? Armchair
      : item.slot === "plant"
        ? Sprout
        : item.category === "screen"
          ? Monitor
          : Package;
  return (
    <span
      data-testid="thumb-fallback"
      className="flex size-14 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground"
    >
      <Icon className="size-6" aria-hidden />
    </span>
  );
}

// Product photo from monis.rent, or an icon when there is none or it fails to load.
function Thumb({ item }: { item: CatalogItem }) {
  const [failed, setFailed] = useState(false);
  if (item.imageUrl === undefined || failed)
    return <FallbackIcon item={item} />;
  return (
    <Image
      src={item.imageUrl}
      alt=""
      width={56}
      height={56}
      unoptimized
      onError={() => {
        setFailed(true);
      }}
      className="size-14 shrink-0 rounded-lg bg-white object-contain"
    />
  );
}

export function ItemCard({
  item,
  plan,
  qty,
  multi,
  delta,
  onToggle,
  onDecrement,
}: ItemCardProps) {
  const selected = qty > 0;
  const unit = plan === "weekly" ? "wk" : "mo";
  const nameId = useId();
  const detailsId = useId();
  const status =
    selected && !multi
      ? "Selected."
      : `Changes your total by ${formatDelta(delta)} per ${plan === "weekly" ? "week" : "month"}.`;
  return (
    <div
      data-testid={`item-card-${item.id}`}
      data-selected={selected}
      className={cn(
        // relative: keeps the sr-only status inside the scroll area.
        "relative rounded-xl border bg-card p-2.5 transition",
        selected
          ? "border-primary ring-2 ring-accent/50"
          : "hover:border-primary/30",
      )}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-pressed={multi ? undefined : selected}
        aria-labelledby={nameId}
        aria-describedby={detailsId}
        className="flex w-full items-start gap-3 rounded-lg text-left focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
      >
        <Thumb item={item} />
        <span className="min-w-0 flex-1">
          <span
            id={nameId}
            className="block text-sm leading-tight font-semibold"
          >
            {item.name}
          </span>
          <span id={detailsId} className="block">
            <span className="mt-0.5 line-clamp-2 block text-xs text-muted-foreground">
              {item.benefit}
            </span>
            <span className="mt-1.5 flex flex-wrap items-center gap-1.5">
              <span className="text-sm font-semibold">
                {formatCents(effectiveCents(item, plan))}
                <span className="text-xs font-normal text-muted-foreground">
                  /{unit}
                </span>
              </span>
              {item.salePercent > 0 ? (
                <Badge className="bg-sale text-white">
                  −{item.salePercent}%
                </Badge>
              ) : null}
              {item.instant ? (
                <Badge variant="outline">
                  <Zap aria-hidden />
                  Same-day
                </Badge>
              ) : null}
              {item.concept ? <Badge variant="secondary">Concept</Badge> : null}
            </span>
            <span className="sr-only">{status}</span>
          </span>
        </span>
        <span className="shrink-0 pt-0.5 text-xs font-semibold" aria-hidden>
          {selected && !multi ? (
            <Check className="size-4 text-primary" />
          ) : (
            formatDelta(delta)
          )}
        </span>
      </button>
      {multi && selected ? (
        <div className="mt-2 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onDecrement}
            aria-label={`Remove one ${item.name}`}
            className="flex size-9 items-center justify-center rounded-full border hover:bg-muted"
          >
            <Minus className="size-3.5" aria-hidden />
          </button>
          <span
            className="w-4 text-center text-sm font-semibold"
            data-testid={`qty-${item.id}`}
          >
            {qty}
          </span>
          <button
            type="button"
            onClick={onToggle}
            aria-label={`Add another ${item.name}`}
            className="flex size-9 items-center justify-center rounded-full border hover:bg-muted"
          >
            <Plus className="size-3.5" aria-hidden />
          </button>
        </div>
      ) : null}
      {item.slug === undefined ? null : (
        <a
          href={monisProductUrl(item.slug)}
          target="_blank"
          rel="noreferrer"
          className="mt-1 inline-flex min-h-8 items-center text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
        >
          View on monis.rent
        </a>
      )}
    </div>
  );
}
