import { defineProject } from "vitest/config";

export default defineProject({
  test: {
    name: "@aether-md/plugin-prosemirror",
    environment: "node",
    include: ["src/**/*.test.ts"],
    exclude: ["src/testing/**"],
  },
});
