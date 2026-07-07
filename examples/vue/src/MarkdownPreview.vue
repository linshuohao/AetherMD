<script setup lang="ts">
import { useAetherEditor } from "@aether-md/vue";

const { markdown, ready } = useAetherEditor();
</script>

<template>
  <section class="markdown-probe" aria-label="Serialized markdown">
    <pre data-testid="markdown-preview">{{ ready ? markdown : "Loading…" }}</pre>
  </section>
</template>
