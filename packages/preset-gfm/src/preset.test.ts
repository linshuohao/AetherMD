import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "vitest";

import { createGfmPreset, gfmManifest } from "./index.js";

describe("@aether-md/preset-gfm Manifest and factory", () => {
  it("exports GFM manifest with manifestVersion 1 and name gfm", () => {
    assert.equal(gfmManifest.metadata.manifestVersion, 1);
    assert.equal(gfmManifest.metadata.name, "gfm");
  });

  it("createGfmPreset returns manifest and wired adapter references", () => {
    const preset = createGfmPreset();

    assert.equal(preset.manifest.metadata.name, "gfm");
    assert.equal(preset.parser.name, "remark-parser");
    assert.equal(preset.serializer.name, "remark-serializer");
    assert.equal(preset.engine.name, "prosemirror-engine");
  });

  it("does not require createEditor or bootstrapCore in factory imports", () => {
    const sourcePath = join(dirname(fileURLToPath(import.meta.url)), "index.ts");
    const source = readFileSync(sourcePath, "utf8");
    const importLines = source.split("\n").filter((line) => line.trimStart().startsWith("import "));

    for (const line of importLines) {
      assert.doesNotMatch(line, /createEditor|bootstrapCore|@aether-md\/react|AetherEditor/);
    }
  });

  it("depends on plugin packages rather than inlining remark or prosemirror syntax", () => {
    const packagePath = join(dirname(fileURLToPath(import.meta.url)), "..", "package.json");
    const pkg = JSON.parse(readFileSync(packagePath, "utf8")) as {
      dependencies: Record<string, string>;
    };

    assert.ok(pkg.dependencies["@aether-md/plugin-remark"]);
    assert.ok(pkg.dependencies["@aether-md/plugin-prosemirror"]);
    assert.equal(pkg.dependencies.remark, undefined);
    assert.equal(pkg.dependencies["prosemirror-model"], undefined);
  });
});
