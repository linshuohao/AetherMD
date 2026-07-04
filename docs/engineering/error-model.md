# 错误模型

> 状态：设计草案 + M1 Core Bootstrap + M2 Command/Event Runtime。本页作为对应主题的维护入口。

## 错误模型

### 类型定义

```typescript
type ErrorSeverity = 'recoverable' | 'degraded' | 'fatal';

interface AetherError {
  code: string;
  severity: ErrorSeverity;
  source: 'core' | 'plugin' | 'adapter' | 'render' | 'serialization';
  message: string;
  cause?: unknown;
  pluginName?: string;
}

type CoreError          = AetherError & { source: 'core' };
type PluginError        = AetherError & { source: 'plugin' };
type AdapterError       = AetherError & { source: 'adapter' };
type RenderError        = AetherError & { source: 'render' };
type SerializationError = AetherError & { source: 'serialization' };
```

`@aether-md/core` 当前导出可实例化的 `CoreError` 与 `PluginError` 类，二者均实现 `AetherError`。`AdapterError`、`RenderError` 与 `SerializationError` 仍属后续里程碑。

### 恢复策略矩阵

| 错误类型 | 典型场景 | severity | 恢复策略 |
| --- | --- | --- | --- |
| `CoreError` | Manifest 校验失败、Schema 冲突、未知命令、runtime 已 dispose | `fatal` 或 `recoverable` | 启动中止（fatal）；命令路径返回失败结果（recoverable） |
| `PluginError` | Command handler 未捕获异常 | `recoverable` | 沙盒隔离；返回失败结果并发出 `pluginError`（M2 不要求事务回滚） |
| `AdapterError` | PM Transaction 失败 | `recoverable` | 原子回滚；`transactionFailed` 事件（尚未实现） |
| `RenderError` | NodeView 崩溃 | `degraded` | Fallback Error View Block（尚未实现） |
| `SerializationError` | 节点无法序列化 | `degraded` | 输出 `[unsupported:block]` 占位符（尚未实现） |

### Error Boundary 层级

```
Plugin Handler  →  try/catch → PluginError
Adapter Layer   →  try/catch → AdapterError → Rollback
Render Layer    →  try/catch → RenderError   → Fallback View
Core Bootstrap  →  try/catch → CoreError     → Abort Init
```

M2 仅实现 Plugin Handler 错误边界：handler 抛错时转换为 `PluginError`，不向宿主抛出，不要求 Adapter 事务回滚。

## M1 Core Bootstrap baseline

`@aether-md/core` 实现 fatal `CoreError` shape，并用于以下启动中止场景：

- invalid Manifest shape。
- unsupported `metadata.manifestVersion`。
- missing Service Capability。
- missing plugin dependency。
- plugin dependency cycle。
- lifecycle hook failure during startup or dispose。

## M2 Command/Event Runtime baseline

`@aether-md/core` 在 Command/Event 路径上实现：

- recoverable `CoreError`：`COMMAND_UNKNOWN`、`RUNTIME_DISPOSED`（`dispatch` 返回 `{ ok: false }`，不抛出）。
- recoverable `PluginError`：`COMMAND_HANDLER_FAILED`（handler 抛错时隔离，并发出 `pluginError`）。

`AdapterError`、`RenderError` 和 `SerializationError` 仍属于后续里程碑。

---
