# v1.0 路线图

> 状态：设计草案 + M1–M4 里程碑已实现（M4 为 GFM preset 六语法 round-trip 基线）。本页作为对应主题的维护入口。

## v1.0 路线图

v1.0 目标是交付**最小可运行编辑器**，而非实现工程文档中全部预留能力。

### v1.0 必须实现

| 模块 | 范围 |
| --- | --- |
| **Core** | 分层 Manifest 合并、`supportedManifestVersions` 校验、Lifecycle（load → onReady → dispose）、Command Bus、Event Hub |
| **Service Capability** | `metadata.provides` / `requires` 启动期校验 |
| **ConflictResolver** | `createDefaultConflictResolver()` 默认策略（command / keymap / schema / capability） |
| **Adapters** | `plugin-prosemirror`、`plugin-remark` 最小可用实现 |
| **内置底座** | History、Selection、Clipboard |
| **Error Model** | `CoreError`（启动失败）+ `PluginError`（沙盒 + 事务回滚） |
| **Shell** | `@aether-md/react` + GateLock 单向数据闸门 |
| **Preset** | `@aether-md/preset-gfm` 基础块级与行内语法（段落、标题、加粗、斜体、列表、链接） — **M4 基线已实现** |
| **EditorContext** | `commands`、`events`、`logger`、`services.*` |

### 暂不实现，仅保留契约

| 模块 | 说明 |
| --- | --- |
| **Worker Thread** | Parser / Serializer / Search / Lint Worker 化，详见 [线程模型](../engineering/thread-model.md) |
| **Command Queue 优先级** | P0–P3 完整队列与 Coalescing，详见 [并发策略](../engineering/concurrency.md) |
| **PermissionGuard 沙盒** | 未授权 API 拦截；第三方插件安全模型完整落地，详见 [安全模型](../engineering/security.md) |
| **Telemetry 后端** | OpenTelemetry / Datadog 接入；生产采样，详见 [可观测性](../engineering/observability.md) |
| **Vue Shell** | `@aether-md/vue` |
| **五级 Error Model 全覆盖** | `RenderError`、`SerializationError` 降级视图 |
| **自定义 ConflictResolver** | 宿主注入（接口已定义，v1.0 仅保证默认实现可测） |

---
