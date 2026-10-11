"use client";

import { Sparkles } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Textarea } from "@/components/ui/textarea";
import { SUGGESTION_EXAMPLES, suggestSetup } from "@/lib/suggest";
import { useSetupStore } from "@/store/setup-store";

const STEPS = [
  "Reading your brief…",
  "Picking a desk…",
  "Fitting screens and extras…",
];
const STEP_MS = 270;

// "Describe your work": one sentence in, a whole setup out, with reasons and Undo.
export function SmartSetup() {
  const setup = useSetupStore((state) => state.setup);
  const applySuggestion = useSetupStore((state) => state.applySuggestion);
  const undo = useSetupStore((state) => state.undo);
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [step, setStep] = useState<number | null>(null);
  const timers = useRef<number[]>([]);
  const fieldId = useId();
  useEffect(
    () => () => {
      timers.current.forEach((timer) => {
        window.clearTimeout(timer);
      });
    },
    [],
  );
  const build = (): void => {
    const suggestion = suggestSetup(text, setup);
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const finish = (): void => {
      setStep(null);
      setOpen(false);
      applySuggestion(suggestion.setup);
      toast(suggestion.matched ? "Here's your setup" : "Here's a solid start", {
        description: (
          <ul className="mt-1 list-disc space-y-0.5 pl-4">
            {suggestion.reasons.map((reason) => (
              <li key={reason}>{reason}</li>
            ))}
          </ul>
        ),
        action: { label: "Undo", onClick: undo },
        duration: 10_000,
      });
    };
    if (reduce) {
      finish();
      return;
    }
    setStep(0);
    timers.current = [
      window.setTimeout(() => {
        setStep(1);
      }, STEP_MS),
      window.setTimeout(() => {
        setStep(2);
      }, STEP_MS * 2),
      window.setTimeout(finish, STEP_MS * 3),
    ];
  };
  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <button
          type="button"
          className="flex min-h-9 shrink-0 items-center gap-1.5 rounded-full border border-accent bg-accent/15 px-3.5 text-sm font-semibold text-accent-foreground transition hover:bg-accent/25 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
        >
          <Sparkles className="size-4" aria-hidden />
          <span className="sm:hidden">Describe</span>
          <span className="hidden sm:inline">Describe your work</span>
        </button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="mx-auto w-full max-w-lg">
          <DrawerHeader>
            <DrawerTitle>Tell us how you work</DrawerTitle>
            <DrawerDescription>
              One sentence is enough: your job, how long you stay, your budget,
              what Bali throws at you.
            </DrawerDescription>
          </DrawerHeader>
          <div className="space-y-3 px-4">
            <label htmlFor={fieldId} className="sr-only">
              How do you work?
            </label>
            <Textarea
              id={fieldId}
              rows={3}
              maxLength={300}
              value={text}
              onChange={(event) => {
                setText(event.target.value);
              }}
              placeholder="e.g. Video editor in Canggu for 2 months, humid villa"
              className="text-base sm:text-sm"
              disabled={step !== null}
            />
            <div className="flex flex-wrap gap-2">
              {SUGGESTION_EXAMPLES.map((example) => (
                <button
                  key={example}
                  type="button"
                  onClick={() => {
                    setText(example);
                  }}
                  disabled={step !== null}
                  className="min-h-8 rounded-full border bg-white px-3 text-xs hover:border-primary/40"
                >
                  {example}
                </button>
              ))}
            </div>
            <p
              className="min-h-5 text-sm text-muted-foreground"
              aria-live="polite"
            >
              {step === null ? "" : STEPS[step]}
            </p>
          </div>
          <DrawerFooter>
            <Button
              size="lg"
              className="h-11"
              onClick={build}
              disabled={text.trim() === "" || step !== null}
            >
              <Sparkles aria-hidden />
              Build my setup
            </Button>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
