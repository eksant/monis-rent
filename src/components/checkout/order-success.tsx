"use client";

import { CircleCheck, ExternalLink, TriangleAlert } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { ShareButton } from "@/components/builder/share-button";
import { SiteHeader } from "@/components/builder/site-header";
import { BackToBuilder } from "@/components/checkout/checkout";
import { Button } from "@/components/ui/button";
import { formatDeliveryDate } from "@/lib/checkout";
import { formatCents } from "@/lib/money";
import { useSetupStore } from "@/store/setup-store";

const NEXT_STEPS = [
  "monis.rent confirms availability and the delivery fee.",
  "Your setup arrives on the date you chose. The rental starts on arrival.",
  "Swap, add or return items any time from your monis.rent account.",
  "Book the pickup when you leave. Nothing to pack or ship.",
];

function NoOrder() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-3 px-4 py-16 text-center">
      <h2 className="text-xl font-bold">No request yet</h2>
      <p className="text-sm text-muted-foreground">
        Design your workspace first, then send a rental request.
      </p>
      <Button asChild size="lg">
        <Link href="/">Design my workspace</Link>
      </Button>
    </div>
  );
}

export function OrderSuccess() {
  const router = useRouter();
  const hydrated = useSetupStore((state) => state.hydrated);
  const hydrate = useSetupStore((state) => state.hydrate);
  const order = useSetupStore((state) => state.lastOrder);
  const startNewSetup = useSetupStore((state) => state.startNewSetup);
  useEffect(() => {
    void hydrate();
  }, [hydrate]);
  const unit = order?.setup.plan === "monthly" ? "month" : "week";
  const firstName = order?.customer.fullName.split(" ")[0] ?? "";
  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      <SiteHeader title="Request received" action={<BackToBuilder />} />
      <main className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        {!hydrated ? null : order === null ? (
          <NoOrder />
        ) : (
          <div className="mx-auto w-full max-w-2xl space-y-4 px-3 py-4 sm:px-4 lg:py-8">
            <p
              role="note"
              className="flex items-start gap-2 rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900"
              data-testid="concept-banner"
            >
              <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
              <span>
                <strong>Concept demo.</strong> No order was placed, no payment
                was taken and nobody will contact you.
              </span>
            </p>
            <section className="space-y-4 rounded-2xl border bg-card p-5 text-center shadow-sm">
              <CircleCheck
                className="mx-auto size-12 animate-drop-in text-primary"
                aria-hidden
              />
              <div>
                <h2 className="text-2xl font-extrabold tracking-tight">
                  Thanks, {firstName}!
                </h2>
                <p className="text-sm text-muted-foreground">
                  Your request reference is{" "}
                  <strong
                    className="font-mono text-foreground"
                    data-testid="order-reference"
                  >
                    {order.reference}
                  </strong>
                </p>
              </div>
              <dl className="grid gap-3 text-left text-sm sm:grid-cols-2">
                <div className="rounded-lg bg-muted/60 p-3">
                  <dt className="text-xs text-muted-foreground">Total</dt>
                  <dd
                    className="font-semibold tabular-nums"
                    data-testid="order-total"
                  >
                    {formatCents(order.totalCents)} / {unit}
                  </dd>
                </div>
                <div className="rounded-lg bg-muted/60 p-3">
                  <dt className="text-xs text-muted-foreground">Delivery</dt>
                  <dd className="font-semibold" data-testid="order-delivery">
                    {formatDeliveryDate(order.customer.deliveryDate)} ·{" "}
                    {order.customer.area}
                  </dd>
                </div>
              </dl>
            </section>
            <section className="rounded-2xl border bg-card p-5 shadow-sm">
              <h2 className="text-base font-semibold">What happens next</h2>
              <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm">
                {NEXT_STEPS.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            </section>
            <div className="flex flex-wrap justify-center gap-2 pb-4">
              <ShareButton />
              <Button
                size="lg"
                className="h-10"
                onClick={() => {
                  startNewSetup();
                  router.push("/");
                }}
              >
                Start a new setup
              </Button>
              <Button asChild variant="outline" size="lg" className="h-10">
                <a
                  href="https://www.monis.rent"
                  target="_blank"
                  rel="noreferrer"
                >
                  Browse monis.rent
                  <ExternalLink aria-hidden />
                </a>
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
