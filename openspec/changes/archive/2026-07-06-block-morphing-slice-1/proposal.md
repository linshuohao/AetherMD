## Why

L1 `examples/react-basic` 已闭合架构管线验证，但产品 north star（Instant Morphing + Block Focus）尚未有可演示实现。M7 发布门禁（方案 B）要求 **L2 Slice A** 可演示：单段落块在聚焦时显示 Markdown 源码、失焦时显示排版渲染，且不依赖独立 preview 栏。本 change 交付 Slice A MVP 与 `examples/block-morphing` 演示载体。

## What Changes

- `@aether-md/react` additive export：`AetherMorphingContent`（单段落 rendered ↔ source morphing surface）及 focus 状态机。
- 块 rendered 视图：最小 inline strong 排版（MVP HTML/CSS）。
- 块 source 视图：聚焦块 `<textarea>` + 等宽字体；编辑经 `core:replaceText` / `dispatch` 更新文档。
- 新建 `examples/block-morphing`（`@aether-md/example-block-morphing`）private workspace example，`pnpm dev` 可演示 morphing。
- happy-dom 集成测试：场景 A（聚焦见 `**`）、场景 B（失焦见渲染、序列化一致）、零 remount（连续编辑不重建 editor）。
- **MODIFIED** `react-shell`：补充 morphing additive API 与 Slice A 验收场景。
- **MODIFIED** `product-experience`：Slice A 实现侧 delta（单段落 MVP 范围）。
- **MODIFIED** `validation-suite`：`examples/block-morphing` G6 typecheck 纳入 `pnpm check`。
- **非 BREAKING**：`@aether-md/core` 无 API 或 morph 分支；`AetherEditorContent` / Phase 0 shell 保持不变。

## Capabilities

### New Capabilities

（无全新 capability；在既有 `react-shell`、`product-experience`、`validation-suite` 上 delta。）

### Modified Capabilities

- `react-shell`: additive `AetherMorphingContent`、focus 状态机、单段落 source/rendered surfaces、Slice A happy-dom 测试。
- `product-experience`: Slice A 单段落 morphing MVP 实现验收与 L2 demo 载体引用。
- `validation-suite`: `examples/block-morphing` workspace example 与 G6 typecheck 门禁。

## Impact

- **代码**：`packages/react` morphing 模块；`examples/block-morphing`；**不**修改 Core 运行时语义。
- **API**：`@aether-md/react` additive exports；`@aether-md/core` 无 breaking change。
- **测试/CI**：新增 happy-dom morphing 集成测试；example typecheck 纳入 check pipeline。
- **OpenSpec main spec（archive 后 sync）**：MODIFIED `react-shell`、`product-experience`、`validation-suite`。

## 非目标

- Slice B/C/D（多块、列表/链接块插件化、GFM marks 全保真）。
- History / Selection / Clipboard。
- M7 publish、Release CI、`NPM_TOKEN`、去 `private: true`。
- 破坏 `examples/react-basic` 与 Phase 0 测试。
- 删除 view-bridge；Vue / Playwright。

## Source Docs

- `docs/architecture/product-experience-spec.md`
- `docs/engineering/mvp-implementation-plan.md`
- `openspec/specs/product-experience/spec.md`
- `openspec/specs/react-shell/spec.md`
- `openspec/specs/validation-suite/spec.md`
- `openspec/changes/archive/2026-07-06-align-instant-morphing-north-star/design.md`

## Version Impact

- **`@aether-md/react`**：additive minor（morphing exports）；workspace `0.0.0` private 不变。
- **`@aether-md/core`**：无变更。
- **`@aether-md/example-block-morphing`**：新 private example；无 npm publish。

## Code-Management Status

- **Branch**：`feat/block-morphing-slice-1`
- **OpenSpec change id**：`block-morphing-slice-1`

## 验收标准

- `openspec validate block-morphing-slice-1 --strict` 通过。
- `pnpm check` 全绿。
- happy-dom：场景 A/B + 零 remount 测试通过。
- `pnpm --filter @aether-md/example-block-morphing dev` 可启动演示。
