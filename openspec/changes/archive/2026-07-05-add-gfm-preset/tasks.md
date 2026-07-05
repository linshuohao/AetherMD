## 1. Preset package scaffold

- [ ] 1.1 建立 `packages/preset-gfm` workspace package（`@aether-md/preset-gfm`），提供 `build` / `typecheck` / `test` 脚本。
- [ ] 1.2 定义 GFM preset Manifest（`manifestVersion: 1`，`metadata.name: gfm` 或等价官方名）。
- [ ] 1.3 导出公开 factory 入口（如 `createGfmPreset()`），不依赖 `createEditor` / `bootstrapCore` Adapter 加载。
- [ ] 1.4 确认 `@aether-md/core` **不**新增 Remark/ProseMirror/React 运行时依赖。

## 2. plugin-remark GFM 扩展

- [ ] 2.1 引入 GFM 解析能力（如 `remark-gfm`），映射 list/link/strong/emphasis 为 structured `AetherDoc`。
- [ ] 2.2 扩展 `SerializerAdapter`：确定性输出 `**`、`*`、`-`/`1.`、`[text](href)`；保留 M3 paragraph/heading 行为。
- [ ] 2.3 实现 `SerializationError` 策略：`CustomBlock` → `[unsupported:block:<name>]`；不支持节点 reject `SerializationError`。
- [ ] 2.4 更新 parser unit tests（list 结构化 parse；未知非 GFM 语法仍降级）。
- [ ] 2.5 添加 serializer unit tests（GFM 六类 + CustomBlock 占位符 + unsupported 节点 rejection）。

## 3. plugin-prosemirror GFM 扩展

- [ ] 3.1 扩展 ProseMirror schema（list nodes、link/strong/emphasis marks）。
- [ ] 3.2 更新 `aetherDocToPm` / `pmToAetherDoc` 保留 GFM 结构。
- [ ] 3.3 验证 `apply` 成功后 `getDocument` 在未编辑块上保留 list/link/mark。
- [ ] 3.4 验证 `apply` 失败时 GFM 快照不被污染。
- [ ] 3.5 添加/更新 prosemirror package 内 contract tests。

## 4. GFM round-trip integration tests

- [ ] 4.1 在 `@aether-md/preset-gfm` 或 cross-package 测试模块添加六类语法 round-trip（paragraph、heading、strong、emphasis、list、link）。
- [ ] 4.2 每样例含 parse → `EngineAdapter.apply`（`replaceText`）→ serialize，断言 golden Markdown。
- [ ] 4.3 确认 M3 paragraph / heading round-trip 仍 pass。
- [ ] 4.4 确认测试 **不** import `createEditor`、`bootstrapCore` adapter wiring、`@aether-md/react`。

## 5. Core package boundary

- [ ] 5.1 确认 `@aether-md/core` package-boundary 仍禁止 `createEditor`、`AetherEditor`、`EditorContext`、Shell、`presetGfm` export。
- [ ] 5.2 确认 workspace 可包含 `@aether-md/preset-gfm` 且 `pnpm check` 覆盖 preset package。
- [ ] 5.3 确认 `@aether-md/core` 不 re-export preset 或 adapter 实现。

## 6. Verification

- [ ] 6.1 运行 `pnpm check`，确认 build、typecheck、tests 通过（含 preset 与 adapter packages）。
- [ ] 6.2 运行 `openspec validate add-gfm-preset --strict` 并保持 green。
- [ ] 6.3 记录 validation evidence 到后续 Superpowers validation 工件。

## 7. Explicit non-goals guard

- [ ] 7.1 确认 **不**引入 `createEditor` / `AetherEditor` / React Shell / Vue Shell。
- [ ] 7.2 确认 **不**在 `createCommandEventRuntime.dispatch` 中实现 Adapter 自动 rollback 或 `transactionFailed` auto emit。
- [ ] 7.3 确认 **不**通过 `bootstrapCore` silent provide `core:engine` / `core:parser`。
- [ ] 7.4 确认 **不**实现 compile-layer Schema 合并、`gfm:*` command 注册、`CustomBlock` round-trip、嵌套列表/表格/代码块。

## 8. Workflow follow-up

- [ ] 8.1 后续使用 `aether-workflow-create-plan` 生成 Superpowers implementation plan。
- [ ] 8.2 说明性正文使用中文；API 名称、包名、路径与 OpenSpec 结构关键词保持 English。
- [ ] 8.3 OpenSpec archive 前 sync main specs（`gfm-preset`、`document-model`、`adapter-base`、`core-bootstrap`）与长期 Docs。
