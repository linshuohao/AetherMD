import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { CoreError } from "../../../dist/errors.js";
import type { AetherDoc } from "../../../dist/document-model.js";
import type { ExtensionPluginWithAdapters } from "../../../dist/editor/adapter-wiring.js";
import {
  toExtensionPluginFromPreset,
  type PresetBundle,
} from "../../../dist/editor/adapter-wiring.js";
import { createEditor } from "../../../dist/editor/create-editor.js";

function createMockDoc(text = "hello"): AetherDoc {
  return {
    type: "doc",
    children: [{ type: "paragraph", children: [{ type: "text", text }] }],
  };
}

function createMockPreset(name = "mock-preset"): ExtensionPluginWithAdapters {
  const doc = createMockDoc();
  const preset: PresetBundle = {
    manifest: {
      metadata: {
        manifestVersion: 1,
        name,
        provides: ["core:parser", "core:serializer", "core:engine"],
      },
    },
    parser: {
      name: "mock-parser",
      async parse(markdown: string) {
        assert.equal(typeof markdown, "string");
        return doc;
      },
    },
    serializer: {
      name: "mock-serializer",
      async serialize() {
        return "hello\n";
      },
    },
    engine: {
      name: "mock-engine",
      async create(_initialDoc: AetherDoc) {
        return { id: "session-1" };
      },
      async apply() {
        return { ok: true, doc };
      },
      getDocument() {
        return doc;
      },
      async dispose() {},
    },
  };
  return toExtensionPluginFromPreset(preset);
}

describe("createEditor startup-abort", () => {
  it("rejects duplicate plugin metadata.name with CoreError", async () => {
    const pluginA = createMockPreset("dup-plugin");
    const pluginB = createMockPreset("dup-plugin");

    await assert.rejects(
      () => createEditor({ plugins: [pluginA, pluginB] }),
      (error: unknown) => error instanceof CoreError && error.code === "PLUGIN_NAME_DUPLICATE",
    );
  });

  it("rejects duplicate plugin metadata.name before lifecycle hooks", async () => {
    let onInitCalls = 0;
    const pluginA = createMockPreset("dup-plugin");
    pluginA.manifest.runtime = {
      onInit() {
        onInitCalls += 1;
      },
    };
    const pluginB = createMockPreset("dup-plugin");
    pluginB.manifest.runtime = {
      onInit() {
        onInitCalls += 1;
      },
    };

    await assert.rejects(
      () => createEditor({ plugins: [pluginA, pluginB] }),
      (error: unknown) => error instanceof CoreError && error.code === "PLUGIN_NAME_DUPLICATE",
    );

    assert.equal(onInitCalls, 0);
  });
});

// Unsupported manifestVersion abort is covered by editor-orchestration.test.ts:
// "rejects unsupported manifest version with CoreError" → MANIFEST_VERSION_UNSUPPORTED
