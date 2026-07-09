import { createEditor, type AetherEditor, type ExtensionPlugin } from "@aether-md/core";
import { type AetherDoc } from "@aether-md/core/document";

import {
  defineComponent,
  onUnmounted,
  provide,
  reactive,
  ref,
  watch,
  type PropType,
  type Ref,
} from "vue";

import { AETHER_EDITOR_CONTEXT_KEY } from "./context.js";
import { shouldApplyControlledValue } from "./gate-lock.js";

function createChangeHandler(
  editor: AetherEditor,
  context: { markdown: string; doc: AetherDoc | null },
  prevControlledRef: Ref<string | undefined>,
  isControlled: boolean,
  onChange?: (markdown: string) => void,
) {
  return editor.on("change", async () => {
    const nextMarkdown = await editor.getMarkdown();
    const nextDoc = editor.getDocument();
    context.markdown = nextMarkdown;
    context.doc = nextDoc;
    if (isControlled) {
      prevControlledRef.value = nextMarkdown;
    }
    onChange?.(nextMarkdown);
  });
}

function editorConfigFromProps(props: {
  plugins: readonly ExtensionPlugin[];
  initialValue?: string | undefined;
  readOnly: boolean;
}) {
  return {
    plugins: props.plugins,
    ...(props.initialValue !== undefined ? { initialValue: props.initialValue } : {}),
    ...(props.readOnly ? { readOnly: true as const } : {}),
  };
}

export const AetherEditorRoot = defineComponent({
  name: "AetherEditorRoot",
  props: {
    plugins: {
      type: Array as PropType<readonly ExtensionPlugin[]>,
      required: true,
    },
    initialValue: {
      type: String,
      required: false,
    },
    value: {
      type: String,
      required: false,
    },
    markdown: {
      type: String,
      required: false,
    },
    onChange: {
      type: Function as PropType<(markdown: string) => void>,
      required: false,
    },
    readOnly: {
      type: Boolean,
      default: false,
    },
  },
  setup(props, { slots }) {
    const context = reactive({
      editor: null as AetherEditor | null,
      markdown: "",
      doc: null as AetherDoc | null,
      ready: false,
      error: null as Error | null,
    });

    provide(AETHER_EDITOR_CONTEXT_KEY, context);

    const prevControlledRef = ref<string | undefined>(undefined);
    const pluginsKey = () => props.plugins.map((plugin) => plugin.manifest.metadata.name).join("|");

    watch(
      () => [pluginsKey(), props.initialValue, props.readOnly] as const,
      () => {
        let cancelled = false;
        let activeEditor: AetherEditor | null = null;
        let unsubscribe: (() => void) | undefined;

        async function mountEditor() {
          context.ready = false;
          context.error = null;

          const controlledValue = props.value ?? props.markdown;
          const mountInitial = controlledValue !== undefined ? controlledValue : props.initialValue;
          const isControlled = controlledValue !== undefined;

          try {
            const created = await createEditor(
              editorConfigFromProps({
                plugins: props.plugins,
                ...(mountInitial !== undefined ? { initialValue: mountInitial } : {}),
                readOnly: props.readOnly,
              }),
            );

            if (cancelled) {
              await created.dispose();
              return;
            }

            activeEditor = created;
            const nextMarkdown = await created.getMarkdown();
            const nextDoc = created.getDocument();

            context.editor = created;
            context.markdown = nextMarkdown;
            context.doc = nextDoc;
            context.ready = true;
            prevControlledRef.value =
              controlledValue !== undefined ? controlledValue : nextMarkdown;

            unsubscribe = createChangeHandler(
              created,
              context,
              prevControlledRef,
              isControlled,
              props.onChange,
            );
          } catch (error) {
            if (!cancelled) {
              context.error = error instanceof Error ? error : new Error(String(error));
              context.ready = false;
            }
          }
        }

        void mountEditor();

        return () => {
          cancelled = true;
          unsubscribe?.();
          void (async () => {
            if (activeEditor) {
              await activeEditor.dispose();
            }
            context.editor = null;
            context.ready = false;
            context.doc = null;
            context.markdown = "";
          })();
        };
      },
      { immediate: true },
    );

    watch(
      () => props.value ?? props.markdown,
      (controlledValue) => {
        if (!context.editor || !context.ready || controlledValue === undefined) {
          return;
        }

        if (!shouldApplyControlledValue(prevControlledRef.value, controlledValue)) {
          return;
        }

        if (prevControlledRef.value === undefined) {
          prevControlledRef.value = controlledValue;
          return;
        }

        let cancelled = false;
        const editor = context.editor;
        const isControlled = true;
        let unsubscribe: (() => void) | undefined;

        void (async () => {
          prevControlledRef.value = controlledValue;
          await editor.dispose();

          if (cancelled) {
            return;
          }

          const recreated = await createEditor(
            editorConfigFromProps({
              plugins: props.plugins,
              initialValue: controlledValue,
              readOnly: props.readOnly,
            }),
          );

          if (cancelled) {
            await recreated.dispose();
            return;
          }

          const nextMarkdown = await recreated.getMarkdown();
          context.editor = recreated;
          context.markdown = nextMarkdown;
          context.doc = recreated.getDocument();
          context.ready = true;

          unsubscribe = createChangeHandler(
            recreated,
            context,
            prevControlledRef,
            isControlled,
            props.onChange,
          );
        })();

        return () => {
          cancelled = true;
          unsubscribe?.();
        };
      },
    );

    onUnmounted(() => {
      void context.editor?.dispose();
      context.editor = null;
      context.ready = false;
      context.doc = null;
      context.markdown = "";
    });

    return () => slots.default?.();
  },
});
