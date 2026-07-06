import { defineProject } from "vitest/config";

export default defineProject({
  test: {
    name: "@aether-md/preset-gfm",
    environment: "node",
    include: ["src/**/*.test.ts"],
    exclude: ["src/testing/**"],
  },
});
