## Why

Slice A (`block-morphing-slice-1`) delivered single-paragraph Instant Morphing but does not satisfy product-experience **场景 C** (multi-block Block Focus). L2 north star requires that when the user focuses block B in a multi-paragraph document, only block B is in source state while other blocks remain rendered. This change closes that gap without M7 publish work.

## What Changes

- `@aether-md/react` additive export: `AetherMorphingDocument` with document-level `focusedBlockIndex` focus state machine.
- Block-level source text from `AetherDoc` paragraph children (Shell helper); **no** whole-document markdown as single-block source.
- Refactor `AetherMorphingContent` to read per-block source/rendered from `doc.children[blockIndex]`; retain as single-block primitive.
- Extend `examples/block-morphing` to multi-paragraph fixture with clickable block focus.
- happy-dom integration tests: scenario C + Slice A A/B regression + focus switch + zero remount.
- **MODIFIED** `react-shell`, `product-experience`, `validation-suite` delta specs.
- Documentation sync: `roadmap.md`, `project-status.md`, `README.md`, `mvp-implementation-plan.md`.
- **非 BREAKING**: Core unchanged; Phase 0 shell unchanged.

## Capabilities

### New Capabilities

（无全新 capability。）

### Modified Capabilities

- `react-shell`: additive `AetherMorphingDocument`, document-level Block Focus state machine, block-level source helper, scenario C tests.
- `product-experience`: Slice C multi-block Block Focus demonstrable; Slice A regression preserved.
- `validation-suite`: `examples/block-morphing` multi-block demo acceptance.

## Impact

- **代码**：`packages/react` morphing module（focus context, document surface, block helpers）；`examples/block-morphing`。
- **API**：`@aether-md/react` additive `AetherMorphingDocument` export；`AetherMorphingContent` behavior refined (per-block doc source)。
- **测试**：扩展 `block-morphing.integration.test.tsx`。
- **OpenSpec main spec（archive 后 sync）**：MODIFIED `react-shell`、`product-experience`、`validation-suite`。
- **Branch**：`feat/block-morphing-slice-c`

## 非目标

- Slice B（GFM marks 全保真）、Slice D（列表/链接块）。
- M7 publish、Release CI、`NPM_TOKEN`、去 `private: true`。
- History / Selection / Clipboard / Vue / Playwright。
- 破坏 `examples/react-basic` 与 Phase 0 测试。

## Version Impact

- **`@aether-md/react`**：additive minor（`AetherMorphingDocument`）；workspace `0.0.0` private 不变。
- **`@aether-md/core`**：无变更。

## 验收标准

- `openspec validate block-morphing-slice-c --strict` 通过。
- `pnpm check` 全绿。
- happy-dom：场景 C + A/B 回归 + focus 切换 + 零 remount。
- `pnpm --filter @aether-md/example-block-morphing dev` 可演示多块 Block Focus。
