#!/usr/bin/env node

import { spawnSync } from "node:child_process";

const commitMsgFile = process.argv[2];

if (!commitMsgFile) {
  console.error("Usage: node scripts/git-hooks/commit-msg.mjs <commit-msg-file>");
  process.exit(1);
}

const result = spawnSync(
  "pnpm",
  ["exec", "commitlint", "--config", ".commitlintrc.cjs", "--edit", commitMsgFile],
  { stdio: "inherit" },
);

process.exit(result.status ?? 1);
