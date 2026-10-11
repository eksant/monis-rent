# Bug log

History of reported bugs with root cause, fix, prevention and regression test. Newest entries first.

**Entry format:**

- **Symptom** (as reported) · **Repro** · **Root cause** · **Fix** (files) · **Prevention** · **Regression test**

---

## 2026-10-11 — [FIXED] Landscape phones and a stretched page (CR-07, CR-08)

- **Symptom:** at 844×390 the item list had almost no height. Strengthening the layout test then showed the page was 143 px taller than the screen at 375×667.
- **Repro:** `e2e/layout.spec.ts` at 844×390, 667×375 and 375×667.
- **Root cause:** (1) the stacked layout spends its height on header, presets, scene and price bar; (2) each card's `sr-only` status text is absolutely positioned, and with no positioned ancestor it was placed relative to the page, below the scroll area.
- **Fix:** a `short` variant (landscape, height ≤ 520 px) puts scene and picker side by side with slimmer chrome (`globals.css`, `builder.tsx`, header, presets, price bar); cards are `relative` (`item-card.tsx`).
- **Prevention:** the layout test asserts that the first item card is at least half visible, not only that the document does not scroll.
- **Regression test:** `e2e/layout.spec.ts` — nine viewport sizes.

## 2026-10-11 — [FIXED] Searching "constructor" crashed the builder (CR-02)

- **Symptom:** typing `constructor` or `__proto__` into search showed Next's application error page.
- **Repro:** `searchCatalog("constructor")` throws "function is not iterable".
- **Root cause:** synonyms lived in a plain object, so `SYNONYMS["constructor"]` returned `Object.prototype.constructor`; there was no route error boundary.
- **Fix:** synonyms in a `Map` (`src/lib/search.ts`); `src/app/error.tsx` with "Try again" and "Start over".
- **Prevention:** use `Map` for lookups keyed by user input.
- **Regression test:** `src/lib/search.test.ts` › ignores words that are Object prototype keys.

## 2026-10-11 — [FIXED] False desk upgrade and a 34" screen that could not be removed (CR-01)

- **Symptom:** on the 120 cm desk with two 24" screens, tapping a 34" ultrawide offered "Upgrade to the 160 cm desk", which then still failed. In the Trading preset, tapping the selected 34" card tried to add a second one.
- **Repro:** `addItem(withItems({ "mon-24-1c": 2 }), "mon-34-curved")`; `toggleItem(trading, "mon-34-gaming")`.
- **Root cause:** desk capacity was checked before the per-item limit, the upgrade was offered without checking the wider desk's capacity, and "multi-unit" was decided by slot capacity alone.
- **Fix:** limit first, upgrade only when the screen fits, and `isMultiUnit()` (maxQty > 1 and slot capacity > 1) shared by the rules and the picker (`src/lib/setup.ts`, `category-picker.tsx`).
- **Prevention:** one helper decides toggle versus add everywhere.
- **Regression test:** `src/lib/setup.test.ts` › offers no wider desk…, checks the per-item limit…, isMultiUnit; `e2e/builder.spec.ts` › a selected single-unit screen is removed by tapping its card.
