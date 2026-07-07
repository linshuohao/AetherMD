# Examples Matrix

Workspace examples are **private** packages — one per shell runtime. Each example exposes a single integrated showcase component. All three participate in root `pnpm check` via `typecheck` (G6). Browser E2E covers React (content + morphing) and Vue (morphing, expanding).

## Matrix

| Example                 | Package                           | Shell / runtime                                  | Showcase component        | Local run                                                                                                    |
| ----------------------- | --------------------------------- | ------------------------------------------------ | ------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `examples/headless-gfm` | `@aether-md/example-headless-gfm` | Node headless (`createEditor`)                   | `src/run.ts`              | `pnpm --filter @aether-md/example-headless-gfm build && pnpm --filter @aether-md/example-headless-gfm start` |
| `examples/react`        | `@aether-md/example-react`        | `AetherEditorContent` + `AetherMorphingDocument` | `AetherShellShowcase`     | `pnpm --filter @aether-md/example-react dev`                                                                 |
| `examples/vue`          | `@aether-md/example-vue`          | `AetherMorphingDocument` + `AetherEditorContent` | `AetherShellShowcase.vue` | `pnpm --filter @aether-md/example-vue dev`                                                                   |

## Shared wiring

- GFM plugin wiring: `@aether-md/example-shared` (`createGfmEditorPlugins()`).
- Fixture markdown and E2E probes: `showcase-markdown.ts`, `e2e-probes.tsx`.

## CI gates

| Gate           | Scope                                                                                         |
| -------------- | --------------------------------------------------------------------------------------------- |
| G6 `typecheck` | All three examples via turbo `check` in root `pnpm check`                                     |
| Playwright E2E | `examples/react` (24) — content + morphing；`examples/vue` (3, expanding) — morphing |
| Consumer smoke | Six publishable `@aether-md/*` packages (`pnpm consumer:smoke`)                               |

See [测试策略](../engineering/test-strategy.md) and [CI 校验计划](../architecture/ci-checklist.md).
