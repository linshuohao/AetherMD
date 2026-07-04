## Context

M1 已在 `@aether-md/core` 提供 `bootstrapCore`、Manifest / Service Capability 校验与 lifecycle startup/dispose。`packages/core/src/index.ts` 当前不导出 Command Bus 或 Event Hub。

M2 目标是在同一包内增加最小可测的 Command/Event 运行时，验证 `docs/architecture/principles.md` 中的命令驱动与事件观察模型，并满足 `docs/engineering/mvp-implementation-plan.md` 对 M2 的验收：能派发命令、返回结果、发出 `change` 与错误事件。

约束：

- 长期事实来源仍是 Docs；本 design 只抽取 M2 implementation contract。
- 不得引入 Adapter、Markdown、Shell 或第三方编辑器依赖。
- 必须更新 M1 包边界断言，避免与新增 public API 冲突。
- 说明性正文使用中文；API 名称、包名、路径与 OpenSpec 结构关键词保持英文。

## Goals / Non-Goals

**Goals:**

- 导出与 `docs/sdk/command-event-protocol.md` 对齐的最小 public types。
- 提供同步 command handler 注册与 `dispatch`。
- 返回可审查的 `CommandResult`（成功与失败）。
- 提供 Event Hub：`on` / `emit` / unsubscribe，以及基础 `EventEnvelope`。
- handler 抛错时转换为失败结果，并可发出错误事件。
- package boundary tests 允许 Command/Event，继续禁止后续里程碑 API。

**Non-Goals:**

- Adapter 创建、Markdown parse/serialize、React Shell、Remark / ProseMirror / GFM preset。
- Command Queue priority / coalescing、Worker Thread、完整权限沙盒。
- 完整 `createEditor`、`AetherEditor` 文档读写 API、默认 ConflictResolver、完整 Middleware 链（Capability / Permission / History / Telemetry）。
- 基于真实 `AetherDoc` 的自动 `change` 派生（无 document model）。
- Adapter 事务回滚（`docs/engineering/test-strategy.md` 中 handler 抛错回滚场景延后到 M3）。
- M1 follow-up：duplicate `metadata.name`、partial startup cleanup、`bootstrapCore` dispose idempotency public contract。

## Decisions

### 1. 独立 Command/Event runtime 表面，不扩展完整 `createEditor`

**选择：** 在 `@aether-md/core` 导出规范 public API：

```typescript
createCommandEventRuntime(): CommandEventRuntime

interface CommandEventRuntime {
  register(id: CommandId, handler: CommandHandler): void;
  dispatch(command: CommandRequest): CommandResult;
  on(eventName: EventName, listener: EventListener): Unsubscribe;
  emit(event: EventEnvelope): void;
  dispose(): void;
}

type Unsubscribe = () => void;
type EventListener = (event: EventEnvelope) => void;
type CommandHandler = (
  command: CommandRequest,
) => void | boolean | { value?: unknown };
```

Runtime **完全独立**于 `bootstrapCore`；lifecycle 绑定留到后续 editor 入口。

**理由：** `docs/architecture/core-api.md` 中的完整 `createEditor` 依赖 Adapter 与初始 Markdown，属于后续里程碑。M2 只需验证 Bus/Hub 合同。独立 factory 便于契约测试，且不扩大 M1 bootstrap 回归面。

**备选：** 直接把 API 挂到 `CoreBootstrapRuntime`。否决原因：会把 Command/Event 与 Manifest bootstrap 强耦合，增加 M1 回归面。

### 2. 同步派发路径

**选择：** `dispatch(command: CommandRequest): CommandResult` 为同步 API；handler 在 M2 中按同步路径执行。

**理由：** MVP 要求「Command Pipeline 的同步路径」；用户范围明确要求同步注册与派发。`AetherEditor.dispatch` 的 `Promise` 形态可在后续 editor 入口包装。

**备选：** 一律 `Promise<CommandResult>`。否决原因：M2 无异步 I/O，Promise 会掩盖同步合同。

### 3. 最小 Middleware：仅错误边界，不做完整 Guard 链

**选择：** M2 Pipeline 为 `dispatch → resolve handler → run handler → map result/error → emit pluginError on throw`。不实现 `ReadOnlyGuard`、`CapabilityGuard`、`PermissionGuard`、`HistoryCapture`、`TelemetrySpan`。

相对 `docs/architecture/core-api.md`「`dispatch` **MUST** 经过 Command Pipeline，不允许绕过 Middleware」：M2 将 **错误边界** 视为唯一 Middleware；完整 Guard 链是 v1.0 目标，不是本 change 范围。实现 **MUST NOT** 提供可绕过错误边界的第二入口。

