import type { PlacedMonitor } from "@/lib/scene-layout";
import type { Setup } from "@/lib/types";

interface DeskItemsProps {
  setup: Setup;
  desk: { x: number; y: number; width: number };
  monitors: PlacedMonitor[];
}

const has = (setup: Setup, id: string): boolean => (setup.items[id] ?? 0) > 0;
const DARK = "#2B353C";
const SILVER = "#D7DCE0";

// Items in front of the monitors on (or hanging from) the desk top.
export function DeskItems({ setup, desk, monitors }: DeskItemsProps) {
  const top = desk.y;
  const center = desk.x + desk.width / 2;
  const right = desk.x + desk.width;
  const middle = monitors[monitors.length === 3 ? 1 : 0];
  const ownLaptop = !has(setup, "mac-mini");
  const laptopWidth = 30;
  // Left of the chair back so the chair never hides it.
  const laptopX = Math.min(desk.x + 8, center - 28 - laptopWidth);
  const laptopLift = has(setup, "laptop-stand") ? 9 : 0;
  const keyboardTone = has(setup, "kb-magic") ? SILVER : DARK;
  const mouseTone = has(setup, "mouse-magic") ? SILVER : DARK;
  const keyboardSelected = has(setup, "kb-mx") || has(setup, "kb-magic");
  const mouseSelected =
    has(setup, "mouse-mx") ||
    has(setup, "mouse-silent") ||
    has(setup, "mouse-magic");
  const camAnchor = middle ?? {
    x: laptopX,
    y: top - laptopLift - 21,
    width: laptopWidth,
  };
  return (
    <g>
      {/* In front of the screens so it is never hidden behind them. */}
      {has(setup, "lamp-hue") ? (
        <g className="animate-drop-in" data-testid="scene-item-lamp-hue">
          <defs>
            <linearGradient id="hue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#FF8FB1" />
              <stop offset="0.5" stopColor="#B98CFF" />
              <stop offset="1" stopColor="#63AEFD" />
            </linearGradient>
          </defs>
          <ellipse
            cx={right - 8}
            cy={top - 18}
            rx="12"
            ry="22"
            fill="#B98CFF"
            opacity="0.22"
          />
          <rect
            x={right - 10}
            y={top - 36}
            width="4"
            height="35"
            rx="2"
            fill="url(#hue)"
          />
          <rect
            x={right - 13}
            y={top - 2}
            width="10"
            height="2"
            rx="1"
            fill={DARK}
          />
        </g>
      ) : null}
      {has(setup, "light-bar") && middle !== undefined ? (
        <rect
          className="animate-drop-in"
          data-testid="scene-item-light-bar"
          x={middle.x + middle.width / 2 - 18}
          y={middle.y - 3}
          width="36"
          height="2.6"
          rx="1.3"
          fill={DARK}
        />
      ) : null}
      {has(setup, "webcam") ? (
        <g className="animate-drop-in" data-testid="scene-item-webcam">
          <rect
            x={
              camAnchor.x +
              camAnchor.width / 2 -
              (has(setup, "light-bar") ? 26 : 5)
            }
            y={camAnchor.y - 4}
            width="10"
            height="4"
            rx="2"
            fill={DARK}
          />
        </g>
      ) : null}
      {has(setup, "mac-mini") ? (
        <rect
          className="animate-drop-in"
          data-testid="scene-item-mac-mini"
          x={right - 40}
          y={top - 4}
          width="20"
          height="4"
          rx="1.5"
          fill={SILVER}
        />
      ) : null}
      {has(setup, "dock") ? (
        <rect
          className="animate-drop-in"
          data-testid="scene-item-dock"
          x={laptopX + laptopWidth + 3}
          y={top - 3}
          width="10"
          height="3"
          rx="1"
          fill={DARK}
        />
      ) : null}
      {ownLaptop ? (
        <g data-testid="scene-own-laptop">
          {laptopLift > 0 ? (
            <path
              className="animate-drop-in"
              data-testid="scene-item-laptop-stand"
              d={`M${String(laptopX + 4)} ${String(top)} L${String(laptopX + 8)} ${String(top - laptopLift)} M${String(laptopX + laptopWidth - 4)} ${String(top)} L${String(laptopX + laptopWidth - 8)} ${String(top - laptopLift)}`}
              stroke="#AEB6BC"
              strokeWidth="1.6"
            />
          ) : null}
          <rect
            x={laptopX + 2}
            y={top - laptopLift - 21}
            width={laptopWidth - 4}
            height="19"
            rx="1.5"
            fill="#AEB6BC"
          />
          <rect
            x={laptopX + 3.5}
            y={top - laptopLift - 19.5}
            width={laptopWidth - 7}
            height="16"
            rx="0.8"
            fill="#33475B"
          />
          <rect
            x={laptopX}
            y={top - laptopLift - 2}
            width={laptopWidth}
            height="2"
            rx="1"
            fill="#C9CED3"
          />
        </g>
      ) : null}
      {keyboardSelected ? (
        <rect
          className="animate-drop-in"
          data-testid="scene-item-keyboard"
          x={center - 20}
          y={top - 2.6}
          width="40"
          height="2.6"
          rx="1"
          fill={keyboardTone}
        />
      ) : null}
      {has(setup, "mouse-pad") ? (
        <rect
          className="animate-drop-in"
          data-testid="scene-item-mouse-pad"
          x={center + 24}
          y={top - 0.8}
          width="20"
          height="0.8"
          fill="#3E4A52"
        />
      ) : null}
      {mouseSelected ? (
        <ellipse
          className="animate-drop-in"
          data-testid="scene-item-mouse"
          cx={center + 34}
          cy={top - 2}
          rx="3.5"
          ry="2"
          fill={mouseTone}
        />
      ) : null}
      {has(setup, "headphones") ? (
        <path
          className="animate-drop-in"
          data-testid="scene-item-headphones"
          d={`M${String(right - 10)} ${String(top + 18)} a7 7 0 0 1 14 0`}
          stroke={DARK}
          strokeWidth="2.2"
          fill="none"
        />
      ) : null}
    </g>
  );
}

