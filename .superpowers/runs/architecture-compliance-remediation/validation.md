# Validation: architecture-compliance-remediation Wave 6

Date: 2026-07-07
Branch: `refactor/architecture-compliance-remediation`

## Tasks completed

| Task | Status | Notes                                              |
| ---- | ------ | -------------------------------------------------- |
| T14  | done   | Vue RenderedBlockHost identity-aware update        |
| T15  | done   | README, matrix, test-strategy, vue-shell.md        |
| T16  | done   | Vue E2E 3→22 scenarios                             |
| T21  | done   | Vue Slice D, block-identity tests                  |
| T22  | done   | React focus FSM guards                             |
| T13  | done   | Core morph registry extraction                     |
| T18  | done   | interactiveRenderers removed from manifest         |
| T19  | done   | Preset single registry                             |
| T17  | done   | **BREAKING** legacy subpath + PM optional peer     |
| T23  | done   | GFM wiring via preset-gfm `createGfmEditorPlugins` |
| T20  | done   | OpenSpec main spec sync                            |

## Validation commands

| Command                                                          | Result                                                                             |
| ---------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `pnpm --filter @aether-md/core test`                             | 157 passed                                                                         |
| `pnpm --filter @aether-md/preset-gfm test`                       | 19 passed                                                                          |
| `pnpm --filter @aether-md/react test`                            | 59 passed                                                                          |
| `pnpm --filter @aether-md/vue test`                              | 44 passed                                                                          |
| `openspec validate architecture-compliance-remediation --strict` | pass                                                                               |
| `pnpm lint` + `format:check` + `docs:check-links`                | pass                                                                               |
| `pnpm check` (full turbo)                                        | types:check fails — `tsd` cannot resolve `resolve` module (node_modules env issue) |

## Post-wave fix

- Moved `createGfmEditorPlugins` to `@aether-md/preset-gfm` to break turbo cycle (core/react/vue → example-shared → react).
- Core GFM test uses relative `preset-gfm/dist` import (matches orchestration test pattern).

## Remaining (deferred to complete-v1-before-release)

- GFM document model decoupling from core exports (C-03)
- Command Bus full Guard pipeline (C-05 partial)
- compile-layer schema merge, Worker Thread, PermissionGuard
