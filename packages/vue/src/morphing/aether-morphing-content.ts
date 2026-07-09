import { type AetherBlock } from "@aether-md/core/document";

import { defineComponent, h, ref, type PropType } from "vue";

import { useAetherEditor } from "../shell/use-aether-editor.js";
import type { MorphingBlockStrategy } from "./contracts.js";
import { MorphingBlockSurface } from "./morphing-block-surface.js";

export const AetherMorphingContent = defineComponent({
  name: "AetherMorphingContent",
  props: {
    blockIndex: {
      type: Number as PropType<number>,
      default: 0,
    },
  },
  setup(props) {
    const shell = useAetherEditor();
    const focused = ref(false);

    return () => {
      if (!shell.ready || !shell.doc || !shell.editor) {
        return h(
          "div",
          { "data-testid": "aether-morphing-content", "data-ready": "false" },
          "Loading…",
        );
      }

      const block = shell.doc.children[props.blockIndex];
      const strategy = block
        ? (shell.editor.getMorphingStrategy(block.type) as MorphingBlockStrategy | undefined)
        : undefined;
      if (!block || !strategy) {
        return h(
          "div",
          { "data-testid": "aether-morphing-content", "data-ready": "true" },
          h("p", `Unsupported block at index ${props.blockIndex}`),
        );
      }

      return h(
        "div",
        {
          "data-testid": "aether-morphing-content",
          "data-ready": "true",
          "data-focused": focused.value ? "true" : "false",
        },
        [
          h(MorphingBlockSurface, {
            blockIndex: props.blockIndex,
            block: block as AetherBlock,
            strategy,
            localFocus: focused.value,
            onLocalFocusChange: (nextFocused: boolean) => {
              focused.value = nextFocused;
            },
          }),
        ],
      );
    };
  },
});
