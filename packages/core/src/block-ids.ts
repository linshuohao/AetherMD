import type { AetherBlock, AetherDoc } from "./document-model.js";

export function createBlockId(): string {
  return `blk_${crypto.randomUUID()}`;
}

export function ensureBlockId<T extends AetherBlock>(block: T): T {
  if (block.id !== undefined) {
    return block;
  }

  return { ...block, id: createBlockId() };
}

export function ensureDocumentBlockIds(doc: AetherDoc): AetherDoc {
  return {
    ...doc,
    children: doc.children.map((block) => ensureBlockId(block)),
  };
}

export function findBlockIndexById(doc: AetherDoc, blockId: string): number | undefined {
  const index = doc.children.findIndex((block) => block.id === blockId);
  return index >= 0 ? index : undefined;
}

export function withPreservedBlockId(
  target: AetherBlock | undefined,
  replacement: AetherBlock,
): AetherBlock {
  const id = target?.id ?? replacement.id ?? createBlockId();
  return { ...replacement, id };
}
