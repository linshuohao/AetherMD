# 核心词汇表

三套文档 **MUST** 使用本页术语作为共同语言。

## 核心词汇表

| 术语                                 | 类型           | 插件声明                                  | 宿主配置                                   | 运行时                   |
| ------------------------------------ | -------------- | ----------------------------------------- | ------------------------------------------ | ------------------------ |
| **Service Capability**（服务能力）   | `CapabilityId` | `metadata.provides` / `metadata.requires` | —                                          | 启动期 `validate` 解析   |
| **Runtime Permission**（运行时权限） | `PermissionId` | `security.requests`                       | `EditorConfig.security.grantedPermissions` | `ctx.grantedPermissions` |

**生效规则：** `ctx.grantedPermissions` = `security.requests` ∩ `EditorConfig.security.grantedPermissions`（未声明的权限默认拒绝）。

其他名词：

- **内核 (Core / AetherCore)**：中央调度器，管理生命周期、合并清单与路由命令。
- **Core Bootstrap**：`@aether-md/core` 的启动子集，负责 Manifest 加载、Service Capability 校验、插件依赖排序和生命周期启动/销毁。
- **清单 (Manifest / ExtensionManifest)**：插件声明式描述符，四层：`metadata` / `compile` / `runtime` / `security`（详见 [Manifest 分层契约](sdk/manifest.md)）。
- **适配器 (Adapter)**：对 ProseMirror、Remark 等重型依赖的容器化封装层。
- **预设 (Preset)**：官方语法/能力组合包（如 `@aether-md/preset-gfm`），通过 Manifest 与工厂入口声明 preset 身份，并 wiring 对应 Adapter 实现；Core **MUST NOT** re-export preset 工厂。
- **文档快照 (AetherDoc)**：Core、SDK 与 Adapter 之间共享的框架无关文档树。
- **模式声明 (AetherSchema)**：Parser/Serializer Adapter 签名使用的 schema 占位；最小形状 `{ version: 1 }`；compile-layer merge 属完整编辑器能力。
- **契约数据 (AetherDoc / AetherSchema)**：框架无关的中间态数据结构。
- **Instant Morphing（即时形态转换）**：块在渲染态与 Markdown 源码态之间即时切换的产品体验；详见 [产品交互体验设计规范](architecture/product-experience-spec.md)。
- **Block Focus（块级独立）**：任意时刻最多一个块处于源码编辑态；详见 [产品交互体验设计规范](architecture/product-experience-spec.md)。
- **Rendered state（渲染态）** / **Source state（源码态）**：块双态模型的两种呈现；详见 [产品交互体验设计规范](architecture/product-experience-spec.md)。
- **集成壳 (integration shell)**：常驻 ProseMirror 视图 + preview 的集成证明实现，**不是**产品 north star 终态。

---
