import assert from "node:assert/strict";
import { describe, it } from "vitest";

import {
  PARSE_BLOCK_MARKDOWN_COMMAND,
  createMorphingStrategyRegistry,
  type CustomBlockRenderer,
  type MorphingBlockStrategy,
} from "./index.js";

describe("@aether-md/morphing-contracts", () => {
  it("exports parse-block-markdown command constant", () => {
    assert.equal(PARSE_BLOCK_MARKDOWN_COMMAND, "core:parseBlockMarkdown");
  });

  it("createMorphingStrategyRegistry indexes strategies by block type", () => {
    const renderer: CustomBlockRenderer = {
      mount() {},
    };
    const strategy: MorphingBlockStrategy = {
      blockType: "paragraph",
      serializeSource: () => "",
      parseSource: async () => ({ type: "paragraph", children: [] }),
      interactiveRenderer: renderer,
    };

    const registry = createMorphingStrategyRegistry([strategy]);

    assert.equal(registry.get("paragraph"), strategy);
    assert.equal(registry.get("heading"), undefined);
    assert.deepEqual(registry.list(), [strategy]);
  });
});
