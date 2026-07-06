#!/usr/bin/env node

import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const rulesetPath = path.join(repoRoot, ".github/rulesets/main.json");
const ruleset = JSON.parse(readFileSync(rulesetPath, "utf8"));

function runGh(args, input) {
  const result = spawnSync("gh", args, {
    encoding: "utf8",
    input,
    stdio: ["pipe", "pipe", "pipe"],
  });

  if (result.status !== 0) {
    throw new Error(result.stderr || result.stdout || `gh ${args.join(" ")} failed`);
  }

  return result.stdout.trim();
}

function ghJson(args, input) {
  const output = runGh([...args, "--jq", "."], input);
  return output ? JSON.parse(output) : null;
}

const { owner, name: repo } = ghJson(["repo", "view", "--json", "owner,name"]);
const fullName = `${owner.login}/${repo}`;
const payload = JSON.stringify(ruleset);

const existing = ghJson(["api", `repos/${fullName}/rulesets`, "--method", "GET", "--paginate"]);
const current = existing.find((entry) => entry.name === ruleset.name);

if (current) {
  runGh(
    ["api", `repos/${fullName}/rulesets/${current.id}`, "--method", "PUT", "--input", "-"],
    payload,
  );
  console.log(`Updated ruleset "${ruleset.name}" (id ${current.id}) on ${fullName}.`);
} else {
  const created = ghJson(
    ["api", `repos/${fullName}/rulesets`, "--method", "POST", "--input", "-"],
    payload,
  );
  console.log(`Created ruleset "${ruleset.name}" (id ${created.id}) on ${fullName}.`);
}

console.log("Required status checks:");
for (const check of ruleset.rules.find((rule) => rule.type === "required_status_checks").parameters
  .required_status_checks) {
  console.log(`- ${check.context}`);
}
