import assert from "node:assert/strict";
import { describe, it } from "node:test";

import type { ParagraphBlock } from "@aether-md/core";

import { createGfmPreset } from "../../dist/index.js";
import {
  serializeInlineToMarkdown,
  serializeParagraphInlines,
} from "../../dist/gfm-inline-morphing.js";

const schema = { version: 1 as const };

describe("gfm-inline-morphing", () => {
  it("serializeParagraphInlines emits strong, emphasis, and link syntax", () => {
    const block: ParagraphBlock = {
      type: "paragraph",
      children: [
        { type: "text", text: "Hello " },
        {
          type: "mark",
          mark: "strong",
          children: [{ type: "text", text: "bold" }],
        },
        { type: "text", text: " and " },
        {
          type: "mark",
          mark: "emphasis",
          children: [{ type: "text", text: "emphasis" }],
        },
        { type: "text", text: " with " },
        {
          type: "link",
          href: "https://example.com",
          children: [{ type: "text", text: "link" }],
        },
        { type: "text", text: "." },
      ],
    };

    assert.equal(
      serializeParagraphInlines(block),
      "Hello **bold** and *emphasis* with [link](https://example.com).",
    );
  });

  it("round-trips with remark parser for inline marks", async () => {
    const preset = createGfmPreset();
    const markdown = "Hello **bold** and *emphasis* with [link](https://example.com).\n";
    const doc = await preset.parser.parse(markdown, schema);
    const paragraph = doc.children[0];
    assert.equal(paragraph?.type, "paragraph");

    const serialized = serializeParagraphInlines(paragraph as ParagraphBlock);
    const reparsed = await preset.parser.parse(`${serialized}\n`, schema);
    const reparsedParagraph = reparsed.children[0];
    assert.equal(reparsedParagraph?.type, "paragraph");
    if (paragraph?.type === "paragraph" && reparsedParagraph?.type === "paragraph") {
      assert.deepEqual(reparsedParagraph.children, paragraph.children);
    }
  });

  it("serializeInlineToMarkdown handles individual mark types", () => {
    assert.equal(
      serializeInlineToMarkdown({
        type: "mark",
        mark: "strong",
        children: [{ type: "text", text: "bold" }],
      }),
      "**bold**",
    );
    assert.equal(
      serializeInlineToMarkdown({
        type: "mark",
        mark: "emphasis",
        children: [{ type: "text", text: "italic" }],
      }),
      "*italic*",
    );
    assert.equal(
      serializeInlineToMarkdown({
        type: "link",
        href: "https://example.com",
        children: [{ type: "text", text: "label" }],
      }),
      "[label](https://example.com)",
    );
  });
});
