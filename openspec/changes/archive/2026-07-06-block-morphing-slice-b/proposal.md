## Why

L2 Slice A/C delivered single- and multi-block Block Focus with strong-only inline rendering and plain-text `replaceText` edits. Slice B closes the GFM inline mark fidelity gap: emphasis, strong, and link marks MUST survive source editing and render as `<em>`, `<strong>`, and `<a>` from the `AetherDoc` tree — not regex MVP. This unblocks preset pluginization and satisfies product-experience zero-latency typing for inline marks.

## What Changes

- `@aether-md/preset-gfm` headless `serializeParagraphInlines` (and inline helpers) exported without React dependency.
- `@aether-md/react` morphing: `renderParagraphFromBlock` renders strong/emphasis/link; `MorphingBlockSurface` uses block-tree render (not deprecated `renderParagraphInline`); source `onChange` parses via `editor.context.services.parser.adapter` and dispatches `core:replaceText` with `children`.
- happy-dom integration tests: Slice B scenarios (emphasis focus source, blurred `<em>` render, source edit preserves marks) plus Slice A/C regression.
- `examples/block-morphing` fixture adds `*emphasis*` and `[link](url)`; README marks Slice B scope.
- **MODIFIED** `product-experience`, `react-shell`, `validation-suite`, `gfm-preset` delta specs.
- `gfmManifest` documents `interactiveRenderers` reservation (stub; full DOM registration deferred to Slice D).
- **非 BREAKING**: Core command vocabulary unchanged; `AetherEditorContent` / Phase 0 shell unchanged.

## Capabilities

### New Capabilities

（无全新 capability。）

### Modified Capabilities

- `product-experience`: Slice B GFM inline mark fidelity (rendered + source edit) acceptance scenarios.
- `react-shell`: morphing rendered path uses `AetherInline` tree; parser-backed source dispatch.
- `gfm-preset`: headless inline serialize contract for morphing; manifest `interactiveRenderers` reservation.
- `validation-suite`: Slice B integration test scenarios and example fixture.

## Impact

- **代码**：`packages/preset-gfm`, `packages/react` morphing; `examples/block-morphing`; `docs/sdk/manifest.md` cross-link.
- **API**：`@aether-md/preset-gfm` additive export; `@aether-md/react` depends on preset-gfm for serialize; `@aether-md/core` 无变更。
- **测试/CI**：≥3 新 happy-dom Slice B 场景；`pnpm check` 门禁。
- **OpenSpec main spec（archive 后 sync）**：MODIFIED 上述 capabilities。

## 非目标

- Slice D（列表/链接块 morphing、`interactiveRenderers` 实装）。
- M7 publish、Release CI、`NPM_TOKEN`、去 `private: true`。
- History / Selection / Clipboard；Core 破坏性 API；删除 view-bridge。

## Source Docs

- `docs/architecture/product-experience-spec.md`
- `docs/engineering/mvp-implementation-plan.md`
- `openspec/specs/product-experience/spec.md`
- `openspec/changes/archive/2026-07-06-block-morphing-slice-1/`
- `openspec/changes/archive/2026-07-06-block-morphing-slice-c/`

## Version Impact

- **`@aether-md/preset-gfm`**：additive minor（headless serialize export）；workspace `0.0.0` private 不变。
- **`@aether-md/react`**：additive minor；新增对 `@aether-md/preset-gfm` runtime dependency。
- **M7 publish**：禁止。

## Code-Management Status

- **Branch**：`feat/block-morphing-slice-b`
- **OpenSpec change id**：`block-morphing-slice-b`

## 验收标准

- `openspec validate block-morphing-slice-b --strict` 通过。
- `pnpm check` 全绿。
- Rendered: `<strong>` / `<em>` / `<a>`；source 编辑不剥离 marks；morphing 不调用 `renderParagraphInline`。
- Slice A/C 回归测试仍绿。
