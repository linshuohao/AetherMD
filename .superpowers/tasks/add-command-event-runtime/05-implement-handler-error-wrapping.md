# Task 05: 实现 handler error wrapping / failure result

Change:

- `add-command-event-runtime`

Spec Requirement:

- `Handler errors become reviewable failure results`

Source Docs:

- `.superpowers/plans/add-command-event-runtime.md`
- `openspec/changes/add-command-event-runtime/design.md`
- `openspec/changes/add-command-event-runtime/specs/command-event-runtime/spec.md`
- `docs/engineering/error-model.md`
- `docs/engineering/test-strategy.md`
- `docs/sdk/command-event-protocol.md`

## 目标

handler 抛错时，`dispatch` 返回可审查失败结果（`PluginError` 形状），emit `pluginError`，且异常不穿透宿主。不实现 Adapter 事务回滚。

## 范围

- try/catch 错误边界作为 M2 唯一 Middleware。
- `{ ok: false, error }` 且 `error.source === 'plugin'`、`error.severity === 'recoverable'`。
- emit `pluginError`，payload 含可审查 `error`。
- **不**断言或实现事务回滚 / 文档快照保留。
- **不**实现 dispose。

Allowed Files:

- `packages/core/src/command-event-runtime.ts`
- `packages/core/src/errors.ts`（`PluginError` 完善）
- `packages/core/src/command-event-runtime.test.ts`

Forbidden Files:

- `packages/core/src/bootstrap.ts`
- Adapter / Markdown / React / Remark / ProseMirror / GFM 相关文件
- `docs/**`、`openspec/**`、`AGENTS.md`

## TDD 入口

1. 失败测试：handler `throw new Error('boom')` → `dispatch` 返回 `{ ok: false, error.source === 'plugin', error.severity === 'recoverable' }`，且 `dispatch` 调用本身不抛。
2. 失败测试：先 `on('pluginError', listener)`，再 dispatch 抛错 handler → listener 收到 `pluginError` envelope，payload 含 `error`。
3. 明确 **不** 编写 rollback / snapshot 断言。
4. 运行 tests → FAIL → 实现 → PASS。

TDD Notes:

- red-green；错误隔离是本任务唯一完成标准。

## 实现步骤

1. 在 `dispatch` 用 try/catch 包裹 handler 调用。
2. 捕获后构造 `PluginError`（或等价对象），填入 `CommandResult.error`。
3. `emit({ name: 'pluginError', source: 'plugin', timestamp, payload: { error, pluginName? } })`。
4. 确保不引入 Adapter 或事务 API。
5. 运行验证命令。

Implementation Notes:

- 相对 `test-strategy.md`「抛错时事务回滚」：本任务只做错误隔离，回滚留给 M3。
- `cause` 可保留原始异常以便调试，但 public `error` 形状必须可审查。

## 验证命令

```bash
pnpm --filter @aether-md/core test
pnpm --filter @aether-md/core exec tsc --noEmit
```

Intuitive Verification:

- 无。

Review Checklist:

- [x] throw → `PluginError` 形状失败结果。
- [x] emit `pluginError`。
- [x] `dispatch` 不向宿主抛异常。
- [x] 无事务回滚实现或测试。

## 回滚提示

Rollback Notes:

- 回滚 try/catch 映射、`PluginError` 相关改动与测试。
- 保留 Task 04 的成功/`false`/未知命令路径。

Version Impact:

- 导出 `PluginError`（若 Task 01 未完整导出，本任务补齐）

Commit Scope:

- `feat(core): isolate command handler errors`

Status:

- completed

Run Log:

- TDD red：handler throw 测试失败。
- 实现 try/catch → PluginError + emit pluginError。
- 无事务回滚。
- `pnpm --filter @aether-md/core test` pass（35 tests）。
- Version impact：PluginError 已在 Task 01 导出。

Deviation:

- 无。

