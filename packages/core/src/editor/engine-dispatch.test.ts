import assert from "node:assert/strict";
import { describe, it } from "node:test";

import type { AetherDoc } from "../document-model.js";
import {
  resolveReplaceTextBlockIndex,
  toAdapterCommand,
  ENGINE_REPLACE_TEXT_COMMAND,
} from "./engine-dispatch.js";

const DOC: AetherDoc = {
  type: "doc",
  children: [
    { type: "paragraph", id: "blk_a", children: [{ type: "text", text: "A" }] },
    { type: "paragraph", id: "blk_b", children: [{ type: "text", text: "B" }] },
  ],
};

describe("engine-dispatch blockId", () => {
  it("resolveReplaceTextBlockIndex prefers blockId after reorder", () => {
    const reordered: AetherDoc = {
      type: "doc",
      children: [DOC.children[1]!, DOC.children[0]!],
    };

    assert.equal(resolveReplaceTextBlockIndex(reordered, { blockId: "blk_b" }), 0);
  });

  it("toAdapterCommand resolves blockId to correct index", () => {
    const reordered: AetherDoc = {
      type: "doc",
      children: [DOC.children[1]!, DOC.children[0]!],
    };

    const command = toAdapterCommand(reordered, {
      id: ENGINE_REPLACE_TEXT_COMMAND,
      payload: { blockId: "blk_b", text: "updated" },
    });

    assert.ok(command);
    assert.equal(command?.blockIndex, 0);
  });

  it("toAdapterCommand preserves target id on replacement", () => {
    const command = toAdapterCommand(DOC, {
      id: ENGINE_REPLACE_TEXT_COMMAND,
      payload: {
        blockId: "blk_b",
        replacement: {
          type: "paragraph",
          children: [{ type: "text", text: "replacement" }],
        },
      },
    });

    assert.ok(command?.replacement);
    assert.equal(command?.replacement?.id, "blk_b");
  });
});
