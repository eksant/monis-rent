import { CATALOG } from "@/data/catalog";
import type { CatalogItem, CategoryId } from "@/lib/types";

const MAX_QUERY_LENGTH = 60;

const CATEGORY_WORDS: Record<CategoryId, string> = {
  desk: "desk desks table",
  chair: "chair chairs seat",
  screen: "screen screens monitor display",
  accessory: "accessory accessories",
  extra: "bali extra extras",
};

// Words people type that the catalog text does not always contain.
const SYNONYMS: Record<string, string[]> = {
  screen: ["monitor", "display"],
  display: ["monitor", "screen"],
  monitor: ["screen", "display"],
  wifi: ["wi-fi", "router", "internet", "starlink"],
  internet: ["wi-fi", "router", "starlink"],
  light: ["lamp", "lighting"],
  lamp: ["light"],
  computer: ["mac", "laptop"],
  coffee: ["espresso", "nespresso"],
  table: ["desk"],
};

// Lower-cased words of a text; hyphenated words also contribute their parts.
function wordsOf(text: string): string[] {
  const words = text
    .toLowerCase()
    .split(/[\s,.;:!?()/"″'+]+/)
    .filter(Boolean);
  return words.flatMap((word) =>
    word.includes("-") ? [word, ...word.split("-")] : [word],
  );
}

const INDEX = CATALOG.map((item) => ({
  item,
  nameWords: wordsOf(item.name),
  allWords: wordsOf(
    [
      item.name,
      item.benefit,
      item.group ?? "",
      CATEGORY_WORDS[item.category],
      ...item.tags,
    ].join(" "),
  ),
}));

// A query word, its singular form, and their synonyms.
function formsOf(word: string): string[] {
  const forms = new Set([word]);
  if (word.length > 3 && word.endsWith("s")) forms.add(word.slice(0, -1));
  for (const form of [...forms]) {
    for (const synonym of SYNONYMS[form] ?? []) forms.add(synonym);
  }
  return [...forms];
}

function matchesAll(
  words: string[],
  queryForms: string[][],
  exact: boolean,
): boolean {
  return queryForms.every((forms) =>
    forms.some((form) =>
      words.some((word) => (exact ? word === form : word.startsWith(form))),
    ),
  );
}

// Every query word must start a word of the item. Whole-word matches rank
// before partial ones, then name matches before matches elsewhere.
export function searchCatalog(query: string): CatalogItem[] {
  const queryForms = wordsOf(query.slice(0, MAX_QUERY_LENGTH)).map(formsOf);
  if (queryForms.length === 0) return [];
  const scored = INDEX.filter((entry) =>
    matchesAll(entry.allWords, queryForms, false),
  ).map((entry) => {
    const whole = matchesAll(entry.allWords, queryForms, true);
    const inName = matchesAll(entry.nameWords, queryForms, false);
    return { item: entry.item, score: (whole ? 0 : 2) + (inName ? 0 : 1) };
  });
  return scored.sort((a, b) => a.score - b.score).map((entry) => entry.item);
}
