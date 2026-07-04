# Task 03: 实现最小 Command Bus handler registry

Change:

- `add-command-event-runtime`

Spec Requirement:

- `Synchronous command handlers can be registered and dispatched`（本任务只完成 **register** 与「已注册可被后续 dispatch 解析」；完整 `CommandResult` 映射在 Task 04）

Source Docs:

- `.superpowers/plans/add-command-event-runtime.md`
- `openspec/changes/add-command-event-runtime/design.md`
- `openspec/changes/add-command-event-runtime/specs/command-event-runtime/spec.md`
- `docs/sdk/commands.md`
- `docs/sdk/command-event-protocol.md`

## 目标

实现同步 `register(id, handler)`，将 handler 存入 runtime，供后续 `dispatch` 解析。

## 范围

- 实现 handler registry（`Map<CommandId, CommandHandler>` 或等价）。
- 可用最小 `dispatch` 探测：已注册 handler 被调用一次（返回值映射可仍粗糙）。
- **不**完成完整 `CommandResult` 成功/失败矩阵（Task 04）。
- **不**实现 handler throw 隔离（Task 05）。
- **不**实现 dispose（Task 06）。

Allowed Files:

- `packages/core/src/command-event-runtime.ts`
- `packages/core/src/command-event-types.ts`（仅当 `CommandHandler` 签名需对齐）
- `packages/core/src/command-event-runtime.test.ts`

Forbidden Files:

- `packages/core/src/bootstrap.ts`
- `packages/react/**`、`packages/preset-gfm/**`、`packages/plugin-prosemirror/**`、`packages/plugin-remark/**`
- Adapter / Markdown 实现
- `docs/**`、`openspec/**`、`AGENTS.md`

## TDD 入口

1. 失败测试：`register('demo:ping', handler)` 后 `dispatch({ id: 'demo:ping' })` 时 `handler` 被同步调用恰好一次。
2. 失败测试：同一 `CommandId` 再次 `register` 覆盖旧 handler（后注册者生效）——若 design 未强制覆盖语义，则测试「后注册可被调用」即可；**不要**发明 ConflictResolver。
3. 运行 tests → FAIL → 实现 registry → PASS。

TDD Notes:

- 本任务以「handler 被调用」为红灯信号，不以完整 `ok/value/error` 形状为完成标准。

## 实现步骤

1. 在 runtime 增加 `handlers: Map<CommandId, CommandHandler>`。
2. `register(id, handler)` 同步写入 map。
3. `dispatch` 能解析并调用已注册 handler（返回值处理可临时：有返回则 `{ ok: true }`，无 handler 可仍返回占位失败）。
4. 忽略 `meta.priority`（不做队列）。
5. 运行验证命令。

Implementation Notes:

- `CommandHandler` 同步子集；不支持 async handler（不 await Promise）。
- Pipeline 仍只有错误边界占位；完整错误包装在 Task 05。

## 验证命令

```bash
pnpm --filter @aether-md/core test
pnpm --filter @aether-md/core exec tsc --noEmit
```

Intuitive Verification:

- 无。

Review Checklist:

- [x] `register` 同步写入并可被 `dispatch` 解析。
- [x] 无 priority queue / coalescing。
- [x] 未实现 throw→PluginError（Task 05）。
- [x] 未修改 `bootstrap.ts`。

## 回滚提示

Rollback Notes:

- 回滚 registry 相关实现与测试。
- 保留 Task 02 Event Hub。

Version Impact:

- none

Commit Scope:

- `feat(core): add command handler registry`

Status:

- completed

Run Log:

- TDD red：registry 测试因 stub `register` no-op 失败。
- 实现 `Map<CommandId, CommandHandler>` 与最小 `dispatch` 调用。
- `pnpm --filter @aether-md/core test` pass（29 tests）。
- Version impact：none。

Deviation:

- 无。

