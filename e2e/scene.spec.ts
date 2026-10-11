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

test("dragging the close-up looks around without opening anything", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("radio", { name: "Close-up" }).click();
  const camera = page.getByTestId("scene-camera");
  await expect(page.getByTestId("scene-frame")).toHaveAttribute(
    "data-view",
    "desk",
  );
  const transform = (): Promise<string> =>
    camera.evaluate((element) => getComputedStyle(element).transform);
  await expect.poll(transform).not.toBe("none");
  const before = await transform();
  const chair = await page
    .getByRole("button", { name: "Change chair" })
    .boundingBox();
  if (chair === null) throw new Error("chair target not found");
  const start = { x: chair.x + chair.width / 2, y: chair.y + chair.height / 3 };
  await page.mouse.move(start.x, start.y);
  await page.mouse.down();
  await page.mouse.move(start.x + 120, start.y + 30, { steps: 8 });
  await page.mouse.up();
  await expect.poll(transform).not.toBe(before);
  await expect(page.getByRole("tab", { name: "Chair" })).toHaveAttribute(
    "aria-selected",
    "false",
  );
});

test("tapping things on the floor and shelves shows them in the list", async ({
  page,
}) => {
  await page.goto(
    "/?d=desk-electric&c=chair-ergo&i=plant-monstera,nespresso,router,tower-fan",
  );
  await page.getByRole("button", { name: "Change coffee machine" }).click();
  await expect(page.getByRole("tab", { name: "Bali" })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await expect(page.getByTestId("item-card-nespresso")).toBeInViewport();
  await page.getByRole("button", { name: "Change plants" }).click();
  await expect(page.getByRole("tab", { name: "Accessories" })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await expect(page.getByTestId("item-card-plant-monstera")).toBeInViewport();
  await expect(page.getByTestId("scene-frame")).toHaveAttribute(
    "data-view",
    "room",
  );
});
