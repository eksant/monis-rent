import { expect, type Locator, type Page } from "@playwright/test";

// The summary lives in a sidebar on desktop and in a drawer on mobile.
export async function openSummary(
  page: Page,
  isMobile: boolean,
): Promise<Locator> {
  if (isMobile) {
    await page.getByTestId("price-bar").click();
  }
  const panel = page.getByTestId("summary-panel").filter({ visible: true });
  await expect(panel).toBeVisible();
  return panel;
}

export async function closeSummary(
  page: Page,
  isMobile: boolean,
): Promise<void> {
  if (isMobile) await page.keyboard.press("Escape");
}

export async function addFromCard(page: Page, itemId: string): Promise<void> {
  await page
    .getByTestId(`item-card-${itemId}`)
    .getByRole("button")
    .first()
    .click();
}
