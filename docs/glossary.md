# 核心词汇表

> 状态：设计草案 + M1 Core Bootstrap。本页作为对应主题的维护入口。

三套文档必须使用本页术语作为共同语言。

## 核心词汇表

三套文档 **MUST** 使用以下统一术语（英文为主键，中文为对照）：

| 术语 | 类型 | 插件声明 | 宿主配置 | 运行时 |
| --- | --- | --- | --- | --- |
| **Service Capability**（服务能力） | `CapabilityId` | `metadata.provides` / `metadata.requires` | — | 启动期 `validate` 解析 |
| **Runtime Permission**（运行时权限） | `PermissionId` | `security.requests` | `EditorConfig.security.grantedPermissions` | `ctx.grantedPermissions` |

**生效规则：** `ctx.grantedPermissions` = `security.requests` ∩ `EditorConfig.security.grantedPermissions`（未声明的权限默认拒绝）。

其他名词：

* **内核 (Core / AetherCore)**：中央调度器，管理生命周期、合并清单与路由命令。
* **Core Bootstrap**：`@aether-md/core` 的启动子集，负责 Manifest 加载、Service Capability 校验、插件依赖排序和生命周期启动/销毁。
* **清单 (Manifest / ExtensionManifest)**：插件声明式描述符，四层：`metadata` / `compile` / `runtime` / `security`（详见 [Manifest 分层契约](sdk/manifest.md)）。
* **适配器 (Adapter)**：对 ProseMirror、Remark 等重型依赖的容器化封装层。
* **文档快照 (AetherDoc)**：Core、SDK 与 Adapter 之间共享的框架无关文档树。
* **模式声明 (AetherSchema)**：Parser/Serializer Adapter 签名使用的 schema 占位；M3 最小形状 `{ version: 1 }`，compile-layer merge 仍属 M4+。
* **契约数据 (AetherDoc / AetherSchema)**：框架无关的中间态数据结构。

---
