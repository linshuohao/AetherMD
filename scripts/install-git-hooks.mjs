#!/usr/bin/env node

import { chmodSync, mkdirSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const hooksDir = join(rootDir, ".githooks");

const hookEntries = [
  { name: "pre-commit", script: "scripts/git-hooks/pre-commit.mjs" },
  { name: "commit-msg", script: "scripts/git-hooks/commit-msg.mjs", args: '"$1"' },
  { name: "pre-push", script: "scripts/git-hooks/pre-push.mjs", args: '"$1" "$2"' },
];

function isGitRepo() {
  const result = spawnSync("git", ["rev-parse", "--git-dir"], {
    cwd: rootDir,
    stdio: "ignore",
  });
  return result.status === 0;
}

function writeHook(name, scriptPath, args = "") {
  const hookPath = join(hooksDir, name);
  const argSuffix = args ? ` ${args}` : "";
  const content = `#!/bin/sh
set -e
ROOT="$(CDPATH= cd -- "$(dirname "$0")/.." && pwd)"
exec node "$ROOT/${scriptPath}"${argSuffix}
`;

  writeFileSync(hookPath, content, { mode: 0o755 });
  chmodSync(hookPath, 0o755);
}

if (!isGitRepo()) {
  process.exit(0);
}

mkdirSync(hooksDir, { recursive: true });

for (const hook of hookEntries) {
  writeHook(hook.name, hook.script, hook.args);
}

const configResult = spawnSync("git", ["config", "core.hooksPath", ".githooks"], {
  cwd: rootDir,
  stdio: "inherit",
});

if (configResult.status !== 0) {
  process.exit(configResult.status ?? 1);
}

const installedAt = new Date().toISOString();
writeFileSync(join(hooksDir, ".installed"), `installed-at=${installedAt}\n`, "utf8");

console.log(`Git hooks installed via core.hooksPath=.githooks (installed-at=${installedAt})`);
