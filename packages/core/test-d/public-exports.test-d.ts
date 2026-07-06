import { expectType } from "tsd";

import {
  PARSE_BLOCK_MARKDOWN_COMMAND,
  createEditor,
  createMorphingStrategyRegistry,
  type AetherEditor,
  type MorphingBlockStrategy,
  type ParseBlockMarkdownPayload,
} from "@aether-md/core";

expectType<AetherEditor["morphing"]>(createMorphingStrategyRegistry([]));

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

const payload: ParseBlockMarkdownPayload = { markdown: "hello\n" };
expectType<typeof PARSE_BLOCK_MARKDOWN_COMMAND>("core:parseBlockMarkdown");

void payload;
void createEditor;
