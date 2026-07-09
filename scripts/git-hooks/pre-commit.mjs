#!/usr/bin/env node

import { execFileSync, spawnSync } from "node:child_process";
import { existsSync } from "node:fs";

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    encoding: "utf8",
    stdio: "inherit",
    ...options,
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

function gitOutput(args) {
  return execFileSync("git", args, { encoding: "utf8" }).trim();
}

if (process.env.SKIP_PRE_COMMIT === "1") {
  process.exit(0);
}

const stagedFiles = gitOutput(["diff", "--cached", "--name-only", "--diff-filter=ACMR"])
  .split("\n")
  .map((file) => file.trim())
  .filter(Boolean)
  .filter((file) => existsSync(file));

if (stagedFiles.length === 0) {
  process.exit(0);
}

const prettierPattern = /\.(md|mdx|json|ya?ml|css|scss|html|mjs|cjs|js|jsx|ts|tsx)$/i;
const eslintPattern = /\.(mjs|cjs|js|jsx|ts|tsx)$/i;

const prettierFiles = stagedFiles.filter((file) => prettierPattern.test(file));
const eslintFiles = stagedFiles.filter((file) => eslintPattern.test(file));

if (prettierFiles.length > 0) {
  console.log("→ Prettier (staged files)");
  run("pnpm", ["exec", "prettier", "--write", ...prettierFiles]);
  run("git", ["add", "--", ...prettierFiles]);
}

if (eslintFiles.length > 0) {
  console.log("→ ESLint --fix (staged files)");
  run("pnpm", ["exec", "eslint", "--fix", ...eslintFiles]);
  run("git", ["add", "--", ...eslintFiles]);
}
