import Link from "next/link";

// Placeholder until the checkout milestone (Plan 2).
export default function CheckoutPage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-3 px-4 text-center">
      <h1 className="text-2xl font-bold">Checkout is on its way</h1>
      <p className="text-sm text-muted-foreground">
        This build is the clickable preview. Checkout lands in the next
        milestone.
      </p>
      <Link
        href="/"
        className="text-sm font-medium underline underline-offset-4"
      >
        Back to your setup
      </Link>
    </main>
  );
}
