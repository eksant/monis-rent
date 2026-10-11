"use client";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useSetupStore } from "@/store/setup-store";

export function PlanToggle() {
  const plan = useSetupStore((state) => state.setup.plan);
  const choosePlan = useSetupStore((state) => state.choosePlan);
  return (
    <ToggleGroup
      type="single"
      variant="outline"
      value={plan}
      onValueChange={(value) => {
        if (value === "weekly" || value === "monthly") choosePlan(value);
      }}
      aria-label="Billing plan"
      className="w-full"
    >
      <ToggleGroupItem value="weekly" className="flex-1">
        Weekly
      </ToggleGroupItem>
      <ToggleGroupItem value="monthly" className="flex-1">
        Monthly
      </ToggleGroupItem>
    </ToggleGroup>
  );
}
