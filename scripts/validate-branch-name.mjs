#!/usr/bin/env node

const BRANCH_PATTERN =
  /^(docs|spec|feature|feat|fix|test|chore|ci|build|refactor|codex|cursor)\/[a-z0-9]+(-[a-z0-9]+)*$/;

const branchName = process.argv[2] ?? process.env.BRANCH_NAME ?? "";

if (!branchName) {
  console.error("Usage: node scripts/validate-branch-name.mjs <branch-name>");
  process.exit(1);
}

if (branchName === "main") {
  console.error("Direct pushes to main are not allowed. Create a scoped branch and open a PR.");
  process.exit(1);
}

if (!BRANCH_PATTERN.test(branchName)) {
  console.error(`Branch name '${branchName}' must match <type>/<kebab-topic>.`);
  console.error(
    "Allowed types: docs, spec, feature, feat, fix, test, chore, ci, build, refactor, codex, cursor.",
  );
  process.exit(1);
}

console.log(`Branch name OK: ${branchName}`);
