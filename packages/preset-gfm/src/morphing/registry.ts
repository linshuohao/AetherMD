import { type AetherBlock } from "@aether-md/core/document";

import {
  createMorphingStrategyRegistry,
  type CustomBlockRenderer,
  type MorphingBlockStrategy,
  type MorphingStrategyRegistry,
} from "@aether-md/morphing-contracts";

import { listMorphingStrategy } from "./list-strategy.js";
import { paragraphMorphingStrategy } from "./paragraph-strategy.js";

const strategies: MorphingBlockStrategy[] = [paragraphMorphingStrategy, listMorphingStrategy];

export function createGfmMorphingRegistry(): MorphingStrategyRegistry {
  return createMorphingStrategyRegistry(strategies);
}

export function getSupportedGfmMorphingBlockTypes(): AetherBlock["type"][] {
  return createGfmMorphingRegistry()
    .list()
    .map((strategy) => strategy.blockType);
}

export function createGfmInteractiveRenderers(): Record<string, CustomBlockRenderer> {
  return {
    paragraph: paragraphMorphingStrategy.interactiveRenderer,
    list: listMorphingStrategy.interactiveRenderer,
  };
}

export { paragraphMorphingStrategy, listMorphingStrategy };
