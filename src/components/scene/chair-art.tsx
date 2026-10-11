import { SCENE } from "@/lib/scene-layout";
import type { CatalogItem } from "@/lib/types";

type Variant = "ergo" | "basic" | "premium";

const COLORS: Record<
  Variant,
  { frame: string; back: string; seat: string; accent: string }
> = {
  ergo: {
    frame: "#22313A",
    back: "#33454F",
    seat: "#2B3A43",
    accent: "#63AEFD",
  },
  basic: {
    frame: "#5D6A72",
    back: "#8A949B",
    seat: "#7A858C",
    accent: "#B7C0C6",
  },
  premium: {
    frame: "#15252E",
    back: "#1F3440",
    seat: "#1A2C36",
    accent: "#F2B544",
  },
};

// Office chair seen from the front, standing on the floor at centerX.
export function ChairArt({
  item,
  centerX,
}: {
  item: CatalogItem;
  centerX: number;
}) {
  const variant: Variant =
    item.art.kind === "chair" ? item.art.variant : "ergo";
  const color = COLORS[variant];
  const floor = SCENE.floorY;
  const seatY = floor - 48;
  const backTop = variant === "basic" ? seatY - 40 : seatY - 52;
  return (
    <g data-testid={`scene-chair-${variant}`}>
      <g stroke={color.frame} strokeWidth="2.4" strokeLinecap="round">
        <line x1={centerX} y1={floor - 6} x2={centerX - 22} y2={floor - 2} />
        <line x1={centerX} y1={floor - 6} x2={centerX + 22} y2={floor - 2} />
        <line x1={centerX} y1={floor - 6} x2={centerX - 9} y2={floor - 1} />
        <line x1={centerX} y1={floor - 6} x2={centerX + 9} y2={floor - 1} />
      </g>
      {[-22, -9, 9, 22].map((offset) => (
        <circle
          key={offset}
          cx={centerX + offset}
          cy={floor - 1.6}
          r="1.8"
          fill="#1B2329"
        />
      ))}
      <rect
        x={centerX - 2}
        y={seatY + 6}
        width="4"
        height="36"
        fill="#7D8A92"
      />
      <rect
        x={centerX - 3.5}
        y={seatY + 18}
        width="7"
        height="14"
        rx="1.5"
        fill={color.frame}
      />
      <rect
        x={centerX - 19}
        y={backTop}
        width="38"
        height={seatY - backTop + 2}
        rx="9"
        fill={color.back}
      />
      {variant === "basic" ? null : (
        <g stroke={color.frame} strokeWidth="0.5" opacity="0.6">
          {[0.25, 0.45, 0.65].map((fraction) => (
            <line
              key={fraction}
              x1={centerX - 15}
              x2={centerX + 15}
              y1={backTop + (seatY - backTop) * fraction}
              y2={backTop + (seatY - backTop) * fraction}
            />
          ))}
        </g>
      )}
      <rect
        x={centerX - 13}
        y={seatY - 18}
        width="26"
        height="5"
        rx="2.5"
        fill={color.accent}
      />
      {variant === "basic" ? null : (
        <rect
          x={centerX - 12}
          y={backTop - (variant === "premium" ? 14 : 11)}
          width="24"
          height={variant === "premium" ? 12 : 9}
          rx="4"
          fill={color.back}
        />
      )}
      <rect
        x={centerX - 24}
        y={seatY - 4}
        width="5"
        height="16"
        rx="2"
        fill={color.frame}
      />
      <rect
        x={centerX + 19}
        y={seatY - 4}
        width="5"
        height="16"
        rx="2"
        fill={color.frame}
      />
      <rect
        x={centerX - 26}
        y={seatY - 6}
        width="9"
        height="3"
        rx="1.5"
        fill={color.frame}
      />
      <rect
        x={centerX + 17}
        y={seatY - 6}
        width="9"
        height="3"
        rx="1.5"
        fill={color.frame}
      />
      <rect
        x={centerX - 22}
        y={seatY}
        width="44"
        height="8"
        rx="4"
        fill={color.seat}
      />
    </g>
  );
}
