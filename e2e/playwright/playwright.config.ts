import { defineConfig, devices } from "@playwright/test";

const isCI = !!process.env.CI;
const MORPHING_PORT = Number(process.env.E2E_PORT ?? 4173);
const MORPHING_URL = `http://127.0.0.1:${MORPHING_PORT}`;
const REACT_BASIC_PORT = Number(process.env.E2E_REACT_BASIC_PORT ?? 4174);
const REACT_BASIC_URL = `http://127.0.0.1:${REACT_BASIC_PORT}`;

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
    url: `${MORPHING_URL}/`,
    timeout: isCI ? 180_000 : 120_000,
    reuseExistingServer: false,
    stdout: "pipe",
    stderr: "pipe",
  },
  projects: [
    {
      name: "block-morphing",
      testMatch: /block-morphing\.spec\.ts/,
      use: {
        ...devices["Desktop Chrome"],
        baseURL: MORPHING_URL,
      },
    },
    {
      name: "react-basic",
      testMatch: /react-basic\.spec\.ts/,
      use: {
        ...devices["Desktop Chrome"],
        baseURL: REACT_BASIC_URL,
      },
    },
  ],
});
