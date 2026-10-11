"use client";

import { Check, ChevronsUpDown } from "lucide-react";
import { type ReactNode, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export interface ComboboxOption {
  value: string;
  label: string;
  hint?: string;
}

export interface ComboboxGroup {
  heading: string;
  options: ComboboxOption[];
}

interface ComboboxFieldProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  groups: ComboboxGroup[];
  placeholder: string;
  searchPlaceholder: string;
  emptyText: string;
  invalid?: boolean;
  ariaLabel?: string;
  // What the closed field shows for the chosen option.
  display?: (option: ComboboxOption) => ReactNode;
  className?: string;
}

// A searchable, grouped pick list in a popover (shadcn Popover + Command).
export function ComboboxField({
  id,
  value,
  onChange,
  onBlur,
  groups,
  placeholder,
  searchPlaceholder,
  emptyText,
  invalid,
  ariaLabel,
  display,
  className,
}: ComboboxFieldProps) {
  const [open, setOpen] = useState(false);
  const selected = groups
    .flatMap((group) => group.options)
    .find((option) => option.value === value);
  const close = (): void => {
    setOpen(false);
    onBlur?.();
  };
  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        if (next) setOpen(true);
        else close();
      }}
    >
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-invalid={invalid}
          aria-label={ariaLabel}
          className={cn(
            "h-10 w-full justify-between bg-white px-2.5 text-base font-normal sm:text-sm",
            selected === undefined && "text-muted-foreground",
            className,
          )}
        >
          <span className="truncate">
            {selected === undefined
              ? placeholder
              : (display?.(selected) ?? selected.label)}
          </span>
          <ChevronsUpDown className="size-4 opacity-50" aria-hidden />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-(--radix-popover-trigger-width) min-w-64 p-0"
        align="start"
      >
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList className="max-h-72">
            <CommandEmpty>{emptyText}</CommandEmpty>
            {groups.map((group) => (
              <CommandGroup key={group.heading} heading={group.heading}>
                {group.options.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={`${option.label} ${option.hint ?? ""} ${option.value}`}
                    onSelect={() => {
                      onChange(option.value);
                      close();
                    }}
                  >
                    <Check
                      className={cn(
                        "size-4",
                        option.value === value ? "opacity-100" : "opacity-0",
                      )}
                      aria-hidden
                    />
                    <span className="flex-1">{option.label}</span>
                    {option.hint === undefined ? null : (
                      <span className="text-xs text-muted-foreground">
                        {option.hint}
                      </span>
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
