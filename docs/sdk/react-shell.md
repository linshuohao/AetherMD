# React Shell

`@aether-md/react` exposes the M5 public Shell surface: `AetherEditorRoot`, morphing document components, and `useAetherEditor`.

## Public components

| Component                | Role                                                                                                   |
| ------------------------ | ------------------------------------------------------------------------------------------------------ |
| `AetherEditorRoot`       | Creates an `AetherEditor` via `createEditor`, provides React context, GateLock for controlled `value`. |
| `AetherMorphingDocument` | **Primary — L2 north star** — multi-block Block Focus with preset morphing strategies.                 |
| `AetherMorphingContent`  | Single-block morphing helper (Slice A default: paragraph at index `0`).                                |
| `useAetherEditor`        | Access `editor`, `doc`, `markdown`, and `ready` from context.                                          |

## L2 morphing shell (primary)

`AetherMorphingDocument` / `AetherMorphingContent` implement Instant Morphing and Block Focus per [Product Experience Specification](../architecture/product-experience-spec.md). Use them for product UI aligned with the L2 north star.

```tsx
import { AetherEditorRoot, AetherMorphingDocument } from "@aether-md/react";

<AetherEditorRoot plugins={plugins} value={markdown} onChange={setMarkdown}>
  <AetherMorphingDocument />
</AetherEditorRoot>;
```

Ensure the GFM preset (or your preset) registers `morphingStrategies` on the wired plugin object so `editor.getMorphingStrategy(blockType)` resolves paragraph/list handlers. See `@aether-md/example-shared` (`createGfmEditorPlugins()`).

### Single-block apps

Use `AetherMorphingContent` with optional `blockIndex` when only one morphing block is on screen.

## Legacy L1 shell

`AetherEditorContent` mounts the ProseMirror view-bridge (`createProseMirrorView`). It validates the `createEditor` → DOM → `dispatch` → serialize pipeline and is the right surface for the L1 architecture demo (`examples/react`, `AetherShellShowcase` content mode).

Import from the **`@aether-md/react/legacy`** subpath. The primary `@aether-md/react` entry is morphing-first and does not export `AetherEditorContent`. Legacy usage requires `@aether-md/plugin-prosemirror` as an optional peer dependency.

| Component             | Role                                                                                        |
| --------------------- | ------------------------------------------------------------------------------------------- |
| `AetherEditorContent` | **Legacy L1** — ProseMirror view-bridge integration; not the L2 product north star surface. |

```tsx
import { AetherEditorRoot } from "@aether-md/react";
import { AetherEditorContent } from "@aether-md/react/legacy";

<AetherEditorRoot plugins={plugins} value={markdown} onChange={setMarkdown}>
  <AetherEditorContent />
</AetherEditorRoot>;
```

## Related docs

- [Custom Block Renderer](./custom-block-renderer.md)
- [Editor Context](./editor-context.md)
- [Product Experience Specification](../architecture/product-experience-spec.md)
