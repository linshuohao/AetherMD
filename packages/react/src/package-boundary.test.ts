import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
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

describe("@aether-md/react package boundary", () => {
  it("exports AetherEditorRoot, AetherEditorContent, AetherMorphingContent, and useAetherEditor", () => {
    assert.equal(typeof reactShell.AetherEditorRoot, "function");
    assert.equal(typeof reactShell.AetherEditorContent, "function");
    assert.equal(typeof reactShell.AetherMorphingContent, "function");
    assert.equal(typeof reactShell.useAetherEditor, "function");
  });

  it("does not re-export core internal APIs or ShellAdapter", () => {
    const exportedKeys = Object.keys(reactShell);

    for (const forbidden of FORBIDDEN_CORE_REEXPORTS) {
      assert.equal(
        exportedKeys.includes(forbidden),
        false,
        `must not re-export ${forbidden}`,
      );
    }

    assert.equal(exportedKeys.includes("ShellAdapter"), false);
  });

  it("does not import prosemirror-view in production source files", () => {
    const packageRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
    const srcDir = join(packageRoot, "src");
    const productionFiles = [
      "index.ts",
      "types.ts",
      "aether-editor-root.tsx",
      "aether-editor-content.tsx",
      "aether-morphing-content.tsx",
      "morphing/paragraph-render.tsx",
      "gate-lock.ts",
      "context.tsx",
      "use-aether-editor.ts",
    ].map((file) => join(srcDir, file));

    for (const filePath of productionFiles) {
      const source = readFileSync(filePath, "utf8");
      assert.doesNotMatch(source, /from ['"]prosemirror-view['"]/);
    }
  });
});
