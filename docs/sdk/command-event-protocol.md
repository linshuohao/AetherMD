# Command/Event 协议

> 状态：设计草案。实现开始前，本页定义插件、Core 与宿主之间共享的命令和事件数据结构。

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
  source?: 'user' | 'plugin' | 'shell' | 'system';
  meta?: CommandMeta;
}

export interface CommandMeta {
  history?: 'capture' | 'skip';
  priority?: 'normal' | 'high';
  pluginName?: PluginName;
}
```

v1.0 **MAY** 忽略 `priority`，但 **SHOULD** 保留字段以兼容后续 Command Queue。

## CommandResult

```typescript
export interface CommandResult<TValue = unknown> {
  ok: boolean;
  value?: TValue;
  error?: AetherError;
  events?: EventEnvelope[];
}
```

Command handler 返回 `false` 时，Core **SHOULD** 转换为 `ok: false` 且不视为异常。

## EventName

```typescript
export type EventName =
  | 'ready'
  | 'change'
  | 'transactionFailed'
  | 'pluginError'
  | 'disposed'
  | `${string}:${string}`;
```

## EventEnvelope

```typescript
export interface EventEnvelope<TPayload = unknown> {
  name: EventName;
  payload?: TPayload;
  source: 'core' | 'plugin' | 'adapter' | 'shell';
  timestamp: number;
  pluginName?: PluginName;
}
```

## 内置事件

| 事件 | 触发时机 | payload |
| --- | --- | --- |
| `ready` | 生命周期 `onReady` 完成后 | `{}` |
| `change` | 可见文档快照变化后 | `{ doc, markdown? }` |
| `transactionFailed` | Adapter 事务失败并回滚后 | `{ commandId, error }` |
| `pluginError` | 插件运行时异常被隔离后 | `{ pluginName, error }` |
| `disposed` | 编辑器销毁完成后 | `{}` |

## 约束

- 事件 payload **MUST** 可 JSON 序列化，除非事件明确标记为内部事件。
- 插件 **SHOULD NOT** 监听未记录的 Core 内部事件。
- 宿主 **MUST NOT** 依赖事件同步触发顺序来读取内部 Adapter 状态。

---
