"use client";

import { ChevronRight } from "lucide-react";
import { Accordion as AccordionPrimitive } from "radix-ui";
import { type ReactNode, useState } from "react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
} from "@/components/ui/accordion";
import { formatCents } from "@/lib/money";
import { totalCents } from "@/lib/pricing";
import { CATEGORY_LABELS, groupLines } from "@/lib/setup";
import type { CategoryId, Plan, SetupLine } from "@/lib/types";

function isCategoryId(value: string): value is CategoryId {
  return value in CATEGORY_LABELS;
}

// Summary lines grouped like the builder's tabs. Each group folds away and keeps
// its subtotal visible; groups that appear later start open.
export function GroupedLines({
  lines,
  plan,
  renderLine,
  className,
}: {
  lines: readonly SetupLine[];
  plan: Plan;
  renderLine: (line: SetupLine) => ReactNode;
  className?: string;
}) {
  const [closed, setClosed] = useState<CategoryId[]>([]);
  const groups = groupLines(lines);
  const present = groups.map((group) => group.category);
  return (
    <Accordion
      type="multiple"
      value={present.filter((category) => !closed.includes(category))}
      onValueChange={(next) => {
        const open = next.filter(isCategoryId);
        setClosed(present.filter((category) => !open.includes(category)));
      }}
      className={className}
    >
      {groups.map((group) => (
        <AccordionItem
          key={group.category}
          value={group.category}
          className="border-none"
          data-testid={`summary-group-${group.category}`}
        >
          <AccordionPrimitive.Header className="flex">
            {/* Chevron on the left so it never crowds the subtotal. */}
            <AccordionPrimitive.Trigger className="group/trigger flex flex-1 items-center gap-2 rounded-md py-1.5 text-left text-xs font-semibold tracking-wide text-muted-foreground uppercase outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50">
              <ChevronRight
                className="size-3.5 shrink-0 transition-transform duration-200 group-data-[state=open]/trigger:rotate-90 motion-reduce:transition-none"
                aria-hidden
              />
              <span className="flex-1">{group.label}</span>
              <span className="rounded-full bg-muted px-1.5 text-[11px] leading-5 tabular-nums">
                {group.count}
              </span>
              <span className="min-w-16 text-right normal-case tabular-nums">
                {formatCents(totalCents(group.lines, plan))}
              </span>
            </AccordionPrimitive.Trigger>
          </AccordionPrimitive.Header>
          {/* h-auto: the vendored content locks the height measured on open, which
              clips items when names wrap later (font load, resize). */}
          <AccordionContent className="h-auto pb-2">
            {/* Each item gets a dot under the chevron and lines up with the label. */}
            <ul className="space-y-2 text-sm text-foreground [&>li]:relative [&>li]:pl-5.5 [&>li]:before:absolute [&>li]:before:top-[0.55em] [&>li]:before:left-1 [&>li]:before:size-1.5 [&>li]:before:rounded-full [&>li]:before:bg-accent [&>li]:before:content-['']">
              {group.lines.map((line) => renderLine(line))}
            </ul>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
