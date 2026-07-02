# 命令管道

> 状态：设计草案。实现开始前，本页作为对应主题的维护入口。

## 命令管道

```
dispatch → enqueue → validate → middleware → handler
    → adapter → transaction → event → render → telemetry
```

**默认 Middleware 链（RECOMMENDED）：**

| 顺序 | Middleware | 职责 |
| --- | --- | --- |
| 1 | `ReadOnlyGuard` | 只读模式拦截 |
| 2 | `CapabilityGuard` | 校验 `metadata.requires`（Service Capability） |
| 3 | `PermissionGuard` | 校验 `ctx.grantedPermissions`（Runtime Permission） |
| 4 | `HistoryCapture` | 可撤销命令打标 |
| 5 | `TelemetrySpan` | 耗时记录 |

并发策略与队列详见 [并发策略](../engineering/concurrency.md)。

命令请求、返回值与事件信封详见 [Command/Event 协议](command-event-protocol.md)。

---


## Schema 与 Command 声明

### SchemaDeclaration

```typescript
export interface SchemaDeclaration {
  type: 'node' | 'mark';
  name: string;
  matchMarkdownTag: string;
  serializeToMarkdown: string | { open: string; close: string };
}
```

### CommandHandler

```typescript
export type CommandHandler = (
  ctx: EditorContext,
  payload?: unknown
) => void | boolean | Promise<void | boolean>;
```

异步 Command handler **MUST** 在 `security.requests` 中声明 `perm:async`。

---
