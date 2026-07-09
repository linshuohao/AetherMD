import { type AetherBlock } from "@aether-md/core/document";

import { computed, defineComponent, h, nextTick, ref, watch, type PropType } from "vue";

import { useAetherEditor } from "../shell/use-aether-editor.js";
import { PARSE_BLOCK_MARKDOWN_COMMAND, type MorphingBlockStrategy } from "./contracts.js";
import { useMorphingFocus } from "./morphing-focus-context.js";
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
    localFocus: {
      type: Boolean,
      default: false,
    },
    onLocalFocusChange: {
      type: Function as PropType<(focused: boolean) => void>,
      default: undefined,
    },
  },
  setup(props) {
    const shell = useAetherEditor();
    const focusContext = useMorphingFocus();
    const textareaRef = ref<HTMLTextAreaElement | null>(null);
    const draftSource = ref<string | null>(null);
    const pendingEdits = ref(0);
    const revision = ref(0);
    const inFlightEditRef = ref<Promise<void> | null>(null);
    const blockId = computed(() => props.block.id ?? String(props.blockIndex));
    const serializedSource = computed(() => props.strategy.serializeSource(props.block));
    const documentFocused = computed(
      () => focusContext !== null && focusContext.focusedBlockId.value === blockId.value,
    );
    const focused = computed(() =>
      focusContext !== null ? documentFocused.value : props.localFocus,
    );

    const commitFocus = async (): Promise<void> => {
      if (inFlightEditRef.value) {
        await inFlightEditRef.value;
      }
    };

    if (focusContext) {
      watch(
        blockId,
        (id, _previous, onCleanup) => {
          onCleanup(focusContext.registerFocusCommit(id, commitFocus));
        },
        { immediate: true },
      );
    }

    watch(
      () => [focused.value, blockId.value, serializedSource.value] as const,
      async ([isFocused]) => {
        if (isFocused) {
          if (draftSource.value === null) {
            draftSource.value = serializedSource.value;
          }
          await nextTick();
          textareaRef.value?.focus();
          return;
        }
        draftSource.value = null;
      },
    );

    const handleFocus = (): void => {
      if (focusContext) {
        if (focusContext.focusedBlockId.value === blockId.value) {
          return;
        }
        focusContext.requestFocus(blockId.value);
        return;
      }
      props.onLocalFocusChange?.(true);
    };

    const handleBlur = (): void => {
      if (focusContext) {
        if (focusContext.focusedBlockId.value === blockId.value) {
          focusContext.releaseFocus();
        }
        return;
      }

      void (async () => {
        await commitFocus();
        props.onLocalFocusChange?.(false);
      })();
    };

    const handleChange = (rawSource: string) => {
      if (!shell.editor) {
        return;
      }

      draftSource.value = rawSource;
      const currentRevision = ++revision.value;

      const editPromise = (async () => {
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

          await shell.editor!.dispatch({
            id: "core:replaceText",
            payload: { blockId: blockId.value, replacement },
          });
        } finally {
          pendingEdits.value = Math.max(0, pendingEdits.value - 1);
        }
      })();

      inFlightEditRef.value = editPromise;
      void editPromise.finally(() => {
        if (inFlightEditRef.value === editPromise) {
          inFlightEditRef.value = null;
        }
      });
    };

    return () => {
      const sourceText =
        focused.value && draftSource.value !== null ? draftSource.value : serializedSource.value;

      return h(
        "div",
        {
          "data-testid": `morphing-block-${props.blockIndex}`,
          "data-block-id": blockId.value,
          "data-block-type": props.block.type,
          "data-focused": focused.value ? "true" : "false",
          "data-pending-edits": String(pendingEdits.value),
          "data-edit-synced": pendingEdits.value === 0 ? "true" : "false",
          class: "aether-morphing-block",
        },
        focused.value
          ? h("textarea", {
              ref: textareaRef,
              "data-testid": "morphing-source",
              class: "aether-morphing-source",
              "aria-label": `Edit block ${props.blockIndex} source`,
              value: sourceText,
              rows: props.strategy.blockType === "list" ? 4 : 3,
              spellcheck: false,
              onFocus: handleFocus,
              onBlur: handleBlur,
              onInput: (event: Event) => {
                handleChange((event.target as HTMLTextAreaElement).value);
              },
            })
          : h(RenderedBlockHost, {
              block: props.block,
              renderer: props.strategy.interactiveRenderer,
              onFocus: handleFocus,
            }),
      );
    };
  },
});
