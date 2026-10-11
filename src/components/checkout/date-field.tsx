"use client";

import { CalendarDays } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  addDays,
  formatDeliveryDate,
  isoToLocalDate,
  localDateToIso,
} from "@/lib/checkout";

const BOOKING_WINDOW_DAYS = 180;

interface DateFieldProps {
  id: string;
  value: string;
  min: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  invalid?: boolean;
}

// Delivery date in a popover calendar; days before `min` are disabled.
export function DateField({
  id,
  value,
  min,
  onChange,
  onBlur,
  invalid,
}: DateFieldProps) {
  const [open, setOpen] = useState(false);
  const first = isoToLocalDate(min);
  const selected = value === "" ? undefined : isoToLocalDate(value);
  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) onBlur?.();
      }}
    >
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          aria-invalid={invalid}
          className="h-10 w-full justify-between bg-white px-2.5 text-base font-normal sm:text-sm"
        >
          <span>
            {value === "" ? "Pick a date" : formatDeliveryDate(value)}
          </span>
          <CalendarDays className="size-4 opacity-50" aria-hidden />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selected}
          defaultMonth={selected ?? first}
          startMonth={first}
          endMonth={isoToLocalDate(addDays(min, BOOKING_WINDOW_DAYS))}
          disabled={{ before: first }}
          onSelect={(date) => {
            if (date === undefined) return;
            onChange(localDateToIso(date));
            setOpen(false);
            onBlur?.();
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
