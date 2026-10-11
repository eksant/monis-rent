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
      data-testid="share-button"
    >
      <Share2 aria-hidden />
      Share setup
    </Button>
  );
}
