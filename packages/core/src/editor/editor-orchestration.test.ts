import assert from "node:assert/strict";
import { describe, it } from "vitest";

import { CoreError, AdapterError, SerializationError } from "../errors.js";
import type { AdapterCommandRequest } from "../document/adapter-types.js";
import type { AetherDoc } from "../document/model.js";
import type { EventEnvelope } from "../command-event/types.js";
import type { MorphingBlockStrategy } from "../morphing/types.js";
import { PARSE_BLOCK_MARKDOWN_COMMAND } from "../morphing/types.js";
import type { ExtensionPluginWithAdapters } from "../editor/adapter-wiring.js";
import { toExtensionPluginFromPreset, type PresetBundle } from "../editor/adapter-wiring.js";
import { createEditor } from "../editor/create-editor.js";
import { ENGINE_REPLACE_TEXT_COMMAND } from "../editor/engine-dispatch.js";
import type { EditorContext } from "../editor/context.js";

function createMockDoc(text = "hello"): AetherDoc {
  return {
    type: "doc",
    children: [{ type: "paragraph", children: [{ type: "text", text }] }],
  };
}

function createMockPreset(overrides?: {
  manifestVersion?: number;
  parseSpy?: { called: boolean };
}): ExtensionPluginWithAdapters {
  const doc = createMockDoc();
  const parseSpy = overrides?.parseSpy ?? { called: false };
  const preset: PresetBundle = {
    manifest: {
      metadata: {
        manifestVersion: (overrides?.manifestVersion ?? 1) as 1,
        name: "mock-preset",
        provides: ["core:parser", "core:serializer", "core:engine"],
      },
    },
    parser: {
      name: "mock-parser",
      async parse(markdown: string) {
        parseSpy.called = true;
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
      async apply(_session: { id: string }, request: AdapterCommandRequest) {
        if (request.type !== "replaceText") {
          return { ok: false };
        }
        const text =
          request.text ??
          request.children?.map((inline) => (inline.type === "text" ? inline.text : "")).join("") ??
          "";
        return { ok: true, doc: createMockDoc(text) };
      },
      getDocument() {
        return doc;
      },
      async dispose() {},
    },
  };
  return toExtensionPluginFromPreset(preset);
}

describe("createEditor orchestration", () => {
  it("resolves AetherEditor and emits ready during startup", async () => {
    const readyEvents: EventEnvelope[] = [];
    const plugin = createMockPreset();
    plugin.manifest.runtime = {
      onInit(ctx) {
        const editorCtx = ctx as EditorContext;
        editorCtx.events.on("ready", (event) => {
          readyEvents.push(event);
        });
      },
    };

    const editor = await createEditor({ plugins: [plugin] });

    assert.equal(typeof editor.dispatch, "function");
    assert.equal(typeof editor.getMarkdown, "function");
    assert.equal(typeof editor.getDocument, "function");
    assert.equal(readyEvents.length, 1);
    assert.equal(readyEvents[0]?.name, "ready");
    await editor.dispose();
  });

  it("rejects unsupported manifest version with CoreError", async () => {
    const plugin = createMockPreset({ manifestVersion: 99 });

    await assert.rejects(
      () => createEditor({ plugins: [plugin] }),
      (error: unknown) =>
        error instanceof CoreError && error.code === "MANIFEST_VERSION_UNSUPPORTED",
    );
  });

  it("parses Markdown initialValue through Parser adapter", async () => {
    const parseSpy = { called: false };
    const plugin = createMockPreset({ parseSpy });

    const editor = await createEditor({
      plugins: [plugin],
      initialValue: "# Hi\n",
    });

    assert.equal(parseSpy.called, true);
    assert.equal(editor.getDocument().children.length > 0, true);
    await editor.dispose();
  });

  it("skips Parser when initialValue is AetherDoc", async () => {
    const parseSpy = { called: false };
    const plugin = createMockPreset({ parseSpy });
    const doc = createMockDoc("direct");

    const editor = await createEditor({
      plugins: [plugin],
      initialValue: doc,
    });

    assert.equal(parseSpy.called, false);
    assert.equal(
      (editor.getDocument().children[0] as { children: { text: string }[] }).children[0]?.text,
      "direct",
    );
    await editor.dispose();
  });

  it("getDocument returns host-visible snapshot", async () => {
    const plugin = createMockPreset();
    const editor = await createEditor({
      plugins: [plugin],
      initialValue: createMockDoc("snapshot"),
    });

    const doc = editor.getDocument();
    assert.equal(
      (doc.children[0] as { children: { text: string }[] }).children[0]?.text,
      "snapshot",
    );
    await editor.dispose();
  });

  it("getMarkdown lazily serializes on call only", async () => {
    let serializeCount = 0;
    const plugin = createMockPreset();
    plugin.adapters!.serializer = {
      name: "counting-serializer",
      async serialize() {
        serializeCount += 1;
        return "serialized\n";
      },
    };

    const editor = await createEditor({ plugins: [plugin] });
    assert.equal(serializeCount, 0);

    const markdown = await editor.getMarkdown();
    assert.equal(markdown, "serialized\n");
    assert.equal(serializeCount, 1);
    await editor.dispose();
  });

  it("dispatch core:replaceText updates document and emits change", async () => {
    const changes: EventEnvelope[] = [];
    const plugin = createMockPreset();
    const editor = await createEditor({ plugins: [plugin] });
    editor.on("change", (event) => changes.push(event));

    const result = await editor.dispatch({
      id: ENGINE_REPLACE_TEXT_COMMAND,
      payload: { blockIndex: 0, text: "updated" },
    });

    assert.equal(result.ok, true);
    assert.equal(changes.length, 1);
    assert.equal(
      (editor.getDocument().children[0] as { children: { text: string }[] }).children[0]?.text,
      "updated",
    );
    await editor.dispose();
  });

  it("restores snapshot and emits transactionFailed when apply fails", async () => {
    const failures: EventEnvelope[] = [];
    const plugin = createMockPreset();
    plugin.adapters!.engine = {
      name: "failing-engine",
      async create(_initialDoc: AetherDoc) {
        return { id: "s1" };
      },
      async apply() {
        return {
          ok: false,
          error: new AdapterError({ code: "APPLY_FAILED", message: "fail" }),
        };
      },
      getDocument() {
        return createMockDoc("before");
      },
      async dispose() {},
    };

    const editor = await createEditor({
      plugins: [plugin],
      initialValue: createMockDoc("before"),
    });
    editor.on("transactionFailed", (event) => failures.push(event));

    const result = await editor.dispatch({
      id: ENGINE_REPLACE_TEXT_COMMAND,
      payload: { blockIndex: 0, text: "after" },
    });

    assert.equal(result.ok, false);
    assert.equal(failures.length, 1);
    assert.equal(
      (editor.getDocument().children[0] as { children: { text: string }[] }).children[0]?.text,
      "before",
    );
    await editor.dispose();
  });

  it("isolates plugin command failures without adapter rollback", async () => {
    const pluginErrors: EventEnvelope[] = [];
    const plugin = createMockPreset();
    plugin.manifest.runtime = {
      onReady(ctx) {
        const editorCtx = ctx as EditorContext;
        editorCtx.commands.register("demo:boom", () => {
          throw new Error("plugin boom");
        });
      },
    };

    const editor = await createEditor({ plugins: [plugin] });
    editor.on("pluginError", (event) => pluginErrors.push(event));

    const result = await editor.dispatch({ id: "demo:boom" });
    assert.equal(result.ok, false);
    assert.equal(pluginErrors.length, 1);
    await editor.dispose();
  });

  it("dispose emits disposed and fails closed on subsequent dispatch", async () => {
    const disposedEvents: EventEnvelope[] = [];
    const plugin = createMockPreset();
    const editor = await createEditor({ plugins: [plugin] });
    editor.on("disposed", (event) => disposedEvents.push(event));

    await editor.dispose();
    assert.equal(disposedEvents.length, 1);

    const result = await editor.dispatch({
      id: ENGINE_REPLACE_TEXT_COMMAND,
      payload: { blockIndex: 0, text: "x" },
    });
    assert.equal(result.ok, false);
    assert.equal(result.error?.code, "EDITOR_DISPOSED");
  });

  it("exposes morphing strategies from preset wiring", async () => {
    const mockStrategy: MorphingBlockStrategy = {
      blockType: "paragraph",
      serializeSource() {
        return "";
      },
      async parseSource(rawSource) {
        return {
          type: "paragraph",
          children: [{ type: "text", text: rawSource }],
        };
      },
      interactiveRenderer: {
        mount() {},
      },
    };

    const plugin = createMockPreset();
    plugin.morphingStrategies = [mockStrategy];
    const editor = await createEditor({ plugins: [plugin] });

    assert.equal(editor.getMorphingStrategy("paragraph"), mockStrategy);
    assert.equal(editor.getMorphingStrategy("heading"), undefined);
    await editor.dispose();
  });

  it("dispatch core:parseBlockMarkdown returns first parsed block", async () => {
    const plugin = createMockPreset();
    const editor = await createEditor({ plugins: [plugin] });

    const result = await editor.dispatch({
      id: PARSE_BLOCK_MARKDOWN_COMMAND,
      payload: { markdown: "**bold**\n" },
    });

    assert.equal(result.ok, true);
    if (result.ok) {
      const block = result.value as { type?: string } | undefined;
      assert.equal(block?.type, "paragraph");
    }
    await editor.dispose();
  });

  it("exposes effective grantedPermissions on EditorContext", async () => {
    const plugin = createMockPreset();
    const editor = await createEditor({
      plugins: [plugin],
      security: { grantedPermissions: ["perm:dom", "perm:clipboard"] },
    });

    assert.equal(editor.context.grantedPermissions.has("perm:dom"), true);
    assert.equal(editor.context.grantedPermissions.has("perm:clipboard"), true);
    assert.equal(editor.context.grantedPermissions.has("perm:network"), false);
    await editor.dispose();
  });

  it("denies clipboard service when perm:clipboard is not granted", async () => {
    const plugin = createMockPreset();
    const editor = await createEditor({
      plugins: [plugin],
      security: { grantedPermissions: ["perm:dom"] },
    });

    assert.throws(
      () => editor.context.services.clipboard.copy("blocked"),
      (error: unknown) => error instanceof CoreError && error.code === "PERMISSION_DENIED",
    );
    await editor.dispose();
  });

  it("tryGetMarkdown returns SerializationError without throwing", async () => {
    const plugin = createMockPreset();
    plugin.adapters!.serializer = {
      name: "failing-serializer",
      async serialize() {
        throw new SerializationError({
          code: "UNSUPPORTED_NODE",
          message: "cannot serialize node",
        });
      },
    };

    const editor = await createEditor({ plugins: [plugin] });
    const result = await editor.tryGetMarkdown();

    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.equal(result.error.code, "UNSUPPORTED_NODE");
      assert.equal(result.error.source, "serialization");
    }
    await editor.dispose();
  });

  it("emits serializationError and logs when tryGetMarkdown fails", async () => {
    const events: EventEnvelope[] = [];
    const logs: string[] = [];
    const plugin = createMockPreset();
    plugin.adapters!.serializer = {
      name: "failing-serializer",
      async serialize() {
        throw new SerializationError({
          code: "SERIALIZE_FAILED",
          message: "serialize failed",
        });
      },
    };
    plugin.manifest.runtime = {
      onInit(ctx) {
        const context = ctx as EditorContext;
        context.logger.error = (message: string) => {
          logs.push(message);
        };
      },
    };

    const editor = await createEditor({ plugins: [plugin] });
    editor.on("serializationError", (event) => events.push(event));

    const result = await editor.tryGetMarkdown();
    assert.equal(result.ok, false);
    assert.equal(events.length, 1);
    assert.equal(events[0]?.name, "serializationError");
    assert.equal(logs.length, 1);
    assert.equal(logs[0], "serialize failed");

    await assert.rejects(
      () => editor.getMarkdown(),
      (error: unknown) => {
        return error instanceof SerializationError && error.code === "SERIALIZE_FAILED";
      },
    );
    await editor.dispose();
  });
});
