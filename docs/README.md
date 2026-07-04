# AetherMD 文档

这里是 AetherMD 的公开文档入口。项目当前处于设计到最小实现过渡阶段，本文档体系用于明确架构边界、插件契约、工程策略和 M1 Core Bootstrap 的实现基线。

## 阅读路径

| 读者 | 先读 | 再读 |
| --- | --- | --- |
| 新贡献者 | [项目状态](project-status.md) | [架构原则](architecture/principles.md)、[ADR](adr/README.md) |
| 架构审查者 | [设计文档映射](architecture/design-doc-map.md)、[架构总览](architecture/overview.md) | [兼容策略](architecture/compatibility.md)、[路线图](architecture/roadmap.md) |
| 插件作者 | [SDK 概述](sdk/overview.md) | [Manifest](sdk/manifest.md)、[生命周期](sdk/lifecycle.md)、[Command/Event 协议](sdk/command-event-protocol.md)、[示例](sdk/examples.md) |
| Core 实现者 | [MVP 实施计划](engineering/mvp-implementation-plan.md) | [Core API](architecture/core-api.md)、[文档模型](architecture/document-model.md)、[Adapter 协议](engineering/adapter-protocol.md)、[测试策略](engineering/test-strategy.md) |
| 维护者 | [文档维护规则](maintenance.md) | [组件库治理规范](engineering/component-library-governance.md)、[AI-native Engineering Workflow](../AI_NATIVE_ENGINEERING_WORKFLOW.md)、[ADR 模板](templates/adr.md)、[CI 校验计划](architecture/ci-checklist.md) |

## 文档分区

| 分区 | 作用 | 更新节奏 |
| --- | --- | --- |
| [架构文档](architecture/README.md) | 长期原则、边界、质量目标、路线图 | 慢 |
| [Plugin SDK](sdk/README.md) | 插件公开契约与示例 | 中 |
| [工程文档](engineering/README.md) | 运行时实现策略与工程约束 | 快 |
| [ADR](adr/README.md) | 已接受或正在讨论的架构决策 | 按决策 |
| [社区文档](community/README.md) | 开源协作模型 | 按需 |

## 当前状态

- 阶段：设计草案 + M1 Core Bootstrap
- 实现：`@aether-md/core` 最小 bootstrap 基线已开始
- 目标：保持最小实现、OpenSpec 规格和长期 Docs 一致

## 维护规则

1. [核心词汇表](glossary.md) 是共享术语来源。
2. 插件可见的类型、生命周期语义归 [Plugin SDK](sdk/README.md) 维护。
3. 运行时策略、性能规则、遥测和安全行为归 [工程文档](engineering/README.md) 维护。
4. 架构约束、范围、兼容策略、路线图和 CI 门禁归 [架构文档](architecture/README.md) 维护。
5. 重要取舍在成为项目约束前，应记录为 ADR。
