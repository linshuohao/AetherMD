# Block Morphing Example (L2 Slice C)

**L2 product north star demo** — multi-paragraph Instant Morphing + Block Focus for AetherMD.

| | |
| --- | --- |
| **Proves** | Focus = Markdown source (`**` visible); blur = rendered typography; only one block in source state; edits via Command Bus; GateLock |
| **Does not prove** | Full GFM mark fidelity (Slice B), list/link blocks (Slice D), M7 publish |

For the L1 architecture pipeline demo, see [`examples/react-basic`](../react-basic/README.md).

## Prerequisites

From the repository root:

```bash
pnpm install
pnpm build
```

## Run

```bash
pnpm --filter @aether-md/example-block-morphing dev
```

Open the URL Vite prints (typically `http://localhost:5173`).

## What to try

1. Click paragraph A — you should see `First **one**` in a monospace textarea; other paragraphs stay rendered.
2. Click paragraph B — only B shows source; A morphs back to rendered bold text.
3. Edit paragraph B (e.g. change to `Second **edited**`) — paragraph A content must not reset.
4. Use **Force parent rerender** — content should not reset (GateLock).

## Slice C limits

- Paragraph blocks only (three-paragraph fixture).
- Rendered state supports `**strong**` inline only (MVP).
- No separate preview panel by design.
- `AetherMorphingContent` remains available for single-block use; this demo uses `AetherMorphingDocument`.

## Related docs

- [Product Experience Specification](../../docs/architecture/product-experience-spec.md)
- [MVP Implementation Plan — Block Morphing](../../docs/engineering/mvp-implementation-plan.md)
