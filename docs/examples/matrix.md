# Examples Matrix

Workspace examples are **private** packages — they are not published to npm. All four examples participate in root `pnpm check` via their `typecheck` (`tsc --noEmit`) scripts (G6 gate). Browser E2E covers the React demos only.

## Matrix

| Example                   | Package                             | Shell / runtime                  | North star                        | Local run                                                                                                    |
| ------------------------- | ----------------------------------- | -------------------------------- | --------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `examples/headless-gfm`   | `@aether-md/example-headless-gfm`   | Node headless (`createEditor`)   | L1 integration path               | `pnpm --filter @aether-md/example-headless-gfm build && pnpm --filter @aether-md/example-headless-gfm start` |
| `examples/react-basic`    | `@aether-md/example-react-basic`    | React + `AetherEditorContent`    | L1 architecture pipeline demo     | `pnpm --filter @aether-md/example-react-basic dev`                                                           |
| `examples/vue-basic`      | `@aether-md/example-vue-basic`      | Vue 3 + `AetherEditorContent`    | L1 Vue Shell demo                 | `pnpm --filter @aether-md/example-vue-basic dev`                                                             |
| `examples/block-morphing` | `@aether-md/example-block-morphing` | React + `AetherMorphingDocument` | L2 Instant Morphing / Block Focus | `pnpm --filter @aether-md/example-block-morphing dev`                                                        |

## Shared wiring

- GFM plugin wiring: `@aether-md/example-shared` (`examples/shared/gfm-wiring.ts` → `createGfmEditorPlugins()`).
- Showcase markdown and E2E probes: `examples/shared/showcase-markdown.ts`, `examples/shared/e2e-probes.tsx`.

## CI gates

| Gate           | Scope                                                                |
| -------------- | -------------------------------------------------------------------- |
| G6 `typecheck` | All four examples via turbo `check` in root `pnpm check`             |
| Playwright E2E | `examples/react-basic` + `examples/block-morphing` (blocking CI job) |
| Consumer smoke | Six publishable `@aether-md/*` packages (`pnpm consumer:smoke`)      |

See [测试策略](../engineering/test-strategy.md) and [CI 校验计划](../architecture/ci-checklist.md).
