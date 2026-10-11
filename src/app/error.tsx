"use client";

import { Button } from "@/components/ui/button";
import { STORAGE_KEY } from "@/store/setup-store";

// Route-level safety net (Next 16 passes `retry`). "Start over" also drops a
// saved setup in case that is what keeps failing.
export default function RouteError({
  retry,
}: {
  error: Error;
  retry: () => void;
}) {
  const startOver = (): void => {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Storage unavailable: nothing to clear.
    }
    window.location.reload();
  };
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-2xl font-bold">Something went wrong</h1>
      <p className="text-sm text-muted-foreground">
        The builder hit an unexpected error. Try again, or start over with a
        fresh setup.
      </p>
      <div className="flex gap-2">
        <Button size="lg" onClick={retry}>
          Try again
        </Button>
        <Button size="lg" variant="outline" onClick={startOver}>
          Start over
        </Button>
      </div>
    </main>
  );
}
