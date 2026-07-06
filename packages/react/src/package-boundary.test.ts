import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

import * as reactShell from "./index.js";

const FORBIDDEN_CORE_REEXPORTS = [
  "bootstrapCore",
  "createCommandEventRuntime",
  "CoreError",
  "createEditor",
  "SUPPORTED_MANIFEST_VERSIONS",
] as const;

function collectProductionSourceFiles(srcDir: string): string[] {
  const files: string[] = [];

  function walk(currentDir: string): void {
    for (const entry of readdirSync(currentDir, { withFileTypes: true })) {
      const fullPath = join(currentDir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
        continue;
      }

      if (!/\.(ts|tsx)$/.test(entry.name)) {
        continue;
      }
      if (/\.test\.(ts|tsx)$/.test(entry.name)) {
        continue;
      }
      if (entry.name === "test-setup.ts" || entry.name === "test-helpers.ts") {
        continue;
      }

      files.push(fullPath);
    }
  }

  walk(srcDir);
  return files.sort();
}

describe("@aether-md/react package boundary", () => {
  it("exports AetherEditorRoot, AetherEditorContent, AetherMorphingContent, AetherMorphingDocument, and useAetherEditor", () => {
    assert.equal(typeof reactShell.AetherEditorRoot, "function");
    assert.equal(typeof reactShell.AetherEditorContent, "function");
    assert.equal(typeof reactShell.AetherMorphingContent, "function");
    assert.equal(typeof reactShell.AetherMorphingDocument, "function");
    assert.equal(typeof reactShell.useAetherEditor, "function");
  });

  it("does not re-export core internal APIs or ShellAdapter", () => {
    const exportedKeys = Object.keys(reactShell);

    for (const forbidden of FORBIDDEN_CORE_REEXPORTS) {
      assert.equal(exportedKeys.includes(forbidden), false, `must not re-export ${forbidden}`);
    }

    assert.equal(exportedKeys.includes("ShellAdapter"), false);
  });

  it("does not import @aether-md/preset-gfm in production source files", () => {
    const packageRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
    const srcDir = join(packageRoot, "src");
    const productionFiles = collectProductionSourceFiles(srcDir);

    for (const filePath of productionFiles) {
      const source = readFileSync(filePath, "utf8");
      assert.doesNotMatch(
        source,
        /from ['"]@aether-md\/preset-gfm['"]/,
        `unexpected preset-gfm import in ${filePath}`,
      );
    }
  });

  it("does not import prosemirror-view in production source files", () => {
    const packageRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
    const srcDir = join(packageRoot, "src");
    const productionFiles = collectProductionSourceFiles(srcDir);

    assert.ok(productionFiles.length > 0, "expected production source files");

    for (const filePath of productionFiles) {
      const source = readFileSync(filePath, "utf8");
      assert.doesNotMatch(
        source,
        /from ['"]prosemirror-view['"]/,
        `unexpected prosemirror-view import in ${filePath}`,
      );
    }
  });
});
