import assert from "node:assert/strict";
import { describe, it } from "node:test";

import type {
  AetherDoc,
  HeadingBlock,
  ParagraphBlock,
  TextInline,
} from "@aether-md/core";

import { createRemarkParserAdapter } from "./parser.js";

const schema = { version: 1 as const };

describe("Remark ParserAdapter", () => {
  const parser = createRemarkParserAdapter();

  it("parses a paragraph markdown sample into AetherDoc", async () => {
    const doc = await parser.parse("Hello world\n", schema);

    assert.equal(doc.type, "doc");
    assert.equal(doc.children.length, 1);
    const block = doc.children[0] as ParagraphBlock;
    assert.equal(block.type, "paragraph");
    assert.equal(block.children[0]?.type, "text");
    assert.equal((block.children[0] as TextInline).text, "Hello world");
  });

  it("parses heading and paragraph markdown into AetherDoc", async () => {
    const doc = await parser.parse("## Title\n\nBody\n", schema);

    assert.equal(doc.children.length, 2);
    const heading = doc.children[0] as HeadingBlock;
    assert.equal(heading.type, "heading");
    assert.equal(heading.level, 2);
    assert.equal(heading.children[0]?.type, "text");
    assert.equal((heading.children[0] as TextInline).text, "Title");

    const paragraph = doc.children[1] as ParagraphBlock;
    assert.equal(paragraph.type, "paragraph");
    assert.equal((paragraph.children[0] as TextInline).text, "Body");
  });

  it("degrades unrecognized syntax to paragraph text instead of dropping content", async () => {
    const doc = await parser.parse("- list item\n", schema);

    assert.equal(doc.type, "doc");
    assert.ok(doc.children.length > 0);
    const block = doc.children[0] as ParagraphBlock;
    assert.equal(block.type, "paragraph");
    assert.ok(
      block.children.some(
        (inline) => inline.type === "text" && inline.text.includes("list item"),
      ),
    );
  });

  it("returns JSON-serializable AetherDoc without engine leaks", async () => {
    const doc = await parser.parse("Hello world\n", schema);
    const json = JSON.stringify(doc);
    const parsed = JSON.parse(json) as AetherDoc;

    assert.equal(parsed.type, "doc");
    assert.doesNotMatch(json, /function|\[object Object\]/);
  });
});
