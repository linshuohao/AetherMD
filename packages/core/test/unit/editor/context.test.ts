import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { createCommandEventRuntime } from "../../../dist/command-event-runtime.js";
import type { AetherDoc } from "../../../dist/document-model.js";
import { createEditorContext } from "../../../dist/editor/context.js";

describe("EditorContext", () => {
  it("exposes commands, events, engine, and parser services", () => {
    const runtime = createCommandEventRuntime();
    const doc: AetherDoc = {
      type: "doc",
      children: [{ type: "paragraph", children: [{ type: "text", text: "x" }] }],
    };
    const engine = {
      name: "engine",
      async create() {
        return { id: "s1" };
      },
      async apply() {
        return { ok: true, doc };
      },
      getDocument() {
        return doc;
      },
      async dispose() {},
    };
    const parser = {
      name: "parser",
      async parse() {
        return doc;
      },
    };
    const serializer = {
      name: "serializer",
      async serialize() {
        return "x\n";
      },
    };

    const context = createEditorContext({
      runtime,
      engine,
      session: { id: "s1" },
      parser,
      serializer,
    });

    assert.equal(typeof context.commands.dispatch, "function");
    assert.equal(typeof context.events.on, "function");
    assert.equal(context.services.engine.adapter.name, "engine");
    assert.equal(context.services.parser.adapter.name, "parser");
    assert.equal(typeof context.services.history.undo, "function");
    assert.equal(context.services.selection.getSelection(), null);
  });
});
