import { CATALOG, getItem } from "@/data/catalog";
import { presetSetup } from "@/data/presets";
import { formatCents } from "@/lib/money";
import {
  effectiveCents,
  monthlySavingsCents,
  weeklyEquivalentCents,
} from "@/lib/pricing";
import {
  addItem,
  monitorCapacity,
  normalizeSetup,
  removeItem,
  setDesk,
  setupLines,
  usedUnits,
} from "@/lib/setup";
import type { CatalogItem, PresetId, Setup } from "@/lib/types";

export interface Suggestion {
  setup: Setup;
  reasons: string[];
  matched: boolean;
}

export const SUGGESTION_EXAMPLES = [
  "Full-stack dev, 6 weeks, $50/wk",
  "Lots of calls, bad wifi",
  "Video editor in Canggu, 2 months",
  "Day trader, three screens",
] as const;

const MAX_INPUT = 300;
const CHEAP_WEEKLY_CENTS = 2500;
const WEEKS_PER_MONTH = 52 / 12;
const WIDE_DESK = "desk-dual-motor";
const NUMBER_WORDS: Record<string, number> = {
  a: 1,
  an: 1,
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  dual: 2,
  double: 2,
  triple: 3,
};

type Role = "developer" | "creative" | "trading";

interface Signals {
  role: Role | null;
  calls: boolean;
  creator: boolean;
  budgetCents: number | null;
  premium: boolean;
  weeks: number | null;
  screens: number | null;
  standing: boolean;
  walking: boolean;
  internet: "router" | "starlink" | null;
  humid: boolean;
  hot: boolean;
  dusty: boolean;
  coffee: boolean;
  computer: boolean;
}

const ROLE_PATTERNS: [Role, RegExp][] = [
  ["trading", /\b(trader|trading|crypto|stocks?|forex)\b/],
  [
    "creative",
    /\b(designer|design|video|editor|editing|photographer|photo|colou?rist|creative)\b/,
  ],
  [
    "developer",
    /\b(dev|developer|engineer|coder|programmer|full[- ]?stack|software)\b/,
  ],
];

const ROLE_BASE: Record<Role, PresetId> = {
  developer: "founders",
  creative: "studio",
  trading: "trading",
};

const ROLE_REASON: Record<Role | "none", string> = {
  developer: "Founders base for long build days.",
  creative: "Studio base for creative work.",
  trading: "Trading base for charts and early opens.",
  none: "Essentials base: desk, chair and power.",
};

function toNumber(token: string): number {
  return NUMBER_WORDS[token] ?? Number.parseInt(token, 10);
}

function parseBudget(text: string): number | null {
  const match =
    /\$\s?(\d+(?:\.\d+)?)\s*(?:\/|per|a|an)?\s*(weeks?|wk|w|months?|mo|m)?\b/.exec(
      text,
    ) ??
    /(\d+(?:\.\d+)?)\s*(?:usd|dollars?)?\s*(?:\/|per|a)\s*(weeks?|wk|months?|mo)\b/.exec(
      text,
    );
  if (match === null) return null;
  const amount = Number.parseFloat(match[1] ?? "");
  if (!Number.isFinite(amount) || amount <= 0) return null;
  const monthly = (match[2] ?? "").startsWith("m");
  return Math.round((monthly ? amount / WEEKS_PER_MONTH : amount) * 100);
}

function parseWeeks(text: string): number | null {
  const match =
    /\b(\d+|an?|one|two|three|four|five|six)\s*(weeks?|wks?|months?|mos?)\b/.exec(
      text,
    );
  if (match === null) return null;
  const count = toNumber(match[1] ?? "");
  if (!Number.isFinite(count)) return null;
  return (match[2] ?? "").startsWith("m") ? count * WEEKS_PER_MONTH : count;
}

function parseScreens(text: string): number | null {
  const match =
    /\b(\d+|one|two|three|four|five|six|dual|double|triple)\s*(?:monitors?|screens?|displays?)\b/.exec(
      text,
    );
  if (match === null) return null;
  const count = toNumber(match[1] ?? "");
  return Number.isFinite(count) ? Math.min(3, Math.max(1, count)) : null;
}

