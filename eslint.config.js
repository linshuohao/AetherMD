import eslint from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import globals from "globals";
import tseslint from "typescript-eslint";

const ADAPTER_PACKAGE_GLOBS = [
  "packages/plugins/plugin-remark/**",
  "packages/plugins/plugin-prosemirror/**",
];

export default tseslint.config(
  {
    ignores: [
      "**/dist/**",
      "**/dist-test/**",
      "**/node_modules/**",
      "**/.turbo/**",
      "**/.codex/**",
      "**/.cursor/**",
      "**/.skills/**",
    ],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  eslintConfigPrettier,
  {
    files: [
      "scripts/**/*.{js,mjs,cjs}",
      "packages/core/scripts/**/*.{js,mjs,cjs}",
      ".commitlintrc.cjs",
      "prettier.config.js",
      "eslint.config.js",
    ],
    languageOptions: {
      globals: globals.node,
    },
  },
  {
    files: ["**/*.{js,mjs,cjs,ts,tsx}"],
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
  {
    files: ["packages/core/**", "packages/react/**", "packages/preset-gfm/**"],
    ignores: ["**/*.test.ts", "**/*.test.tsx"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["prosemirror-*", "remark-*"],
              message:
                "Engine dependencies must stay inside adapter packages (@aether-md/plugin-remark / @aether-md/plugin-prosemirror).",
            },
          ],
        },
      ],
    },
  },
  ...ADAPTER_PACKAGE_GLOBS.map((files) => ({
    files: [files],
    rules: {
      "no-restricted-imports": "off",
    },
  })),
);
