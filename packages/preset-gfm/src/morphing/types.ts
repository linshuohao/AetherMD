import type { AetherBlock, AetherInline, ParagraphBlock } from "@aether-md/core";

/** DOM morphing renderer contract (see `docs/sdk/custom-block-renderer.md`). */
export interface CustomBlockRenderer {
  mount(domContainer: HTMLElement, blockData: unknown): void;
  update?(newBlockData: unknown): void;
  unmount?(): void;
}

export interface GfmMorphingBlockStrategy {
  readonly blockType: AetherBlock["type"];
  serializeSource(block: AetherBlock): string;
  parseSource(
    rawSource: string,
    parseMarkdown: (markdown: string) => Promise<AetherBlock | undefined>,
  ): Promise<AetherBlock>;
  readonly interactiveRenderer: CustomBlockRenderer;
}

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
