import assert from "node:assert/strict";
import { describe, it } from "node:test";

import type {
  AetherDoc,
  HeadingBlock,
  LinkInline,
  ListBlock,
  MarkedInline,
  ParagraphBlock,
  TextInline,
} from "@aether-md/core";
import { runParserAdapterContractTests } from "@aether-md/adapter-contract-tests";

import { createRemarkParserAdapter } from "../../dist/parser.js";

const schema = { version: 1 as const };

runParserAdapterContractTests("Remark", createRemarkParserAdapter);

describe("Remark ParserAdapter", () => {
  const parser = createRemarkParserAdapter();

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

  it("parses an unordered list into a structured ListBlock", async () => {
    const doc = await parser.parse("- item\n", schema);

    assert.equal(doc.children.length, 1);
    const list = doc.children[0] as ListBlock;
    assert.equal(list.type, "list");
    assert.equal(list.ordered, false);
    assert.equal(list.items.length, 1);
    const itemParagraph = list.items[0]?.[0] as ParagraphBlock;
    assert.equal(itemParagraph.type, "paragraph");
    assert.equal((itemParagraph.children[0] as TextInline).text, "item");
  });

  it("parses an ordered list into a structured ListBlock", async () => {
    const doc = await parser.parse("1. first\n2. second\n", schema);

    assert.equal(doc.children.length, 1);
    const list = doc.children[0] as ListBlock;
    assert.equal(list.type, "list");
    assert.equal(list.ordered, true);
    assert.equal(list.items.length, 2);
    assert.equal(((list.items[0]?.[0] as ParagraphBlock).children[0] as TextInline).text, "first");
    assert.equal(((list.items[1]?.[0] as ParagraphBlock).children[0] as TextInline).text, "second");
  });

  it("parses strong inline into MarkedInline with mark strong", async () => {
    const doc = await parser.parse("**bold**\n", schema);

    const paragraph = doc.children[0] as ParagraphBlock;
    assert.equal(paragraph.type, "paragraph");
    const mark = paragraph.children[0] as MarkedInline;
    assert.equal(mark.type, "mark");
    assert.equal(mark.mark, "strong");
    assert.equal((mark.children[0] as TextInline).text, "bold");
  });

  it("parses emphasis inline into MarkedInline with mark emphasis", async () => {
    const doc = await parser.parse("*italic*\n", schema);

    const paragraph = doc.children[0] as ParagraphBlock;
    assert.equal(paragraph.type, "paragraph");
    const mark = paragraph.children[0] as MarkedInline;
    assert.equal(mark.type, "mark");
    assert.equal(mark.mark, "emphasis");
    assert.equal((mark.children[0] as TextInline).text, "italic");
  });

  it("parses a link inline into LinkInline with matching href", async () => {
    const doc = await parser.parse("[label](https://example.com)\n", schema);

    const paragraph = doc.children[0] as ParagraphBlock;
    assert.equal(paragraph.type, "paragraph");
    const link = paragraph.children[0] as LinkInline;
    assert.equal(link.type, "link");
    assert.equal(link.href, "https://example.com");
    assert.equal((link.children[0] as TextInline).text, "label");
  });

  it("degrades unrecognized syntax to paragraph text instead of dropping content", async () => {
    const doc = await parser.parse(":::custom\n", schema);

    assert.equal(doc.type, "doc");
    assert.ok(doc.children.length > 0);
    const block = doc.children[0] as ParagraphBlock;
    assert.equal(block.type, "paragraph");
    assert.ok(
      block.children.some((inline) => inline.type === "text" && inline.text.includes("custom")),
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
