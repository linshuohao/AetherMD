<script setup lang="ts">
import { ref } from "vue";

import { createGfmEditorPlugins } from "@aether-md/example-shared";
import { SHOWCASE_MARKDOWN } from "@aether-md/example-shared/showcase-markdown";
import { AetherEditorContent, AetherEditorRoot, AetherMorphingDocument } from "@aether-md/vue";

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
    <button type="button" class="shell-toolbar-button" @click="renderCount += 1">
      Force parent rerender ({{ renderCount }})
    </button>
    <AetherEditorRoot :plugins="plugins" :value="markdown" :on-change="handleChange">
      <section
        v-if="mode === 'morphing'"
        class="example-editor"
        data-testid="aether-morphing-shell"
      >
        <AetherMorphingDocument />
        <MarkdownPreview />
      </section>
      <section v-else class="example-editor" data-testid="aether-vue-basic-shell">
        <AetherEditorContent />
        <MarkdownPreview />
      </section>
    </AetherEditorRoot>
  </main>
</template>
