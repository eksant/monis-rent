"use client";

import { Search, X } from "lucide-react";
import { useEffect, useRef } from "react";

import { Input } from "@/components/ui/input";
import { useSetupStore } from "@/store/setup-store";

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return (
    target.isContentEditable ||
    ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)
  );
}

export function CatalogSearch() {
  const query = useSetupStore((state) => state.search);
  const setSearch = useSetupStore((state) => state.setSearch);
  const inputRef = useRef<HTMLInputElement>(null);
  // "/" focuses the search, like on GitHub or MDN.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key !== "/" || event.metaKey || event.ctrlKey || event.altKey)
        return;
      if (isTypingTarget(event.target)) return;
      event.preventDefault();
      inputRef.current?.focus();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);
  return (
    <div role="search" className="relative shrink-0">
      <Search
        className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden
      />
      <Input
        ref={inputRef}
        type="text"
        inputMode="search"
        enterKeyHint="search"
        autoComplete="off"
        maxLength={60}
        value={query}
        onChange={(event) => {
          setSearch(event.target.value);
        }}
        onKeyDown={(event) => {
          if (event.key === "Escape") setSearch("");
        }}
        placeholder="Search desks, screens, gear…"
        aria-label="Search the catalog"
        data-testid="catalog-search"
        className="h-10 rounded-xl bg-white pr-10 pl-9 text-base sm:text-sm"
      />
      {query === "" ? (
        <kbd className="pointer-events-none absolute top-1/2 right-3 hidden -translate-y-1/2 rounded border bg-muted px-1.5 text-xs text-muted-foreground lg:block">
          /
        </kbd>
      ) : (
        <button
          type="button"
          aria-label="Clear search"
          onClick={() => {
            setSearch("");
            inputRef.current?.focus();
          }}
          className="absolute top-1/2 right-1.5 flex size-8 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <X className="size-4" aria-hidden />
        </button>
      )}
    </div>
  );
}
