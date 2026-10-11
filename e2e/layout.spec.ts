import { expect, test } from "@playwright/test";

const SIZES = [
  { width: 375, height: 667 },
  { width: 390, height: 844 },
  { width: 820, height: 1180 },
  { width: 1024, height: 768 },
  { width: 1280, height: 720 },
  { width: 1440, height: 900 },
  { width: 1920, height: 1080 },
  { width: 844, height: 390 },
  { width: 667, height: 375 },
];

test(
  "the builder fits every viewport without page scroll",
  { tag: "@desktop-only" },
  async ({ page }) => {
    for (const size of SIZES) {
      const label = `${String(size.width)}x${String(size.height)}`;
      await page.setViewportSize(size);
      await page.goto("/");
      await expect(page.getByTestId("workspace-scene")).toBeVisible();
      const overflow = await page.evaluate(() => ({
        vertical: document.documentElement.scrollHeight - window.innerHeight,
        horizontal: document.documentElement.scrollWidth - window.innerWidth,
      }));
      expect(overflow.vertical, label).toBeLessThanOrEqual(0);
      expect(overflow.horizontal, label).toBeLessThanOrEqual(0);
      await expect(page.getByRole("banner"), label).toBeInViewport();
      await expect(page.getByTestId("workspace-scene"), label).toBeInViewport();
      await expect(
        page.getByRole("link", { name: /^Rent/ }).filter({ visible: true }),
        label,
      ).toBeInViewport();
      await expect(page.getByTestId("catalog-search"), label).toBeInViewport();
      await expect(
        page.locator('[data-testid^="item-card-"]').first(),
        label,
      ).toBeInViewport({ ratio: 0.5 });
    }
  },
);

test(
  "touch targets are at least 32 px on phones",
  { tag: "@mobile-only" },
  async ({ page }) => {
    await page.goto("/");
    await expect(page.getByTestId("workspace-scene")).toBeVisible();
    await page.getByRole("tab", { name: "Screens" }).click();
    await page
      .getByTestId("item-card-mon-24-1c")
      .getByRole("button")
      .first()
      .click();
    const targets = [
      page.getByRole("button", { name: /^Add another/ }).first(),
      page.getByRole("button", { name: /^Remove one/ }).first(),
      page.getByRole("link", { name: "View on monis.rent" }).first(),
      page.getByTestId("share-button"),
    ];
    for (const target of targets) {
      const box = await target.boundingBox();
      expect(box?.height ?? 0).toBeGreaterThanOrEqual(32);
      expect(box?.width ?? 0).toBeGreaterThanOrEqual(32);
    }
    await page.getByTestId("price-bar").click();
    const remove = page
      .getByTestId("summary-panel")
      .filter({ visible: true })
      .getByRole("button", { name: /^Remove/ })
      .first();
    const box = await remove.boundingBox();
    expect(box?.height ?? 0).toBeGreaterThanOrEqual(32);
  },
);

test(
  "checkout keeps the header and scrolls only its content",
  { tag: "@desktop-only" },
  async ({ page }) => {
    for (const size of [SIZES[0], SIZES[4]]) {
      if (size === undefined) continue;
      const label = `${String(size.width)}x${String(size.height)}`;
      await page.setViewportSize(size);
      await page.goto("/checkout");
      const submit = page.getByRole("button", { name: "Send rental request" });
      await expect(submit, label).toBeAttached();
      const vertical = await page.evaluate(
        () => document.documentElement.scrollHeight - window.innerHeight,
      );
      expect(vertical, label).toBeLessThanOrEqual(0);
      await submit.scrollIntoViewIfNeeded();
      await expect(submit, label).toBeInViewport();
      await expect(page.getByRole("banner"), label).toBeInViewport();
    }
  },
);
