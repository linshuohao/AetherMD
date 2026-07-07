import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "vitest";

import * as core from "./index.js";
import { CORE_BUILTIN_CAPABILITIES } from "./manifest/capabilities.js";

describe("@aether-md/core package boundary", () => {
  it("exposes core bootstrap runtime surface", () => {
    assert.deepEqual(core.SUPPORTED_MANIFEST_VERSIONS, [1]);
    assert.equal(typeof core.CoreError, "function");
    assert.equal(typeof core.bootstrapCore, "function");
    assert.deepEqual(core.CORE_BUILTIN_CAPABILITIES, [
      "core:history",
      "core:selection",
      "core:clipboard",
      "core:assets",
    ]);
  });

  it("exposes command-event runtime surface", () => {
    assert.equal(typeof core.createCommandEventRuntime, "function");
    assert.equal(typeof core.PluginError, "function");
  });

  it("exposes document-model and adapter-base surface", () => {
    assert.equal(typeof core.AdapterError, "function");
    assert.equal(typeof core.SerializationError, "function");
    assert.equal(typeof core.RenderError, "function");
    assert.equal(typeof core.toSerializationError, "function");
    assert.equal(typeof core.createNoopTelemetryService, "function");
    assert.equal(typeof core.createNoopTelemetrySpan, "function");
  });

  it("exposes editor orchestration entry without Shell or preset re-exports", () => {
    const exportedKeys = Object.keys(core);

    assert.equal(exportedKeys.includes("createEditor"), true);
    assert.equal(typeof core.createEditor, "function");
    assert.equal(exportedKeys.includes("createEditorSync"), false);
    assert.equal(exportedKeys.includes("createEditorLite"), false);
    assert.equal(exportedKeys.includes("EditorContext"), false);
    assert.equal(exportedKeys.includes("parseMarkdown"), false);
    assert.equal(exportedKeys.includes("serializeMarkdown"), false);
    assert.equal(exportedKeys.includes("getMarkdown"), false);
    assert.equal(exportedKeys.includes("getDocument"), false);
    assert.equal(exportedKeys.includes("createAdapter"), false);
    assert.equal(exportedKeys.includes("ReactEditor"), false);
    assert.equal(exportedKeys.includes("remarkPlugin"), false);
    assert.equal(exportedKeys.includes("prosemirrorPlugin"), false);
    assert.equal(exportedKeys.includes("presetGfm"), false);
    assert.equal(exportedKeys.includes("createGfmPreset"), false);
  });

  it("allows GFM preset package in workspace without core re-export", () => {
    const presetPackagePath = join(
      dirname(fileURLToPath(import.meta.url)),
      "..",
      "..",
      "preset-gfm",
      "package.json",
    );

    assert.equal(existsSync(presetPackagePath), true);
    const presetPackage = JSON.parse(readFileSync(presetPackagePath, "utf8")) as {
      name: string;
    };
    assert.equal(presetPackage.name, "@aether-md/preset-gfm");
  });

  it("does not silently provide adapter capabilities in the builtin core set", () => {
    assert.equal(CORE_BUILTIN_CAPABILITIES.includes("core:engine" as never), false);
    assert.equal(CORE_BUILTIN_CAPABILITIES.includes("core:parser" as never), false);
  });

  it("does not declare remark, prosemirror, react, or vue runtime dependencies", () => {
    const packageJsonPath = join(dirname(fileURLToPath(import.meta.url)), "..", "package.json");
    const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8")) as {
      dependencies?: Record<string, string>;
    };
    const deps = Object.keys(packageJson.dependencies ?? {});

    for (const dep of deps) {
      assert.doesNotMatch(dep, /remark|prosemirror|react|vue/i, `unexpected dependency: ${dep}`);
    }
  });
});
