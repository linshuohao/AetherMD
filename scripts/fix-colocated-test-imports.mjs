#!/usr/bin/env node
import { readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const roots = [
  "packages/core/src",
  "packages/preset-gfm/src",
  "packages/plugins/plugin-remark/src",
  "packages/plugins/plugin-prosemirror/src",
  "packages/react/src",
  "examples/block-morphing/src",
];

function walk(dir, files = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      if (entry === "testing") {
        continue;
      }
      walk(full, files);
    } else if (/\.test\.tsx?$/.test(entry)) {
      files.push(full);
    }
  }
  return files;
}

function fixContent(content) {
  return content
    .replace(/from (['"])\.\/src\//g, "from $1./")
    .replace(/from (['"])\.\.\/src\//g, "from $1../")
    .replace(/from (['"])\.\.\/\.\.\/helpers\//g, 'from "../testing/')
    .replace(/from (['"])\.\.\/helpers\//g, 'from "../testing/');
}

for (const root of roots) {
  for (const file of walk(resolve(repoRoot, root))) {
    const original = readFileSync(file, "utf8");
    const fixed = fixContent(original);
    if (fixed !== original) {
      writeFileSync(file, fixed);
      console.log("fixed", file.replace(repoRoot + "/", ""));
    }
  }
}

for (const testRoot of [
  "packages/core/test",
  "packages/react/test",
  "packages/preset-gfm/test",
  "packages/plugins/plugin-remark/test",
  "packages/plugins/plugin-prosemirror/test",
  "examples/block-morphing/test",
]) {
  const abs = resolve(repoRoot, testRoot);
  try {
    rmSync(abs, { recursive: true, force: true });
    console.log("removed", testRoot);
  } catch {
    // ignore
  }
}

console.log("import fix complete");
