import assert from "node:assert/strict";
import { describe, it } from "node:test";

import type {
  AetherDoc,
  AetherSchema,
  HeadingBlock,
  ParagraphBlock,
  TextInline,
} from "./index.js";

describe("document model public types", () => {
  it("exports AetherDoc, block, inline, and AetherSchema types from core", () => {
    const text: TextInline = { type: "text", text: "Hello world" };
    const paragraph: ParagraphBlock = { type: "paragraph", children: [text] };
    const heading: HeadingBlock = {
      type: "heading",
      level: 2,
      children: [{ type: "text", text: "Title" }],
    };
    const doc: AetherDoc = {
      type: "doc",
      children: [paragraph, heading],
    };
    const schema: AetherSchema = { version: 1 };

    assert.equal(doc.type, "doc");
    assert.equal(doc.children.length, 2);
    assert.equal(schema.version, 1);
  });

  it("serializes AetherDoc to JSON without functions or engine types", () => {
    const doc: AetherDoc = {
      type: "doc",
      children: [
        {
          type: "paragraph",
          children: [{ type: "text", text: "Hello world" }],
        },
      ],
    };

    const json = JSON.stringify(doc);
    const parsed = JSON.parse(json) as AetherDoc;

    assert.equal(parsed.type, "doc");
    assert.equal(parsed.children[0]?.type, "paragraph");
    assert.equal(
      (parsed.children[0] as ParagraphBlock).children[0]?.type,
      "text",
    );
    assert.doesNotMatch(json, /function|\[object Object\]/);
  });

  it("accepts AetherSchema with version 1", () => {
    const schema: AetherSchema = { version: 1 };
    assert.deepEqual(schema, { version: 1 });
  });
});
