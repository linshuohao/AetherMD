#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const rootDir = join(dirname(fileURLToPath(import.meta.url)), "../..");

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: rootDir,
    encoding: "utf8",
    stdio: "inherit",
    ...options,
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

function gitOutput(args) {
  const result = spawnSync("git", args, {
    cwd: rootDir,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "inherit"],
  });

  if (result.status !== 0) {
    return "";
  }

  return (result.stdout ?? "").trim();
}

if (process.env.SKIP_PRE_PUSH === "1") {
  console.log("SKIP_PRE_PUSH=1 — skipping pre-push checks");
  process.exit(0);
}

const branchName = gitOutput(["branch", "--show-current"]);
if (!branchName) {
  console.error("Could not determine current branch.");
  process.exit(1);
}

console.log("→ Validating branch name");
run("node", ["scripts/validate-branch-name.mjs", branchName]);

const baseRef = gitOutput(["rev-parse", "--verify", "origin/main"])
  ? "origin/main"
  : gitOutput(["rev-parse", "--verify", "main"])
    ? "main"
    : "";

if (baseRef) {
  console.log(`→ Validating commit messages (${baseRef}..HEAD)`);
  run("pnpm", ["lint:commits"]);
} else {
  console.log("→ Skipping commit message range lint (no main branch ref found)");
}

if (process.env.PRE_PUSH_FAST === "1") {
  console.log("→ Running fast pre-push checks (PRE_PUSH_FAST=1)");
  run("pnpm", ["lint"]);
  run("pnpm", ["format:check"]);
  run("pnpm", ["typecheck"]);
} else {
  console.log("→ Running CI-aligned pre-push checks (pnpm prepush)");
  run("pnpm", ["prepush"]);
}

console.log("✓ Pre-push checks passed");
