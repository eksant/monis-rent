import { defineConfig, devices } from "@playwright/test";

// Runs against a local production server, or against BASE_URL (e.g. a Vercel deployment).
const LOCAL_URL = "http://localhost:3000";
const remote = process.env.BASE_URL;
const baseURL = remote !== undefined && remote !== "" ? remote : LOCAL_URL;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
  webServer:
    baseURL === LOCAL_URL
      ? {
          command: "pnpm start",
          url: LOCAL_URL,
          reuseExistingServer: false,
          timeout: 120_000,
        }
      : undefined,
});
