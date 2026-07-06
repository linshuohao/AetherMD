import type { AetherBlock, ParagraphBlock } from "@aether-md/core";
import { serializeParagraphInlines } from "@aether-md/plugin-remark";

import { appendInlineToDom } from "./dom-inlines.js";
import type { CustomBlockRenderer, GfmMorphingBlockStrategy } from "./types.js";
import { isParagraphBlock } from "./types.js";

const paragraphInteractiveRenderer: CustomBlockRenderer = {
  mount(domContainer, blockData) {
    domContainer.replaceChildren();
    const block = blockData as ParagraphBlock;
    if (!isParagraphBlock(block)) {
      return;
    }
    for (const inline of block.children) {
      appendInlineToDom(domContainer, inline);
    }
  },
};

export const paragraphMorphingStrategy: GfmMorphingBlockStrategy = {
  blockType: "paragraph",
  serializeSource(block) {
    return serializeParagraphInlines(block as ParagraphBlock);
  },
  async parseSource(rawSource, parseMarkdown) {
    const parsed = await parseMarkdown(`${rawSource}\n`);
    if (parsed && isParagraphBlock(parsed)) {
      return parsed;
    }
    return {
      type: "paragraph",
      children: [{ type: "text", text: rawSource }],
    };
  },
  interactiveRenderer: paragraphInteractiveRenderer,
};

export function paragraphSourceFromBlock(block: ParagraphBlock): string {
  return paragraphMorphingStrategy.serializeSource(block);
}

export function renderParagraphFromBlock(block: ParagraphBlock): void {
  throw new Error(
    "renderParagraphFromBlock is DOM-only; use interactiveRenderer.mount in Shell",
  );
}
