import assert from "node:assert/strict";
import { describe, it } from "vitest";

import type { AetherDoc } from "@aether-md/core";
import { SerializationError } from "@aether-md/core";
import { runSerializerAdapterContractTests } from "@aether-md/adapter-contract-tests";

import { createRemarkSerializerAdapter } from "./serializer.js";

const schema = { version: 1 as const };

runSerializerAdapterContractTests("Remark", createRemarkSerializerAdapter);

function headingParagraphDoc(level: 1 | 2 | 3 | 4 | 5 | 6, title: string, body: string): AetherDoc {
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

function gfmFixtureDoc(): AetherDoc {
  return {
    type: "doc",
    children: [
      {
        type: "paragraph",
        children: [
          {
            type: "mark",
            mark: "strong",
            children: [{ type: "text", text: "bold" }],
          },
        ],
      },
      {
        type: "paragraph",
        children: [
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
              children: [{ type: "text", text: "item" }],
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
              children: [{ type: "text", text: "first" }],
            },
          ],
          [
            {
              type: "paragraph",
              children: [{ type: "text", text: "second" }],
            },
          ],
        ],
      },
      {
        type: "paragraph",
        children: [
          {
            type: "link",
            href: "https://example.com",
            children: [{ type: "text", text: "label" }],
          },
        ],
      },
    ],
  };
}

describe("Remark SerializerAdapter", () => {
  const serializer = createRemarkSerializerAdapter();

  it("serializes heading and paragraph AetherDoc to deterministic Markdown", async () => {
    const markdown = await serializer.serialize(headingParagraphDoc(2, "Title", "Body"), schema);
    assert.equal(markdown, "## Title\n\nBody\n");
  });

  it("produces identical output for repeated serialization of the same doc", async () => {
    const doc = headingParagraphDoc(2, "Title", "Body");
    const first = await serializer.serialize(doc, schema);
    const second = await serializer.serialize(doc, schema);
    assert.equal(first, second);
  });
});

describe("Remark SerializerAdapter GFM golden strings", () => {
  const serializer = createRemarkSerializerAdapter();

  it("serializes strong inline to **text** golden string", async () => {
    const markdown = await serializer.serialize(
      {
        type: "doc",
        children: [
          {
            type: "paragraph",
            children: [
              {
                type: "mark",
                mark: "strong",
                children: [{ type: "text", text: "text" }],
              },
            ],
          },
        ],
      },
      schema,
    );
    assert.equal(markdown, "**text**\n");
  });

  it("serializes emphasis inline to *text* golden string", async () => {
    const markdown = await serializer.serialize(
      {
        type: "doc",
        children: [
          {
            type: "paragraph",
            children: [
              {
                type: "mark",
                mark: "emphasis",
                children: [{ type: "text", text: "text" }],
              },
            ],
          },
        ],
      },
      schema,
    );
    assert.equal(markdown, "*text*\n");
  });

  it("serializes unordered list to - item golden string", async () => {
    const markdown = await serializer.serialize(
      {
        type: "doc",
        children: [
          {
            type: "list",
            ordered: false,
            items: [
              [
                {
                  type: "paragraph",
                  children: [{ type: "text", text: "item" }],
                },
              ],
            ],
          },
        ],
      },
      schema,
    );
    assert.equal(markdown, "- item\n");
  });

  it("serializes ordered list to 1. item golden strings", async () => {
    const markdown = await serializer.serialize(
      {
        type: "doc",
        children: [
          {
            type: "list",
            ordered: true,
            items: [
              [
                {
                  type: "paragraph",
                  children: [{ type: "text", text: "first" }],
                },
              ],
              [
                {
                  type: "paragraph",
                  children: [{ type: "text", text: "second" }],
                },
              ],
            ],
          },
        ],
      },
      schema,
    );
    assert.equal(markdown, "1. first\n2. second\n");
  });

  it("serializes link inline to [text](href) golden string", async () => {
    const markdown = await serializer.serialize(
      {
        type: "doc",
        children: [
          {
            type: "paragraph",
            children: [
              {
                type: "link",
                href: "https://example.com",
                children: [{ type: "text", text: "label" }],
              },
            ],
          },
        ],
      },
      schema,
    );
    assert.equal(markdown, "[label](https://example.com)\n");
  });

  it("serializes combined GFM fixture to golden Markdown blocks", async () => {
    const markdown = await serializer.serialize(gfmFixtureDoc(), schema);
    assert.equal(
      markdown,
      "**bold**\n\n*italic*\n\n- item\n\n1. first\n2. second\n\n[label](https://example.com)\n",
    );
  });
});

describe("Remark SerializerAdapter error and placeholder strategy", () => {
  const serializer = createRemarkSerializerAdapter();

  it("serializes CustomBlock to unsupported block placeholder without throwing", async () => {
    const doc: AetherDoc = {
      type: "doc",
      children: [
        {
          type: "custom",
          name: "diagram",
          children: [
            {
              type: "paragraph",
              children: [{ type: "text", text: "content" }],
            },
          ],
        },
      ],
    };

    const markdown = await serializer.serialize(doc, schema);
    assert.equal(markdown, "[unsupported:block:diagram]\n");
  });

  it("rejects unsupported node types with SerializationError", async () => {
    const doc = {
      type: "doc",
      children: [
        {
          type: "unknown-block",
          children: [],
        },
      ],
    } as unknown as AetherDoc;

    await assert.rejects(
      () => serializer.serialize(doc, schema),
      (error: unknown) => {
        assert.ok(error instanceof SerializationError);
        assert.equal(error.code, "UNSUPPORTED_NODE");
        assert.equal(error.source, "serialization");
        assert.equal(error.severity, "degraded");
        return true;
      },
    );
  });

  it("keeps GFM and M3 serialize paths resolving deterministic Markdown", async () => {
    const gfmMarkdown = await serializer.serialize(gfmFixtureDoc(), schema);
    assert.equal(
      gfmMarkdown,
      "**bold**\n\n*italic*\n\n- item\n\n1. first\n2. second\n\n[label](https://example.com)\n",
    );

    const m3Markdown = await serializer.serialize(headingParagraphDoc(2, "Title", "Body"), schema);
    assert.equal(m3Markdown, "## Title\n\nBody\n");
  });
});
