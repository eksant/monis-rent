"use client";

import { useEffect } from "react";
import { toast } from "sonner";

import type { NoticeAction } from "@/lib/types";
import { useSetupStore } from "@/store/setup-store";

// Shows each new store notice once, as a toast with an optional action.
export function NoticeToasts() {
  const notice = useSetupStore((state) => state.notice);
  const chooseDesk = useSetupStore((state) => state.chooseDesk);
  const add = useSetupStore((state) => state.add);
  const undo = useSetupStore((state) => state.undo);
  useEffect(() => {
    if (notice === null) return;
    const run = (action: NoticeAction): void => {
      if (action.kind === "undo") {
        undo();
        return;
      }
      chooseDesk(action.deskId);
      if (action.addItemId !== undefined) add(action.addItemId);
    };
    const { action } = notice;
    toast(notice.message, {
      id: `notice-${String(notice.id)}`,
      action:
        action === undefined
          ? undefined
          : {
              label: action.label,
              onClick: () => {
                run(action);
              },
            },
    });
  }, [notice, chooseDesk, add, undo]);
  return null;
}
