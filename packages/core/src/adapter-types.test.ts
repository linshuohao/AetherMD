import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

import type {
  AdapterCommandRequest,
  AdapterEvent,
  AdapterTransactionResult,
  EngineAdapter,
  EngineSession,
  ParserAdapter,
  SerializerAdapter,
} from "./adapter-types.js";
import { AdapterError, SerializationError } from "./errors.js";

describe("adapter protocol types", () => {
  it("exports ParserAdapter, SerializerAdapter, and EngineAdapter interfaces", () => {
    const parser: ParserAdapter = {
      name: "test-parser",
      parse: async () => ({ type: "doc", children: [] }),
    };
    const serializer: SerializerAdapter = {
      name: "test-serializer",
      serialize: async () => "",
    };
    const engine: EngineAdapter = {
      name: "test-engine",
      create: async () => ({ id: "session-1" } as EngineSession),
      apply: async (): Promise<AdapterTransactionResult> => ({ ok: true }),
      getDocument: () => ({ type: "doc", children: [] }),
      dispose: async () => {},
    };

    assert.equal(parser.name, "test-parser");
    assert.equal(serializer.name, "test-serializer");
    assert.equal(engine.name, "test-engine");
  });

  it("exports supporting adapter protocol types", () => {
    const request: AdapterCommandRequest = {
      type: "replaceText",
      blockIndex: 0,
      text: "updated",
    };
    const event: AdapterEvent = { name: "change", source: "adapter" };
    const result: AdapterTransactionResult = { ok: true, events: [event] };

    assert.equal(request.type, "replaceText");
    assert.equal(result.ok, true);
    assert.equal(result.events?.[0]?.name, "change");
  });

  it("instantiates AdapterError with adapter source and recoverable severity", () => {
    const error = new AdapterError({
      code: "APPLY_FAILED",
      message: "apply failed",
    });

    assert.equal(error.source, "adapter");
    assert.equal(error.severity, "recoverable");
    assert.equal(error.code, "APPLY_FAILED");
    assert.equal(error.message, "apply failed");
  });

  it("instantiates SerializationError with serialization source and degraded severity", () => {
    const error = new SerializationError({
      code: "UNSUPPORTED_NODE",
      message: "cannot serialize node",
    });

    assert.equal(error.source, "serialization");
    assert.equal(error.severity, "degraded");
    assert.equal(error.code, "UNSUPPORTED_NODE");
  });

  it("does not add remark or prosemirror runtime dependencies to core", () => {
    const packageJsonPath = join(
      dirname(fileURLToPath(import.meta.url)),
      "..",
      "package.json",
    );
    const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8")) as {
      dependencies?: Record<string, string>;
    };
    const deps = Object.keys(packageJson.dependencies ?? {});

    for (const dep of deps) {
      assert.doesNotMatch(
        dep,
        /remark|prosemirror|react|vue/i,
        `unexpected dependency: ${dep}`,
      );
    }
  });
});
