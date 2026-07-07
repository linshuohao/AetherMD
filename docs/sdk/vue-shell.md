# Vue Shell

`@aether-md/vue` exposes the Vue Shell public surface: `AetherEditorRoot`, morphing document components, and `useAetherEditor`.

## Public components

| Component                | Role                                                                                                 |
| ------------------------ | ---------------------------------------------------------------------------------------------------- |
| `AetherEditorRoot`       | Creates an `AetherEditor` via `createEditor`, provides Vue context, GateLock for controlled `value`. |
| `AetherMorphingDocument` | **Primary — L2 north star** — multi-block Block Focus with preset morphing strategies.               |
| `AetherMorphingContent`  | Single-block morphing helper (Slice A default: paragraph at index `0`).                              |
| `useAetherEditor`        | Access `editor`, `doc`, `markdown`, and `ready` from context.                                        |

## L2 morphing shell (primary)

`AetherMorphingDocument` / `AetherMorphingContent` implement Instant Morphing and Block Focus per [Product Experience Specification](../architecture/product-experience-spec.md). Use them for product UI aligned with the L2 north star.

```vue
<script setup lang="ts">
import { ref } from "vue";
import { AetherEditorRoot, AetherMorphingDocument } from "@aether-md/vue";

const markdown = ref("# Hello");
</script>

<template>
  <AetherEditorRoot :plugins="plugins" :value="markdown" @change="markdown = $event">
    <AetherMorphingDocument />
  </AetherEditorRoot>
</template>
```

Ensure the GFM preset (or your preset) registers `morphingStrategies` on the wired plugin object so `editor.getMorphingStrategy(blockType)` resolves paragraph/list handlers. See `@aether-md/example-shared` (`createGfmEditorPlugins()`).

### Single-block apps

Use `AetherMorphingContent` with optional `blockIndex` when only one morphing block is on screen.

## Legacy L1 shell

`AetherEditorContent` mounts the ProseMirror view-bridge (`createProseMirrorView`). It validates the `createEditor` → DOM → `dispatch` → serialize pipeline and is the right surface for the L1 architecture demo (`examples/vue`, `AetherShellShowcase` content mode).

Import from the **`@aether-md/vue/legacy`** subpath. The primary `@aether-md/vue` entry is morphing-first and does not export `AetherEditorContent`. Legacy usage requires `@aether-md/plugin-prosemirror` as an optional peer dependency.

| Component             | Role                                                                                        |
| --------------------- | ------------------------------------------------------------------------------------------- |
| `AetherEditorContent` | **Legacy L1** — ProseMirror view-bridge integration; not the L2 product north star surface. |

```vue
<script setup lang="ts">
import { AetherEditorRoot } from "@aether-md/vue";
import { AetherEditorContent } from "@aether-md/vue/legacy";
</script>

<template>
  <AetherEditorRoot :plugins="plugins" :value="markdown" @change="markdown = $event">
    <AetherEditorContent />
  </AetherEditorRoot>
</template>
```

## Related docs

- [Custom Block Renderer](./custom-block-renderer.md)
- [Editor Context](./editor-context.md)
- [Product Experience Specification](../architecture/product-experience-spec.md)
