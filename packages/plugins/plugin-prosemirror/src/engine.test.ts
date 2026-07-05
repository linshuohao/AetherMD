import assert from "node:assert/strict";
import { describe, it } from "node:test";

import type { AetherDoc, HeadingBlock, ParagraphBlock, TextInline } from "@aether-md/core";
import { AdapterError } from "@aether-md/core";

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
