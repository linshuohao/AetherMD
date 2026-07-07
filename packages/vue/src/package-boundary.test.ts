import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "vitest";

import * as vueShell from "./index.js";
import * as vueLegacy from "./legacy.js";

const FORBIDDEN_CORE_REEXPORTS = [
  "bootstrapCore",
  "createCommandEventRuntime",
  "CoreError",
  "createEditor",
  "SUPPORTED_MANIFEST_VERSIONS",
] as const;

const DUPLICATE_MORPHING_CONTRACT_PATTERNS = [
  /export interface CustomBlockRenderer\b/,
  /export interface MorphingBlockStrategy\b/,
  /export interface MorphingStrategyRegistry\b/,
  /export interface ParseBlockMarkdownPayload\b/,
  /export function createMorphingStrategyRegistry\b/,
  /export const PARSE_BLOCK_MARKDOWN_COMMAND\b/,
] as const;

function collectProductionSourceFiles(srcDir: string): string[] {
  const files: string[] = [];

  function walk(currentDir: string): void {
    for (const entry of readdirSync(currentDir, { withFileTypes: true })) {
      const fullPath = join(currentDir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name === "testing") {
          continue;
        }
        walk(fullPath);
        continue;
      }

      if (!/\.ts$/.test(entry.name) || /\.test\.ts$/.test(entry.name)) {
        continue;
      }

      files.push(fullPath);
    }
  }

  walk(srcDir);
  return files.sort();
}

describe("@aether-md/vue package boundary", () => {
  it("exports morphing-first surface without legacy content on primary entry", () => {
    assert.equal(typeof vueShell.AetherEditorRoot, "object");
    assert.equal(typeof vueShell.AetherMorphingDocument, "object");
    assert.equal(typeof vueShell.AetherMorphingContent, "object");
    assert.equal(typeof vueShell.useAetherEditor, "function");
    assert.equal("AetherEditorContent" in vueShell, false);
    assert.equal("AetherLegacyEditorContent" in vueShell, false);
  });

  it("exports legacy content bridge from ./legacy subpath", () => {
    assert.equal(typeof vueLegacy.AetherEditorContent, "object");
    assert.equal(typeof vueLegacy.AetherLegacyEditorContent, "object");
    assert.equal(vueLegacy.AetherLegacyEditorContent, vueLegacy.AetherEditorContent);
  });

  it("does not re-export core internal APIs", () => {
    const exportedKeys = Object.keys(vueShell);

    for (const forbidden of FORBIDDEN_CORE_REEXPORTS) {
      assert.equal(exportedKeys.includes(forbidden), false, `must not re-export ${forbidden}`);
    }
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

  it("imports morphing contracts from @aether-md/morphing-contracts without local duplicates", () => {
    const packageRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
    const srcDir = join(packageRoot, "src");
    const productionFiles = collectProductionSourceFiles(srcDir);
    const contractsReExportPath = join(srcDir, "morphing", "contracts.ts");

    assert.ok(
      productionFiles.includes(contractsReExportPath),
      "expected morphing/contracts.ts re-export",
    );

    for (const filePath of productionFiles) {
      const source = readFileSync(filePath, "utf8");

      if (filePath === contractsReExportPath) {
        assert.match(
          source,
          /from ['"]@aether-md\/morphing-contracts['"]/,
          "morphing/contracts.ts must re-export from @aether-md/morphing-contracts",
        );
        continue;
      }

      for (const pattern of DUPLICATE_MORPHING_CONTRACT_PATTERNS) {
        assert.doesNotMatch(
          source,
          pattern,
          `duplicate morphing contract definition in ${filePath}`,
        );
      }
    }
  });
});
