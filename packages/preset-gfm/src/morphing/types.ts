import type { AetherBlock, AetherInline, ParagraphBlock } from "@aether-md/core";

import type { MorphingBlockStrategy } from "./contracts.js";

export type {
  CustomBlockRenderer,
  MorphingBlockStrategy,
  MorphingStrategyRegistry,
  ParseBlockMarkdownPayload,
} from "./contracts.js";
export {
  PARSE_BLOCK_MARKDOWN_COMMAND,
  createMorphingStrategyRegistry,
} from "./contracts.js";

export function isParagraphBlock(block: AetherBlock): block is ParagraphBlock {
  return block.type === "paragraph";
}

export function paragraphTextContent(block: ParagraphBlock): string {
  return block.children.map((inline) => inlineText(inline)).join("");
}

function inlineText(inline: AetherInline): string {
  if (inline.type === "text") {
    return inline.text;
  }
  if (inline.type === "mark" || inline.type === "link") {
    return inline.children.map((child) => inlineText(child)).join("");
  }
  return "";
}

/** @deprecated Use `MorphingBlockStrategy`. */
export type GfmMorphingBlockStrategy = MorphingBlockStrategy;
