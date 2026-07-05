# Task 02: 定义 Adapter 协议、错误类与 core exports（含 boundary 允许面）

Change:

- `add-adapter-base`

Spec Requirement:

- `Adapter protocol types are exported from core`
- `AdapterError and SerializationError are exported`
- `core-bootstrap` MODIFIED：`Minimal Core package exists`（MAY expose document-model / adapter-base types）
- `core-bootstrap` MODIFIED：`Core package boundary excludes editor and shell entrypoints`

Source Docs:

- `.superpowers/plans/add-adapter-base.md`
- `openspec/changes/add-adapter-base/design.md`
- `openspec/changes/add-adapter-base/specs/adapter-base/spec.md`
- `openspec/changes/add-adapter-base/specs/core-bootstrap/spec.md`
- `docs/engineering/adapter-protocol.md`
- `docs/engineering/error-model.md`

## 目标

导出三类 Adapter 协议类型与 `AdapterError` / `SerializationError`，更新 `package-boundary.test.ts` 允许 M3 document/adapter exports，继续禁止 `createEditor`、Shell、GFM preset 与 Core 对 Remark/ProseMirror 的 runtime 依赖。

## 范围

- 新增 `adapter-types.ts`：`ParserAdapter`、`SerializerAdapter`、`EngineAdapter`、`EngineSession`、`AdapterCommandRequest`、`AdapterTransactionResult`、`AdapterEvent`。
- 扩展 `errors.ts`：`AdapterError`（`source: 'adapter'`, `severity: 'recoverable'`）、`SerializationError`（`source: 'serialization'`, `severity: 'degraded'`）。
- 新增 `adapter-types.test.ts`：错误 shape smoke；**不**实现真实 Adapter 行为。
- 更新 `index.ts` 导出 adapter types + errors。
- 更新 `package-boundary.test.ts`：
  - **允许：** Task 01 document types + M3 Adapter 协议 types / errors + 既有 M2 Command/Event exports。
  - **禁止：** `createEditor`、`AetherEditor`、`EditorContext`、Shell、GFM preset、Remark/PM **实现** re-export。
  - **断言：** `packages/core/package.json` dependencies 无 `remark`、`prosemirror*`、`react`、`vue`。
- **不**建立 plugin package；**不**修改 `bootstrap.ts` / `capabilities.ts`。

Allowed Files:

- `packages/core/src/adapter-types.ts`
- `packages/core/src/adapter-types.test.ts`
- `packages/core/src/errors.ts`
- `packages/core/src/index.ts`
- `packages/core/src/package-boundary.test.ts`

Forbidden Files:

- `packages/core/src/bootstrap.ts`
- `packages/core/src/capabilities.ts`（禁止 silent provide `core:engine` / `core:parser`）
- `packages/core/src/command-event-runtime.ts`（禁止 Adapter 集成）
- `packages/plugins/**`
- `packages/react/**`、`packages/preset-gfm/**`
- `docs/**`、`openspec/**`
- `AGENTS.md` 及其他无关脏文件

## TDD 入口

1. 在 `adapter-types.test.ts` 写失败测试：可导入 `ParserAdapter`、`SerializerAdapter`、`EngineAdapter` 及 supporting types。
2. 失败测试：`new AdapterError(...).source === 'adapter'`；`new SerializationError(...).source === 'serialization'`。
3. 在 `package-boundary.test.ts` 写失败断言：exports **包含** `AetherDoc`、`ParserAdapter`、`AdapterError` 等 M3 允许符号；**不包含** `createEditor`、`AetherEditor`。
4. 失败测试：`packages/core/package.json` 的 `dependencies` 不含 remark/prosemirror。
5. 运行 `pnpm --filter @aether-md/core test` → FAIL → 最小实现 → PASS。

TDD Notes:

- red-green：先失败 export/boundary/error shape，再 types + boundary 更新。
- Adapter 接口仅为 TypeScript 契约；无 Remark/PM runtime。

Implementation Notes:

- 规范名称对齐 `docs/engineering/adapter-protocol.md`。
- `EngineAdapter.getDocument(session)` 是 Adapter 协议方法，**不是** Core 宿主 `AetherEditor.getDocument()`。
- 独立 types 面，不挂到 `bootstrapCore` 或 Command Bus。

## 验证命令

```bash
pnpm --filter @aether-md/core test
pnpm --filter @aether-md/core exec tsc --noEmit
rg -i "remark|prosemirror|react|vue|gfm|createEditor|AetherEditor|EditorContext" packages/core/package.json packages/core/src
```

预期：tests / typecheck 通过；`rg` 无生产代码命中（boundary 禁止导出名断言字符串除外）。

Intuitive Verification:

- 人工扫一眼 `packages/core/src/index.ts`，确认无 `createEditor` / Shell exports。

Review Checklist:

- [ ] 三类 Adapter 协议与 `AdapterError` / `SerializationError` 已导出。
- [ ] boundary tests 允许 M3 + M2，禁止 M4/M5 editor/shell/GFM。
- [ ] Core `package.json` 无 remark/prosemirror/react/vue runtime dependency。
- [ ] 未修改 `bootstrap.ts` / M1 capability 子集。
- [ ] 未实现 Command Bus ↔ Adapter 集成。

Rollback Notes:

- 删除 `adapter-types.ts`、`adapter-types.test.ts`。
- 恢复 `errors.ts`、`index.ts`、`package-boundary.test.ts` 到 task 前状态。

Version Impact:

- `@aether-md/core` public exports 增量（adapter protocol + errors）；不改 `manifestVersion` / lockfiles。

Commit Scope:

- `feat(core): add adapter protocol types and M3 boundary tests`

Status:

- complete

Run Log:

- 2026-07-05: TDD red — adapter-types.test.ts + package-boundary M3 assertions.
- 2026-07-05: Implemented adapter-types.ts, AdapterError/SerializationError, index exports, boundary update; core test PASS (47/47).

Deviation:

- none
