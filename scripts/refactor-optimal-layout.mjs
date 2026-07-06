#!/usr/bin/env node
/**
 * Optimal production src/ layout migration.
 * Run from repo root: node scripts/refactor-optimal-layout.mjs
 */
import { execSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

/** @type {Array<{ from: string; to: string }>} */
const CORE_MOVES = [
  { from: "packages/core/src/bootstrap.ts", to: "packages/core/src/bootstrap/bootstrap.ts" },
  { from: "packages/core/src/lifecycle.ts", to: "packages/core/src/bootstrap/lifecycle.ts" },
  { from: "packages/core/src/manifest.ts", to: "packages/core/src/manifest/manifest.ts" },
  { from: "packages/core/src/capabilities.ts", to: "packages/core/src/manifest/capabilities.ts" },
  { from: "packages/core/src/dependencies.ts", to: "packages/core/src/manifest/dependencies.ts" },
  {
    from: "packages/core/src/command-event-runtime.ts",
    to: "packages/core/src/command-event/runtime.ts",
  },
  {
    from: "packages/core/src/command-event-types.ts",
    to: "packages/core/src/command-event/types.ts",
  },
  { from: "packages/core/src/document-model.ts", to: "packages/core/src/document/model.ts" },
  { from: "packages/core/src/block-ids.ts", to: "packages/core/src/document/block-ids.ts" },
  { from: "packages/core/src/adapter-types.ts", to: "packages/core/src/document/adapter-types.ts" },
  { from: "packages/core/src/morphing-types.ts", to: "packages/core/src/morphing/types.ts" },
];

/** @type {Array<{ from: string; to: string }>} */
const REACT_MOVES = [
  {
    from: "packages/react/src/aether-editor-root.tsx",
    to: "packages/react/src/shell/aether-editor-root.tsx",
  },
  {
    from: "packages/react/src/aether-editor-content.tsx",
    to: "packages/react/src/shell/aether-editor-content.tsx",
  },
  {
    from: "packages/react/src/use-aether-editor.ts",
    to: "packages/react/src/shell/use-aether-editor.ts",
  },
  { from: "packages/react/src/context.tsx", to: "packages/react/src/shell/context.tsx" },
  { from: "packages/react/src/gate-lock.ts", to: "packages/react/src/shell/gate-lock.ts" },
  { from: "packages/react/src/types.ts", to: "packages/react/src/shell/types.ts" },
  {
    from: "packages/react/src/aether-morphing-content.tsx",
    to: "packages/react/src/morphing/aether-morphing-content.tsx",
  },
  {
    from: "packages/react/src/aether-morphing-document.tsx",
    to: "packages/react/src/morphing/aether-morphing-document.tsx",
  },
  { from: "packages/react/src/test-setup.ts", to: "packages/react/vitest.setup.ts" },
];

const CORE_IMPORT_REWRITES = [
  [/from "\.\/bootstrap\.js"/g, 'from "./bootstrap/bootstrap.js"'],
  [/from "\.\/lifecycle\.js"/g, 'from "./bootstrap/lifecycle.js"'],
  [/from "\.\/manifest\.js"/g, 'from "./manifest/manifest.js"'],
  [/from "\.\/capabilities\.js"/g, 'from "./manifest/capabilities.js"'],
  [/from "\.\/dependencies\.js"/g, 'from "./manifest/dependencies.js"'],
  [/from "\.\/command-event-runtime\.js"/g, 'from "./command-event/runtime.js"'],
  [/from "\.\/command-event-types\.js"/g, 'from "./command-event/types.js"'],
  [/from "\.\/document-model\.js"/g, 'from "./document/model.js"'],
  [/from "\.\/block-ids\.js"/g, 'from "./document/block-ids.js"'],
  [/from "\.\/adapter-types\.js"/g, 'from "./document/adapter-types.js"'],
  [/from "\.\/morphing-types\.js"/g, 'from "./morphing/types.js"'],
  [/from "\.\.\/bootstrap\.js"/g, 'from "../bootstrap/bootstrap.js"'],
  [/from "\.\.\/lifecycle\.js"/g, 'from "../bootstrap/lifecycle.js"'],
  [/from "\.\.\/manifest\.js"/g, 'from "../manifest/manifest.js"'],
  [/from "\.\.\/capabilities\.js"/g, 'from "../manifest/capabilities.js"'],
  [/from "\.\.\/dependencies\.js"/g, 'from "../manifest/dependencies.js"'],
  [/from "\.\.\/command-event-runtime\.js"/g, 'from "../command-event/runtime.js"'],
  [/from "\.\.\/command-event-types\.js"/g, 'from "../command-event/types.js"'],
  [/from "\.\.\/document-model\.js"/g, 'from "../document/model.js"'],
  [/from "\.\.\/block-ids\.js"/g, 'from "../document/block-ids.js"'],
  [/from "\.\.\/adapter-types\.js"/g, 'from "../document/adapter-types.js"'],
  [/from "\.\.\/morphing-types\.js"/g, 'from "../morphing/types.js"'],
];

const REACT_IMPORT_REWRITES = [
  [/from "\.\/aether-editor-root\.js"/g, 'from "./shell/aether-editor-root.js"'],
  [/from "\.\/aether-editor-content\.js"/g, 'from "./shell/aether-editor-content.js"'],
  [/from "\.\/use-aether-editor\.js"/g, 'from "./shell/use-aether-editor.js"'],
  [/from "\.\/context\.js"/g, 'from "./shell/context.js"'],
  [/from "\.\/gate-lock\.js"/g, 'from "./shell/gate-lock.js"'],
  [/from "\.\/types\.js"/g, 'from "./shell/types.js"'],
  [/from "\.\/aether-morphing-content\.js"/g, 'from "./morphing/aether-morphing-content.js"'],
  [/from "\.\/aether-morphing-document\.js"/g, 'from "./morphing/aether-morphing-document.js"'],
  [/from "\.\.\/use-aether-editor\.js"/g, 'from "../shell/use-aether-editor.js"'],
  [/from "\.\.\/context\.js"/g, 'from "../shell/context.js"'],
  [/from "\.\.\/gate-lock\.js"/g, 'from "../shell/gate-lock.js"'],
  [/from "\.\.\/types\.js"/g, 'from "../shell/types.js"'],
  [/from "\.\.\/aether-editor-root\.js"/g, 'from "../shell/aether-editor-root.js"'],
];

function walk(dir, files = []) {
  if (!existsSync(dir)) {
    return files;
  }
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      if (entry === "testing" || entry === "demo") {
        continue;
      }
      walk(full, files);
    } else if (/\.(ts|tsx)$/.test(entry)) {
      files.push(full);
    }
  }
  return files;
}

