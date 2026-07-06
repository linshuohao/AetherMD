import type { AetherBlock } from "@aether-md/core";

import { listMorphingStrategy } from "./list-strategy.js";
import { paragraphMorphingStrategy } from "./paragraph-strategy.js";
import type { CustomBlockRenderer, GfmMorphingBlockStrategy } from "./types.js";

const strategies: GfmMorphingBlockStrategy[] = [
  paragraphMorphingStrategy,
  listMorphingStrategy,
];

const strategyByType = new Map(
  strategies.map((strategy) => [strategy.blockType, strategy]),
);

export function getGfmMorphingStrategy(
  blockType: AetherBlock["type"],
): GfmMorphingBlockStrategy | undefined {
  return strategyByType.get(blockType);
}

export function getSupportedGfmMorphingBlockTypes(): AetherBlock["type"][] {
  return strategies.map((strategy) => strategy.blockType);
}

export function createGfmInteractiveRenderers(): Record<string, CustomBlockRenderer> {
  return {
    paragraph: paragraphMorphingStrategy.interactiveRenderer,
    list: listMorphingStrategy.interactiveRenderer,
  };
}

export { paragraphMorphingStrategy, listMorphingStrategy };
