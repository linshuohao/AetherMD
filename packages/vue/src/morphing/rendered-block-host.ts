import type { AetherBlock } from "@aether-md/core";
import { RenderError } from "@aether-md/core";
import { defineComponent, h, onMounted, onUnmounted, ref, watch, type PropType } from "vue";

import type { CustomBlockRenderer } from "./contracts.js";
import { RenderFallbackView } from "./render-fallback-view.js";

export const RenderedBlockHost = defineComponent({
  name: "RenderedBlockHost",
  props: {
    block: {
      type: Object as PropType<AetherBlock>,
      required: true,
    },
    renderer: {
      type: Object as PropType<CustomBlockRenderer>,
      required: true,
    },
    onFocus: {
      type: Function as PropType<() => void>,
      required: true,
    },
  },
  setup(props) {
    const containerRef = ref<HTMLDivElement | null>(null);
    const mountedIdentityRef = ref<{ blockId: string | undefined; blockType: string } | null>(null);
    const renderError = ref<RenderError | null>(null);

    const cleanupContainer = () => {
      const container = containerRef.value;
      if (!container) {
        return;
      }
      try {
        props.renderer.unmount?.();
      } catch {
        // Best-effort cleanup after a failed mount should not mask the original error.
      }
      container.replaceChildren();
      mountedIdentityRef.value = null;
    };

    watch(
      () => [props.block.id, props.block.type, props.renderer] as const,
      (_value, _oldValue, onCleanup) => {
        onCleanup(() => {
          cleanupContainer();
        });
      },
      { flush: "sync" },
    );

    onUnmounted(() => {
      cleanupContainer();
    });

    const mountBlock = () => {
      const container = containerRef.value;
      if (!container) {
        return;
      }

      renderError.value = null;
      try {
        props.renderer.mount(container, props.block);
        mountedIdentityRef.value = {
          blockId: props.block.id,
          blockType: props.block.type,
        };
      } catch (cause) {
        mountedIdentityRef.value = null;
        renderError.value = new RenderError({
          code: "RENDER_MOUNT_FAILED",
          message: cause instanceof Error ? cause.message : "Block renderer mount failed",
          cause,
        });
      }
    };

    const applyBlockChange = () => {
      const container = containerRef.value;
      if (!container) {
        return;
      }

      const mounted = mountedIdentityRef.value;
      const isMounted =
        mounted !== null &&
        mounted.blockId === props.block.id &&
        mounted.blockType === props.block.type;

      if (!isMounted) {
        mountBlock();
        return;
      }

      if (props.renderer.update) {
        renderError.value = null;
        try {
          props.renderer.update(props.block);
        } catch (cause) {
          renderError.value = new RenderError({
            code: "RENDER_UPDATE_FAILED",
            message: cause instanceof Error ? cause.message : "Block renderer update failed",
            cause,
          });
        }
        return;
      }

      try {
        props.renderer.unmount?.();
      } catch {
        // Best-effort cleanup before remount.
      }
      container.replaceChildren();
      mountBlock();
    };

    onMounted(() => {
      applyBlockChange();
    });

    watch(
      () => [props.block, props.block.id, props.block.type, props.renderer] as const,
      () => {
        applyBlockChange();
      },
    );

    return () => {
      if (renderError.value) {
        return h(RenderFallbackView, {
          error: renderError.value,
          onFocus: props.onFocus,
        });
      }

      return h("div", {
        ref: containerRef,
        "data-testid": "morphing-rendered",
        class: "aether-morphing-rendered",
        tabindex: 0,
        onFocus: () => props.onFocus(),
        onMousedown: (event: MouseEvent) => {
          event.preventDefault();
          props.onFocus();
        },
      });
    };
  },
});
