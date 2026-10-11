import { SCENE } from "@/lib/scene-layout";

// Back wall, Bali window and wooden floor.
export function Room() {
  const { width, height, floorY } = SCENE;
  return (
    <g data-testid="scene-room">
      <defs>
        <linearGradient id="wall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FBF6EF" />
          <stop offset="1" stopColor="#F3E8DA" />
        </linearGradient>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8FCBFF" />
          <stop offset="1" stopColor="#DDF1FF" />
        </linearGradient>
        <linearGradient id="floor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#E7D3B8" />
          <stop offset="1" stopColor="#D9C09F" />
        </linearGradient>
      </defs>
      <rect width={width} height={floorY} fill="url(#wall)" />
      <g transform="translate(130 18)">
        <rect width="140" height="82" rx="6" fill="#FFFFFF" />
        <rect x="5" y="5" width="130" height="72" rx="3" fill="url(#sky)" />
        <circle cx="104" cy="24" r="9" fill="#FFD27A" />
        <path d="M5 52 Q40 40 75 50 T135 46 V77 H5 Z" fill="#A8D98F" />
        <path d="M5 62 Q45 54 85 62 T135 58 V77 H5 Z" fill="#8CC97E" />
        <path d="M5 70 Q50 64 95 71 T135 68 V77 H5 Z" fill="#6FB566" />
        <g fill="#2F6B4F">
          <rect x="24" y="30" width="2.5" height="26" rx="1" />
          <path d="M25 30 q-10 -2 -15 5 q8 -6 15 -3 q-6 -8 -14 -6 q9 -1 14 4 q2 -9 10 -10 q-7 4 -8 10 q8 -5 15 1 q-9 -3 -17 -1 Z" />
        </g>
        <rect x="68.5" y="5" width="3" height="72" fill="#FFFFFF" />
        <rect
          x="5"
          y="40"
          width="130"
          height="2.5"
          fill="#FFFFFF"
          opacity="0.8"
        />
      </g>
      <rect
        y={floorY}
        width={width}
        height={height - floorY}
        fill="url(#floor)"
      />
      {[0.25, 0.5, 0.75].map((fraction) => (
        <line
          key={fraction}
          x1="0"
          x2={width}
          y1={floorY + (height - floorY) * fraction}
          y2={floorY + (height - floorY) * fraction}
          stroke="#CDB291"
          strokeWidth="0.6"
        />
      ))}
      <rect y={floorY - 3} width={width} height="3" fill="#E4D2BB" />
    </g>
  );
}
