# Command/Event 协议

> 本页定义插件、Core 与宿主之间共享的命令和事件数据结构；未标注为已实现的行为仍属 v1.0 目标。

## 已实现子集

`@aether-md/core` 导出以下类型与运行时：

- 类型：`CommandId`、`CommandRequest`、`CommandMeta`、`CommandResult`、`EventName`、`EventEnvelope`、`CommandHandler`、`EventListener`、`Unsubscribe`，以及相关的 `AetherError` / `CommandSource` / `EventSource` / `ErrorSeverity`
- 运行时：`createCommandEventRuntime` → `CommandEventRuntime`（`register`、`dispatch`、`on`、`emit`、`dispose`）

已验证行为：

- 同步注册与 `dispatch`，返回 `CommandResult`
- handler 返回 `false` → `{ ok: false }`，不视为异常
- 未知命令与 dispose 后 `dispatch` → `{ ok: false }`，`error.source` 为 `core`
- handler 抛错 → `{ ok: false }`，`PluginError`（`source: 'plugin'`，`severity: 'recoverable'`），并发出 `pluginError`
- Event Hub：`on` / `emit` / unsubscribe；可投递 `change` 与 `pluginError`（不要求文档快照）
- 事件 payload 须可 JSON 序列化
- `meta.priority` 被忽略

未实现：Adapter 事务回滚、`transactionFailed` 自动派生、基于 `AetherDoc` 的自动 `change`、完整 Guard 链、Command Queue。

## CommandId

```typescript
export type CommandId = `${string}:${string}`;
```

命令名 **SHOULD** 使用命名空间格式：

- Core 内置命令：`core:undo`
- 官方插件命令：`gfm:toggleStrong`
- 第三方插件命令：`plugin-name:commandName`

## CommandRequest

```typescript
export interface CommandRequest<TPayload = unknown> {
  id: CommandId;
  payload?: TPayload;
  source?: "user" | "plugin" | "shell" | "system";
  meta?: CommandMeta;
}

export interface CommandMeta {
  history?: "capture" | "skip";
  priority?: "normal" | "high";
  pluginName?: PluginName;
}
```

v1.0 **MAY** 忽略 `priority`，但 **SHOULD** 保留字段以兼容后续 Command Queue。当前实现已忽略 `priority`。

## CommandResult

```typescript
export interface CommandResult<TValue = unknown> {
  ok: boolean;
  value?: TValue;
  error?: AetherError;
  events?: EventEnvelope[];
}
```

Command handler 返回 `false` 时，Core **SHOULD** 转换为 `ok: false` 且不视为异常。当前实现已覆盖该映射。

## EventName

```typescript
export type EventName =
  "ready" | "change" | "transactionFailed" | "pluginError" | "disposed" | `${string}:${string}`;
```

## EventEnvelope

```typescript
export interface EventEnvelope<TPayload = unknown> {
  name: EventName;
  payload?: TPayload;
  source: "core" | "plugin" | "adapter" | "shell";
  timestamp: number;
  pluginName?: PluginName;
}
```

## 内置事件

| 事件                | 触发时机                  | payload                  | 实现状态                                             |
| ------------------- | ------------------------- | ------------------------ | ---------------------------------------------------- |
| `ready`             | 生命周期 `onReady` 完成后 | `{}`                     | 类型已导出；未由 bootstrap 自动发出                  |
| `change`            | 可见文档快照变化后        | `{ doc, markdown? }`     | 可通过 `emit` 投递；不要求文档快照字段               |
| `transactionFailed` | Adapter 事务失败并回滚后  | `{ commandId, error }`   | 类型已导出；无 Adapter，未实现自动发出               |
| `pluginError`       | 插件运行时异常被隔离后    | `{ pluginName?, error }` | handler 抛错时由 runtime 发出                        |
| `disposed`          | 编辑器销毁完成后          | `{}`                     | 类型已导出；Command/Event runtime dispose 不自动发出 |

## 约束

- 事件 payload **MUST** 可 JSON 序列化，除非事件明确标记为内部事件。
- 插件 **SHOULD NOT** 监听未记录的 Core 内部事件。
- 宿主 **MUST NOT** 依赖事件同步触发顺序来读取内部 Adapter 状态。

---
