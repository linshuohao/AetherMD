import { type AetherBlock } from "@aether-md/core/document";

import { defineComponent, h } from "vue";

import { useAetherEditor } from "../shell/use-aether-editor.js";
import type { MorphingBlockStrategy } from "./contracts.js";
import { MorphingBlockSurface } from "./morphing-block-surface.js";
import { MorphingFocusProvider, useMorphingFocus } from "./morphing-focus-context.js";

type AetherEditorInstance = NonNullable<ReturnType<typeof useAetherEditor>["editor"]>;

const MorphingDocumentBody = defineComponent({
  name: "MorphingDocumentBody",
  props: {
    morphingBlocks: {
      type: Array as () => { block: AetherBlock; index: number }[],
      required: true,
    },
    editor: {
      type: Object as () => AetherEditorInstance,
      required: true,
    },
  },
  setup(props) {
    const focusContext = useMorphingFocus();

    return () =>
      h(
        "div",
        {
          "data-testid": "aether-morphing-document",
          "data-ready": "true",
          "data-focused-block-id": focusContext?.focusedBlockId.value ?? "",
          class: "aether-morphing-document",
        },
        props.morphingBlocks.map(({ block, index }) => {
          const strategy = props.editor.getMorphingStrategy(block.type) as MorphingBlockStrategy;
          return h(MorphingBlockSurface, {
            key: block.id ?? index,
            blockIndex: index,
            block: block as AetherBlock,
            strategy,
          });
        }),
      );
  },
});

export const AetherMorphingDocument = defineComponent({
  name: "AetherMorphingDocument",
  setup() {
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

      return h(MorphingFocusProvider, null, {
        default: () =>
          h(MorphingDocumentBody, {
            morphingBlocks,
            editor: shell.editor!,
          }),
      });
    };
  },
});
