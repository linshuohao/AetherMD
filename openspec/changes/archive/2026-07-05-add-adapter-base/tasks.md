## 1. Document model public types

- [ ] 1.1 在 `packages/core` 增加与 `docs/architecture/document-model.md` 对齐的 M3 最小 `AetherDoc` / block / inline 类型。
- [ ] 1.2 导出 M3 最小 `AetherSchema`（`version: 1` 占位，不要求 compile-layer merge）。
- [ ] 1.3 确认类型可 `JSON.stringify`，不包含引擎私有类型。

## 2. Adapter protocol and errors in core

- [ ] 2.1 在 `packages/core` 导出 `ParserAdapter`、`SerializerAdapter`、`EngineAdapter` 及 `EngineSession`、`AdapterCommandRequest`、`AdapterTransactionResult`、`AdapterEvent` 协议类型（对齐 `docs/engineering/adapter-protocol.md`）。
- [ ] 2.2 实现并导出 `AdapterError`（`source: 'adapter'`）与 `SerializationError`（`source: 'serialization'`）最小可实例化类。
- [ ] 2.3 确认 `@aether-md/core` **不**添加 Remark、ProseMirror、React 运行时依赖。

## 3. plugin-remark package

- [ ] 3.1 建立 `packages/plugins/plugin-remark` workspace package（`build` / `typecheck` / `test`）。
- [ ] 3.2 实现 `ParserAdapter`：M3 样例 Markdown（paragraph、heading）→ `AetherDoc`；无法识别语法降级为 text/paragraph。
- [ ] 3.3 实现 `SerializerAdapter`：M3 `AetherDoc` 子集 → 确定性 Markdown。
- [ ] 3.4 添加 remark package 内 contract tests（parse / serialize）。

## 4. plugin-prosemirror package

- [ ] 4.1 建立 `packages/plugins/plugin-prosemirror` workspace package（`build` / `typecheck` / `test`）。
- [ ] 4.2 实现 `EngineAdapter.create` / `getDocument` / `dispose`。
- [ ] 4.3 实现至少一种 M3 最小编辑 `apply` 路径，成功时返回最新 `AetherDoc`。
- [ ] 4.4 实现 `apply` 失败路径：返回 `AdapterError`，`getDocument` 保持 apply 前快照。
- [ ] 4.5 添加 prosemirror package 内 contract tests（create / apply / failure / dispose）。

## 5. Cross-package round-trip

- [ ] 5.1 添加 integration test：Markdown → remark parse → prosemirror apply → remark serialize → 可预测 Markdown（paragraph 样例）。
- [ ] 5.2 添加 integration test：heading + paragraph 样例 round-trip。
- [ ] 5.3 确认 round-trip **不**依赖 `createEditor`、`bootstrapCore` Adapter 加载或 React Shell。

## 6. Core package boundary

- [ ] 6.1 更新 `packages/core` package-boundary 测试：允许 M3 document-model / adapter-base exports。
- [ ] 6.2 断言仍禁止 `createEditor`、`AetherEditor`、`EditorContext`、Shell、GFM preset API。
- [ ] 6.3 断言 `@aether-md/core` 不 re-export Remark/ProseMirror 实现或依赖。

## 7. Verification

- [ ] 7.1 运行 `pnpm check`，确认 build、typecheck、tests 通过（含新 adapter packages）。
- [ ] 7.2 运行 `openspec validate add-adapter-base --strict` 并保持 green。
- [ ] 7.3 记录 validation evidence 到后续 Superpowers validation 工件。

## 8. Explicit non-goals guard

- [ ] 8.1 确认实现 **不**引入 `createEditor` / `AetherEditor` / React Shell / GFM preset。
- [ ] 8.2 确认 **不**在 `createCommandEventRuntime.dispatch` 中实现 Adapter 自动 rollback 或 `transactionFailed` 自动 emit。
- [ ] 8.3 确认 **不**通过 `bootstrapCore` silent provide `core:engine` / `core:parser`。
- [ ] 8.4 确认 **不**实现 M1 follow-up（duplicate `metadata.name`、partial startup cleanup、dispose public contract）。

## 9. Workflow follow-up

- [ ] 9.1 后续 Superpowers plan / tasks / validation / review 说明性正文使用中文。
- [ ] 9.2 API 名称、包名、路径与 OpenSpec 结构关键词保持 English。
- [ ] 9.3 OpenSpec archive 前 sync main specs（`document-model`、`adapter-base`、`core-bootstrap`）与长期 Docs（Step 8）。
