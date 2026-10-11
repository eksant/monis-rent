"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

import { SiteHeader } from "@/components/builder/site-header";
import { CheckoutForm } from "@/components/checkout/checkout-form";
import { OrderSummary } from "@/components/checkout/order-summary";
import { Button } from "@/components/ui/button";
import { useSetupStore } from "@/store/setup-store";

export function BackToBuilder() {
  return (
    <Button
      asChild
      variant="outline"
      size="lg"
      className="h-10 shrink-0 sm:h-9"
    >
      <Link href="/">
        <ArrowLeft aria-hidden />
        Edit setup
      </Link>
    </Button>
  );
}

// Same app shell as the builder: the header stays put and only <main> scrolls.
export function Checkout() {
  const hydrated = useSetupStore((state) => state.hydrated);
  const hydrate = useSetupStore((state) => state.hydrate);
  useEffect(() => {
    void hydrate();
  }, [hydrate]);
  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      <SiteHeader title="Checkout" action={<BackToBuilder />} />
      <main className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        {hydrated ? (
          <div className="mx-auto grid w-full max-w-5xl items-start gap-4 px-3 py-4 sm:px-4 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-6 lg:py-6">
            <section
              aria-label="Order summary"
              className="lg:sticky lg:top-0 lg:order-2"
            >
              <OrderSummary />
            </section>
            <section aria-label="Delivery" className="lg:order-1">
              <CheckoutForm />
            </section>
          </div>
        ) : (
          <div
            className="mx-auto h-96 max-w-5xl animate-pulse rounded-2xl bg-muted"
            aria-busy="true"
          />
        )}
      </main>
    </div>
  );
}
