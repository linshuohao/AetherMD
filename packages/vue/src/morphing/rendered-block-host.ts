import type { AetherBlock } from "@aether-md/core";
import { RenderError } from "@aether-md/core";
import { defineComponent, h, onMounted, onUnmounted, ref, watch, type PropType } from "vue";

import type { CustomBlockRenderer } from "./contracts.js";

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
    const renderError = ref<RenderError | null>(null);

    const mountRenderer = () => {
      const container = containerRef.value;
      if (!container) {
        return;
      }

      container.replaceChildren();
      renderError.value = null;

      try {
        props.renderer.mount(container, props.block);
      } catch (cause) {
        renderError.value = new RenderError({
          code: "RENDER_MOUNT_FAILED",
          message: cause instanceof Error ? cause.message : "Block renderer mount failed",
          cause,
        });
      }
    };

    onMounted(() => {
      mountRenderer();
    });

    watch(
      () => [props.block, props.renderer] as const,
      () => {
        mountRenderer();
      },
    );

    onUnmounted(() => {
      try {
        props.renderer.unmount?.();
      } catch {
        // Best-effort cleanup.
      }
      containerRef.value?.replaceChildren();
    });

    return () => {
      if (renderError.value) {
        return h(
          "button",
          {
            type: "button",
            "data-testid": "morphing-render-fallback",
            onClick: () => props.onFocus(),
          },
          renderError.value.message,
        );
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
