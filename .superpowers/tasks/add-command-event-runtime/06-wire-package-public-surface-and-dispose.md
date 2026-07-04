# Task 06: 将 Command/Event 接入 package public surface（含 dispose）

Change:

- `add-command-event-runtime`

Spec Requirement:

- `CommandEventRuntime public API is exported`
- `Disposed runtime rejects further command dispatch`
- `Command and Event public types are exported`（补齐最终 exports）

Source Docs:

- `.superpowers/plans/add-command-event-runtime.md`
- `openspec/changes/add-command-event-runtime/design.md`
- `openspec/changes/add-command-event-runtime/specs/command-event-runtime/spec.md`
- `docs/architecture/core-api.md`
- `docs/sdk/lifecycle.md`

## 目标

把完整 Command/Event runtime 接到 `@aether-md/core` **package public surface**（`index.ts` + `createCommandEventRuntime`），并实现 dispose 失败关闭语义。

## 范围

- 确认 `index.ts` 导出全部规范 public API：types、`PluginError`、`createCommandEventRuntime`、`CommandEventRuntime`。
- 实现 dispose：
  - 之后 `dispatch` → `{ ok: false, error.source === 'core' }`，不调用 handlers，不抛向宿主；
  - 之后 `emit` → no-op；
  - 重复 `dispose` → no-op。
- **明确不做：** 把 Command/Event 挂到 `CoreBootstrapRuntime` / 修改 `bootstrapCore` 行为。OpenSpec design Decision 1 要求独立 factory；用户建议中的「bootstrap runtime 最小 surface」在本 change 中解释为 **core package 对外最小运行时表面**，不是 M1 bootstrap lifecycle 对象。

Allowed Files:

- `packages/core/src/index.ts`
- `packages/core/src/command-event-runtime.ts`
- `packages/core/src/command-event-types.ts`
- `packages/core/src/errors.ts`
- `packages/core/src/command-event-runtime.test.ts`
- `packages/core/src/package-boundary.test.ts`（仅补 export 断言）

Forbidden Files:

- `packages/core/src/bootstrap.ts`（禁止接入 `CoreBootstrapRuntime`）
- `packages/core/src/lifecycle.ts`
- `packages/core/src/manifest.ts` / `capabilities.ts` / `dependencies.ts`（禁止借机做 M1 follow-up）
- Adapter / React / Remark / ProseMirror / GFM / Markdown 文件
- `docs/**`、`openspec/**`、`AGENTS.md`

## TDD 入口

1. 失败测试：`dispose()` 后 `dispatch` 返回 `{ ok: false, error.source === 'core' }`，已注册 handler 不被调用。
2. 失败测试：`dispose()` 后 `emit` 不投递 listener。
3. 失败测试：连续两次 `dispose()` 不抛。
4. 失败测试（export smoke）：`import * as core from './index.js'` 含 `createCommandEventRuntime` 与关键 types 的运行时可达 factory。
5. 运行 tests → FAIL → 实现 → PASS。

TDD Notes:

- dispose 语义与 package export 完整性是本任务红灯信号。
- 若误改 `bootstrap.ts`，视为 scope violation，必须回滚。

## 实现步骤

1. 在 runtime 增加 `disposed` 标志。
2. `dispose` 置位；重复调用直接返回。
3. disposed 后 `dispatch` / `emit` /（可选）`register`/`on` 按 design Decision 8 失败关闭或 no-op。
4. 整理 `index.ts` 导出列表，与 design Public Contract Impact 一致。
5. 更新 boundary 测试确认 M2 surface 完整导出。
6. 运行验证命令。

Implementation Notes:

- runtime-level 重复 dispose no-op **不**关闭 M1 follow-up「`bootstrapCore` dispose idempotency public contract」。
- 不得实现 duplicate `metadata.name` 或 partial startup cleanup。

## 验证命令

```bash
pnpm --filter @aether-md/core test
pnpm --filter @aether-md/core exec tsc --noEmit
rg "bootstrapCore|CoreBootstrapRuntime" packages/core/src/command-event-runtime.ts
```

预期：tests / typecheck 通过；`command-event-runtime.ts` 不依赖 `bootstrapCore`。

Intuitive Verification:

- 无。

Review Checklist:

- [x] public exports 完整且命名规范。
- [x] dispose 后 dispatch/emit/重复 dispose 语义正确。
- [x] **未**修改 `bootstrap.ts` / `CoreBootstrapRuntime`。
- [x] **未**实现 M1 follow-up 三项。

## 回滚提示

Rollback Notes:

- 回滚 dispose 逻辑、`index.ts` export 调整与相关测试。
- 保留 Task 02–05 的 Bus/Hub/错误隔离行为（若 dispose 与之耦合，仅回滚 dispose 分支）。

Version Impact:

- public exports 最终面确认（minor-level API surface）

Commit Scope:

- `feat(core): export command-event runtime and dispose fail-closed`

Status:

- completed

Run Log:

- TDD red：dispose 后 dispatch/emit/重复 dispose 测试失败。
- 实现 disposed 标志；dispatch 返回 RUNTIME_DISPOSED；emit no-op；重复 dispose no-op。
- `index.ts` 已导出完整 public surface（Task 01 建立，本任务确认）。
- 未修改 `bootstrap.ts`。
- `pnpm --filter @aether-md/core test` pass（38 tests）。
- Version impact：public exports 最终面确认。

Deviation:

- 无。

