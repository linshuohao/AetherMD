# 错误模型

> 状态：设计草案。实现开始前，本页作为对应主题的维护入口。

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

### 恢复策略矩阵

| 错误类型 | 典型场景 | severity | 恢复策略 |
| --- | --- | --- | --- |
| `CoreError` | Manifest 校验失败、Schema 冲突 | `fatal` | 中止启动 |
| `PluginError` | Command handler 未捕获异常 | `recoverable` | 沙盒隔离；回滚事务 |
| `AdapterError` | PM Transaction 失败 | `recoverable` | 原子回滚；`transactionFailed` 事件 |
| `RenderError` | NodeView 崩溃 | `degraded` | Fallback Error View Block |
| `SerializationError` | 节点无法序列化 | `degraded` | 输出 `[unsupported:block]` 占位符 |

### Error Boundary 层级

```
Plugin Handler  →  try/catch → PluginError
Adapter Layer   →  try/catch → AdapterError → Rollback
Render Layer    →  try/catch → RenderError   → Fallback View
Core Bootstrap  →  try/catch → CoreError     → Abort Init
```

---
