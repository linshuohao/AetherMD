import { defineProject } from "vitest/config";

export default defineProject({
  test: {
    name: "@aether-md/vue",
    environment: "happy-dom",
    setupFiles: ["./vitest.setup.ts"],
    include: ["src/**/*.test.ts"],
    exclude: ["src/testing/**"],
  },
});
