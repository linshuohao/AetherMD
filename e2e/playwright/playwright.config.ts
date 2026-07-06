import { defineConfig, devices } from "@playwright/test";

const isCI = !!process.env.CI;
const PORT = Number(process.env.E2E_PORT ?? 4173);
const BASE_URL = `http://127.0.0.1:${PORT}`;

export default defineConfig({
  testDir: "./tests",
  timeout: isCI ? 60_000 : 30_000,
  expect: {
    timeout: isCI ? 10_000 : 5_000,
  },
  retries: isCI ? 2 : 0,
  workers: isCI ? 1 : undefined,
  forbidOnly: isCI,
  outputDir: "../../test-results",
  reporter: isCI
    ? [["list"], ["github"], ["html", { open: "never", outputFolder: "../../playwright-report" }]]
    : "list",
  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    actionTimeout: isCI ? 15_000 : 10_000,
    navigationTimeout: 30_000,
  },
  webServer: {
    command: `pnpm --filter @aether-md/example-block-morphing dev --host 127.0.0.1 --port ${PORT}`,
    url: `${BASE_URL}/`,
    timeout: isCI ? 180_000 : 120_000,
    reuseExistingServer: !isCI,
    stdout: "pipe",
    stderr: "pipe",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
