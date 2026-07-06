import type {
  AetherBlock,
  AetherInline,
  MorphingBlockStrategy,
  ParagraphBlock,
} from "@aether-md/core";

/** @deprecated Use `MorphingBlockStrategy` from `@aether-md/core`. */
export type GfmMorphingBlockStrategy = MorphingBlockStrategy;

/** DOM morphing renderer contract (see `docs/sdk/custom-block-renderer.md`). */
export type { CustomBlockRenderer } from "@aether-md/core";

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
