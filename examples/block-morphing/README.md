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

Phase 1 covers smoke, Block Focus, Instant Morphing, GateLock regression, Scenario C focus switching, Slice B link morphing, edit isolation, click-to-focus, and sync-wait helpers. CI runs the same suite in a **non-blocking** `e2e-playwright` job (11 tests).

## Maintainer browser sign-off (M7)

Automated: `pnpm e2e:test` (22 tests: 19 block-morphing + 3 react-basic). Before claiming M7 L2 sign-off, confirm in a real browser:

- [ ] Scenario A — focused block shows Markdown source (list block shows `- item` markers)
- [ ] Scenario B — blur restores rendered typography; serialized content matches edits
- [ ] Scenario C — only one block in source state at a time
- [ ] Slice D list morphing feels instant; no full-editor remount on focus switch

Record sign-off date in [项目状态](../../docs/project-status.md) when complete.

## Related docs

- [Product Experience Specification](../../docs/architecture/product-experience-spec.md)
- [Architecture Optimization Principles](../../docs/architecture/architecture-optimization-principles.md)
- [MVP Implementation Plan — Block Morphing](../../docs/engineering/mvp-implementation-plan.md)
