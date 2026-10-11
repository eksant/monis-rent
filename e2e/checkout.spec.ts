import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, test } from "@playwright/test";

import { addDays, baliDate, formatDeliveryDate } from "../src/lib/checkout";

async function goToCheckout(page: Page): Promise<void> {
  await page.goto("/");
  await expect(page.getByTestId("workspace-scene")).toBeVisible();
  await page
    .getByRole("link", { name: /^Rent/ })
    .filter({ visible: true })
    .click();
  await expect(page.getByRole("heading", { name: "Checkout" })).toBeVisible();
}

async function fillValidRequest(page: Page): Promise<void> {
  await page.getByLabel("Full name").fill("Kadek Ayu");
  await page.getByLabel("Email").fill("kadek@example.com");
  await page.getByLabel("Delivery area").click();
  await page.getByPlaceholder("Search an area…").fill("cang");
  await page.getByRole("option", { name: "Canggu" }).click();
  await page
    .getByLabel("Address or villa")
    .fill("Villa Melati, Jl. Pantai Berawa 12");
}

test("Rent opens checkout with the setup and its total", async ({ page }) => {
  await goToCheckout(page);
  await expect(page.getByTestId("checkout-total")).toHaveText("$12.70 / week");
  await expect(page.getByTestId("order-summary")).toContainText(
    "Electrical Adjustable Desk",
  );
});

test("checkout explains what is missing", async ({ page }) => {
  await goToCheckout(page);
  await page.getByRole("button", { name: "Send rental request" }).click();
  for (const message of [
    "Please enter your name.",
    "Please enter a valid email.",
    "Choose a delivery area.",
    "Add a street, villa or landmark.",
  ]) {
    await expect(page.getByText(message)).toBeVisible();
  }
  await expect(page).toHaveURL(/\/checkout$/);
});

test("a valid request ends on the success page and survives a reload", async ({
  page,
}) => {
  await goToCheckout(page);
  await fillValidRequest(page);
  await page.getByRole("button", { name: "Send rental request" }).click();
  await expect(page).toHaveURL(/\/checkout\/success$/);
  await expect(page.getByTestId("concept-banner")).toBeVisible();
  await expect(page.getByTestId("order-reference")).toHaveText(
    /^MR-[A-HJ-NP-Z2-9]{4}$/,
  );
  const reference = await page.getByTestId("order-reference").textContent();
  await expect(page.getByTestId("order-total")).toHaveText("$12.70 / week");
  await expect(page.getByTestId("order-delivery")).toContainText("Canggu");
  await page.reload();
  await expect(page.getByTestId("order-reference")).toHaveText(reference ?? "");
  await page.getByRole("button", { name: "Start a new setup" }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(
    page.getByRole("button", { name: "Essentials" }),
  ).toHaveAttribute("aria-pressed", "true");
});

test("the success page without a request points back to the builder", async ({
  page,
}) => {
  await page.goto("/checkout/success");
  await expect(page.getByText("No request yet")).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Design my workspace" }),
  ).toBeVisible();
});

test("checkout pages have no serious accessibility violations", async ({
  page,
}) => {
  await goToCheckout(page);
  await expect(page).toHaveTitle(/Checkout/);
  const scan = async (): Promise<string[]> => {
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .analyze();
    return results.violations
      .filter((v) => v.impact === "serious" || v.impact === "critical")
      .map((v) => v.id);
  };
  expect(await scan()).toEqual([]);
  await fillValidRequest(page);
  await page.getByRole("button", { name: "Send rental request" }).click();
  await expect(page.getByTestId("order-reference")).toBeVisible();
  // Client navigation updates <title> a moment after the content.
  await expect(page).toHaveTitle(/Request received/);
  expect(await scan()).toEqual([]);
});

test("area, date and WhatsApp use friendly pickers", async ({ page }) => {
  await goToCheckout(page);
  await fillValidRequest(page);
  await expect(page.getByLabel("Delivery area")).toHaveText(/Canggu/);

  await page.getByLabel("Country code").click();
  await page.getByPlaceholder("Search a country…").fill("austr");
  await page.getByRole("option", { name: /Australia/ }).click();
  await expect(page.getByLabel("Country code")).toHaveText(/\+61/);
  await page.getByLabel(/WhatsApp/).fill("412 345 678");

  const earliest = addDays(baliDate(new Date()), 1);
  const target = addDays(earliest, 2);
  await page.getByLabel("Delivery date").click();
  const day = page.locator(`[data-day="${target}"] button`);
  if (!(await day.isVisible())) {
    await page.getByRole("button", { name: "Go to the Next Month" }).click();
  }
  await day.click();
  await expect(page.getByLabel("Delivery date")).toHaveText(
    formatDeliveryDate(target),
  );

  await page.getByRole("button", { name: "Send rental request" }).click();
  await expect(page.getByTestId("order-delivery")).toContainText(
    formatDeliveryDate(target),
  );
});
