#!/usr/bin/env node

/**
 * Validate Workflow Traceability fields in a PR body or markdown file.
 * Usage: node scripts/check-workflow-pr-traceability.mjs [--] [file]
 * If no file is given, reads stdin.
 */

import { readFileSync } from "node:fs";

const MAINTENANCE_FIELDS = [
  "Path: Maintenance",
  "Classification:",
  "Changed files:",
  "Validation:",
];

const QUICK_CHANGE_FIELDS = [
  "Path: Quick Change",
  "Classification:",
  "Source docs:",
  "Allowed scope:",
  "Changed files:",
  "Escalation checked:",
  "Validation:",
  "Version impact:",
  "Suggested commit scope:",
];

function readInput(pathArg) {
  const dashIndex = process.argv.indexOf("--");
  const args = dashIndex >= 0 ? process.argv.slice(dashIndex + 1) : process.argv.slice(2);
  const file = pathArg ?? args[0];
  if (file) {
    return readFileSync(file, "utf8");
  }
  return readFileSync(0, "utf8");
}

function missingFields(body, fields) {
  return fields.filter((field) => !body.includes(field));
}

function main() {
  const body = readInput().trim();

  if (body.length === 0 || !body.includes("## Workflow Traceability")) {
    console.log("workflow-pr-check: no Workflow Traceability section; skip");
    process.exit(0);
  }

  let required;
  if (body.includes("Path: Maintenance")) {
    required = MAINTENANCE_FIELDS;
  } else if (body.includes("Path: Quick Change")) {
    required = QUICK_CHANGE_FIELDS;
  } else if (body.includes("Path: Spec Change") || body.includes("Path: Full Change")) {
    if (!/add-[a-z0-9-]+|change name|OpenSpec change/i.test(body)) {
      console.error("workflow-pr-check: Spec/Full Change PR should reference change name");
      process.exit(1);
    }
    console.log("workflow-pr-check: Spec/Full Change traceability ok");
    process.exit(0);
  } else {
    console.error("workflow-pr-check: unknown Path value in Workflow Traceability");
    process.exit(1);
  }

  const missing = missingFields(body, required);
  if (missing.length > 0) {
    console.error("workflow-pr-check: missing fields:");
    for (const field of missing) {
      console.error(`  - ${field}`);
    }
    process.exit(1);
  }

  console.log("workflow-pr-check: pass");
}

main();