**理由：** 完整 Guard 依赖权限模型、只读配置与 Telemetry；完整权限沙盒已排除。错误边界足以满足「handler 抛错可审查」。

**备选：** 实现全部默认 Middleware。否决原因：范围膨胀，且多项依赖后续里程碑。

### 4. `change` 事件为可发出的协议事件，不自动绑定文档快照

**选择：** Event Hub 支持 `emit` 任意合法 `EventEnvelope`，包括 `change` 与 `pluginError`。M2 **不**从 document model 自动派生 `change`。`emit` 的 `payload` **MUST** 可 JSON 序列化（对齐 `docs/sdk/command-event-protocol.md`）。测试通过显式 `emit('change')` / handler 抛错路径验证事件投递。

**理由：** `change` payload 中的 `doc` / `markdown?` 依赖 M3 Adapter 与文档模型。M2 只保证事件形状与投递，不假装已有可见文档快照。

**备选：** 引入内存假文档以自动发 `change`。否决原因：会提前发明 document model，污染后续 M3 边界。

### 5. handler 错误映射为 `PluginError` 形状的失败结果（无事务回滚）

**选择：** handler 抛错时，`dispatch` 返回 `{ ok: false, error }`，其中 `error` 符合 `docs/engineering/error-model.md` 的 `PluginError`（`source: 'plugin'`，`severity: 'recoverable'`）。runtime **MUST** 同时 `emit` `pluginError`，payload 至少包含可审查的 `error`（`pluginName` 在可知时提供）。handler 返回 `false` 映射为 `{ ok: false }` 且不视为异常。未知 `CommandId` 返回 `{ ok: false, error }`，`error.source === 'core'`。

相对 `docs/engineering/test-strategy.md`「Command handler 抛错时事务回滚并返回 `PluginError`」：M2 **只**实现返回 `PluginError` 与错误事件隔离；**不**实现事务回滚（无 Adapter / document snapshot）。回滚场景属于 M3。

**理由：** 与 error-model 的隔离策略一致，且不需要 Adapter。

**备选：** 让异常直接抛出宿主。否决原因：破坏可审查失败合同。

### 6. `priority` 字段保留但忽略

**选择：** `CommandMeta.priority` 可出现在类型中，M2 runtime **MUST NOT** 依赖其改变执行顺序。

**理由：** `docs/sdk/command-event-protocol.md` 允许 v1.0 忽略 `priority`；Queue priority/coalescing 已排除。

### 7. 包边界：允许 M2，禁止 M3+

**选择：** 修改 `core-bootstrap` 中「不得暴露后续里程碑 API」的要求，使 Command Bus / Event Hub 成为允许的 M2 表面；继续禁止 Adapter、Markdown parse/serialize、React Shell、Remark、ProseMirror、GFM preset。

**理由：** M1 边界测试若仍断言「不暴露 Command/Event」，会与本 change 冲突。

### 8. dispose 后的失败关闭语义

**选择：**

- `dispose` 后再次 `dispatch` **MUST** 返回 `{ ok: false, error }`（`source: 'core'`），不抛异常、不调用 handlers。
- `dispose` 后再次 `emit` **MUST** 为 no-op（不投递 listeners）。
- `dispose` 后再次 `on` / `register` **MUST** 为 no-op 或返回不会再收到事件的 unsubscribe；实现任选其一，但 **MUST** 可测且不抛未捕获异常。
- Command/Event runtime 的重复 `dispose` **MUST** 为 no-op（实现级幂等），但这 **不** 关闭 M1 follow-up：是否将 `bootstrapCore.dispose` 幂等提升为文档化 public contract。

**理由：** 对齐 `docs/architecture/core-api.md`「dispose 后再次 `dispatch` **MUST** 返回失败结果或抛出 `CoreError`」，并优先采用失败结果以保持可审查风格。

### 9. M1 follow-up 仅记录，不在本 change 实现

**选择：** 在 proposal / design / tasks 中显式记录下列 M1 遗留项为 **out of scope**，留给后续 Manifest/lifecycle hardening change：

1. **duplicate `metadata.name`**：当前依赖解析用 `Map` 静默覆盖同名插件；需定义 fatal 拒绝或其它裁决。
2. **partial startup cleanup**：`onInit` / `onReady` 中途失败后，是否对已成功插件调用 `onDestroy`。
3. **dispose idempotency public contract**：M1 实现已对重复 `dispose` no-op，但尚未提升为长期 public contract / main spec 要求。

**理由：** 这些项来自 `add-core-bootstrap` compliance review follow-ups，属于 bootstrap/lifecycle 硬化，不是 Command/Event 运行时。混入 M2 会破坏里程碑边界。

