# Task 02: 实现最小 Event Hub

Change:

- `add-command-event-runtime`

Spec Requirement:

- `Event Hub supports subscribe emit and unsubscribe`

Source Docs:

- `.superpowers/plans/add-command-event-runtime.md`
- `openspec/changes/add-command-event-runtime/design.md`
- `openspec/changes/add-command-event-runtime/specs/command-event-runtime/spec.md`
- `docs/sdk/command-event-protocol.md`
- `docs/architecture/core-api.md`

## 目标

实现最小 Event Hub：`on` 返回 `Unsubscribe`，`emit` 投递 `EventEnvelope`，支持 `change` / `pluginError`，payload 可 JSON 序列化。

## 范围

- 仅实现 `on` / `emit` / unsubscribe 行为。
- **不**实现 Command `register` / `dispatch` 成功路径（可保持 Task 01 stub）。
- **不**从 document model 自动派生 `change`。
- **不**实现 dispose 失败关闭（Task 06）。

Allowed Files:

- `packages/core/src/command-event-runtime.ts`
- `packages/core/src/command-event-types.ts`（仅当 Event Hub 需要微调类型）
- `packages/core/src/command-event-runtime.test.ts`

Forbidden Files:

- `packages/core/src/bootstrap.ts`
- `packages/core/src/package-boundary.test.ts`（除非测试失败必须微调，优先不改）
- `packages/react/**`、`packages/preset-gfm/**`、`packages/plugin-prosemirror/**`、`packages/plugin-remark/**`
- Adapter / Markdown 实现
- `docs/**`、`openspec/**`、`AGENTS.md`

## TDD 入口

1. 失败测试：`on('change', listener)` 后 `emit({ name: 'change', source: 'core', timestamp: <number> })` 调用 listener，envelope 含 `name` / `source` / `timestamp`。
2. 失败测试：调用返回的 `Unsubscribe` 后，再次 `emit` 不再调用 listener。
3. 失败测试：`emit({ name: 'pluginError', source: 'plugin', timestamp, payload: { error: { code: 'x' } } })` 可投递，且 `JSON.stringify(payload)` 成功。
4. 运行 `pnpm --filter @aether-md/core test` → FAIL → 实现 → PASS。

TDD Notes:

- red-green-refactor；先写上述三个场景再实现。

## 实现步骤

1. 在 runtime 内维护 `EventName → Set<EventListener>`（或等价结构）。
2. `on(eventName, listener)` 注册并返回 `Unsubscribe`。
3. `emit(event)` 同步调用匹配 listeners；不要求 listener 异常隔离（可留到后续，但不得让未捕获异常破坏整个进程测试——若 listener 抛错，本任务可不处理，记录在 Deviation）。
4. 不引入 Adapter 或文档快照。
5. 运行验证命令。

Implementation Notes:

- `timestamp` 由调用方提供或 runtime 在缺失时填充 `Date.now()`；若填充，须在测试中可断言为 number。
- payload **MUST** 保持 JSON 可序列化约定；不接受函数/循环引用作为契约测试输入。

## 验证命令

```bash
pnpm --filter @aether-md/core test
pnpm --filter @aether-md/core exec tsc --noEmit
```

Intuitive Verification:

- 无。

Review Checklist:

- [x] `on` / `emit` / `Unsubscribe` 行为正确。
- [x] `change` 与 `pluginError` 可发出。
- [x] 无 document model / Adapter。
- [x] 未实现完整 Command Bus。

## 回滚提示

Rollback Notes:

- 回滚 `command-event-runtime.ts` 与 `command-event-runtime.test.ts` 中 Event Hub 相关改动。
- 保留 Task 01 的 types / boundary / factory 表面。

Version Impact:

- none（方法已在 Task 01 表面声明）

Commit Scope:

- `feat(core): implement minimal event hub`

Status:

- completed

Run Log:

- TDD red：Event Hub 测试因 stub `emit` no-op 失败。
- 实现 `Map<EventName, Set<EventListener>>` 的 `on` / `emit` / `Unsubscribe`。
- `pnpm --filter @aether-md/core test` pass（27 tests）。
- Version impact：none。

Deviation:

- 无。

