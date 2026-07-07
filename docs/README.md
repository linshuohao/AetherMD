# AetherMD 文档

AetherMD 的公开文档体系，定义架构边界、插件契约、工程策略与 v1.0 能力范围。

## 阅读路径

| 读者        | 先读                                                                                  | 再读                                                                                                                                                                                                                                     |
| ----------- | ------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 新贡献者    | [能力概览](project-status.md)                                                         | [架构原则](architecture/principles.md)、[产品交互体验规范](architecture/product-experience-spec.md)、[ADR](adr/README.md)                                                                                                                |
| 架构审查者  | [设计文档映射](architecture/design-doc-map.md)、[架构总览](architecture/overview.md)  | [产品交互体验规范](architecture/product-experience-spec.md)、[兼容策略](architecture/compatibility.md)、[v1.0 能力范围](architecture/roadmap.md)                                                                                                |
| 插件作者    | [SDK 概述](sdk/overview.md)                                                           | [Manifest](sdk/manifest.md)、[生命周期](sdk/lifecycle.md)、[Command/Event 协议](sdk/command-event-protocol.md)、[示例](sdk/examples.md)                                                                                                  |
| Core 实现者 | [能力概览](project-status.md)、[实施范围](engineering/mvp-implementation-plan.md) | [产品交互体验规范](architecture/product-experience-spec.md)、[Core API](architecture/core-api.md)、[文档模型](architecture/document-model.md)、[Adapter 协议](engineering/adapter-protocol.md)、[测试策略](engineering/test-strategy.md) |
| 维护者      | [文档维护规则](maintenance.md)                                                        | [组件库治理规范](engineering/component-library-governance.md)、[AI-native Engineering Workflow](../AI_NATIVE_ENGINEERING_WORKFLOW.md)、[ADR 模板](templates/adr.md)、[CI 校验计划](architecture/ci-checklist.md)                         |

## 文档分区

| 分区                               | 作用                             | 更新节奏 |
| ---------------------------------- | -------------------------------- | -------- |
| [架构文档](architecture/README.md) | 长期原则、边界、质量目标、能力范围 | 慢       |
| [Plugin SDK](sdk/README.md)        | 插件公开契约与示例               | 中       |
| [工程文档](engineering/README.md)  | 运行时实现策略与工程约束         | 快       |
| [ADR](adr/README.md)               | 已接受或正在讨论的架构决策       | 按决策   |
| [社区文档](community/README.md)    | 开源协作模型                     | 按需     |

## 能力概览

- **微内核**：`@aether-md/core` — Manifest 校验、生命周期、Command/Event 运行时、headless `createEditor` / `AetherEditor` 编排
- **适配器**：`@aether-md/plugin-remark`、`@aether-md/plugin-prosemirror` — Parser / Serializer / Engine 隔离层
- **预设**：`@aether-md/preset-gfm` — GFM 六语法 round-trip
- **外壳**：`@aether-md/react`、`@aether-md/vue` — 框架集成与 Instant Morphing 产品面
- **验证**：`examples/headless-gfm`、`examples/react`、`examples/vue` — 集成证明与 CI 门禁
- **目标**：v1.0 最小可运行编辑器；完整能力范围见 [v1.0 能力范围](architecture/roadmap.md)

## 维护规则

1. [核心词汇表](glossary.md) 是共享术语来源。
2. 插件可见的类型、生命周期语义归 [Plugin SDK](sdk/README.md) 维护。
3. 运行时策略、性能规则、遥测和安全行为归 [工程文档](engineering/README.md) 维护。
4. 架构约束、范围、兼容策略、能力范围与 CI 门禁归 [架构文档](architecture/README.md) 维护。
5. 重要取舍在成为项目约束前，应记录为 ADR。
