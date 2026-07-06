import type { AetherBlock, AetherDoc } from "./model.js";

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

export function moveBlockInDocument(
  doc: AetherDoc,
  blockId: string,
  toIndex: number,
): AetherDoc | undefined {
  const fromIndex = findBlockIndexById(doc, blockId);
  if (fromIndex === undefined || toIndex < 0 || toIndex >= doc.children.length) {
    return undefined;
  }

  if (fromIndex === toIndex) {
    return doc;
  }

  const children = [...doc.children];
  const [block] = children.splice(fromIndex, 1);
  if (!block) {
    return undefined;
  }
  children.splice(toIndex, 0, block);
  return { type: "doc", children };
}
