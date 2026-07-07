import type { AetherBlock } from "@aether-md/core";
import { defineComponent, h, ref } from "vue";

import { useAetherEditor } from "../shell/use-aether-editor.js";
import type { MorphingBlockStrategy } from "./contracts.js";
import { MorphingBlockSurface } from "./morphing-block-surface.js";

export const AetherMorphingDocument = defineComponent({
  name: "AetherMorphingDocument",
  setup() {
    const focusedBlockId = ref<string | null>(null);
    const shell = useAetherEditor();

    return () => {
      if (!shell.ready || !shell.doc || !shell.editor) {
        return h(
          "div",
          { "data-testid": "aether-morphing-document", "data-ready": "false" },
          "Loading…",
        );
      }

      const morphingBlocks = shell.doc.children
        .map((block, index) => ({ block, index }))
        .filter(({ block }) => shell.editor!.getMorphingStrategy(block.type) !== undefined);

      return h(
        "div",
        {
          "data-testid": "aether-morphing-document",
          "data-ready": "true",
          "data-focused-block-id": focusedBlockId.value ?? "",
          class: "aether-morphing-document",
        },
        morphingBlocks.map(({ block, index }) => {
          const strategy = shell.editor!.getMorphingStrategy(block.type) as MorphingBlockStrategy;
          const blockId = block.id ?? String(index);
          return h(MorphingBlockSurface, {
            key: blockId,
            blockIndex: index,
            block: block as AetherBlock,
            strategy,
            focused: focusedBlockId.value === blockId,
            onFocusChange: (focused: boolean) => {
              focusedBlockId.value = focused ? blockId : null;
            },
          });
        }),
      );
    };
  },
});
