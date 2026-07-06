# Block Morphing Example (L2 Slice B)

**L2 product north star demo** — GFM inline mark morphing fidelity + multi-paragraph Block Focus for AetherMD.

| | |
| --- | --- |
| **Proves** | Rendered `<strong>` / `<em>` / `<a>` from `AetherInline` tree; focus shows Markdown sigils; source edits preserve marks via parser-backed dispatch; only one block in source state; GateLock |
| **Does not prove** | List/link **blocks** (Slice D), M7 publish |

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

1. Click paragraph A — source shows `**one**` and `*emphasis*` sigils; other paragraphs stay rendered.
2. Click paragraph B — only B shows source with `[link](https://example.com)`; A morphs back to rendered typography.
3. Edit emphasis or link text in source — blurred render and serialized markdown must keep marks.
4. Use **Force parent rerender** — content should not reset (GateLock).

## Slice B scope

- GFM inline marks: strong, emphasis, link within paragraph blocks.
- Serialize contract lives in `@aether-md/preset-gfm` (`serializeParagraphInlines`); React renders from block tree.
- `AetherMorphingContent` for single-block; this demo uses `AetherMorphingDocument` (Slice C Block Focus).

## Follow-up (Slice D)

- List/link **block** morphing and `interactiveRenderers` DOM registration.

## Related docs

- [Product Experience Specification](../../docs/architecture/product-experience-spec.md)
- [MVP Implementation Plan — Block Morphing](../../docs/engineering/mvp-implementation-plan.md)
