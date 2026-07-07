import { expectType } from "tsd";

import {
  PARSE_BLOCK_MARKDOWN_COMMAND,
  createGfmPreset,
  createMorphingStrategyRegistry,
  getGfmMorphingStrategy,
  type MorphingBlockStrategy,
} from "@aether-md/preset-gfm";

const preset = createGfmPreset();

expectType<readonly MorphingBlockStrategy[]>(preset.morphingStrategies);

expectType<MorphingBlockStrategy | undefined>(getGfmMorphingStrategy("paragraph"));

const strategy: MorphingBlockStrategy = {
  blockType: "paragraph",
  serializeSource() {
    return "";
  },
  async parseSource(rawSource) {
    return { type: "paragraph", children: [{ type: "text", text: rawSource }] };
  },
  interactiveRenderer: { mount() {} },
};

expectType<MorphingBlockStrategy | undefined>(
  createMorphingStrategyRegistry([strategy]).get("paragraph"),
);

expectType<typeof PARSE_BLOCK_MARKDOWN_COMMAND>("core:parseBlockMarkdown");
