import { CATALOG } from "@/data/catalog";
import { SCENE } from "@/lib/scene-layout";
import type { Setup } from "@/lib/types";

const has = (setup: Setup, id: string): boolean => (setup.items[id] ?? 0) > 0;
const DARK = "#2B353C";
const WHITE = "#F7F8F9";

function Monstera({ x }: { x: number }) {
  const floor = SCENE.floorY;
  return (
    <g className="animate-drop-in" data-testid="scene-plant-monstera">
      <path
        d={`M${String(x - 9)} ${String(floor - 18)} h18 l-2 18 h-14 Z`}
        fill="#C8754B"
      />
      <g fill="#3E8E5A">
        <ellipse
          cx={x - 10}
          cy={floor - 38}
          rx="11"
          ry="7"
          transform={`rotate(-30 ${String(x - 10)} ${String(floor - 38)})`}
        />
        <ellipse
          cx={x + 10}
          cy={floor - 42}
          rx="12"
          ry="7"
          transform={`rotate(25 ${String(x + 10)} ${String(floor - 42)})`}
        />
        <ellipse cx={x} cy={floor - 56} rx="10" ry="8" />
      </g>
      <g stroke="#2F6B4F" strokeWidth="1.2">
        <line x1={x} y1={floor - 18} x2={x - 9} y2={floor - 36} />
        <line x1={x} y1={floor - 18} x2={x + 9} y2={floor - 40} />
        <line x1={x} y1={floor - 18} x2={x} y2={floor - 52} />
      </g>
    </g>
  );
}

function SnakePlant({ x }: { x: number }) {
  const floor = SCENE.floorY;
  return (
    <g className="animate-drop-in" data-testid="scene-plant-snake">
      <rect
        x={x - 7}
        y={floor - 14}
        width="14"
        height="14"
        rx="2"
        fill="#E9E2D8"
      />
      <g fill="#4F8F4A">
        <path
          d={`M${String(x - 5)} ${String(floor - 14)} q-2 -16 1 -30 q2 14 3 30 Z`}
        />
        <path
          d={`M${String(x - 1)} ${String(floor - 14)} q0 -22 3 -38 q2 20 1 38 Z`}
        />
        <path
          d={`M${String(x + 3)} ${String(floor - 14)} q2 -14 5 -26 q-1 14 -1 26 Z`}
        />
      </g>
    </g>
  );
}

