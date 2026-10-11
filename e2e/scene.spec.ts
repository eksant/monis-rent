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

test("the close-up view zooms into the desk and back", async ({ page }) => {
  await page.goto("/");
  const frame = page.getByTestId("scene-frame");
  const desk = page.getByTestId("scene-desk-electric");
  await expect(frame).toHaveAttribute("data-view", "room");
  const roomWidth = (await desk.boundingBox())?.width ?? 0;
  await page.getByRole("radio", { name: "Close-up" }).click();
  await expect(frame).toHaveAttribute("data-view", "desk");
  await expect
    .poll(async () => (await desk.boundingBox())?.width ?? 0)
    .toBeGreaterThan(roomWidth * 1.5);
  await page.getByRole("radio", { name: "Room" }).click();
  await expect(frame).toHaveAttribute("data-view", "room");
});

test("tapping the chair in the scene opens the chair tab in close-up", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Change chair" }).click();
  await expect(page.getByRole("tab", { name: "Chair" })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await expect(page.getByTestId("scene-frame")).toHaveAttribute(
    "data-view",
    "desk",
  );
});

test("an empty setup offers a chair hotspot", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Start empty" }).click();
  await page.getByRole("button", { name: "Add a chair" }).click();
  await expect(page.getByRole("tab", { name: "Chair" })).toHaveAttribute(
    "aria-selected",
    "true",
  );
});
