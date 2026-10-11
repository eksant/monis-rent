import { useMemo } from "react";

import { type SetupSummary, summarize } from "@/lib/setup";
import { useSetupStore } from "@/store/setup-store";

export function useSetupSummary(): SetupSummary {
  const setup = useSetupStore((state) => state.setup);
  return useMemo(() => summarize(setup), [setup]);
}
