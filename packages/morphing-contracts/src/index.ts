/** DOM morphing renderer contract (see `docs/sdk/custom-block-renderer.md`). */
import { type AetherBlock } from "@aether-md/core/document";
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

export interface MorphingStrategyRegistry {
  get(blockType: AetherBlock["type"]): MorphingBlockStrategy | undefined;
  list(): readonly MorphingBlockStrategy[];
}

export function createMorphingStrategyRegistry(
  strategies: readonly MorphingBlockStrategy[],
): MorphingStrategyRegistry {
  const byType = new Map<AetherBlock["type"], MorphingBlockStrategy>();
  for (const strategy of strategies) {
    byType.set(strategy.blockType, strategy);
  }

  return {
    get(blockType) {
      return byType.get(blockType);
    },
    list() {
      return strategies;
    },
  };
}

export const PARSE_BLOCK_MARKDOWN_COMMAND = "core:parseBlockMarkdown" as const;

export interface ParseBlockMarkdownPayload {
  markdown: string;
}
