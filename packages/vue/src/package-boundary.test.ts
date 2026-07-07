import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "vitest";

import * as vueShell from "./index.js";

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
  it("exports AetherEditorRoot, AetherEditorContent, and useAetherEditor", () => {
    assert.equal(typeof vueShell.AetherEditorRoot, "object");
    assert.equal(typeof vueShell.AetherEditorContent, "object");
    assert.equal(typeof vueShell.useAetherEditor, "function");
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
});
