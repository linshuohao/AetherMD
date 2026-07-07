import * as core from "./index.js";
import { describe, expect, it } from "vitest";

const forbiddenMorphingExports = [
  "CustomBlockRenderer",
  "MorphingBlockStrategy",
  "MorphingStrategyRegistry",
  "ParseBlockMarkdownPayload",
  "PARSE_BLOCK_MARKDOWN_COMMAND",
  "createMorphingStrategyRegistry",
] as const;

describe("core public API boundary", () => {
  for (const exportName of forbiddenMorphingExports) {
    it(`does not export morphing contract symbol ${exportName}`, () => {
      expect(exportName in core).toBe(false);
    });
  }
});
