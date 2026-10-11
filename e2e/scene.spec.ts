import { expect, test } from "@playwright/test";

test("the scene draws the default desk and chair", async ({ page }) => {
  await page.goto("/");
  const scene = page.getByTestId("workspace-scene");
  await expect(scene).toBeVisible();
  await expect(scene).toHaveAttribute(
    "aria-label",
    /Electrical Adjustable Desk, Ergonomic Office Chair/,
  );
  await expect(page.getByTestId("scene-desk-electric")).toBeVisible();
  await expect(page.getByTestId("scene-chair-ergo")).toBeVisible();
});
