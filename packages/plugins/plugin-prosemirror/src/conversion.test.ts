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

import { gfmFixtureDoc } from "./fixtures/gfm-doc.js";
import { aetherDocToPm, pmToAetherDoc } from "./conversion.js";

describe("ProseMirror GFM conversion round-trip", () => {
  it("preserves ListBlock through aetherDocToPm and pmToAetherDoc", () => {
    const doc = gfmFixtureDoc();
    const roundTripped = pmToAetherDoc(aetherDocToPm(doc));

    const list = roundTripped.children[2] as ListBlock;
    assert.equal(list.type, "list");
    assert.equal(list.ordered, false);
    assert.equal(
      ((list.items[0]?.[0] as ParagraphBlock).children[0] as TextInline).text,
      "item",
    );
  });

  it("preserves LinkInline through aetherDocToPm and pmToAetherDoc", () => {
    const doc = gfmFixtureDoc();
    const roundTripped = pmToAetherDoc(aetherDocToPm(doc));

    const paragraph = roundTripped.children[3] as ParagraphBlock;
    const link = paragraph.children[0] as LinkInline;
    assert.equal(link.type, "link");
    assert.equal(link.href, "https://example.com");
    assert.equal((link.children[0] as TextInline).text, "label");
  });

  it("preserves MarkedInline strong and emphasis through conversion", () => {
    const doc = gfmFixtureDoc();
    const roundTripped = pmToAetherDoc(aetherDocToPm(doc));

    const strongParagraph = roundTripped.children[0] as ParagraphBlock;
    const strong = strongParagraph.children[0] as MarkedInline;
    assert.equal(strong.type, "mark");
    assert.equal(strong.mark, "strong");

    const emphasisParagraph = roundTripped.children[1] as ParagraphBlock;
    const emphasis = emphasisParagraph.children[0] as MarkedInline;
    assert.equal(emphasis.type, "mark");
    assert.equal(emphasis.mark, "emphasis");
  });
});
