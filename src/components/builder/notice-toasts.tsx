"use client";

import { useEffect } from "react";
import { toast } from "sonner";

import { useSetupStore } from "@/store/setup-store";

// Shows each new store notice once, as a toast with an optional action.
export function NoticeToasts() {
  const notice = useSetupStore((state) => state.notice);
  const chooseDesk = useSetupStore((state) => state.chooseDesk);
  const add = useSetupStore((state) => state.add);
  useEffect(() => {
    if (notice === null) return;
    const { action } = notice;
    toast(notice.message, {
      id: `notice-${String(notice.id)}`,
      action:
        action === undefined
          ? undefined
          : {
              label: action.label,
              onClick: () => {
                chooseDesk(action.deskId);
                if (action.addItemId !== undefined) add(action.addItemId);
              },
            },
    });
  }, [notice, chooseDesk, add]);
  return null;
}
