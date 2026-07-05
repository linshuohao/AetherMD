import assert from "node:assert/strict";
import { describe, it } from "node:test";

import type { AetherDoc } from "@aether-md/core";

import { createRemarkSerializerAdapter } from "./serializer.js";

const schema = { version: 1 as const };

function paragraphDoc(text: string): AetherDoc {
  return {
    type: "doc",
    children: [
      {
        type: "paragraph",
        children: [{ type: "text", text }],
      },
    ],
  };
}

function headingParagraphDoc(
  level: 1 | 2 | 3 | 4 | 5 | 6,
  title: string,
  body: string,
): AetherDoc {
  return {
    type: "doc",
    children: [
      {
        type: "heading",
        level,
        children: [{ type: "text", text: title }],
      },
      {
        type: "paragraph",
        children: [{ type: "text", text: body }],
      },
    ],
  };
}

describe("Remark SerializerAdapter", () => {
  const serializer = createRemarkSerializerAdapter();

  it("serializes a paragraph AetherDoc to deterministic Markdown", async () => {
    const markdown = await serializer.serialize(paragraphDoc("Hello world"), schema);
    assert.equal(markdown, "Hello world\n");
  });

  it("serializes heading and paragraph AetherDoc to deterministic Markdown", async () => {
    const markdown = await serializer.serialize(
      headingParagraphDoc(2, "Title", "Body"),
      schema,
    );
    assert.equal(markdown, "## Title\n\nBody\n");
  });

  it("produces identical output for repeated serialization of the same doc", async () => {
    const doc = headingParagraphDoc(2, "Title", "Body");
    const first = await serializer.serialize(doc, schema);
    const second = await serializer.serialize(doc, schema);
    assert.equal(first, second);
  });
});
