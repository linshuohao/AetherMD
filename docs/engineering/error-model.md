# 错误模型

> 状态：设计草案 + M1 Core Bootstrap + M2 Command/Event Runtime + M3 Adapter 基座 + M4 GFM Preset（Serializer 占位符）。本页作为对应主题的维护入口。

## 错误模型

### 类型定义

```typescript
type ErrorSeverity = "recoverable" | "degraded" | "fatal";

interface AetherError {
  code: string;
  severity: ErrorSeverity;
  source: "core" | "plugin" | "adapter" | "render" | "serialization";
  message: string;
  cause?: unknown;
  pluginName?: string;
}

type CoreError = AetherError & { source: "core" };
type PluginError = AetherError & { source: "plugin" };
type AdapterError = AetherError & { source: "adapter" };
type RenderError = AetherError & { source: "render" };
type SerializationError = AetherError & { source: "serialization" };
```

`@aether-md/core` 当前导出可实例化的 `CoreError`、`PluginError`、`AdapterError` 与 `SerializationError` 类，均实现 `AetherError`。`RenderError` 仍属后续里程碑。

### 恢复策略矩阵

| 错误类型             | 典型场景                                                     | severity                 | 恢复策略                                                                                                  |
| -------------------- | ------------------------------------------------------------ | ------------------------ | --------------------------------------------------------------------------------------------------------- |
| `CoreError`          | Manifest 校验失败、Schema 冲突、未知命令、runtime 已 dispose | `fatal` 或 `recoverable` | 启动中止（fatal）；命令路径返回失败结果（recoverable）                                                    |
| `PluginError`        | Command handler 未捕获异常                                   | `recoverable`            | 沙盒隔离；返回失败结果并发出 `pluginError`（M2 不要求事务回滚）                                           |
| `AdapterError`       | PM Transaction 失败                                          | `recoverable`            | M3：Adapter 层返回失败结果并保持 apply 前快照；`transactionFailed` 事件仍 deferred                        |
| `RenderError`        | NodeView 崩溃                                                | `degraded`               | Fallback Error View Block（尚未实现）                                                                     |
| `SerializationError` | 节点无法序列化                                               | `degraded`               | M4：支持 GFM 节点确定性输出；`CustomBlock` 占位符 `[unsupported:block:<name>]`；不支持节点 Promise reject |

### Error Boundary 层级

```
Plugin Handler  →  try/catch → PluginError
Adapter Layer   →  try/catch → AdapterError → Rollback
Render Layer    →  try/catch → RenderError   → Fallback View
Core Bootstrap  →  try/catch → CoreError     → Abort Init
```

M2 仅实现 Plugin Handler 错误边界：handler 抛错时转换为 `PluginError`，不向宿主抛出，不要求 Adapter 事务回滚。

## M3 Adapter baseline

`@aether-md/core` 与 `@aether-md/plugin-prosemirror` 在 Adapter 路径上实现：

- recoverable `AdapterError`：`APPLY_FAILED`、`CREATE_FAILED` 等（`apply` 返回 `{ ok: false, error }`，不抛出）。
- degraded `SerializationError`：可实例化并 export；M3 Serializer happy-path 为主。

M3 **不**实现 Command Bus 自动 rollback 或 `transactionFailed` auto emit。Adapter 快照语义由 Adapter contract tests 验证。

## M4 GFM Preset baseline

`@aether-md/plugin-remark` Serializer 实现 M4 失败策略：

- 支持 GFM 节点（paragraph、heading、strong、emphasis、list、link）确定性输出。
- `CustomBlock` 降级为 `[unsupported:block:<name>]` 占位符，不 throw。
- 不支持 block/inline 类型 Promise reject `SerializationError`（`source: 'serialization'`，`severity: 'degraded'`，reviewable `code`/`message`）。

M4 **不**实现 Command Bus 自动 rollback 或 `transactionFailed` auto emit。

`RenderError` 仍属于后续里程碑。

## M1 Core Bootstrap baseline

`@aether-md/core` 实现 fatal `CoreError` shape，并用于以下启动中止场景：

- invalid Manifest shape。
- duplicate `metadata.name`（`PLUGIN_NAME_DUPLICATE`）。
- unsupported `metadata.manifestVersion`。
- missing Service Capability。
- missing plugin dependency。
- plugin dependency cycle。
- lifecycle hook failure during startup or normal dispose。

Startup lifecycle 与 normal dispose 的 destroy 行为不对称：

- **Startup failure cleanup**：原始 startup hook 失败时 primary error 为 `LIFECYCLE_HOOK_FAILED`；Core 对已成功 `onInit` 的插件 reverse-order 调用 `onDestroy`；cleanup 中单个 `onDestroy` 失败时 best-effort 继续，primary error 不变；cleanup destroy failures **MAY** 挂入 primary error `cause`（当前实现未强制 `cause` 链）。
- **Normal dispose**：`onDestroy` 失败时 fatal abort，不继续后续 destroy hooks。
- **Repeated bootstrap dispose**：`CoreBootstrapRuntime.dispose()` 重复调用为 no-op，不 throw（与 M2 Command/Event runtime dispose 幂等独立）。

## M2 Command/Event Runtime baseline

`@aether-md/core` 在 Command/Event 路径上实现：

- recoverable `CoreError`：`COMMAND_UNKNOWN`、`RUNTIME_DISPOSED`（`dispatch` 返回 `{ ok: false }`，不抛出）。
- recoverable `PluginError`：`COMMAND_HANDLER_FAILED`（handler 抛错时隔离，并发出 `pluginError`）。

M2 **不**实现 Adapter 事务回滚或 `transactionFailed` 自动 emit。

---
