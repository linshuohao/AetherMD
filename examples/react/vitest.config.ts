import { defineProject } from "vitest/config";

export default defineProject({
  test: {
    name: "@aether-md/example-react",
    environment: "happy-dom",
    setupFiles: ["./src/test-setup.ts"],
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
  },
});
