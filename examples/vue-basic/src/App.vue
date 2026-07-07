<script setup lang="ts">
import { ref } from "vue";

import { AetherEditorContent, AetherEditorRoot } from "@aether-md/vue";

import MarkdownPreview from "./MarkdownPreview.vue";
import { createGfmEditorPlugins } from "./plugins.js";

const INITIAL_MARKDOWN = `# AetherMD Vue Demo

Hello **bold** text.

- list item
`;

const markdown = ref(INITIAL_MARKDOWN);
const renderCount = ref(0);
const plugins = createGfmEditorPlugins();

function handleChange(next: string) {
  markdown.value = next;
}
</script>

<template>
  <main>
    <h1>AetherMD Vue Basic Example</h1>
    <p>
      GateLock demo: edit below, then force a parent rerender without changing
      <code>value</code>. The document should not reset.
    </p>
    <button type="button" @click="renderCount += 1">
      Force parent rerender ({{ renderCount }})
    </button>
    <AetherEditorRoot :plugins="plugins" :value="markdown" :on-change="handleChange">
      <section data-testid="aether-vue-basic-shell">
        <AetherEditorContent />
        <MarkdownPreview />
      </section>
    </AetherEditorRoot>
  </main>
</template>
