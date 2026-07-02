# 架构文档

架构文档说明 AetherMD 为什么这样设计、系统边界在哪里，以及未来实现必须保留哪些约束。

## 页面

| 页面 | 作用 |
| --- | --- |
| [设计文档映射](design-doc-map.md) | 传统概要设计、详细设计等交付物与本仓库文档体系的映射 |
| [文档约定](conventions.md) | RFC 关键词与文档规则 |
| [架构原则与边界](principles.md) | 愿景、架构宪章、范围、非目标、质量目标 |
| [架构总览](overview.md) | 系统总览、确定性数据流、适配器容器模型 |
| [Core API](core-api.md) | 宿主应用调用 `@aether-md/core` 的最小公开入口 |
| [文档模型](document-model.md) | AetherDoc / AetherSchema 的框架无关数据边界 |
| [兼容策略](compatibility.md) | 版本与兼容策略 |
| [目录结构](package-layout.md) | 计划中的 monorepo 包结构 |
| [路线图](roadmap.md) | 最小实现范围与暂不实现但需预留的契约 |
| [CI 校验计划](ci-checklist.md) | 进入最小实现前的校验计划 |

## 权威边界

架构文档负责维护：

- 项目愿景与非目标
- 架构原则
- 系统边界
- 宿主级 Core API 边界
- 框架无关文档模型
- 兼容策略
- 路线图范围
- 架构级 CI 门禁

插件公开契约归 [Plugin SDK](../sdk/README.md) 维护。实现策略和运行时策略归 [工程文档](../engineering/README.md) 维护。
