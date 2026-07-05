import assert from "node:assert/strict";
import { describe, it } from "node:test";

import type { AetherDoc, HeadingBlock, LinkInline, ListBlock, MarkedInline, ParagraphBlock, TextInline } from "@aether-md/core";
import { AdapterError } from "@aether-md/core";

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

function headingParagraphDoc(title: string, body: string): AetherDoc {
  return {
    type: "doc",
    children: [
      {
        type: "heading",
        level: 2,
        children: [{ type: "text", text: title }],
      },
      {
        type: "paragraph",
        children: [{ type: "text", text: body }],
      },
    ],
  };
}

describe("ProseMirror EngineAdapter", () => {
  const engine = createProseMirrorEngineAdapter();

  it("creates a session and getDocument returns equivalent initial snapshot", async () => {
    const initial = paragraphDoc("Hello world");
    const session = await engine.create(initial);
    const snapshot = engine.getDocument(session);

    assert.equal(snapshot.type, "doc");
    assert.equal(snapshot.children.length, 1);
    const block = snapshot.children[0] as ParagraphBlock;
    assert.equal((block.children[0] as TextInline).text, "Hello world");
  });

  it("returns ok true and updated doc on successful replaceText apply", async () => {
    const session = await engine.create(paragraphDoc("Hello world"));
    const result = await engine.apply(session, {
      type: "replaceText",
      blockIndex: 0,
      text: "Hello AetherMD",
    });

    assert.equal(result.ok, true);
    assert.ok(result.doc);
    const block = result.doc!.children[0] as ParagraphBlock;
    assert.equal((block.children[0] as TextInline).text, "Hello AetherMD");
  });

  it("returns ok false with AdapterError and preserves snapshot on failed apply", async () => {
    const initial = headingParagraphDoc("Title", "Body");
    const session = await engine.create(initial);
    const before = engine.getDocument(session);

    const result = await engine.apply(session, {
      type: "replaceText",
      blockIndex: 99,
      text: "invalid",
    });

    assert.equal(result.ok, false);
    assert.ok(result.error instanceof AdapterError);
    assert.equal(result.error?.source, "adapter");
    assert.deepEqual(engine.getDocument(session), before);
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

  it("disposes session safely and allows repeated dispose", async () => {
    const session = await engine.create(paragraphDoc("Hello"));
    await engine.dispose(session);
    await assert.doesNotReject(async () => engine.dispose(session));

    const afterDispose = engine.getDocument(session);
    assert.equal(afterDispose.children.length, 0);
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
