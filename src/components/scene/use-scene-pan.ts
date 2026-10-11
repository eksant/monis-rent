import { type MouseEvent, type PointerEvent, useRef, useState } from "react";

import { type FocusTransform, panFocus } from "@/lib/scene-layout";

const DRAG_THRESHOLD_PX = 6;

interface Offset {
  view: "room" | "desk";
  x: number;
  y: number;
}

interface Drag {
  startX: number;
  startY: number;
  fromX: number;
  fromY: number;
  moved: boolean;
}

// Drag to look around the close-up. The offset belongs to one view, so switching
// views starts centred again.
export function useScenePan(view: "room" | "desk", base: FocusTransform) {
  const [offset, setOffset] = useState<Offset | null>(null);
  const [dragging, setDragging] = useState(false);
  const drag = useRef<Drag | null>(null);
  const swallowClick = useRef(false);
  const current = offset?.view === view ? offset : { view, x: 0, y: 0 };
  const focus = view === "desk" ? panFocus(base, current.x, current.y) : base;

  const onPointerDown = (event: PointerEvent<HTMLDivElement>): void => {
    if (view !== "desk" || event.button !== 0) return;
    drag.current = {
      startX: event.clientX,
      startY: event.clientY,
      fromX: current.x,
      fromY: current.y,
      moved: false,
    };
  };

  const onPointerMove = (event: PointerEvent<HTMLDivElement>): void => {
    const active = drag.current;
    if (active === null) return;
    const dx = event.clientX - active.startX;
    const dy = event.clientY - active.startY;
    if (!active.moved) {
      if (Math.hypot(dx, dy) < DRAG_THRESHOLD_PX) return;
      active.moved = true;
      setDragging(true);
      event.currentTarget.setPointerCapture(event.pointerId);
    }
    const rect = event.currentTarget.getBoundingClientRect();
    const wanted = panFocus(
      base,
      active.fromX + (dx / rect.width) * 100,
      active.fromY + (dy / rect.height) * 100,
    );
    setOffset({ view, x: wanted.x - base.x, y: wanted.y - base.y });
  };

  const onPointerEnd = (): void => {
    if (drag.current?.moved === true) {
      // The click that follows this pointerup is part of the drag, not a tap.
      swallowClick.current = true;
      window.setTimeout(() => {
        swallowClick.current = false;
      }, 0);
    }
    drag.current = null;
    setDragging(false);
  };

  const onClickCapture = (event: MouseEvent<HTMLDivElement>): void => {
    if (!swallowClick.current) return;
    swallowClick.current = false;
    event.stopPropagation();
    event.preventDefault();
  };

  return {
    focus,
    dragging,
    handlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp: onPointerEnd,
      onPointerCancel: onPointerEnd,
      onClickCapture,
    },
  };
}