// Tall items behind the monitors: lamps and the mic boom arm.
export function BackDeskItems({
  setup,
  desk,
}: Pick<DeskItemsProps, "setup" | "desk">) {
  const top = desk.y;
  return (
    <g>
      {has(setup, "lamp-led") ? (
        <g className="animate-drop-in" data-testid="scene-item-lamp-led">
          <ellipse cx={desk.x + 8} cy={top - 1} rx="6" ry="1.6" fill={DARK} />
          <path
            d={`M${String(desk.x + 8)} ${String(top - 1)} L${String(desk.x + 12)} ${String(top - 40)} L${String(desk.x + 30)} ${String(top - 46)}`}
            stroke={DARK}
            strokeWidth="1.6"
            fill="none"
          />
          <ellipse
            cx={desk.x + 32}
            cy={top - 22}
            rx="14"
            ry="20"
            fill="#FFE29A"
            opacity="0.28"
          />
          <rect
            x={desk.x + 26}
            y={top - 48}
            width="12"
            height="3"
            rx="1.5"
            fill={DARK}
          />
        </g>
      ) : null}

      {has(setup, "mic-kit") ? (
        <g
          className="animate-drop-in"
          data-testid="scene-item-mic-kit"
          stroke={DARK}
          strokeWidth="1.4"
          fill="none"
        >
          <path
            d={`M${String(desk.x + 22)} ${String(top)} V${String(top - 30)} L${String(desk.x + 44)} ${String(top - 22)}`}
          />
          <rect
            x={desk.x + 42}
            y={top - 26}
            width="6"
            height="11"
            rx="3"
            fill={DARK}
            stroke="none"
          />
        </g>
      ) : null}
    </g>
  );
}
