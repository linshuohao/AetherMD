# v1.0 路线图

> 状态：设计草案 + M1–M6 里程碑已实现（M4 GFM preset 六语法 round-trip、M4.5 headless `createEditor`、M5 `@aether-md/react` React Shell 基线、M6 验证套件与 publish 预备）。本页作为对应主题的维护入口。

## v1.0 实现差距（M6 快照）

以下短表汇总 v1.0「必须实现」与当前基线的差距；**完整差距列表与 M6 闭合项**见 [项目状态 — v1.0 差距](../project-status.md#v10-差距)。

| 模块 | 路线图要求 | M6 状态 |
| --- | --- | --- |
| **Core / compile-layer** | 分层 Manifest 合并 | `metadata` 校验已有；**compile-layer schema merge deferred** |
| **ConflictResolver** | `createDefaultConflictResolver()` 默认策略 | 单元可测（schema abort）；**完整编排集成 deferred** |
| **内置底座** | History、Selection、Clipboard | **未实现** |
| **PermissionGuard** | 未授权 API 拦截 | **未实现**（见「暂不实现」表） |
| **Worker Thread** | Parser / Serializer Worker 化 | **未实现**（见「暂不实现」表） |
| **Shell / Preset / Adapters** | React Shell + GFM + 最小 Adapters | **M4–M5 已实现** |
| **npm publish** | 公开发布 | M6 **预备完成**；**M7 前不 publish** |

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
| **Shell** | `@aether-md/react` + GateLock 单向数据闸门 — **M5 基线已实现** |
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

### 后续里程碑（实现计划）

| 里程碑 | 范围 | 决策依据 |
| --- | --- | --- |
| M6 验证套件 | 契约测试、`examples/headless-gfm`、G11/G6 CI 门禁、启动中止回归、publish 预备、G12 差距文档 | [MVP 实施计划](../engineering/mvp-implementation-plan.md)、[项目状态](../project-status.md) — **已实现** |
| M7 首次发布与生态 | MIT/LICENSE 元数据同步、npm canary、Release CI、`examples/react-basic` | [ADR 009](../adr/009-release-governance.md) — **未开始**；前置条件见 [Demo Slice 交付计划](../engineering/demo-slice-delivery-program.md) |

## M6 之后：纵向 Demo Slice

M1–M6 按架构层的里程碑叙事仍保留于上表。**当前排期**以用户可感知的纵向切片为主，执行计划见 [Demo Slice 交付计划](../engineering/demo-slice-delivery-program.md)（PR0 → PR A → PR B）。PR B 将把 Slice 叙事正式同步回本页与 [项目状态](../project-status.md)。

---
