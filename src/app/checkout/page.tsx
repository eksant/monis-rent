import type { Metadata } from "next";

import { Checkout } from "@/components/checkout/checkout";

export const metadata: Metadata = { title: "Checkout · monis.rent" };

export default function CheckoutPage() {
  return <Checkout />;
}
