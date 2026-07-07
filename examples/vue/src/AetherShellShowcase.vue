<script setup lang="ts">
import { ref } from "vue";

import { createGfmEditorPlugins } from "@aether-md/example-shared";
import { SHOWCASE_MARKDOWN } from "@aether-md/example-shared/showcase-markdown";
import { AetherEditorContent, AetherEditorRoot } from "@aether-md/vue";

import MarkdownPreview from "./MarkdownPreview.vue";

const markdown = ref(SHOWCASE_MARKDOWN);
const renderCount = ref(0);
const plugins = createGfmEditorPlugins();

function handleChange(next: string) {
  markdown.value = next;
}
</script>

<template>
  <main class="example" data-testid="aether-vue-showcase">
    <h1>Shell: AetherEditorContent</h1>
    <button type="button" class="shell-toolbar-button" @click="renderCount += 1">
      Force parent rerender ({{ renderCount }})
    </button>
    <AetherEditorRoot :plugins="plugins" :value="markdown" :on-change="handleChange">
      <section class="example-editor" data-testid="aether-vue-basic-shell">
        <AetherEditorContent />
        <MarkdownPreview />
      </section>
    </AetherEditorRoot>
  </main>
</template>
