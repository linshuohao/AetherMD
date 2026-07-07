import type { AetherBlock } from "../document/model.js";

/** Kernel-internal morphing strategy record supplied by plugins; not part of Core public API. */
export interface MorphingStrategyRecord {
  readonly blockType: AetherBlock["type"];
  serializeSource(block: AetherBlock): string;
  parseSource(
    rawSource: string,
    parseMarkdown: (markdown: string) => Promise<AetherBlock | undefined>,
  ): Promise<AetherBlock>;
  readonly interactiveRenderer: MorphingRendererRecord;
}

/** Kernel-internal DOM renderer handle; not part of Core public API. */
export interface MorphingRendererRecord {
  mount(domContainer: HTMLElement, blockData: unknown): void;
  update?(newBlockData: unknown): void;
  unmount?(): void;
}

export interface MorphingStrategyRegistry {
  get(blockType: AetherBlock["type"]): MorphingStrategyRecord | undefined;
  list(): readonly MorphingStrategyRecord[];
}

export function createMorphingStrategyRegistry(
  strategies: readonly MorphingStrategyRecord[],
): MorphingStrategyRegistry {
  const byType = new Map<AetherBlock["type"], MorphingStrategyRecord>();
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
