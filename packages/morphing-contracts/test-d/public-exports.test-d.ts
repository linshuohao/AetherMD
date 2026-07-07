import { expectType } from "tsd";

import {
  PARSE_BLOCK_MARKDOWN_COMMAND,
  createMorphingStrategyRegistry,
  type MorphingBlockStrategy,
} from "@aether-md/morphing-contracts";

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
