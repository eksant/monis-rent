import { expect, test } from "@playwright/test";

import { closeSummary, openSummary } from "./helpers";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await expect(page.getByTestId("workspace-scene")).toBeVisible();
});

test("a sentence becomes a setup with reasons, and Undo restores the old one", async ({
  page,
  isMobile,
}) => {
  await page.getByRole("button", { name: /^Describe/ }).click();
  await page.getByLabel("How do you work?").fill("Lots of calls, bad wifi");
  await page.getByRole("button", { name: "Build my setup" }).click();
  await expect(
    page.getByText("Webcam and headset for clear calls."),
  ).toBeVisible();
  const summary = await openSummary(page, isMobile);
  await expect(summary.getByTestId("summary-line-router")).toBeVisible();
  await expect(summary.getByTestId("summary-line-webcam")).toBeVisible();
  await closeSummary(page, isMobile);
  await page.getByRole("button", { name: "Undo" }).click();
  await expect(
    page.getByRole("button", { name: "Essentials" }),
  ).toHaveAttribute("aria-pressed", "true");
});

test("example chips fill in the sentence", async ({ page }) => {
  await page.getByRole("button", { name: /^Describe/ }).click();
  await page.getByRole("button", { name: "Day trader, three screens" }).click();
  await expect(page.getByLabel("How do you work?")).toHaveValue(
    "Day trader, three screens",
  );
  await page.getByRole("button", { name: "Build my setup" }).click();
  await expect(page.locator('[data-testid^="scene-monitor-"]')).toHaveCount(3);
});
