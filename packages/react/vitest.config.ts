import { defineProject } from "vitest/config";

export default defineProject({
  test: {
    name: "@aether-md/react",
    environment: "happy-dom",
    setupFiles: ["./vitest.setup.ts"],
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
    exclude: ["src/testing/**"],
  },
});
