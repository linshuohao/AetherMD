#!/usr/bin/env node
/**
 * Move test/ → colocated src/, rewrite imports for Vitest.
 * Run from repo root: node scripts/migrate-vitest-colocate.mjs
 */
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

/** @type {Array<{ from: string; to: string }>} */
const MOVES = [
  { from: "packages/core/test/unit/block-ids.test.ts", to: "packages/core/src/block-ids.test.ts" },
  {
    from: "packages/core/test/unit/adapter-types.test.ts",
    to: "packages/core/src/adapter-types.test.ts",
  },
  { from: "packages/core/test/unit/bootstrap.test.ts", to: "packages/core/src/bootstrap.test.ts" },
  {
    from: "packages/core/test/unit/capabilities.test.ts",
    to: "packages/core/src/capabilities.test.ts",
  },
  {
    from: "packages/core/test/unit/command-event-runtime.test.ts",
    to: "packages/core/src/command-event-runtime.test.ts",
  },
  {
    from: "packages/core/test/unit/dependencies.test.ts",
    to: "packages/core/src/dependencies.test.ts",
  },
  {
    from: "packages/core/test/unit/document-model.test.ts",
    to: "packages/core/src/document-model.test.ts",
  },
  { from: "packages/core/test/unit/lifecycle.test.ts", to: "packages/core/src/lifecycle.test.ts" },
  { from: "packages/core/test/unit/manifest.test.ts", to: "packages/core/src/manifest.test.ts" },
  {
    from: "packages/core/test/unit/manifest-doc-consistency.test.ts",
    to: "packages/core/src/manifest-doc-consistency.test.ts",
  },
  {
    from: "packages/core/test/boundary/package-boundary.test.ts",
    to: "packages/core/src/package-boundary.test.ts",
  },
  {
    from: "packages/core/test/unit/editor/types.test.ts",
    to: "packages/core/src/editor/types.test.ts",
  },
  {
    from: "packages/core/test/unit/editor/context.test.ts",
    to: "packages/core/src/editor/context.test.ts",
  },
  {
    from: "packages/core/test/unit/editor/conflict-resolver.test.ts",
    to: "packages/core/src/editor/conflict-resolver.test.ts",
  },
  {
    from: "packages/core/test/unit/editor/adapter-wiring.test.ts",
    to: "packages/core/src/editor/adapter-wiring.test.ts",
  },
  {
    from: "packages/core/test/unit/editor/engine-dispatch.test.ts",
    to: "packages/core/src/editor/engine-dispatch.test.ts",
  },
  {
    from: "packages/core/test/integration/editor/editor-orchestration.test.ts",
    to: "packages/core/src/editor/editor-orchestration.test.ts",
  },
  {
    from: "packages/core/test/integration/editor/create-editor-gfm.test.ts",
    to: "packages/core/src/editor/create-editor-gfm.test.ts",
  },
  {
    from: "packages/core/test/integration/editor/startup-abort.test.ts",
    to: "packages/core/src/editor/startup-abort.test.ts",
  },
  {
    from: "packages/plugins/plugin-remark/test/unit/parser.test.ts",
    to: "packages/plugins/plugin-remark/src/parser.test.ts",
  },
  {
    from: "packages/plugins/plugin-remark/test/unit/serializer.test.ts",
    to: "packages/plugins/plugin-remark/src/serializer.test.ts",
  },
  {
    from: "packages/plugins/plugin-prosemirror/test/fixtures/gfm-doc.ts",
    to: "packages/plugins/plugin-prosemirror/src/testing/fixtures/gfm-doc.ts",
  },
  {
    from: "packages/plugins/plugin-prosemirror/test/unit/conversion.test.ts",
    to: "packages/plugins/plugin-prosemirror/src/conversion.test.ts",
  },
  {
    from: "packages/plugins/plugin-prosemirror/test/unit/engine.test.ts",
    to: "packages/plugins/plugin-prosemirror/src/engine.test.ts",
  },
  {
    from: "packages/plugins/plugin-prosemirror/test/integration/round-trip.test.ts",
    to: "packages/plugins/plugin-prosemirror/src/round-trip.test.ts",
  },
  {
    from: "packages/plugins/plugin-prosemirror/test/integration/view-bridge.test.ts",
    to: "packages/plugins/plugin-prosemirror/src/view-bridge.test.ts",
  },
  {
    from: "packages/preset-gfm/test/unit/inline-morphing.test.ts",
    to: "packages/preset-gfm/src/inline-morphing.test.ts",
  },
  {
    from: "packages/preset-gfm/test/unit/preset.test.ts",
    to: "packages/preset-gfm/src/preset.test.ts",
  },
  {
    from: "packages/preset-gfm/test/integration/round-trip.test.ts",
    to: "packages/preset-gfm/src/round-trip.test.ts",
  },
  { from: "packages/react/test/setup.ts", to: "packages/react/src/test-setup.ts" },
  {
    from: "packages/react/test/helpers/gfm-plugins.ts",
    to: "packages/react/src/testing/gfm-plugins.ts",
  },
  {
    from: "packages/react/test/helpers/morphing-fixtures.ts",
    to: "packages/react/src/testing/morphing-fixtures.ts",
  },
  {
    from: "packages/react/test/unit/gate-lock.test.ts",
    to: "packages/react/src/gate-lock.test.ts",
  },
  {
    from: "packages/react/test/unit/use-aether-editor.test.ts",
    to: "packages/react/src/use-aether-editor.test.ts",
  },
  {
    from: "packages/react/test/boundary/package-boundary.test.ts",
    to: "packages/react/src/package-boundary.test.ts",
  },
  {
    from: "packages/react/test/integration/gfm-react-smoke.test.tsx",
    to: "packages/react/src/gfm-react-smoke.test.tsx",
  },
  {
    from: "packages/react/test/integration/react-shell.test.tsx",
    to: "packages/react/src/react-shell.test.tsx",
  },
  {
    from: "packages/react/test/integration/gate-lock.test.tsx",
    to: "packages/react/src/gate-lock.integration.test.tsx",
  },
  {
    from: "packages/react/test/integration/block-identity.test.tsx",
    to: "packages/react/src/morphing/block-identity.test.tsx",
  },
  {
    from: "packages/react/test/integration/block-morphing/slice-a.test.tsx",
    to: "packages/react/src/morphing/slice-a.test.tsx",
  },
  {
    from: "packages/react/test/integration/block-morphing/slice-b.test.tsx",
    to: "packages/react/src/morphing/slice-b.test.tsx",
  },
  {
    from: "packages/react/test/integration/block-morphing/slice-c.test.tsx",
    to: "packages/react/src/morphing/slice-c.test.tsx",
  },
  {
    from: "packages/react/test/integration/block-morphing/slice-d.test.tsx",
    to: "packages/react/src/morphing/slice-d.test.tsx",
  },
  {
    from: "packages/react/test/integration/demo/pr0-acceptance.test.tsx",
    to: "packages/react/src/demo/pr0-acceptance.test.tsx",
  },
  {
    from: "packages/react/test/integration/demo/typing-sync.test.tsx",
    to: "packages/react/src/demo/typing-sync.test.tsx",
  },
  {
    from: "examples/block-morphing/test/setup.ts",
    to: "examples/block-morphing/src/test-setup.ts",
  },
  {
    from: "examples/block-morphing/test/integration/smoke.test.tsx",
    to: "examples/block-morphing/src/smoke.test.tsx",
  },
];

