# v1.0 能力范围

> 本页定义 v1.0 必须交付的能力边界与预留契约。当前实现差距见 [能力概览 — v1.0 能力差距](../project-status.md#v10-能力差距)。

## 目标

v1.0 交付**最小可运行编辑器**，而非工程文档中全部预留能力。

## 必须实现

| 模块                   | 范围                                                                                                                |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------- |
| **Core**               | 分层 Manifest 合并、`supportedManifestVersions` 校验、Lifecycle（load → onReady → dispose）、Command Bus、Event Hub |
| **Service Capability** | `metadata.provides` / `requires` 启动期校验                                                                         |
| **ConflictResolver**   | `createDefaultConflictResolver()` 默认策略（command / keymap / schema / capability）                                |
| **Adapters**           | `plugin-prosemirror`、`plugin-remark` 最小可用实现                                                                  |
| **内置底座**           | History、Selection、Clipboard                                                                                       |
| **Error Model**        | `CoreError`（启动失败）+ `PluginError`（沙盒 + 事务回滚）                                                           |
| **Shell**              | `@aether-md/react` + GateLock 单向数据闸门                                                                          |
| **Preset**             | `@aether-md/preset-gfm` 基础块级与行内语法（段落、标题、加粗、斜体、列表、链接）                                    |
| **EditorContext**      | `commands`、`events`、`logger`、`services.*`                                                                        |

## 暂不实现，仅保留契约

| 模块                        | 说明                                                                                           |
| --------------------------- | ---------------------------------------------------------------------------------------------- |
| **Worker Thread**           | Parser / Serializer / Search / Lint Worker 化，详见 [线程模型](../engineering/thread-model.md) |
| **Command Queue 优先级**    | P0–P3 完整队列与 Coalescing，详见 [并发策略](../engineering/concurrency.md)                    |
| **PermissionGuard 沙盒**    | 未授权 API 拦截；第三方插件安全模型完整落地，详见 [安全模型](../engineering/security.md)       |
| **Telemetry 后端**          | OpenTelemetry / Datadog 接入；生产采样，详见 [可观测性](../engineering/observability.md)       |
| **Vue Shell**               | `@aether-md/vue` 完整产品面（基础 morphing 已交付）                                            |
| **五级 Error Model 全覆盖** | `RenderError`、`SerializationError` 降级视图                                                   |
| **自定义 ConflictResolver** | 宿主注入（接口已定义，v1.0 仅保证默认实现可测）                                                |

## 产品交互 north star

架构原则中的 **Instant Morphing** / **Block Focus** 冻结于 [产品交互体验设计规范](product-experience-spec.md)。已交付能力包括：

| 能力                 | 范围                                                   |
| -------------------- | ------------------------------------------------------ |
| **块双态模型**       | 聚焦块 rendered → source morph；失焦 morph 回 rendered |
| **Block Focus**      | 全文档最多一个块处于源码编辑态                         |
| **GFM inline marks** | 源码态保真 `**bold**`、`*italic*` 等标记               |
| **多块切换**         | 多块文档中 Block Focus 切换不重置非聚焦块              |
| **块类型扩展**       | 列表、链接块插件化 morphing                            |

集成证明见 `examples/react` 与 `examples/vue` morphing 模式，以及 [Examples Matrix](../examples/matrix.md)。

## 发布门禁

首次 npm canary 发布须满足：

1. **架构集成**：`examples/react` content 模式可演示；CI 与维护者 sign-off
2. **产品交互**：Instant Morphing MVP 可演示；维护者 sign-off
3. **工程门禁**：ADR 009 G1–G12、consumer smoke、`pnpm check` 绿；Release CI / `NPM_TOKEN` 就绪

详见 [ADR 009](../adr/009-release-governance.md) 与 [发布流程](../community/release-process.md)。

---
