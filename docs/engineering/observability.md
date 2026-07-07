# 可观测性

## 可观测性

### TelemetryService

```typescript
interface TelemetryService {
  metrics: {
    increment(name: string, tags?: Record<string, string>): void;
    histogram(name: string, value: number, tags?: Record<string, string>): void;
  };
  trace: {
    startSpan(name: string, attrs?: Record<string, unknown>): Span;
  };
  hooks: {
    onCommandExecuted?(payload: CommandExecutedPayload): void;
    onTransaction?(payload: TransactionPayload): void;
    onRender?(payload: RenderPayload): void;
    onAdapterSwitch?(payload: AdapterSwitchPayload): void;
    onPluginError?(error: PluginError): void;
    onManifestValidated?(payload: ManifestValidatedPayload): void;
    onConflictResolved?(payload: ConflictResolvedPayload): void;
  };
}
```

### 默认指标

| 指标名              | 类型      | 说明                    |
| ------------------- | --------- | ----------------------- |
| `command.duration`  | histogram | 命令端到端耗时          |
| `command.count`     | counter   | 按 command 名计数       |
| `transaction.size`  | histogram | 事务影响节点数          |
| `render.frame`      | histogram | 增量渲染帧耗时          |
| `plugin.error`      | counter   | 按 pluginName 计数      |
| `lifecycle.init`    | histogram | 冷启动到 onReady        |
| `manifest.conflict` | counter   | 冲突裁决次数（按 type） |

### 接入策略

- 默认 no-op 实现（零开销）
- **MAY** 通过 `EditorConfig.telemetry` 注入 OpenTelemetry / Datadog
- 生产环境 **SHOULD** 采样 10%；开发环境 **SHOULD** 全量

---
