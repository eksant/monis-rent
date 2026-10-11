import { DESK_TOP_THICKNESS, SCENE } from "@/lib/scene-layout";
import type { CatalogItem } from "@/lib/types";

interface DeskProps {
  item: CatalogItem;
  x: number;
  width: number;
  topY: number;
}

type Variant = "electric" | "mechanical" | "dualMotor";

const TOP_COLORS: Record<Variant, { top: string; edge: string }> = {
  electric: { top: "#D9B38C", edge: "#B98E63" },
  mechanical: { top: "#A87445", edge: "#86592F" },
  dualMotor: { top: "#F4F4F2", edge: "#D2D2CC" },
};

const OUTER_COLUMN_HEIGHT = 40;
const INNER_COLUMN_LENGTH = 68;

function variantOf(item: CatalogItem): Variant {
  return item.art.kind === "desk" ? item.art.variant : "electric";
}

function legXs(x: number, width: number): [number, number] {
  return [x + 14, x + width - 14];
}

// Moves with the desk top: tabletop plus the inner telescoping columns.
export function DeskTop({ item, x, width, topY }: DeskProps) {
  const variant = variantOf(item);
  const colors = TOP_COLORS[variant];
  const columnWidth = variant === "dualMotor" ? 7 : 5;
  return (
    <g className="animate-drop-in" data-testid={`scene-desk-${variant}`}>
      {legXs(x, width).map((legX) => (
        <rect
          key={legX}
          x={legX - columnWidth / 2}
          y={topY + DESK_TOP_THICKNESS}
          width={columnWidth}
          height={INNER_COLUMN_LENGTH}
          fill="#8C9AA3"
        />
      ))}
      <rect
        x={x}
        y={topY}
        width={width}
        height={DESK_TOP_THICKNESS}
        rx="1.5"
        fill={colors.top}
      />
      <rect
        x={x}
        y={topY + DESK_TOP_THICKNESS - 1.2}
        width={width}
        height="1.2"
        fill={colors.edge}
      />
      {variant === "dualMotor" ? (
        <g>
          <rect
            x={x + width - 34}
            y={topY + 4}
            width="18"
            height="4"
            rx="1"
            fill="#2B353C"
          />
          <rect
            x={x + width - 31}
            y={topY + 5}
            width="6"
            height="2"
            rx="0.5"
            fill="#63AEFD"
          />
        </g>
      ) : null}
      {variant === "electric" ? (
        <rect
          x={x + width - 26}
          y={topY + 4}
          width="10"
          height="3"
          rx="1"
          fill="#2B353C"
        />
      ) : null}
    </g>
  );
}

// Stays on the floor: outer columns, feet and (for the mechanical desk) the crank.
export function DeskLegs({ item, x, width }: Omit<DeskProps, "topY">) {
  const variant = variantOf(item);
  const { floorY } = SCENE;
  const columnWidth = variant === "dualMotor" ? 10 : 8;
  return (
    <g>
      {legXs(x, width).map((legX) => (
        <g key={legX}>
          <rect
            x={legX - columnWidth / 2}
            y={floorY - OUTER_COLUMN_HEIGHT}
            width={columnWidth}
            height={OUTER_COLUMN_HEIGHT}
            rx="1"
            fill="#3A4A54"
          />
          <rect
            x={legX - 24}
            y={floorY - 4}
            width="48"
            height="4"
            rx="2"
            fill="#2B353C"
          />
        </g>
      ))}
      {variant === "mechanical" ? (
        <g stroke="#2B353C" strokeWidth="1.6" fill="none" strokeLinecap="round">
          <path
            d={`M${String(x + width - 14)} ${String(floorY - 30)} h10 v8`}
          />
          <circle cx={x + width - 4} cy={floorY - 21} r="1.8" fill="#2B353C" />
        </g>
      ) : null}
    </g>
  );
}
