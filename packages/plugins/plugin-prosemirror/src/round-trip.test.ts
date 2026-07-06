import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

import { createRemarkParserAdapter, createRemarkSerializerAdapter } from "@aether-md/plugin-remark";

import { createProseMirrorEngineAdapter } from "./engine.js";

const schema = { version: 1 as const };

describe("cross-package markdown round-trip", () => {
  const parser = createRemarkParserAdapter();
  const serializer = createRemarkSerializerAdapter();
  const engine = createProseMirrorEngineAdapter();

  it("round-trips a paragraph sample through parse, apply, and serialize", async () => {
    const markdown = "Hello world\n";
    const doc = await parser.parse(markdown, schema);
    const session = await engine.create(doc);

    const applyResult = await engine.apply(session, {
      type: "replaceText",
      blockIndex: 0,
      text: "Hello AetherMD",
    });

    assert.equal(applyResult.ok, true);
    const editedDoc = engine.getDocument(session);
    const result = await serializer.serialize(editedDoc, schema);

    assert.equal(result, "Hello AetherMD\n");
  });

  it("round-trips a heading and paragraph sample through parse, apply, and serialize", async () => {
    const markdown = "## Title\n\nBody\n";
    const doc = await parser.parse(markdown, schema);
    const session = await engine.create(doc);

    const applyResult = await engine.apply(session, {
      type: "replaceText",
      blockIndex: 1,
      text: "Updated body",
    });

    assert.equal(applyResult.ok, true);
    const editedDoc = engine.getDocument(session);
    const result = await serializer.serialize(editedDoc, schema);

    assert.equal(result, "## Title\n\nUpdated body\n");
  });

  it("does not import createEditor, bootstrapCore adapter wiring, or react", () => {
    const sourcePath = join(
      dirname(fileURLToPath(import.meta.url)),
      "..",
      "src",
      "round-trip.test.ts",
    );
    const source = readFileSync(sourcePath, "utf8");
    const importLines = source.split("\n").filter((line) => line.trimStart().startsWith("import "));

    for (const line of importLines) {
      assert.doesNotMatch(line, /createEditor|bootstrapCore|@aether-md\/react|AetherEditor/);
    }
  });
});
