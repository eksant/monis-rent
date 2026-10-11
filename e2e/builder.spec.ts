import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

import { addFromCard, closeSummary, openSummary } from "./helpers";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await expect(page.getByTestId("workspace-scene")).toBeVisible();
});

test("first visit shows the Essentials setup with price and arrival", async ({
  page,
  isMobile,
}) => {
  await expect(page.getByTestId("scene-desk-electric")).toBeVisible();
  await expect(page.getByTestId("scene-chair-ergo")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Essentials" }),
  ).toHaveAttribute("aria-pressed", "true");
  const summary = await openSummary(page, isMobile);
  await expect(summary.getByTestId("summary-total")).toHaveText(
    "$12.70 / week",
  );
  await expect(summary.getByTestId("summary-arrival")).toHaveText(
    "Arrives tomorrow",
  );
});

test("swapping desk and chair updates the scene and summary", async ({
  page,
  isMobile,
}) => {
  await addFromCard(page, "desk-dual-motor");
  await expect(page.getByTestId("scene-desk-dualMotor")).toBeVisible();
  await page.getByRole("tab", { name: "Chair" }).click();
  await addFromCard(page, "chair-basic");
  await expect(page.getByTestId("scene-chair-basic")).toBeVisible();
  const summary = await openSummary(page, isMobile);
  await expect(
    summary.getByTestId("summary-line-desk-dual-motor"),
  ).toBeVisible();
  await expect(summary.getByTestId("summary-line-chair-basic")).toBeVisible();
});

test("a full desk offers an upgrade that adds the third screen", async ({
  page,
}) => {
  await page.getByRole("tab", { name: "Screens" }).click();
  await addFromCard(page, "mon-24-1c");
  await page
    .getByRole("button", { name: 'Add another 24" Full HD Office Monitor 1C' })
    .click();
  await addFromCard(page, "mon-27-4k");
  await page
    .getByRole("button", { name: "Upgrade to the 160 cm desk" })
    .click();
  await expect(page.getByTestId("scene-desk-dualMotor")).toBeVisible();
  await expect(page.locator('[data-testid^="scene-monitor-"]')).toHaveCount(3);
});

test("the plan toggle switches totals and savings", async ({
  page,
  isMobile,
}) => {
  const summary = await openSummary(page, isMobile);
  await summary.getByRole("radio", { name: "Monthly" }).click();
  await expect(summary.getByTestId("summary-total")).toHaveText(
    "$34.80 / month",
  );
  await expect(summary.getByTestId("summary-savings")).toHaveText(
    "You save $20.23 vs weekly billing.",
  );
});

test("standing raises the desk", async ({ page }) => {
  await page.getByRole("radio", { name: "Stand" }).click();
  await expect(page.getByTestId("workspace-scene")).toHaveAttribute(
    "data-posture",
    "stand",
  );
});

