import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "vitest";

import * as adapter from "./adapter.js";
import * as core from "./index.js";
import * as document from "./document.js";
import * as host from "./host.js";
import * as plugin from "./plugin.js";
import * as testing from "./testing.js";
import { CORE_BUILTIN_CAPABILITIES } from "./manifest/capabilities.js";

const HOST_EXPORTS = ["createEditor", "CoreError", "RenderError"] as const;

const HOST_FORBIDDEN = [
  "bootstrapCore",
  "createCommandEventRuntime",
  "createHistoryService",
  "createClipboardService",
  "createSelectionService",
  "createDocumentHistory",
  "createNoopTelemetryService",
  "AdapterError",
  "SerializationError",
  "PluginError",
  "SUPPORTED_MANIFEST_VERSIONS",
  "createBlockId",
  "ParserAdapter",
] as const;

describe("@aether-md/core host entry (default)", () => {
  it("re-exports the same surface as ./host", () => {
    assert.deepEqual(Object.keys(core).sort(), Object.keys(host).sort());
  });

  it("exposes host-only editor orchestration surface", () => {
    for (const name of HOST_EXPORTS) {
      assert.equal(name in host, true, `host must export ${name}`);
    }
    assert.equal(typeof host.createEditor, "function");

    const hostKeys = Object.keys(host);
    for (const forbidden of HOST_FORBIDDEN) {
      assert.equal(hostKeys.includes(forbidden), false, `host must not export ${forbidden}`);
    }

    assert.equal(hostKeys.includes("createEditorSync"), false);
    assert.equal(hostKeys.includes("EditorContext"), false);
    assert.equal(hostKeys.includes("presetGfm"), false);
  });
});

describe("@aether-md/core/plugin entry", () => {
  it("exposes plugin SDK contracts without host or adapter factories", () => {
    assert.deepEqual(plugin.SUPPORTED_MANIFEST_VERSIONS, [1]);
    assert.equal(typeof plugin.PluginError, "function");
    assert.deepEqual(plugin.CORE_BUILTIN_CAPABILITIES, [
      "core:history",
      "core:selection",
      "core:clipboard",
      "core:assets",
    ]);
    assert.equal("createEditor" in plugin, false);
    assert.equal("ParserAdapter" in plugin, false);
    assert.equal("bootstrapCore" in plugin, false);
  });
});

describe("@aether-md/core/adapter entry", () => {
  it("exposes adapter protocol without host editor entry", () => {
    assert.equal(typeof adapter.AdapterError, "function");
    assert.equal(typeof adapter.SerializationError, "function");
    assert.equal(typeof adapter.toSerializationError, "function");
    assert.equal(typeof adapter.ensureDocumentBlockIds, "function");
    assert.equal("createEditor" in adapter, false);
    assert.equal("ExtensionManifest" in adapter, false);
  });
});

describe("@aether-md/core/document entry", () => {
  it("is a type-only surface with no runtime host or adapter exports", () => {
    assert.deepEqual(Object.keys(document), []);
  });
});

describe("@aether-md/core/testing entry", () => {
  it("exposes dev-only bootstrap and command runtime factories", () => {
    assert.equal(typeof testing.bootstrapCore, "function");
    assert.equal(typeof testing.createCommandEventRuntime, "function");
    assert.equal("createEditor" in testing, false);
  });
});

describe("@aether-md/core package boundary", () => {
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
