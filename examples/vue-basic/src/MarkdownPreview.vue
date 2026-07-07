<script setup lang="ts">
import { useAetherEditor } from "@aether-md/vue";

const { markdown, ready } = useAetherEditor();
</script>

<template>
  <section>
    <h2>Markdown preview</h2>
    <pre data-testid="markdown-preview">{{ ready ? markdown : "Loading…" }}</pre>
  </section>
</template>
