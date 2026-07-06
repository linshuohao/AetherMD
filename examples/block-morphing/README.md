# Block Morphing Example (L2 Slice D)

**L2 product north star demo** — GFM list block morphing + paragraph inline marks + multi-block Block Focus for AetherMD.

|                    |                                                                                                                          |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------ |
| **Proves**         | List blocks morph `ul`/`li` ↔ `- item` source; preset `interactiveRenderers`; Block Focus across paragraph + list blocks |
| **Does not prove** | M7 publish, nested lists, tables                                                                                         |

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

1. Click the list block — source shows `- alpha` / `- beta` markers; paragraphs stay rendered.
2. Edit list items in source — blur restores `ul`/`li` typography; serialized markdown updates.
3. Click paragraph blocks — inline marks (strong, link) still morph per Slice B.
4. Use **Force parent rerender** — content should not reset (GateLock).

## Slice D scope

- GFM `list` block morphing via `@aether-md/preset-gfm` strategies + `interactiveRenderers`.
- Shell (`@aether-md/react`) orchestrates focus; preset owns syntax-specific source/render.

## Automated smoke

`pnpm --filter @aether-md/example-block-morphing test` runs happy-dom coverage for Block Focus morphing (focus → `**` sigils, blur → `<strong>`). This is included in root `pnpm check`.

## Browser E2E (Playwright)

From the repository root (after `pnpm install` and `pnpm build`):

```bash
pnpm e2e:install   # first run / CI
pnpm e2e:test
```

Phase 1 covers smoke, Block Focus, Instant Morphing, and GateLock regression against this demo. CI runs the same suite in a **non-blocking** `e2e-playwright` job.

## Related docs

- [Product Experience Specification](../../docs/architecture/product-experience-spec.md)
- [Architecture Optimization Principles](../../docs/architecture/architecture-optimization-principles.md)
- [MVP Implementation Plan — Block Morphing](../../docs/engineering/mvp-implementation-plan.md)
