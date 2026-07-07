import type { AetherBlock } from "@aether-md/core";
import { defineComponent, h, ref, type PropType } from "vue";

import { useAetherEditor } from "../shell/use-aether-editor.js";
import { PARSE_BLOCK_MARKDOWN_COMMAND, type MorphingBlockStrategy } from "./contracts.js";
import { RenderedBlockHost } from "./rendered-block-host.js";

export const MorphingBlockSurface = defineComponent({
  name: "MorphingBlockSurface",
  props: {
    blockIndex: {
      type: Number,
      required: true,
    },
    block: {
      type: Object as PropType<AetherBlock>,
      required: true,
    },
    strategy: {
      type: Object as PropType<MorphingBlockStrategy>,
      required: true,
    },
    focused: {
      type: Boolean,
      default: false,
    },
    onFocusChange: {
      type: Function as PropType<(focused: boolean) => void>,
      required: true,
    },
  },
  setup(props) {
    const shell = useAetherEditor();
    const draftSource = ref<string | null>(null);
    const pendingEdits = ref(0);
    const revision = ref(0);

    const handleChange = async (rawSource: string) => {
      if (!shell.editor) {
        return;
      }

      draftSource.value = rawSource;
      const currentRevision = ++revision.value;
      pendingEdits.value += 1;
      try {
        const replacement = await props.strategy.parseSource(rawSource, async (markdown) => {
          const result = await shell.editor!.dispatch({
            id: PARSE_BLOCK_MARKDOWN_COMMAND,
            payload: { markdown },
          });
          if (!result.ok) {
            return undefined;
          }
          return result.value as AetherBlock | undefined;
        });

        if (currentRevision !== revision.value) {
          return;
        }

        await shell.editor.dispatch({
          id: "core:replaceText",
          payload: { blockId: props.block.id ?? String(props.blockIndex), replacement },
        });
      } finally {
        pendingEdits.value = Math.max(0, pendingEdits.value - 1);
      }
    };

    return () => {
      const sourceText =
        props.focused && draftSource.value !== null
          ? draftSource.value
          : props.strategy.serializeSource(props.block);
      const blockId = props.block.id ?? String(props.blockIndex);

      return h(
        "div",
        {
          "data-testid": `morphing-block-${props.blockIndex}`,
          "data-block-id": blockId,
          "data-block-type": props.block.type,
          "data-focused": props.focused ? "true" : "false",
          "data-pending-edits": String(pendingEdits.value),
          "data-edit-synced": pendingEdits.value === 0 ? "true" : "false",
          class: "aether-morphing-block",
        },
        props.focused
          ? h("textarea", {
              "data-testid": "morphing-source",
              class: "aether-morphing-source",
              "aria-label": `Edit block ${props.blockIndex} source`,
              value: sourceText,
              rows: props.strategy.blockType === "list" ? 4 : 3,
              spellcheck: false,
              onBlur: () => props.onFocusChange(false),
              onInput: (event: Event) => {
                void handleChange((event.target as HTMLTextAreaElement).value);
              },
            })
          : h(RenderedBlockHost, {
              block: props.block,
              renderer: props.strategy.interactiveRenderer,
              onFocus: () => props.onFocusChange(true),
            }),
      );
    };
  },
});
