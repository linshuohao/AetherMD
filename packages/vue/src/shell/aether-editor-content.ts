import type { ReplaceTextCommand } from "@aether-md/core";
import {
  createProseMirrorView,
  refreshProseMirrorViewFromSession,
} from "@aether-md/plugin-prosemirror";
import { defineComponent, h, inject, nextTick, onUnmounted, ref, watch } from "vue";

import { AETHER_EDITOR_CONTEXT_KEY } from "./context.js";

/**
 * Phase 0 ProseMirror integration surface (M5 interim shell).
 *
 * @deprecated Prefer {@link AetherMorphingDocument} or {@link AetherMorphingContent} for the L2
 *   Instant Morphing product north star. `AetherEditorContent` remains available for
 *   `examples/vue` content mode and legacy ProseMirror view-bridge integrations until M7 publish.
 *   See `docs/sdk/react-shell.md` for migration guidance.
 */
export const AetherEditorContent = defineComponent({
  name: "AetherEditorContent",
  setup() {
    const context = inject(AETHER_EDITOR_CONTEXT_KEY);
    if (context === undefined) {
      throw new Error("AetherEditorContent must be used within AetherEditorRoot");
    }

    const containerRef = ref<HTMLDivElement | null>(null);
    const pendingLocalEditsRef = ref(0);
    let destroyView: (() => void) | undefined;

    watch(
      [containerRef, () => context.editor, () => context.ready],
      async () => {
        destroyView?.();
        destroyView = undefined;

        await nextTick();

        const editor = context.editor;
        const container = containerRef.value;
        if (!editor || !context.ready || !container) {
          return;
        }

        const session = editor.context.services.engine.session;
        const handle = createProseMirrorView({
          session,
          dom: container,
          dispatchInput: (request: ReplaceTextCommand) => {
            pendingLocalEditsRef.value += 1;
            void editor
              .dispatch({
                id: "core:replaceText",
                payload: {
                  blockIndex: request.blockIndex,
                  ...(request.children !== undefined ? { children: request.children } : {}),
                  ...(request.text !== undefined
                    ? { text: request.text }
                    : request.children === undefined
                      ? { text: "" }
                      : {}),
                },
              })
              .then((result) => {
                if (!result.ok) {
                  pendingLocalEditsRef.value = Math.max(0, pendingLocalEditsRef.value - 1);
                }
              })
              .catch(() => {
                pendingLocalEditsRef.value = Math.max(0, pendingLocalEditsRef.value - 1);
              });
          },
        });

        const unsubscribe = editor.on("change", () => {
          if (pendingLocalEditsRef.value > 0) {
            pendingLocalEditsRef.value -= 1;
            return;
          }
          refreshProseMirrorViewFromSession(handle, session);
        });

        destroyView = () => {
          unsubscribe();
          handle.destroy();
        };
      },
      { flush: "post", immediate: true },
    );

    onUnmounted(() => {
      destroyView?.();
    });

    return () =>
      h("div", {
        ref: containerRef,
        "data-testid": "aether-editor-content",
      });
  },
});