function packageRoot(filePath) {
  let dir = dirname(resolve(repoRoot, filePath));
  while (dir.startsWith(repoRoot)) {
    if (existsSync(join(dir, "package.json"))) {
      return dir;
    }
    const parent = dirname(dir);
    if (parent === dir) {
      break;
    }
    dir = parent;
  }
  throw new Error(`cannot resolve package root for ${filePath}`);
}

function packageSrcDir(filePath) {
  return join(packageRoot(filePath), "src");
}

function toJsImport(fromFile, targetWithoutExt) {
  let rel = relative(dirname(fromFile), targetWithoutExt).replace(/\\/g, "/");
  if (!rel.startsWith(".")) {
    rel = `./${rel}`;
  }
  return `${rel}.js`;
}

function rewriteImports(content, oldFile, newFile) {
  const oldAbs = resolve(repoRoot, oldFile);
  const newAbs = resolve(repoRoot, newFile);
  const srcDir = packageSrcDir(newFile);
  let next = content;

  next = next.replace(/^import ["'][^"']*setup\.js["'];\n?/gm, "");
  next = next.replace(/from (['"])(?:\.\.\/)+dist\/([^'"]+)\1/g, (_match, quote, distPath) => {
    const target = join(srcDir, distPath.replace(/\.js$/, ""));
    return `from ${quote}${toJsImport(newAbs, target)}${quote}`;
  });
  next = next.replace(
    /from (['"])(?:\.\.\/)+preset-gfm\/dist\/index\.js\1/g,
    'from "@aether-md/preset-gfm"',
  );
  next = next.replace(/from (['"])node:test\1/g, 'from "vitest"');
  next = next.replace(
    /from (['"])\.\.\/fixtures\/gfm-doc\.js\1/g,
    'from "./testing/fixtures/gfm-doc.js"',
  );
  next = next.replace(/from (['"])\.\.\/\.\.\/dist\/index\.js\1/g, (_m, quote) => {
    const target = join(srcDir, "index");
    return `from ${quote}${toJsImport(newAbs, target)}${quote}`;
  });
  next = next.replace(/from (['"])\.\.\/helpers\/([^'"]+)\1/g, (_m, quote, helper) => {
    const target = join(srcDir, "testing", helper.replace(/\.js$/, ""));
    return `from ${quote}${toJsImport(newAbs, target)}${quote}`;
  });

  const oldDir = dirname(oldAbs);
  const newDir = dirname(newAbs);
  next = next.replace(/from (['"])(\.[^'"]+)\1/g, (match, quote, specifier) => {
    if (specifier.includes("/dist/") || specifier.includes("@aether-md/")) {
      return match;
    }
    const oldTarget = resolve(oldDir, specifier.replace(/\.js$/, ""));
    const candidates = [`${oldTarget}.ts`, `${oldTarget}.tsx`, oldTarget];
    let resolved = null;
    for (const candidate of candidates) {
      if (existsSync(candidate)) {
        resolved = candidate;
        break;
      }
    }
    if (!resolved) {
      return match;
    }
    const newTarget = join(newDir, relative(oldDir, resolved));
    if (!existsSync(newTarget) && !existsSync(resolved)) {
      return match;
    }
    const actualTarget = existsSync(newTarget) ? newTarget : resolved;
    return `from ${quote}${toJsImport(newAbs, actualTarget.replace(/\.tsx?$/, ""))}${quote}`;
  });

  return next;
}

function fixRepoRootPaths(content, newFile) {
  let next = content;
  if (newFile.includes("manifest-doc-consistency.test.ts")) {
    next = next.replace(
      /join\(dirname\(fileURLToPath\(import\.meta\.url\)\), "\.\.", "\.\.", "\.\."\)/g,
      'join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..")',
    );
  }
  if (newFile.includes("package-boundary.test.ts") && newFile.includes("packages/core")) {
    next = next
      .replace(
        /join\(\s*dirname\(fileURLToPath\(import\.meta\.url\)\),\s*"\.\.",\s*"\.\.",\s*"\.\.",\s*"preset-gfm"/,
        'join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..", "preset-gfm"',
      )
      .replace(
        /join\(dirname\(fileURLToPath\(import\.meta\.url\)\), "\.\.", "\.\.", "package\.json"\)/,
        'join(dirname(fileURLToPath(import.meta.url)), "..", "package.json")',
      );
  }
  if (newFile.includes("package-boundary.test.ts") && newFile.includes("packages/react")) {
    next = next.replace(
      /join\(dirname\(fileURLToPath\(import\.meta\.url\)\), "\.\.", "\.\."\)/g,
      'join(dirname(fileURLToPath(import.meta.url)), "..")',
    );
  }
  if (newFile.includes("preset.test.ts")) {
    next = next
      .replace(
        /join\(dirname\(fileURLToPath\(import\.meta\.url\)\), "\.\.", "\.\.", "src", "index\.ts"\)/,
        'join(dirname(fileURLToPath(import.meta.url)), "index.ts")',
      )
      .replace(
        /join\(dirname\(fileURLToPath\(import\.meta\.url\)\), "\.\.", "\.\.", "package\.json"\)/,
        'join(dirname(fileURLToPath(import.meta.url)), "..", "package.json")',
      );
  }
  if (newFile.includes("adapter-types.test.ts")) {
    next = next.replace(
      /join\(dirname\(fileURLToPath\(import\.meta\.url\)\), "\.\.", "\.\.", "package\.json"\)/,
      'join(dirname(fileURLToPath(import.meta.url)), "..", "package.json")',
    );
  }
  if (newFile.includes("round-trip.test.ts")) {
    next = next.replace(
      /join\(dirname\(fileURLToPath\(import\.meta\.url\)\), "\.\.", "\.\.", "package\.json"\)/g,
      'join(dirname(fileURLToPath(import.meta.url)), "..", "package.json")',
    );
  }
  return next;
}

for (const { from, to } of MOVES) {
  const fromAbs = resolve(repoRoot, from);
  const toAbs = resolve(repoRoot, to);
  if (!existsSync(fromAbs)) {
    console.warn(`skip missing: ${from}`);
    continue;
  }
  mkdirSync(dirname(toAbs), { recursive: true });
  const content = fixRepoRootPaths(rewriteImports(readFileSync(fromAbs, "utf8"), from, to), to);
  writeFileSync(toAbs, content);
  unlinkSync(fromAbs);
  console.log(`moved ${from} -> ${to}`);
}

const duplicateFixture = resolve(
  repoRoot,
  "packages/plugins/plugin-prosemirror/src/fixtures/gfm-doc.ts",
);
if (existsSync(duplicateFixture)) {
  unlinkSync(duplicateFixture);
}

function removeEmptyDirs(dir) {
  if (!existsSync(dir)) {
    return;
  }
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      removeEmptyDirs(join(dir, entry.name));
    }
  }
  if (readdirSync(dir).length === 0) {
    rmSync(dir, { recursive: true });
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
  removeEmptyDirs(resolve(repoRoot, testRoot));
}

const tsconfigTests = [
  "packages/core/tsconfig.test.json",
  "packages/react/tsconfig.test.json",
  "packages/preset-gfm/tsconfig.test.json",
  "packages/plugins/plugin-remark/tsconfig.test.json",
  "packages/plugins/plugin-prosemirror/tsconfig.test.json",
  "examples/block-morphing/tsconfig.test.json",
];
for (const file of tsconfigTests) {
  const abs = resolve(repoRoot, file);
  if (existsSync(abs)) {
    unlinkSync(abs);
  }
}

console.log("colocate migration complete");