test("a shared link rebuilds the same setup", async ({
  page,
  context,
  browser,
  isMobile,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.getByRole("button", { name: "Founders" }).click();
  await page.getByTestId("share-button").click();
  const url = await page.evaluate(() => navigator.clipboard.readText());
  expect(url).toContain("i=mon-27-4k");

  const fresh = await browser.newContext(
    isMobile
      ? {
          viewport: { width: 412, height: 915 },
          isMobile: true,
          hasTouch: true,
        }
      : {},
  );
  const other = await fresh.newPage();
  await other.goto(url);
  await expect(other.getByRole("button", { name: "Founders" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(other).toHaveURL(/\/$/);
  await fresh.close();
});

test("the setup survives a reload", async ({ page, isMobile }) => {
  await page.getByRole("button", { name: "Trading" }).click();
  await page.reload();
  await expect(page.getByRole("button", { name: "Trading" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  const summary = await openSummary(page, isMobile);
  await expect(summary.getByTestId("summary-total")).toHaveText(
    "$48.20 / week",
  );
  await closeSummary(page, isMobile);
});

test("mobile shows a sticky price bar that opens the summary", async ({
  page,
  isMobile,
}) => {
  test.skip(!isMobile, "mobile only");
  await expect(page.getByTestId("price-bar")).toBeVisible();
  const summary = await openSummary(page, isMobile);
  await expect(
    summary.getByRole("link", { name: "Rent this setup" }),
  ).toBeVisible();
});

test("search finds items across categories", async ({ page }) => {
  const search = page.getByTestId("catalog-search");
  await search.fill("webcam");
  await expect(page.getByRole("tab", { name: "Desk" })).toBeHidden();
  await addFromCard(page, "webcam");
  await expect(page.getByTestId("item-card-webcam")).toHaveAttribute(
    "data-selected",
    "true",
  );
  await expect(page.getByTestId("scene-item-webcam")).toBeVisible();
  await search.fill("xyzzy");
  await expect(page.getByText("No match for “xyzzy”")).toBeVisible();
  await page.getByRole("button", { name: "lamp", exact: true }).click();
  await expect(page.getByTestId("item-card-lamp-led")).toBeVisible();
  await search.press("Escape");
  await expect(page.getByRole("tab", { name: "Desk" })).toBeVisible();
});

test("slash focuses the search on desktop", async ({ page, isMobile }) => {
  test.skip(isMobile, "keyboard shortcut is desktop only");
  await page.keyboard.press("/");
  await expect(page.getByTestId("catalog-search")).toBeFocused();
});

test("a selected single-unit screen is removed by tapping its card", async ({
  page,
  isMobile,
}) => {
  await page.getByRole("button", { name: "Trading" }).click();
  await page.getByRole("tab", { name: "Screens" }).click();
  await expect(page.getByTestId("qty-mon-34-gaming")).toHaveCount(0);
  await addFromCard(page, "mon-34-gaming");
  await expect(page.getByTestId("scene-monitor-mon-34-gaming")).toHaveCount(0);
  const summary = await openSummary(page, isMobile);
  await expect(summary.getByTestId("summary-line-mon-34-gaming")).toHaveCount(
    0,
  );
});

test("item cards expose price and badges to assistive tech", async ({
  page,
}) => {
  const card = page
    .getByTestId("item-card-desk-electric")
    .getByRole("button")
    .first();
  await expect(card).toHaveAccessibleName("Electrical Adjustable Desk");
  await expect(card).toHaveAccessibleDescription(/\$4\.90/);
  await expect(card).toHaveAccessibleDescription(/−30%/);
});

test("concept items are labelled in the summary", async ({
  page,
  isMobile,
}) => {
  await page.getByRole("tab", { name: "Chair" }).click();
  await addFromCard(page, "chair-basic");
  const summary = await openSummary(page, isMobile);
  await expect(summary.getByTestId("summary-line-chair-basic")).toContainText(
    "Concept",
  );
});

test("cards fall back to an icon when product photos fail", async ({
  page,
}) => {
  await page.route("https://strapi.monis.rent/**", (route) => route.abort());
  await page.reload();
  await expect(
    page.getByTestId("item-card-desk-electric").getByTestId("thumb-fallback"),
  ).toBeVisible();
});

test("the mobile price bar announces total changes", async ({
  page,
  isMobile,
}) => {
  test.skip(!isMobile, "mobile only");
  const live = page.getByTestId("price-bar-live");
  await expect(live).toHaveAttribute("aria-live", "polite");
  await expect(live).toHaveText("$12.70 per week");
  await page.getByRole("button", { name: "Founders" }).click();
  await expect(live).toHaveText("$47.45 per week");
});

test("the builder has no serious accessibility violations", async ({
  page,
}) => {
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa"])
    .analyze();
  const serious = results.violations.filter(
    (violation) =>
      violation.impact === "serious" || violation.impact === "critical",
  );
  expect(serious.map((violation) => violation.id)).toEqual([]);
});
