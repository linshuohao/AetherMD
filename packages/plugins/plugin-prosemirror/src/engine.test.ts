import assert from "node:assert/strict";
import { describe, it } from "node:test";

import type {
  AetherDoc,
  LinkInline,
  ListBlock,
  MarkedInline,
  ParagraphBlock,
  TextInline,
} from "@aether-md/core";
import { AdapterError } from "@aether-md/core";
import { runEngineAdapterContractTests } from "@aether-md/adapter-contract-tests";

import { gfmFixtureDoc } from "./fixtures/gfm-doc.js";
import { createProseMirrorEngineAdapter } from "./engine.js";

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

runEngineAdapterContractTests("ProseMirror", createProseMirrorEngineAdapter);

describe("ProseMirror EngineAdapter", () => {
  const engine = createProseMirrorEngineAdapter();

  it("preserves inline marks when replaceText uses structured children", async () => {
    const session = await engine.create(paragraphDoc("Hello world"));
    const result = await engine.apply(session, {
      type: "replaceText",
      blockIndex: 0,
      children: [
        { type: "text", text: "Hello " },
        {
          type: "mark",
          mark: "strong",
          children: [{ type: "text", text: "AetherMD" }],
        },
      ],
    });

    assert.equal(result.ok, true);
    const block = result.doc!.children[0] as ParagraphBlock;
    assert.equal(block.children.length, 2);
    assert.equal((block.children[1] as MarkedInline).mark, "strong");
    assert.equal(((block.children[1] as MarkedInline).children[0] as TextInline).text, "AetherMD");
  });

  it("updates list item paragraph when replaceText includes list item index", async () => {
    const initial = gfmFixtureDoc();
    const session = await engine.create(initial);

    const result = await engine.apply(session, {
      type: "replaceText",
      blockIndex: 2,
      text: "0",
      children: [{ type: "text", text: "item updated" }],
    });

    assert.equal(result.ok, true);
    const list = result.doc!.children[2] as ListBlock;
    assert.equal(list.type, "list");
    assert.equal((list.items[0]![0] as ParagraphBlock).children[0]?.type, "text");
    assert.equal(
      ((list.items[0]![0] as ParagraphBlock).children[0] as TextInline).text,
      "item updated",
    );
  });

  it("returns ok false when replaceText targets a non-text block", async () => {
    const initial = gfmFixtureDoc();
    const session = await engine.create(initial);
    const before = engine.getDocument(session);

    const result = await engine.apply(session, {
      type: "replaceText",
      blockIndex: 2,
      text: "ignored",
    });

    assert.equal(result.ok, false);
    assert.ok(result.error instanceof AdapterError);
    assert.deepEqual(engine.getDocument(session), before);
  });

  it("replaces entire list block when replacement is provided", async () => {
    const initial = gfmFixtureDoc();
    const session = await engine.create(initial);

    const replacement: ListBlock = {
      type: "list",
      ordered: false,
      items: [
        [
          {
            type: "paragraph",
            children: [{ type: "text", text: "alpha" }],
          },
        ],
        [
          {
            type: "paragraph",
            children: [{ type: "text", text: "beta" }],
          },
        ],
      ],
    };

    const result = await engine.apply(session, {
      type: "replaceText",
      blockIndex: 2,
      replacement,
    });

    assert.equal(result.ok, true);
    const list = result.doc!.children[2] as ListBlock;
    assert.equal(list.items.length, 2);
    assert.equal(((list.items[1]![0] as ParagraphBlock).children[0] as TextInline).text, "beta");
  });

  it("converts internal throws to AdapterError without leaking to harness", async () => {
    const session = await engine.create(paragraphDoc("Hello"));
    const result = await engine.apply(session, {
      type: "unsupported" as "replaceText",
      blockIndex: 0,
      text: "x",
    });

    assert.equal(result.ok, false);
    assert.ok(result.error instanceof AdapterError);
  });
});

describe("ProseMirror EngineAdapter GFM structures", () => {
  const engine = createProseMirrorEngineAdapter();

  it("preserves GFM structures in unedited blocks after successful apply", async () => {
    const initial = gfmFixtureDoc();
    const session = await engine.create(initial);

    const result = await engine.apply(session, {
      type: "replaceText",
      blockIndex: 0,
      text: "updated bold",
    });

    assert.equal(result.ok, true);
    const snapshot = engine.getDocument(session);

    const list = snapshot.children[2] as ListBlock;
    assert.equal(list.type, "list");
    assert.equal(list.ordered, false);

    const linkParagraph = snapshot.children[3] as ParagraphBlock;
    const link = linkParagraph.children[0] as LinkInline;
    assert.equal(link.type, "link");
    assert.equal(link.href, "https://example.com");

    const emphasisParagraph = snapshot.children[1] as ParagraphBlock;
    const emphasis = emphasisParagraph.children[0] as MarkedInline;
    assert.equal(emphasis.type, "mark");
    assert.equal(emphasis.mark, "emphasis");
  });

  it("preserves GFM snapshot on failed apply without polluting structures", async () => {
    const initial = gfmFixtureDoc();
    const session = await engine.create(initial);
    const before = engine.getDocument(session);

    const result = await engine.apply(session, {
      type: "replaceText",
      blockIndex: 99,
      text: "invalid",
    });

    assert.equal(result.ok, false);
    assert.ok(result.error instanceof AdapterError);

    const after = engine.getDocument(session);
    assert.deepEqual(after, before);

    const list = after.children[2] as ListBlock;
    assert.equal(list.type, "list");
    const linkParagraph = after.children[3] as ParagraphBlock;
    assert.equal((linkParagraph.children[0] as LinkInline).type, "link");
  });
});
