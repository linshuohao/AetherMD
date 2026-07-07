# Design: Architecture Compliance Remediation

## Branch

`refactor/architecture-compliance-remediation`

## Implementation Contract

### Wave 1 — Interaction fixes (parallel, no Core API break)

| Track | Scope                                                  | Files                                             |
| ----- | ------------------------------------------------------ | ------------------------------------------------- |
| W1-A  | React focus-switch commit + `RenderedBlockHost` update | `packages/react/src/morphing/**`                  |
| W1-B  | Vue L2 parity + showcase preview removal               | `packages/vue/src/morphing/**`, `examples/vue/**` |
| W1-C  | Dead code + deprecated alias removal                   | `packages/preset-gfm/**`, docs drift              |
| W1-D  | Vue tests + boundary guard                             | `packages/vue/src/**/*.test.ts`                   |

### Wave 2 — Contract consolidation (serial gate after W1)

Introduce `packages/morphing-contracts` exporting:

- `MorphingBlockStrategy`, `CustomBlockRenderer`, `MorphingStrategyRegistry`
- `createMorphingStrategyRegistry`
- `PARSE_BLOCK_MARKDOWN_COMMAND`, `ParseBlockMarkdownPayload`

Preset re-exports or depends on this package. React/Vue import from `@aether-md/morphing-contracts` (allowed in package-boundary tests). Core deletes `packages/core/src/morphing/types.ts` duplicate registry factory; keeps only opaque plugin wiring if needed.

### Wave 3 — Core extraction (depends W2)

1. `createGfmPreset()` registers `core:parseBlockMarkdown` via plugin `commands` or runtime hook.
2. `createEditor` removes `registerBuiltinEditorCommands` for parse-block.
3. `resolveMorphingRegistry` moves to preset helper; core `adapter-wiring` calls preset-provided factory or reads `plugin.morphingStrategies` without DOM types in core — use `unknown` for renderer handles internally.
4. `AetherEditor.getMorphingStrategy` returns `unknown`; shells cast via morphing-contracts.

Non-goals this change:

- Full document-model GFM decoupling (paragraph/list types in core) — defer to v1 document-model pluginization.
- compile-layer schema merge, PermissionGuard enforce, Worker Thread — remain in `complete-v1-before-release`.
- Removing `AetherEditorContent` entirely — isolate until M7.

## Architecture Boundary Checks

| Layer   | After change                                                                          |
| ------- | ------------------------------------------------------------------------------------- |
| Core    | No `HTMLElement` in exported or orchestration types; no hardcoded parse-block handler |
| Preset  | Owns morph strategies, command registration, contracts package                        |
| Shell   | Focus FSM + mount surfaces only; imports contracts not preset in production           |
| Adapter | remark/PM unchanged                                                                   |

## Test Strategy

- Port React interaction-matrix patterns to Vue (happy-dom).
- Add React regression tests for inter-block focus commit.
- Vue showcase: assert no `markdown-preview` in morphing mode (unit + e2e).
- `pnpm check` green after each wave.
- Package-boundary tests updated for morphing-contracts import allowlist.

## Version Impact

- Potential **minor** if only additive `morphing-contracts` package.
- Potential **major** if `AetherEditor.morphing` removed or legacy exports narrowed — document in Changeset.

## Open Questions

- Whether `morphing-contracts` is standalone package vs preset subpath export (prefer standalone for shell boundary tests).
- Whether to split `@aether-md/react-legacy` package for PM view-bridge or keep alias until M7.
