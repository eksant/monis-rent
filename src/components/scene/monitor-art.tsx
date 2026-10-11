import { MONITOR_RISER, type PlacedMonitor } from "@/lib/scene-layout";

const TONES = {
  dark: {
    bezel: "#1C252B",
    stand: "#2B353C",
    screenTop: "#2A3F57",
    screenBottom: "#3E6C9B",
  },
  silver: {
    bezel: "#C9CFD4",
    stand: "#AEB6BC",
    screenTop: "#4B3F8F",
    screenBottom: "#7FA6E8",
  },
} as const;

// One monitor on its stand; deskTopY is the desk surface it stands on.
export function MonitorArt({
  monitor,
  deskTopY,
}: {
  monitor: PlacedMonitor;
  deskTopY: number;
}) {
  const art = monitor.item.art;
  const tone = TONES[art.kind === "monitor" ? art.tone : "dark"];
  const { x, y, width, height } = monitor;
  const centerX = x + width / 2;
  const neckTop = y + height;
  const riserTop = deskTopY - (monitor.raised ? MONITOR_RISER : 0);
  const gradientId = `screen-${monitor.key}`;
  return (
    <g
      className="animate-drop-in"
      data-testid={`scene-monitor-${monitor.item.id}`}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={tone.screenTop} />
          <stop offset="1" stopColor={tone.screenBottom} />
        </linearGradient>
      </defs>
      {monitor.raised ? (
        <rect
          x={centerX - 26}
          y={riserTop}
          width="52"
          height={MONITOR_RISER}
          rx="1.5"
          fill="#D9C3A5"
        />
      ) : null}
      <rect
        x={centerX - 2}
        y={neckTop}
        width="4"
        height={riserTop - neckTop - 1}
        fill={tone.stand}
      />
      <rect
        x={centerX - 11}
        y={riserTop - 1.6}
        width="22"
        height="1.6"
        rx="0.8"
        fill={tone.stand}
      />
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx="1.6"
        fill={tone.bezel}
      />
      <rect
        x={x + 1.4}
        y={y + 1.4}
        width={width - 2.8}
        height={height - 2.8}
        rx="0.8"
        fill={`url(#${gradientId})`}
      />
      <g fill="#FFFFFF" opacity="0.35">
        {[0.22, 0.38, 0.54].map((fraction, index) => (
          <rect
            key={fraction}
            x={x + width * 0.1}
            y={y + height * fraction}
            width={width * (index === 1 ? 0.5 : 0.35)}
            height="1.6"
            rx="0.8"
          />
        ))}
      </g>
    </g>
  );
}
