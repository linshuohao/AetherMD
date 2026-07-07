import assert from "node:assert/strict";
import { describe, it } from "vitest";

import { createGfmMorphingRegistry, getSupportedGfmMorphingBlockTypes } from "./registry.js";

describe("GFM morphing registry", () => {
  it("resolves strategies through createGfmMorphingRegistry only", () => {
    const registry = createGfmMorphingRegistry();

    assert.equal(registry.get("paragraph")?.blockType, "paragraph");
    assert.equal(registry.get("list")?.blockType, "list");
    assert.equal(registry.get("heading"), undefined);
  });

  it("lists supported block types from the registry", () => {
    const registry = createGfmMorphingRegistry();

    assert.deepEqual(
      getSupportedGfmMorphingBlockTypes(),
      registry.list().map((s) => s.blockType),
    );
  });
});
