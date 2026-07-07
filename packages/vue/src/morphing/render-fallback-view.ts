import type { RenderError } from "@aether-md/core";
import { defineComponent, h, type PropType } from "vue";

export const RenderFallbackView = defineComponent({
  name: "RenderFallbackView",
  props: {
    error: {
      type: Object as PropType<RenderError>,
      required: true,
    },
    onFocus: {
      type: Function as PropType<() => void>,
      required: true,
    },
  },
  setup(props) {
    return () =>
      h(
        "div",
        {
          "data-testid": "morphing-render-fallback",
          class: "aether-render-fallback",
          role: "alert",
          tabindex: 0,
          onFocus: () => props.onFocus(),
          onMousedown: (event: MouseEvent) => {
            event.preventDefault();
            props.onFocus();
          },
        },
        [
          h(
            "span",
            {
              "data-testid": "morphing-render-fallback-message",
            },
            props.error.message,
          ),
        ],
      );
  },
});
