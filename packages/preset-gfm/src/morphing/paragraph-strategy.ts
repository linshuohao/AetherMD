import type { CustomBlockRenderer, MorphingBlockStrategy, ParagraphBlock } from "@aether-md/core";
import { serializeParagraphInlines } from "../serialization/inline.js";

import { appendInlineToDom } from "./dom-inlines.js";
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

export const paragraphMorphingStrategy: MorphingBlockStrategy = {
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

export function renderParagraphFromBlock(_block: ParagraphBlock): void {
  throw new Error("renderParagraphFromBlock is DOM-only; use interactiveRenderer.mount in Shell");
}
