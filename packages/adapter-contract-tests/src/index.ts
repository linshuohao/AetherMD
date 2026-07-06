import assert from "node:assert/strict";
import { describe, it } from "node:test";

import type {
  AetherDoc,
  EngineAdapter,
  ParagraphBlock,
  ParserAdapter,
  SerializerAdapter,
  TextInline,
} from "@aether-md/core";
import { AdapterError } from "@aether-md/core";

const DEFAULT_SCHEMA = { version: 1 as const };

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

export function runParserAdapterContractTests(
  label: string,
  createParser: () => ParserAdapter,
): void {
  describe(`${label} parser adapter contract`, () => {
    const parser = createParser();

    it("parse returns a doc root with at least one block", async () => {
      const doc = await parser.parse("Hello world\n", DEFAULT_SCHEMA);
      assert.equal(doc.type, "doc");
      assert.ok(doc.children.length >= 1);
    });

    it("parse maps paragraph markdown to paragraph block text", async () => {
      const doc = await parser.parse("Hello world\n", DEFAULT_SCHEMA);
      const block = doc.children[0] as ParagraphBlock;
      assert.equal(block.type, "paragraph");
      assert.equal((block.children[0] as TextInline).text, "Hello world");
    });
  });
}

export function runSerializerAdapterContractTests(
  label: string,
  createSerializer: () => SerializerAdapter,
): void {
  describe(`${label} serializer adapter contract`, () => {
    const serializer = createSerializer();

    it("serialize emits deterministic paragraph markdown", async () => {
      const doc = paragraphDoc("Hello world");
      const first = await serializer.serialize(doc, DEFAULT_SCHEMA);
      const second = await serializer.serialize(doc, DEFAULT_SCHEMA);
      assert.equal(first, second);
      assert.match(first, /Hello world/);
    });
  });
}

export function runEngineAdapterContractTests(
  label: string,
  createEngine: () => EngineAdapter,
): void {
  describe(`${label} engine adapter contract`, () => {
    const engine = createEngine();

    it("create returns a session and getDocument mirrors initial doc", async () => {
      const initial = paragraphDoc("Hello world");
      const session = await engine.create(initial);
      const snapshot = engine.getDocument(session);
      assert.equal(snapshot.type, "doc");
      const block = snapshot.children[0] as ParagraphBlock;
      assert.equal((block.children[0] as TextInline).text, "Hello world");
    });

    it("apply returns ok true with updated doc on successful replaceText", async () => {
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

    it("apply returns AdapterError and preserves snapshot on failed replaceText", async () => {
      const initial = paragraphDoc("Hello world");
      const session = await engine.create(initial);
      const before = engine.getDocument(session);
      const result = await engine.apply(session, {
        type: "replaceText",
        blockIndex: 99,
        text: "invalid",
      });
      assert.equal(result.ok, false);
      assert.ok(result.error instanceof AdapterError);
      assert.deepEqual(engine.getDocument(session), before);
    });

    it("dispose is safe to call repeatedly", async () => {
      const session = await engine.create(paragraphDoc("Hello"));
      await engine.dispose(session);
      await assert.doesNotReject(async () => engine.dispose(session));
    });
  });
}
