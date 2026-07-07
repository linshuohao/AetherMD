<script lang="ts">
import { computed, defineComponent, h, onUnmounted, ref, shallowRef, watch } from "vue";

import type { AetherEditor } from "@aether-md/core";
import { useAetherEditor } from "@aether-md/vue";

declare global {
  interface Window {
    __AETHER_E2E__?: {
      moveBlock: (blockId: string, toIndex: number) => Promise<void>;
    };
  }
}

export const E2EProbes = defineComponent({
  name: "E2EProbes",
  props: {
    markdown: {
      type: String,
      required: false,
    },
    enableMoveBlock: {
      type: Boolean,
      default: false,
    },
  },
  setup(props) {
    const shell = useAetherEditor();
    const editorRef = shallowRef<AetherEditor | null>(null);
    const editorStable = ref(true);

    const probeMarkdown = computed(() => props.markdown ?? shell.markdown);

    watch(
      () => [shell.ready, shell.editor] as const,
      ([ready, editor]) => {
        if (!ready || !editor) {
          return;
        }
        if (editorRef.value !== null && editorRef.value !== editor) {
          editorStable.value = false;
        }
        editorRef.value = editor;
      },
    );

    watch(
      () => [props.enableMoveBlock, shell.editor] as const,
      ([enableMoveBlock, editor]) => {
        if (!enableMoveBlock || !editor) {
          delete window.__AETHER_E2E__;
          return;
        }

        window.__AETHER_E2E__ = {
          moveBlock: async (blockId: string, toIndex: number) => {
            await editor.dispatch({
              id: "core:moveBlock",
              payload: { blockId, toIndex },
            });
          },
        };
      },
      { immediate: true },
    );

    onUnmounted(() => {
      delete window.__AETHER_E2E__;
    });

    return () =>
      h("div", {
        "data-testid": "e2e-probes",
        hidden: true,
        "data-markdown": probeMarkdown.value,
        "data-ready": shell.ready ? "true" : "false",
        "data-editor-stable": editorStable.value ? "true" : "false",
      });
  },
});
</script>

<script setup lang="ts">
import { ref } from "vue";

import { createGfmEditorPlugins } from "@aether-md/example-shared";
import { SHOWCASE_MARKDOWN } from "@aether-md/example-shared/showcase-markdown";
import { AetherEditorRoot, AetherMorphingDocument } from "@aether-md/vue";
import { AetherEditorContent } from "@aether-md/vue/legacy";

import MarkdownPreview from "./MarkdownPreview.vue";

const markdown = ref(SHOWCASE_MARKDOWN);
const renderCount = ref(0);
const plugins = createGfmEditorPlugins();
const mode = ref<"morphing" | "content">("morphing");

function handleChange(next: string) {
  markdown.value = next;
}
</script>

<template>
  <main class="example" data-testid="aether-vue-showcase">
    <nav class="shell-switcher" aria-label="Vue shell">
      <button
        type="button"
        class="shell-switcher-button"
        data-testid="shell-mode-morphing"
        :aria-pressed="mode === 'morphing'"
        @click="mode = 'morphing'"
      >
        AetherMorphingDocument
      </button>
      <button
        type="button"
        class="shell-switcher-button"
        data-testid="shell-mode-content"
        :aria-pressed="mode === 'content'"
        @click="mode = 'content'"
      >
        AetherEditorContent (legacy)
      </button>
    </nav>

    <AetherEditorRoot :plugins="plugins" :value="markdown" :on-change="handleChange">
      <section
        v-if="mode === 'morphing'"
        class="example-editor"
        data-testid="aether-morphing-shell"
      >
        <AetherMorphingDocument />
      </section>
      <section v-else class="example-editor" data-testid="aether-vue-basic-shell">
        <AetherEditorContent />
        <MarkdownPreview />
      </section>
      <div class="e2e-toolbar">
        <button
          type="button"
          class="e2e-toolbar-button"
          data-testid="force-parent-rerender"
          @click="renderCount += 1"
        >
          Force parent rerender ({{ renderCount }})
        </button>
      </div>
      <E2EProbes :markdown="markdown" :enable-move-block="mode === 'morphing'" />
    </AetherEditorRoot>
  </main>
</template>
