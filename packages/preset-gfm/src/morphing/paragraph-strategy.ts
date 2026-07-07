import type { ParagraphBlock } from "@aether-md/core";

import type { CustomBlockRenderer, MorphingBlockStrategy } from "@aether-md/morphing-contracts";
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