function readSignals(input: string): Signals {
  const text = input.toLowerCase().slice(0, MAX_INPUT);
  const cheap = /\b(cheap|budget|tight|affordable|low[- ]cost)\b/.test(text);
  return {
    role: ROLE_PATTERNS.find(([, pattern]) => pattern.test(text))?.[0] ?? null,
    calls:
      /\b(calls?|meetings?|zoom|sales|support|interviews?|clients?)\b/.test(
        text,
      ),
    creator:
      /\b(podcast(er)?|stream(er|ing)?|youtube(r)?|content|creator)\b/.test(
        text,
      ),
    budgetCents: parseBudget(text) ?? (cheap ? CHEAP_WEEKLY_CENTS : null),
    premium: /\b(premium|high[- ]end|luxury|the best)\b/.test(text),
    weeks: parseWeeks(text),
    screens: parseScreens(text),
    standing: /\b(standing|stand up|back pain|long days?|posture)\b/.test(text),
    walking: /\b(walk|walking|steps|active|treadmill)\b/.test(text),
    internet:
      /\b(no (internet|wifi|wi-fi)|remote villa|starlink|off[- ]grid)\b/.test(
        text,
      )
        ? "starlink"
        : /\b(wifi|wi-fi|internet|connection)\b/.test(text)
          ? "router"
          : null,
    humid: /\b(humid|humidity|damp|mou?ld|rainy?)\b/.test(text),
    hot: /\b(hot|heat|warm)\b/.test(text),
    dusty: /\b(dusty?|smoke|smoky|allerg(y|ies))\b/.test(text),
    coffee: /\b(coffee|espresso|caffeine)\b/.test(text),
    computer:
      /\b(no laptop|without (a )?laptop|need a computer|desktop computer)\b/.test(
        text,
      ),
  };
}

function recognised(signals: Signals): boolean {
  return (
    signals.role !== null ||
    signals.budgetCents !== null ||
    signals.weeks !== null ||
    signals.screens !== null ||
    signals.internet !== null ||
    [
      signals.calls,
      signals.creator,
      signals.premium,
      signals.standing,
      signals.walking,
      signals.humid,
      signals.hot,
      signals.dusty,
      signals.coffee,
      signals.computer,
    ].some(Boolean)
  );
}

function addAll(setup: Setup, ids: string[]): Setup {
  return ids.reduce((next, id) => addItem(next, id).setup, setup);
}

function hasSlot(setup: Setup, slot: CatalogItem["slot"]): boolean {
  return usedUnits(setup, slot) > 0;
}

// Replaces every monitor with `count` copies of one single-slot model.
function withScreens(setup: Setup, count: number): Setup {
  const current = CATALOG.find(
    (entry) => entry.slot === "monitor" && (setup.items[entry.id] ?? 0) > 0,
  );
  const model =
    current === undefined
      ? "mon-27-a27i"
      : current.slotSize === 1
        ? current.id
        : "mon-27-4k";
  const items = Object.fromEntries(
    Object.entries(setup.items).filter(
      ([id]) => getItem(id).slot !== "monitor",
    ),
  );
  let next: Setup = { ...setup, items };
  if (count > monitorCapacity(next.deskId))
    next = setDesk(next, WIDE_DESK).setup;
  for (let unit = 0; unit < count; unit += 1) next = addItem(next, model).setup;
  return normalizeSetup(next).setup;
}

function weeklyCost(setup: Setup): number {
  return weeklyEquivalentCents(setupLines(setup), setup.plan);
}

// One notch cheaper in the same slot (real items only), if the desk still fits it.
function stepDown(setup: Setup, item: CatalogItem): Setup | null {
  const price = effectiveCents(item, "weekly");
  const cheaper = CATALOG.filter(
    (entry) =>
      entry.slot === item.slot &&
      !entry.concept &&
      effectiveCents(entry, "weekly") < price,
  ).sort((a, b) => effectiveCents(b, "weekly") - effectiveCents(a, "weekly"));
  for (const option of cheaper) {
    if (item.category === "desk") {
      if (usedUnits(setup, "monitor") <= monitorCapacity(option.id)) {
        return { ...setup, deskId: option.id };
      }
      continue;
    }
    const qty = setup.items[item.id] ?? 0;
    const rest = Object.fromEntries(
      Object.entries(setup.items).filter(([id]) => id !== item.id),
    );
    const items = {
      ...rest,
      ...(qty > 1 ? { [item.id]: qty - 1 } : {}),
      [option.id]: (setup.items[option.id] ?? 0) + 1,
    };
    const candidate = { ...setup, items };
    const fits =
      (candidate.items[option.id] ?? 0) <= option.maxQty &&
      (item.slot !== "monitor" ||
        usedUnits(candidate, "monitor") <= monitorCapacity(candidate.deskId));
    if (fits) return normalizeSetup(candidate).setup;
  }
  return null;
}

// Steps the priciest items down, then drops optional ones, until the budget fits.
function fitBudget(
  setup: Setup,
  budgetCents: number,
): { setup: Setup; fits: boolean } {
  let next = setup;
  for (
    let guard = 0;
    guard < 200 && weeklyCost(next) > budgetCents;
    guard += 1
  ) {
    const byPrice = setupLines(next)
      .map((line) => line.item)
      .sort(
        (a, b) => effectiveCents(b, "weekly") - effectiveCents(a, "weekly"),
      );
    const stepped = byPrice.reduce<Setup | null>(
      (found, item) => found ?? stepDown(next, item),
      null,
    );
    if (stepped !== null) {
      next = stepped;
      continue;
    }
    const optional = byPrice.find(
      (item) => item.category !== "desk" && item.category !== "chair",
    );
    if (optional === undefined) break;
    next = removeItem(next, optional.id).setup;
  }
  return { setup: next, fits: weeklyCost(next) <= budgetCents };
}