// Floor-standing items, wall shelves and under-desk gear; these never move with the desk.
export function FloorItems({
  setup,
  desk,
}: {
  setup: Setup;
  desk: { x: number; width: number };
}) {
  const floor = SCENE.floorY;
  const right = desk.x + desk.width;
  const plants = CATALOG.filter((entry) => entry.slot === "plant").flatMap(
    (entry) =>
      Array.from({ length: setup.items[entry.id] ?? 0 }, () => entry.id),
  );
  const climate = ["tower-fan", "purifier", "dehumidifier"].filter((id) =>
    has(setup, id),
  );
  const internet = has(setup, "starlink")
    ? "starlink"
    : has(setup, "router")
      ? "router"
      : null;
  let cursor = right + 26;
  return (
    <g>
      {plants.map((id, index) => {
        const x = desk.x - 30 - index * 34;
        return id === "plant-monstera" ? (
          <Monstera key={`${id}-${String(index)}`} x={x} />
        ) : (
          <SnakePlant key={`${id}-${String(index)}`} x={x} />
        );
      })}
      {has(setup, "extension-cable") ? (
        <path
          className="animate-drop-in"
          data-testid="scene-item-extension-cable"
          d={`M${String(right - 30)} ${String(floor - 1.5)} Q${String(right + 20)} ${String(floor + 6)} 396 ${String(floor - 20)}`}
          stroke={DARK}
          strokeWidth="1"
          fill="none"
        />
      ) : null}
      {climate.map((id) => {
        const x = cursor;
        if (id === "tower-fan") {
          cursor += 22;
          return (
            <g key={id} data-testid="scene-item-tower-fan">
              <rect
                x={x - 6}
                y={floor - 72}
                width="12"
                height="68"
                rx="6"
                fill={WHITE}
                stroke="#DADFE3"
              />
              <rect
                x={x - 3}
                y={floor - 64}
                width="6"
                height="40"
                rx="3"
                fill="#E3E8EC"
              />
              <rect
                x={x - 9}
                y={floor - 4}
                width="18"
                height="4"
                rx="2"
                fill="#DADFE3"
              />
            </g>
          );
        }
        if (id === "purifier") {
          cursor += 30;
          return (
            <g key={id} data-testid="scene-item-purifier">
              <rect
                x={x - 11}
                y={floor - 46}
                width="22"
                height="46"
                rx="5"
                fill={WHITE}
                stroke="#DADFE3"
              />
              <circle cx={x} cy={floor - 38} r="4" fill="#9FD3B5" />
            </g>
          );
        }
        cursor += 34;
        return (
          <g key={id} data-testid="scene-item-dehumidifier">
            <rect
              x={x - 13}
              y={floor - 40}
              width="26"
              height="40"
              rx="4"
              fill={WHITE}
              stroke="#DADFE3"
            />
            <rect
              x={x - 9}
              y={floor - 34}
              width="18"
              height="3"
              rx="1.5"
              fill="#63AEFD"
            />
          </g>
        );
      })}
      {internet === null ? null : (
        <g className="animate-drop-in" data-testid={`scene-item-${internet}`}>
          <rect x="22" y="112" width="70" height="3" rx="1.5" fill="#C9A77F" />
          {internet === "router" ? (
            <g>
              <rect x="46" y="104" width="22" height="8" rx="2" fill={DARK} />
              <g stroke={DARK} strokeWidth="1.4">
                <line x1="49" y1="104" x2="47" y2="94" />
                <line x1="57" y1="104" x2="57" y2="92" />
                <line x1="65" y1="104" x2="67" y2="94" />
              </g>
            </g>
          ) : (
            <g>
              <rect
                x="34"
                y="102"
                width="16"
                height="10"
                rx="2"
                fill={WHITE}
                stroke="#DADFE3"
              />
              <path
                d="M58 112 L62 96 L82 92 L80 108 Z"
                fill={WHITE}
                stroke="#DADFE3"
              />
            </g>
          )}
        </g>
      )}
      {has(setup, "nespresso") ? (
        <g className="animate-drop-in" data-testid="scene-item-nespresso">
          <rect x="308" y="112" width="70" height="3" rx="1.5" fill="#C9A77F" />
          <rect x="334" y="94" width="16" height="18" rx="3" fill="#D94A3A" />
          <rect x="337" y="106" width="10" height="5" rx="1" fill={DARK} />
          <rect x="356" y="104" width="6" height="8" rx="1.5" fill="#FFFFFF" />
        </g>
      ) : null}
      {has(setup, "walking-pad") ? (
        <g className="animate-drop-in" data-testid="scene-item-walking-pad">
          <rect
            x={desk.x + desk.width / 2 - 42}
            y={floor - 6}
            width="84"
            height="6"
            rx="3"
            fill={DARK}
          />
          <rect
            x={desk.x + desk.width / 2 - 38}
            y={floor - 5}
            width="76"
            height="2"
            rx="1"
            fill="#55636C"
          />
        </g>
      ) : null}
      {has(setup, "power-strip-3") || has(setup, "power-strip-6") ? (
        <rect
          className="animate-drop-in"
          data-testid="scene-item-power-strip"
          x={right - 52}
          y={floor - 3}
          width="22"
          height="3"
          rx="1.5"
          fill={has(setup, "power-strip-6") ? WHITE : DARK}
          stroke="#AEB6BC"
          strokeWidth="0.4"
        />
      ) : null}
    </g>
  );
}
