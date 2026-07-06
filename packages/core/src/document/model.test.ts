import assert from "node:assert/strict";
import { describe, it } from "vitest";

import type {
  AetherDoc,
  AetherSchema,
  CustomBlock,
  HeadingBlock,
  LinkInline,
  ListBlock,
  MarkedInline,
  ParagraphBlock,
  TextInline,
} from "../index.js";

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
    assert.equal((parsed.children[0] as ParagraphBlock).children[0]?.type, "text");
    assert.doesNotMatch(json, /function|\[object Object\]/);
  });

  it("accepts AetherSchema with version 1", () => {
    const schema: AetherSchema = { version: 1 };
    assert.deepEqual(schema, { version: 1 });
  });
});

describe("GFM extended document types export smoke", () => {
  it("exports ListBlock, LinkInline, and MarkedInline from core entry", () => {
    const list: ListBlock = {
      type: "list",
      ordered: false,
      items: [
        [
          {
            type: "paragraph",
            children: [{ type: "text", text: "item one" }],
          },
        ],
      ],
    };
    const link: LinkInline = {
      type: "link",
      href: "https://example.com",
      children: [{ type: "text", text: "label" }],
    };
    const strong: MarkedInline = {
      type: "mark",
      mark: "strong",
      children: [{ type: "text", text: "bold" }],
    };
    const emphasis: MarkedInline = {
      type: "mark",
      mark: "emphasis",
      children: [{ type: "text", text: "italic" }],
    };

    assert.equal(list.type, "list");
    assert.equal(link.type, "link");
    assert.equal(strong.mark, "strong");
    assert.equal(emphasis.mark, "emphasis");
  });
});

describe("GFM fixture AetherDoc JSON serialization", () => {
  const gfmFixtureDoc: AetherDoc = {
    type: "doc",
    children: [
      {
        type: "paragraph",
        children: [
          { type: "text", text: "Visit " },
          {
            type: "link",
            href: "https://example.com",
            title: "Example",
            children: [{ type: "text", text: "Example" }],
          },
          { type: "text", text: " for details." },
        ],
      },
      {
        type: "paragraph",
        children: [
          {
            type: "mark",
            mark: "strong",
            children: [{ type: "text", text: "bold" }],
          },
          { type: "text", text: " and " },
          {
            type: "mark",
            mark: "emphasis",
            children: [{ type: "text", text: "italic" }],
          },
        ],
      },
      {
        type: "list",
        ordered: false,
        items: [
          [
            {
              type: "paragraph",
              children: [{ type: "text", text: "unordered item" }],
            },
          ],
        ],
      },
      {
        type: "list",
        ordered: true,
        items: [
          [
            {
              type: "paragraph",
              children: [{ type: "text", text: "ordered item" }],
            },
          ],
        ],
      },
    ],
  };

  it("serializes GFM fixture AetherDoc to JSON without functions or engine types", () => {
    const json = JSON.stringify(gfmFixtureDoc);
    const parsed = JSON.parse(json) as AetherDoc;

    assert.equal(parsed.type, "doc");
    assert.equal(parsed.children.length, 4);

    const linkParagraph = parsed.children[0] as ParagraphBlock;
    const linkInline = linkParagraph.children[1] as LinkInline;
    assert.equal(linkInline.type, "link");
    assert.equal(linkInline.href, "https://example.com");

    const marksParagraph = parsed.children[1] as ParagraphBlock;
    assert.equal((marksParagraph.children[0] as MarkedInline).mark, "strong");
    assert.equal((marksParagraph.children[2] as MarkedInline).mark, "emphasis");

    const unorderedList = parsed.children[2] as ListBlock;
    assert.equal(unorderedList.type, "list");
    assert.equal(unorderedList.ordered, false);

    const orderedList = parsed.children[3] as ListBlock;
    assert.equal(orderedList.ordered, true);

    assert.doesNotMatch(json, /function|\[object Object\]/);
  });
});

// CustomBlock fixtures are intentionally separate from the GFM six-syntax
// round-trip matrix (Task 08). CustomBlock export is verified here only.
describe("CustomBlock outside GFM round-trip matrix", () => {
  it("exports CustomBlock and constructs a serializable fixture", () => {
    const custom: CustomBlock = {
      type: "custom",
      name: "callout",
      attrs: { variant: "info" },
      children: [
        {
          type: "paragraph",
          children: [{ type: "text", text: "Note" }],
        },
      ],
    };

    const json = JSON.stringify(custom);
    const parsed = JSON.parse(json) as CustomBlock;

    assert.equal(parsed.type, "custom");
    assert.equal(parsed.name, "callout");
    assert.doesNotMatch(json, /function|\[object Object\]/);
  });
});
