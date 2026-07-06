import assert from "node:assert/strict";
import { describe, it } from "vitest";

import {
  createBlockId,
  ensureBlockId,
  ensureDocumentBlockIds,
  findBlockIndexById,
  moveBlockInDocument,
  withPreservedBlockId,
} from "./block-ids.js";

describe("block ids", () => {
  it("createBlockId returns blk_ prefixed ids", () => {
    const id = createBlockId();
    assert.match(id, /^blk_/);
  });

  it("ensureDocumentBlockIds assigns ids to all top-level children", () => {
    const doc = ensureDocumentBlockIds({
      type: "doc",
      children: [
        { type: "paragraph", children: [{ type: "text", text: "a" }] },
        { type: "paragraph", children: [{ type: "text", text: "b" }] },
      ],
    });

    assert.equal(doc.children.length, 2);
    assert.ok(doc.children[0]?.id);
    assert.ok(doc.children[1]?.id);
    assert.notEqual(doc.children[0]?.id, doc.children[1]?.id);
  });

  it("ensureBlockId preserves existing id", () => {
    const block = ensureBlockId({
      type: "paragraph",
      id: "blk_existing",
      children: [{ type: "text", text: "x" }],
    });
    assert.equal(block.id, "blk_existing");
  });

  it("findBlockIndexById resolves after reorder", () => {
    const doc = ensureDocumentBlockIds({
      type: "doc",
      children: [
        { type: "paragraph", id: "blk_a", children: [{ type: "text", text: "A" }] },
        { type: "paragraph", id: "blk_b", children: [{ type: "text", text: "B" }] },
      ],
    });

    const reordered = {
      type: "doc" as const,
      children: [doc.children[1]!, doc.children[0]!],
    };

    assert.equal(findBlockIndexById(reordered, "blk_b"), 0);
    assert.equal(findBlockIndexById(reordered, "blk_a"), 1);
  });

  it("withPreservedBlockId keeps target block id on replacement", () => {
    const target = {
      type: "paragraph" as const,
      id: "blk_target",
      children: [{ type: "text" as const, text: "old" }],
    };
    const replacement = {
      type: "paragraph" as const,
      children: [{ type: "text" as const, text: "new" }],
    };

    const merged = withPreservedBlockId(target, replacement);
    assert.equal(merged.id, "blk_target");
    assert.equal(merged.type, "paragraph");
    if (merged.type === "paragraph") {
      assert.equal(merged.children[0]?.type === "text" && merged.children[0].text, "new");
    }
  });

  it("moveBlockInDocument reorders while preserving block ids", () => {
    const doc = ensureDocumentBlockIds({
      type: "doc",
      children: [
        { type: "paragraph", children: [{ type: "text", text: "A" }] },
        { type: "paragraph", children: [{ type: "text", text: "B" }] },
        { type: "paragraph", children: [{ type: "text", text: "C" }] },
      ],
    });

    const blockBId = doc.children[1]!.id!;
    const moved = moveBlockInDocument(doc, blockBId, 2);
    assert.ok(moved);
    assert.equal(moved.children[2]?.id, blockBId);
    assert.equal(findBlockIndexById(moved, blockBId), 2);
  });

  it("moveBlockInDocument returns undefined for unknown block id", () => {
    const doc = ensureDocumentBlockIds({
      type: "doc",
      children: [{ type: "paragraph", children: [{ type: "text", text: "A" }] }],
    });

    assert.equal(moveBlockInDocument(doc, "blk_missing", 0), undefined);
  });
});
