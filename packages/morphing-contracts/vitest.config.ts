import { defineProject } from "vitest/config";

export default defineProject({
  test: {
    name: "@aether-md/morphing-contracts",
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
