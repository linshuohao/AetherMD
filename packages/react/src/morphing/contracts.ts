import type { AetherBlock } from "@aether-md/core";

export interface CustomBlockRenderer {
  mount(domContainer: HTMLElement, blockData: unknown): void;
  update?(newBlockData: unknown): void;
  unmount?(): void;
}

export interface MorphingBlockStrategy {
  readonly blockType: AetherBlock["type"];
  serializeSource(block: AetherBlock): string;
  parseSource(
    rawSource: string,
    parseMarkdown: (markdown: string) => Promise<AetherBlock | undefined>,
  ): Promise<AetherBlock>;
  readonly interactiveRenderer: CustomBlockRenderer;
}

export const PARSE_BLOCK_MARKDOWN_COMMAND = "core:parseBlockMarkdown" as const;
