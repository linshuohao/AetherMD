import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    projects: [
      "packages/core",
      "packages/preset-gfm",
      "packages/plugins/plugin-remark",
      "packages/plugins/plugin-prosemirror",
      "packages/react",
      "packages/vue",
      "examples/react",
    ],
  },
});
