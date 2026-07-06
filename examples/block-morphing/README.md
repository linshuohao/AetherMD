# Block Morphing Example (L2 Slice A)

**L2 product north star demo** — single-paragraph Instant Morphing for AetherMD.

| | |
| --- | --- |
| **Proves** | Focus = Markdown source (`**` visible); blur = rendered typography; edits via Command Bus; GateLock |
| **Does not prove** | Multi-block Block Focus (Slice C), full GFM mark fidelity (Slice B), M7 publish |

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

1. Click the paragraph — you should see `Hello **world**` in a monospace textarea.
2. Edit the text (e.g. change to `Hello **universe**`) and click outside — bold rendering without `**` sigils.
3. Use **Force parent rerender** — content should not reset (GateLock).

## Slice A limits

- Single paragraph document only (`blockIndex` 0).
- Rendered state supports `**strong**` inline only (MVP).
- No separate preview panel by design.

## Related docs

- [Product Experience Specification](../../docs/architecture/product-experience-spec.md)
- [MVP Implementation Plan — Block Morphing](../../docs/engineering/mvp-implementation-plan.md)
