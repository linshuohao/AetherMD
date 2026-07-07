import { defineConfig, devices } from "@playwright/test";

const isCI = !!process.env.CI;
const REACT_PORT = Number(process.env.E2E_PORT ?? 4173);
const REACT_URL = `http://127.0.0.1:${REACT_PORT}`;

export default defineConfig({
  testDir: "./tests",
  timeout: isCI ? 60_000 : 30_000,
  expect: {
    timeout: isCI ? 10_000 : 5_000,
  },
  retries: isCI ? 2 : 0,
  workers: 1,
  fullyParallel: false,
  forbidOnly: isCI,
  outputDir: "../../test-results",
  reporter: isCI
    ? [["list"], ["github"], ["html", { open: "never", outputFolder: "../../playwright-report" }]]
    : "list",
  use: {
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    actionTimeout: isCI ? 15_000 : 10_000,
    navigationTimeout: 30_000,
  },
  webServer: {
    command: "node ../../scripts/e2e-webservers.mjs",
    url: `${REACT_URL}/`,
    timeout: isCI ? 180_000 : 120_000,
    reuseExistingServer: false,
    stdout: "pipe",
    stderr: "pipe",
  },
  projects: [
    {
      name: "react",
      testMatch: /\.spec\.ts/,
      use: {
        ...devices["Desktop Chrome"],
        baseURL: REACT_URL,
      },
    },
  ],
});
