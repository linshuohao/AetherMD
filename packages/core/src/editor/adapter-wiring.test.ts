import assert from "node:assert/strict";
import { describe, it } from "node:test";

import type { AdapterCommandRequest } from "../adapter-types.js";
import type { AetherDoc } from "../document-model.js";
import { CoreError } from "../errors.js";
import {
  resolveWiredAdapters,
  toExtensionPluginFromPreset,
  type PresetBundle,
} from "./adapter-wiring.js";

function createMockDoc(text = "hello"): AetherDoc {
  return {
    type: "doc",
    children: [{ type: "paragraph", children: [{ type: "text", text }] }],
  };
}

function createMockAdapters() {
  const doc = createMockDoc();
  return {
    parser: {
      name: "mock-parser",
      async parse() {
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
}

describe("adapter wiring", () => {
  it("resolves parser, serializer, and engine from preset-shaped bundle", () => {
    const mocks = createMockAdapters();
    const preset: PresetBundle = {
      manifest: {
        metadata: {
          manifestVersion: 1,
          name: "mock-preset",
          provides: ["core:parser", "core:serializer", "core:engine"],
        },
      },
      ...mocks,
    };

    const wired = resolveWiredAdapters([toExtensionPluginFromPreset(preset)]);

    assert.equal(wired.parser.name, "mock-parser");
    assert.equal(wired.serializer.name, "mock-serializer");
    assert.equal(wired.engine.name, "mock-engine");
  });

  it("throws CoreError when engine adapter is missing", () => {
    assert.throws(
      () =>
        resolveWiredAdapters([
          {
            manifest: {
              metadata: { manifestVersion: 1, name: "incomplete" },
            },
            adapters: {
              parser: createMockAdapters().parser,
              serializer: createMockAdapters().serializer,
              engine: undefined as never,
            },
          },
        ]),
      (error: unknown) => error instanceof CoreError && error.code === "EDITOR_ADAPTER_MISSING",
    );
  });
});
