import assert from "node:assert/strict";
import { describe, it } from "vitest";

import { CoreError } from "../errors.js";
import type { AetherDoc } from "../document/model.js";
import type { ExtensionPluginWithAdapters } from "../editor/adapter-wiring.js";
import { toExtensionPluginFromPreset, type PresetBundle } from "../editor/adapter-wiring.js";
import { createEditor } from "../editor/create-editor.js";
import { createDefaultConflictResolver } from "../editor/conflict-resolver.js";
import type { ConflictContext, ConflictResolver } from "../editor/conflict-resolver.js";
import type { EditorContext } from "../editor/context.js";

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

  it("aborts on conflicting compile schema before lifecycle hooks", async () => {
    let onInitCalls = 0;
    const pluginA = createMockPreset("schema-a");
    pluginA.manifest.compile = {
      schema: { type: "node", name: "paragraph", matchMarkdownTag: "p" },
    };
    pluginA.manifest.runtime = {
      onInit() {
        onInitCalls += 1;
      },
    };

    const pluginB = createMockPreset("schema-b");
    pluginB.manifest.compile = {
      schema: { type: "node", name: "paragraph", matchMarkdownTag: "div" },
    };

    await assert.rejects(
      () => createEditor({ plugins: [pluginA, pluginB] }),
      (error: unknown) => error instanceof CoreError && error.code === "MANIFEST_INVALID",
    );
    assert.equal(onInitCalls, 0);
  });

  it("honors host conflictResolver for schema merge", async () => {
    const pluginA = createMockPreset("schema-a");
    pluginA.manifest.compile = {
      schema: { type: "node", name: "paragraph", matchMarkdownTag: "p" },
    };
    const pluginB = createMockPreset("schema-b");
    pluginB.manifest.compile = {
      schema: { type: "node", name: "paragraph", matchMarkdownTag: "div" },
    };

    const editor = await createEditor({
      plugins: [pluginA, pluginB],
      conflictResolver: createDefaultConflictResolver({ schema: "last-wins" }),
    });

    await editor.dispose();
  });

  it("honors host conflictResolver for command registration conflicts", async () => {
    const resolved: ConflictContext[] = [];
    const conflictResolver: ConflictResolver = {
      resolve(ctx) {
        resolved.push(ctx);
        return { strategy: "first-wins", winner: ctx.existing.value, warn: true };
      },
    };

    const pluginA = createMockPreset("cmd-plugin-a");
    pluginA.manifest.runtime = {
      onReady(ctx) {
        (ctx as EditorContext).commands.register("demo:dup", () => ({ value: "handler-a" }));
      },
    };
    const pluginB = createMockPreset("cmd-plugin-b");
    pluginB.manifest.runtime = {
      onReady(ctx) {
        (ctx as EditorContext).commands.register("demo:dup", () => ({ value: "handler-b" }));
      },
    };

    const editor = await createEditor({
      plugins: [pluginA, pluginB],
      conflictResolver,
    });

    assert.equal(
      resolved.some((ctx) => ctx.type === "command"),
      true,
    );

    const result = await editor.dispatch({ id: "demo:dup" });
    assert.equal(result.ok, true);
    assert.equal(result.value, "handler-a");

    await editor.dispose();
  });

  it("aborts when workers are enabled without perm:worker", async () => {
    const plugin = createMockPreset("worker-host");
    await assert.rejects(
      () =>
        createEditor({
          plugins: [plugin],
          security: { grantedPermissions: ["perm:dom"] },
          workers: {
            entry: "/tmp/unused-worker.js",
            parser: true,
          },
        }),
      (error: unknown) => error instanceof CoreError && error.code === "PERMISSION_DENIED",
    );
  });
});

// Unsupported manifestVersion abort is covered by editor-orchestration.test.ts:
// "rejects unsupported manifest version with CoreError" → MANIFEST_VERSION_UNSUPPORTED
