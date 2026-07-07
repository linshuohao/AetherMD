import type { AetherBlock, ListBlock, ParagraphBlock } from "@aether-md/core";
import { serializeListBlock } from "@aether-md/plugin-remark";

import { appendInlineToDom } from "./dom-inlines.js";
import type { CustomBlockRenderer, MorphingBlockStrategy } from "@aether-md/morphing-contracts";

function isListBlock(block: AetherBlock): block is ListBlock {
  return block.type === "list";
}

const listInteractiveRenderer: CustomBlockRenderer = {
  mount(domContainer, blockData) {
    domContainer.replaceChildren();
    const block = blockData as ListBlock;
    if (!isListBlock(block)) {
      return;
    }

    const listElement = document.createElement(block.ordered ? "ol" : "ul");
    for (const itemBlocks of block.items) {
      const listItem = document.createElement("li");
      const paragraph = itemBlocks.find(
        (itemBlock): itemBlock is ParagraphBlock => itemBlock.type === "paragraph",
      );
      if (paragraph) {
        for (const inline of paragraph.children) {
          appendInlineToDom(listItem, inline);
        }
      }
      listElement.append(listItem);
    }
    domContainer.append(listElement);
  },
};

export const listMorphingStrategy: MorphingBlockStrategy = {
  blockType: "list",
  serializeSource(block) {
    return serializeListBlock(block as ListBlock);
  },
  async parseSource(rawSource, parseMarkdown) {
    const parsed = await parseMarkdown(`${rawSource.trim()}\n`);
    if (parsed && isListBlock(parsed)) {
      return parsed;
    }
    return {
      type: "list",
      ordered: false,
      items: [
        [
          {
            type: "paragraph",
            children: [{ type: "text", text: rawSource }],
          },
        ],
      ],
    };
  },
  interactiveRenderer: listInteractiveRenderer,
};
