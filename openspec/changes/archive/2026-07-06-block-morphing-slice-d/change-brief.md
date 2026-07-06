## Why

L2 Slice A–C delivered paragraph-only morphing with Block Focus. Slice D closes the list/link **block** gap per [architecture optimization principles](docs/architecture/architecture-optimization-principles.md) Phase 2: GFM list blocks morph between rendered and source states; block source/render strategies live in `@aether-md/preset-gfm` with `interactiveRenderers` on `gfmManifest`.

## What

- `@aether-md/preset-gfm`: GFM block morphing registry (paragraph + list), `interactiveRenderers`, list source serialize/parse via remark adapter
- `@aether-md/plugin-remark`: `serializeListBlock` helper
- `@aether-md/core` + engine: backward-compatible optional `replacement` on `replaceText` for whole-block updates
- `@aether-md/react`: generic `MorphingBlockSurface` consuming preset strategies; `AetherMorphingDocument` includes list blocks
- `examples/block-morphing`: fixture with list block demo
- Integration tests: list morphing + Slice A/B/C regression
- Delta specs: `product-experience`, `gfm-preset`, `react-shell`, `validation-suite`

## Non-Goals

- M7 publish, nested lists, tables, heading blocks in morphing document
- compile-layer schema merge
- React Shell Phase 0 `AetherEditorContent` changes

## Source Docs

- `docs/architecture/product-experience-spec.md`
- `docs/architecture/architecture-optimization-principles.md`
- `docs/sdk/manifest.md`
- `openspec/changes/archive/2026-07-06-block-morphing-slice-c/`

## Version Impact

- `@aether-md/core`: additive optional `replacement` on adapter `ReplaceTextCommand` (backward compatible)
- `@aether-md/preset-gfm`: additive exports + manifest `runtime.interactiveRenderers`
- `@aether-md/react`: behavior extension on `AetherMorphingDocument` (additive)

## Branch

`feat/block-morphing-slice-d`

## Single-Task Scope Summary

One task: preset block strategies + interactiveRenderers + engine whole-block replace + React registry integration + tests + example + main spec sync.

## Validation Strategy

- `pnpm --filter @aether-md/plugin-remark test`
- `pnpm --filter @aether-md/preset-gfm test`
- `pnpm --filter @aether-md/react test`
- `pnpm check`

## Escalation Triggers Checked

| 触发器 | 结果 |
| --- | --- |
| 多 task 必需 | **否** — 单 task 可交付 |
| 新 CommandId | **否** — 扩展 replaceText payload |
| workflow 语义变更 | **否** |
