import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

import { createGfmPreset } from "./index.js";

const schema = { version: 1 as const };

async function roundTrip(
  markdown: string,
  blockIndex: number,
  text: string,
): Promise<string> {
  const { parser, serializer, engine } = createGfmPreset();
  const doc = await parser.parse(markdown, schema);
  const session = await engine.create(doc);

  const applyResult = await engine.apply(session, {
    type: "replaceText",
    blockIndex,
    text,
  });

  assert.equal(applyResult.ok, true);
  const editedDoc = engine.getDocument(session);
  return serializer.serialize(editedDoc, schema);
}

describe("GFM preset cross-package round-trip matrix", () => {
  it("round-trips paragraph through parse, apply, and serialize", async () => {
    const result = await roundTrip("Hello world\n", 0, "Hello AetherMD");
    assert.equal(result, "Hello AetherMD\n");
  });

  it("round-trips heading and paragraph through parse, apply, and serialize", async () => {
    const result = await roundTrip("## Title\n\nBody\n", 1, "Updated body");
    assert.equal(result, "## Title\n\nUpdated body\n");
  });

  it("round-trips strong inline while editing an adjacent paragraph", async () => {
    const result = await roundTrip("**bold**\n\nTail\n", 1, "Updated tail");
    assert.equal(result, "**bold**\n\nUpdated tail\n");
  });

  it("round-trips emphasis inline while editing an adjacent paragraph", async () => {
    const result = await roundTrip("*italic*\n\nTail\n", 1, "Updated tail");
    assert.equal(result, "*italic*\n\nUpdated tail\n");
  });

  it("round-trips unordered list with golden string output", async () => {
    const result = await roundTrip("- item one\n- item two\n", 0, "ignored");
    assert.equal(result, "- item one\n- item two\n");
  });

  it("round-trips ordered list with golden string output", async () => {
    const result = await roundTrip("1. first\n2. second\n", 0, "ignored");
    assert.equal(result, "1. first\n2. second\n");
  });

  it("round-trips link inline while editing an adjacent paragraph", async () => {
    const result = await roundTrip(
      "[label](https://example.com)\n\nTail\n",
      1,
      "Updated tail",
    );
    assert.equal(result, "[label](https://example.com)\n\nUpdated tail\n");
  });

  it("does not import createEditor, bootstrapCore adapter wiring, or react", () => {
    const sourcePath = join(
      dirname(fileURLToPath(import.meta.url)),
      "..",
      "src",
      "round-trip.test.ts",
    );
    const source = readFileSync(sourcePath, "utf8");
    const importLines = source
      .split("\n")
      .filter((line) => line.trimStart().startsWith("import "));

    for (const line of importLines) {
      assert.doesNotMatch(line, /createEditor|bootstrapCore|@aether-md\/react|AetherEditor/);
    }
  });
});
