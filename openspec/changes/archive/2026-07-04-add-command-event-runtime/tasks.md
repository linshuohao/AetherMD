## 1. Public types and API surface

- [x] 1.1 在 `packages/core` 增加与 `docs/sdk/command-event-protocol.md` 对齐的 `CommandId`、`CommandRequest`、`CommandMeta`、`CommandResult`、`EventName`、`EventEnvelope` 类型。
- [x] 1.2 增加同步 `CommandHandler`、`EventListener`、`Unsubscribe` 与 `PluginError`（`source: 'plugin'`）类型。
- [x] 1.3 导出规范 public API：`createCommandEventRuntime` 与 `CommandEventRuntime`（`register` / `dispatch` / `on` / `emit` / `dispose`）。
- [x] 1.4 确认 public entry 不导出 Adapter、Markdown parse/serialize、React Shell、Remark、ProseMirror、GFM preset API。

## 2. Event Hub

- [x] 2.1 实现 Event Hub：`on` 返回 `Unsubscribe`，`emit` 投递含 `name` / `source` / `timestamp` 的 `EventEnvelope`。
- [x] 2.2 支持发出 `change` 与 `pluginError`；payload 可 JSON 序列化；不依赖 Adapter 或 document snapshot。
- [x] 2.3 unsubscribe 后 listener 不再收到事件。

## 3. Command Bus

- [x] 3.1 实现独立于 `bootstrapCore` / `createEditor` 的 `createCommandEventRuntime`。
- [x] 3.2 实现同步 `register` 与同步 `dispatch`；Pipeline 仅含错误边界 Middleware。
- [x] 3.3 映射成功结果、`false` 返回值；未知 `CommandId` 返回 `{ ok: false, error.source: 'core' }`。
- [x] 3.4 handler 抛错时返回 `{ ok: false, error }`（`source: 'plugin'`，`severity: 'recoverable'`），emit `pluginError`，**不**实现事务回滚。
- [x] 3.5 忽略 `meta.priority`，不实现 Command Queue priority 或 coalescing。
- [x] 3.6 `dispose` 后 `dispatch` 返回 core 失败结果；`emit` no-op；重复 `dispose` no-op。

## 4. Package boundary

- [x] 4.1 更新 M1 package export boundary tests，允许 `createCommandEventRuntime` 与 Command/Event types。
- [x] 4.2 断言包表面仍不暴露 Adapter、Markdown parse/serialize、React Shell、Remark、ProseMirror、GFM preset API。

## 5. Verification

- [x] 5.1 添加成功 `dispatch`、`false` 结果、未知命令（`source: 'core'`）、handler 抛错隔离（无事务回滚断言）的 contract/unit tests。
- [x] 5.2 添加 `on` / `emit` / unsubscribe、JSON-serializable payload、`change` / `pluginError` 事件 tests。
- [x] 5.3 添加 dispose 后 `dispatch` 失败、`emit` no-op、重复 dispose no-op 的 tests。
- [x] 5.4 运行 `pnpm check`，确认 build、typecheck 与 tests 通过。

## 6. Deferred M1 follow-ups（记录 only，不实现）

- [x] 6.1 在 plan / validation / review 中保留 M1 follow-up 清单：duplicate `metadata.name`、partial startup cleanup、`bootstrapCore` dispose idempotency public contract。
- [x] 6.2 确认实现与 tests **不**偷偷加入上述 M1 follow-up 行为作为本 change 验收条件。

## 7. Workflow follow-up

- [x] 7.1 后续 Superpowers plan / tasks / validation / review 说明性正文使用中文。
- [x] 7.2 API 名称、包名、路径与 OpenSpec 结构关键词保持英文。
- [x] 7.3 实现与 compliance review 完成前，不把无关脏文件（例如 `AGENTS.md`）纳入本 change commit。
