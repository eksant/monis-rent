"use client";

import { Share2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { shareUrl } from "@/lib/share";
import { useSetupStore } from "@/store/setup-store";

export function ShareButton() {
  const setup = useSetupStore((state) => state.setup);
  const share = async (): Promise<void> => {
    const url = shareUrl(setup, window.location.origin);
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied. Send it to your team.");
    } catch {
      toast("Copy this link to share your setup", { description: url });
    }
  };
  return (
    <Button
      variant="outline"
      size="lg"
      onClick={() => void share()}
      aria-label="Share setup"
      data-testid="share-button"
      className="size-10 shrink-0 p-0 sm:h-9 sm:w-auto sm:px-3"
    >
      <Share2 aria-hidden />
      <span className="hidden sm:inline">Share setup</span>
    </Button>
  );
}