## Risks / Trade-offs

- [无文档模型却保留 `change` 事件名] → 规格与测试只验证事件投递与 JSON 可序列化 payload，不验证 `AetherDoc` 内容。
- [同步 API 与未来 `Promise`-based `AetherEditor.dispatch` 不一致] → design 明确 M2 为同步子集；后续 editor 入口可包装为 Promise。
- [最小 Pipeline 缺少 Permission Guard] → 在 non-goals 与 package boundary 中显式排除完整权限沙盒，避免误读为已实现安全模型。
- [扩展 public exports 影响未发布包的 API 面] → 记录为 minor-level 扩展；首次发布前在 docs/spec sync 更新 Core API 实现边界。

## Migration Plan

- 无已发布消费者；迁移成本限于仓库内 M1 边界测试更新。
- 回滚：移除 Command/Event 模块与导出，恢复 `core-bootstrap` 包边界断言。
- 实现顺序建议：types → Event Hub → Command Bus / error mapping → package exports → tests。

## Public Contract Impact

新增（规范名称，实现不得改名）：

- Types：`CommandId`、`CommandRequest`、`CommandMeta`、`CommandResult`、`EventName`、`EventEnvelope`、`CommandHandler`、`EventListener`、`Unsubscribe`
- Errors：`PluginError`（`source: 'plugin'`）；未知命令与 dispose 后 `dispatch` 使用 `CoreError` 或 `source: 'core'` 的 `AetherError` 形状
- Factory：`createCommandEventRuntime(): CommandEventRuntime`
- Runtime methods：`register`、`dispatch`、`on`、`emit`、`dispose`

保留不变：

- `bootstrapCore`、Manifest、Capability、lifecycle bootstrap 语义与 fatal `CoreError` 启动失败行为。
- 不因本 change 改变 duplicate `metadata.name`、partial startup cleanup 或 `bootstrapCore` dispose public contract。

## 架构边界检查

- 符合「命令通达天下」与「命令驱动意图，事件驱动观察」（`docs/architecture/principles.md`）。
- Core 仍不理解 Markdown 语义，不操作 DOM，不创建 Adapter。
- 不绕过未来 Middleware 合同的精神：M2 仅实现错误边界，完整 Guard 链留待后续 change。
- 不反向已接受 ADR；无需新 ADR，除非实现中发现必须改变微内核边界。

## 测试策略

遵循 `docs/engineering/test-strategy.md` 的分层原则（优先契约与边界），使用 Node built-in test runner。M2 **必测**：

- 注册 handler 后 `dispatch` 返回 `{ ok: true, value? }`。
- handler 返回 `false` → `{ ok: false }`，无异常抛出。
- 未知 `CommandId` → `{ ok: false, error.source === 'core' }`。
- handler 抛错 → `{ ok: false, error.source === 'plugin' }`，并收到 `pluginError` 事件；**不**断言事务回滚或文档快照保留。
- `on` 订阅后 `emit` 收到对应 `EventEnvelope`（含 `name` / `source` / `timestamp`）；unsubscribe 后不再收到。
- 可发出 `change` 与 `pluginError`；payload 可 `JSON.stringify`。
- dispose 后 `dispatch` 失败且不调用 handlers；重复 dispose no-op。
- package export boundary：暴露 `createCommandEventRuntime` 与 Command/Event types；不暴露 Adapter、Markdown parse/serialize、React Shell、Remark、ProseMirror、GFM preset API。
- 测试不得依赖后续里程碑包。

M2 **不测**（留给后续里程碑或 M1 follow-up change）：

- Adapter 事务回滚、可见文档快照保留。
- Markdown round-trip、Permission 拒绝路径。
- duplicate `metadata.name`、partial startup cleanup、`bootstrapCore` dispose public-contract 文档化。

## Deferred M1 Follow-ups（out of scope）

来源：`.superpowers/reviews/add-core-bootstrap.md` Recommended future hardening。

| Follow-up | 当前状态 | 本 change |
| --- | --- | --- |
| duplicate `metadata.name` | 未在 main spec 要求 fatal；实现可能静默覆盖 | 仅记录，不实现 |
| partial startup cleanup | hook failure 中止启动；已成功插件的 cleanup 未定义 | 仅记录，不实现 |
| dispose idempotency public contract | M1 实现重复 dispose no-op，但未提升为长期 public contract | 仅记录；Command/Event runtime 自身重复 dispose no-op 不替代该 follow-up |

## Open Questions

无阻塞性问题。下列项已在 Decisions 中关闭：独立 factory、dispose 后失败关闭、未知命令 `source: 'core'`、无事务回滚、M1 follow-up 延后。
