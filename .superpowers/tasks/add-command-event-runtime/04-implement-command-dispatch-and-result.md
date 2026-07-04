# Task 04: 实现 command dispatch 与 `CommandResult`

Change:

- `add-command-event-runtime`

Spec Requirement:

- `Synchronous command handlers can be registered and dispatched`
- `CommandResult reports success and failure`

Source Docs:

- `.superpowers/plans/add-command-event-runtime.md`
- `openspec/changes/add-command-event-runtime/design.md`
- `openspec/changes/add-command-event-runtime/specs/command-event-runtime/spec.md`
- `docs/sdk/command-event-protocol.md`
- `docs/engineering/error-model.md`

## 目标

实现同步 `dispatch` 的 `CommandResult` 映射：成功、`false`→失败、未知命令 `source: 'core'`，并忽略 `meta.priority`。

## 范围

- 完整成功 / `false` / 未知命令结果形状。
- priority 字段可存在但不影响执行顺序。
- **不**实现 handler `throw` → `PluginError`（Task 05；本任务可让 throw 暂时穿透，但更推荐先用 try/catch 占位返回失败并在 Task 05 收紧形状——若占位，须在 Deviation 说明）。
- **不**实现 dispose。

Allowed Files:

- `packages/core/src/command-event-runtime.ts`
- `packages/core/src/errors.ts`（未知命令 core 失败码）
- `packages/core/src/command-event-runtime.test.ts`

Forbidden Files:

- `packages/core/src/bootstrap.ts`
- `packages/react/**`、`packages/preset-gfm/**`、`packages/plugin-prosemirror/**`、`packages/plugin-remark/**`
- Adapter / Markdown 实现
- `docs/**`、`openspec/**`、`AGENTS.md`

## TDD 入口

1. 失败测试：handler 返回 `{ value: 1 }` 或返回值可映射为 `value` → `{ ok: true, value: 1 }`（按 design：`void | boolean | { value?: unknown }`）。
2. 失败测试：handler 返回 `false` → `{ ok: false }`，`dispatch` 不抛。
3. 失败测试：未知 `CommandId` → `{ ok: false, error.source === 'core' }`，`dispatch` 不抛。
4. 失败测试：`meta.priority: 'high'` 与 `'normal'` 不改变「按调用顺序执行」的同步语义（无队列重排副作用）。
5. 运行 tests → FAIL → 实现 → PASS。

TDD Notes:

- red-green；先锁定 `CommandResult` 形状再改 `dispatch`。

## 实现步骤

1. `dispatch` 查找 handler；缺失则返回 core 失败结果。
2. 调用 handler；`false` → `{ ok: false }`；其它成功完成 → `{ ok: true, value? }`。
3. 忽略 `meta.priority`。
4. 保持同步 API：`dispatch(...): CommandResult`（非 `Promise`）。
5. 运行验证命令。

Implementation Notes:

- 对齐 protocol：handler 返回 `false` 不视为异常。
- 错误边界 Middleware 仅在 Task 05 对 throw 做完整 `PluginError` 映射；本任务至少保证未知命令与 `false` 不抛向宿主。

## 验证命令

```bash
pnpm --filter @aether-md/core test
pnpm --filter @aether-md/core exec tsc --noEmit
```

Intuitive Verification:

- 无。

Review Checklist:

- [x] 成功 / `false` / 未知命令结果正确。
- [x] `error.source === 'core'` 用于未知命令。
- [x] 同步 `CommandResult`，非 Promise。
- [x] 无 priority queue。

## 回滚提示

Rollback Notes:

- 回滚 `dispatch` 结果映射与相关测试。
- 保留 Task 03 registry。

Version Impact:

- none（若新增 core error code，属 public error 形状扩展，记入 Run Log）

Commit Scope:

- `feat(core): map command dispatch to CommandResult`

Status:

- completed

Run Log:

- TDD red：CommandResult 映射测试失败。
- 实现 success / `false` / unknown command / ignore priority。
- `pnpm --filter @aether-md/core test` pass（33 tests）。
- Version impact：none。

Deviation:

- 无。

