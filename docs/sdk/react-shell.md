# React Shell

`@aether-md/react` exposes the M5 public Shell surface: `AetherEditorRoot`, morphing document components, and `useAetherEditor`.

## Public components

| Component                | Role                                                                                                   |
| ------------------------ | ------------------------------------------------------------------------------------------------------ |
| `AetherEditorRoot`       | Creates an `AetherEditor` via `createEditor`, provides React context, GateLock for controlled `value`. |
| `AetherMorphingDocument` | **L2 north star** — multi-block Block Focus with preset morphing strategies.                           |
| `AetherMorphingContent`  | Single-block morphing helper (Slice A default: paragraph at index `0`).                                |
| `useAetherEditor`        | Access `editor`, `doc`, `markdown`, and `ready` from context.                                          |
| `AetherEditorContent`    | **Deprecated (Phase 0)** — ProseMirror view-bridge integration shell.                                  |

## Migrating from `AetherEditorContent`

`AetherEditorContent` mounted the Phase 0 ProseMirror view-bridge (`createProseMirrorView`). It validated the `createEditor` → DOM → `dispatch` → serialize pipeline for M5, but it is **not** the L2 Instant Morphing product north star documented in [Product Experience Specification](../architecture/product-experience-spec.md).

### When to keep `AetherEditorContent`

- Maintaining `examples/react-basic` (L1 architecture pipeline demo).
- Integrations that intentionally use the ProseMirror document surface until a morphing preset is wired.

### When to adopt morphing components

- New product UI aligned with Block Focus and Instant Morphing.
- Demos that exercise GFM paragraph/list strategies and preset `interactiveRenderers`.

### Minimal migration

**Before (Phase 0 ProseMirror shell):**

```tsx
<AetherEditorRoot plugins={plugins} value={markdown} onChange={setMarkdown}>
  <AetherEditorContent />
</AetherEditorRoot>
```

**After (L2 morphing shell):**

```tsx
import { AetherEditorRoot, AetherMorphingDocument } from "@aether-md/react";

<AetherEditorRoot plugins={plugins} value={markdown} onChange={setMarkdown}>
  <AetherMorphingDocument />
</AetherEditorRoot>;
```

Ensure the GFM preset (or your preset) registers `morphingStrategies` on the wired plugin object so `editor.getMorphingStrategy(blockType)` resolves paragraph/list handlers. See `examples/block-morphing/src/plugins.ts`.

### Single-block apps

Use `AetherMorphingContent` with optional `blockIndex` when only one morphing block is on screen.

## Related docs

- [Custom Block Renderer](./custom-block-renderer.md)
- [Editor Context](./editor-context.md)
- [Product Experience Specification](../architecture/product-experience-spec.md)
