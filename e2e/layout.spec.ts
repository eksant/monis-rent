import { expect, test } from "@playwright/test";

const SIZES = [
  { width: 375, height: 667 },
  { width: 390, height: 844 },
  { width: 820, height: 1180 },
  { width: 1024, height: 768 },
  { width: 1280, height: 720 },
  { width: 1440, height: 900 },
  { width: 1920, height: 1080 },
];

test("the builder fits every viewport without page scroll", async ({
  page,
  isMobile,
}) => {
  test.skip(isMobile, "viewport sizes are set explicitly");
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
  }
});