// A reason stays only while at least one of its items is still in the setup.
interface Reason {
  text: string;
  items: string[];
}

function isPresent(setup: Setup, id: string): boolean {
  return setup.deskId === id || (setup.items[id] ?? 0) > 0;
}

function joinNames(ids: string[]): string {
  const names = ids.map((id) => getItem(id).name);
  return names.length <= 1
    ? (names[0] ?? "")
    : `${names.slice(0, -1).join(", ")} and ${names.at(-1) ?? ""}`;
}

// Rule-based stand-in for an LLM: same signature an LLM-backed version would have.
export function suggestSetup(text: string, current: Setup): Suggestion {
  const signals = readSignals(text);
  if (!recognised(signals)) {
    return {
      setup: presetSetup("essentials"),
      reasons: [
        "We couldn't tell your role, so here's a solid start. Tweak away.",
      ],
      matched: false,
    };
  }
  const core: Reason[] = [
    { text: ROLE_REASON[signals.role ?? "none"], items: [] },
  ];
  let setup: Setup = {
    ...presetSetup(
      signals.role === null ? "essentials" : ROLE_BASE[signals.role],
    ),
    plan: current.plan,
  };
  const want = (ids: string[], reason: string): void => {
    setup = addAll(setup, ids);
    core.push({ text: reason, items: ids });
  };
  if (signals.calls)
    want(["webcam", "headphones"], "Webcam and headset for clear calls.");
  if (signals.creator) {
    want(
      ["mic-kit", "webcam", "headphones", "lamp-led"],
      "Mic, camera and light for recording.",
    );
  }
  if (signals.computer) {
    setup = addAll(setup, ["mac-mini"]);
    if (!hasSlot(setup, "keyboard")) setup = addAll(setup, ["kb-mx"]);
    if (!hasSlot(setup, "mouse")) setup = addAll(setup, ["mouse-mx"]);
    if (!hasSlot(setup, "monitor")) setup = addAll(setup, ["mon-27-a27i"]);
    core.push({
      text: "A Mac mini with a screen, keyboard and mouse, since you have no laptop.",
      items: ["mac-mini"],
    });
  }
  if (signals.screens !== null) {
    setup = withScreens(setup, signals.screens);
    core.push({
      text: `${String(signals.screens)} matching screens side by side.`,
      items: [],
    });
  }
  if (signals.premium) {
    setup = setDesk(setup, WIDE_DESK).setup;
    core.push({
      text: "The dual-motor desk: the sturdiest one we have.",
      items: [WIDE_DESK],
    });
  }
  if (signals.internet === "starlink") {
    want(["starlink"], "Starlink, so you are online anywhere.");
  } else if (signals.internet === "router") {
    want(["router"], "A Wi-Fi 6 router for a stronger connection.");
  }
  const climate = [
    signals.humid ? "dehumidifier" : null,
    signals.hot ? "tower-fan" : null,
    signals.dusty ? "purifier" : null,
    signals.coffee ? "nespresso" : null,
  ].filter((id): id is string => id !== null);
  if (climate.length > 0)
    want(climate, `${joinNames(climate)} for life in Bali.`);
  if (signals.walking)
    want(["walking-pad"], "A walking pad under the desk to keep moving.");
  if (signals.standing || signals.walking) {
    setup = { ...setup, posture: "stand" };
    if (!signals.walking)
      core.push({ text: "Standing height for long days.", items: [] });
  }
  const tail: string[] = [];
  if (signals.weeks !== null && signals.weeks >= 4)
    setup = { ...setup, plan: "monthly" };
  setup = normalizeSetup(setup).setup;
  if (signals.budgetCents !== null) {
    const fitted = fitBudget(setup, signals.budgetCents);
    setup = fitted.setup;
    const asked = [...new Set(core.flatMap((reason) => reason.items))];
    const dropped = asked.filter((id) => !isPresent(setup, id));
    if (dropped.length > 0)
      tail.push(`Left out the ${joinNames(dropped)} to stay on budget.`);
    tail.push(
      fitted.fits
        ? `Fits your ${formatCents(signals.budgetCents)} a week budget.`
        : "This is the leanest setup we can do.",
    );
  }
  if (
    setup.plan === "monthly" &&
    signals.weeks !== null &&
    signals.weeks >= 4
  ) {
    const savings = monthlySavingsCents(setupLines(setup));
    tail.unshift(
      savings > 0
        ? `Monthly plan: you're staying a while, so you save ${formatCents(savings)} a month.`
        : "Monthly plan: you're staying a while.",
    );
  }
  const kept = core
    .filter(
      (reason) =>
        reason.items.length === 0 ||
        reason.items.some((id) => isPresent(setup, id)),
    )
    .map((reason) => reason.text);
  const room = Math.max(1, 4 - tail.length);
  return {
    setup,
    reasons: [...kept.slice(0, room), ...tail].slice(0, 4),
    matched: true,
  };
}