function applyRewrites(content, rewrites) {
  let next = content;
  for (const [pattern, replacement] of rewrites) {
    next = next.replace(pattern, replacement);
  }
  return next;
}

function moveFiles(moves) {
  for (const { from, to } of moves) {
    const fromAbs = resolve(repoRoot, from);
    const toAbs = resolve(repoRoot, to);
    if (!existsSync(fromAbs)) {
      console.warn(`skip missing: ${from}`);
      continue;
    }
    execSync(`mkdir -p "${dirname(toAbs)}" && git mv "${fromAbs}" "${toAbs}"`, {
      cwd: repoRoot,
      stdio: "inherit",
    });
  }
}

console.log("=== core moves ===");
moveFiles(CORE_MOVES);

console.log("=== react moves ===");
moveFiles(REACT_MOVES);

console.log("=== rewrite core imports ===");
for (const file of walk(resolve(repoRoot, "packages/core/src"))) {
  const original = readFileSync(file, "utf8");
  const updated = applyRewrites(original, CORE_IMPORT_REWRITES);
  if (updated !== original) {
    writeFileSync(file, updated);
    console.log("core:", relative(repoRoot, file));
  }
}

console.log("=== rewrite react imports ===");
const reactRewritesExtended = [
  ...REACT_IMPORT_REWRITES,
  [/from "\.\/morphing\/morphing-block-surface\.js"/g, 'from "./morphing-block-surface.js"'],
  [/from "\.\/morphing\/morphing-focus-context\.js"/g, 'from "./morphing-focus-context.js"'],
  [/from "\.\.\/use-aether-editor\.js"/g, 'from "../shell/use-aether-editor.js"'],
];

for (const dir of [
  resolve(repoRoot, "packages/react/src"),
  join(repoRoot, "packages/react/src/demo"),
  join(repoRoot, "packages/react/src/morphing"),
  join(repoRoot, "packages/react/src/testing"),
]) {
  for (const file of walk(dir)) {
    const original = readFileSync(file, "utf8");
    const updated = applyRewrites(original, reactRewritesExtended);
    if (updated !== original) {
      writeFileSync(file, updated);
      console.log("react:", relative(repoRoot, file));
    }
  }
}

console.log("=== update core index ===");
const coreIndexPath = resolve(repoRoot, "packages/core/src/index.ts");
let coreIndex = readFileSync(coreIndexPath, "utf8");
coreIndex = applyRewrites(coreIndex, CORE_IMPORT_REWRITES);
writeFileSync(coreIndexPath, coreIndex);

console.log("=== update react index ===");
const reactIndexPath = resolve(repoRoot, "packages/react/src/index.ts");
let reactIndex = `export type { AetherMorphingContentProps } from "./morphing/aether-morphing-content.js";
export type { AetherEditorRootProps, UseAetherEditorResult } from "./shell/types.js";
export { AetherEditorRoot } from "./shell/aether-editor-root.js";
export { AetherEditorContent } from "./shell/aether-editor-content.js";
export { AetherMorphingContent } from "./morphing/aether-morphing-content.js";
export { AetherMorphingDocument } from "./morphing/aether-morphing-document.js";
export { useAetherEditor } from "./shell/use-aether-editor.js";
export { shouldApplyControlledValue } from "./shell/gate-lock.js";
`;
writeFileSync(reactIndexPath, reactIndex);

console.log("done");
