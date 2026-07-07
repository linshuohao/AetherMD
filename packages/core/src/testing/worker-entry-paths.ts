import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export function resolveWorkerFixtureEntryPath(): string {
  return fileURLToPath(
    new URL("../../dist/worker/fixtures/worker-fixture-entry.js", import.meta.url),
  );
}

export function resolveRemarkWorkerEntryPath(): string {
  const require = createRequire(import.meta.url);
  const mainEntry = require.resolve("@aether-md/plugin-remark");
  return join(dirname(mainEntry), "remark-worker-entry.js");
}
