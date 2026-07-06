# AetherMD 文档

这里是 AetherMD 的公开文档入口。项目当前处于设计到最小实现过渡阶段，本文档体系用于明确架构边界、插件契约、工程策略和 M1–M6 最小实现基线（含 M4.5 Editor Orchestration、`@aether-md/react` React Shell 与 M6 验证套件）。

## 阅读路径

| 读者 | 先读 | 再读 |
| --- | --- | --- |
| 新贡献者 | [项目状态](project-status.md) | [架构原则](architecture/principles.md)、[ADR](adr/README.md) |
| 架构审查者 | [设计文档映射](architecture/design-doc-map.md)、[架构总览](architecture/overview.md) | [兼容策略](architecture/compatibility.md)、[路线图](architecture/roadmap.md) |
| 插件作者 | [SDK 概述](sdk/overview.md) | [Manifest](sdk/manifest.md)、[生命周期](sdk/lifecycle.md)、[Command/Event 协议](sdk/command-event-protocol.md)、[示例](sdk/examples.md) |
| Core 实现者 | [项目状态](project-status.md)、[**Demo Slice 交付计划**](engineering/demo-slice-delivery-program.md) | [MVP 实施计划](engineering/mvp-implementation-plan.md)、[Core API](architecture/core-api.md)、[文档模型](architecture/document-model.md)、[Adapter 协议](engineering/adapter-protocol.md)、[测试策略](engineering/test-strategy.md) |
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

- 阶段：设计草案 + M1 Core Bootstrap + M2 Command/Event Runtime + M3 Adapter 基座 + M4 GFM Preset + M4.5 Editor Orchestration + M5 React Shell + **M6 验证套件**
- 实现：`@aether-md/core` 已提供 M1 bootstrap、M2 Command/Event、M3 document/adapter 类型与 M4.5 headless `createEditor` / `AetherEditor`；`@aether-md/plugin-remark` 与 `@aether-md/plugin-prosemirror` 提供 Adapter 实现；`@aether-md/preset-gfm` 提供 GFM preset 与 round-trip 集成测试；`@aether-md/react` 提供 M5 React Shell；`examples/headless-gfm` 提供 M6 headless GFM 集成证明与 G11/G6 CI 门禁
- 主要产物：文档、OpenSpec 规格、`packages/core`、两个 Adapter plugin packages、`packages/preset-gfm`、`packages/react`、`examples/headless-gfm`
- 目标：M6 验证套件已闭合；**当前按 [Demo Slice 交付计划](engineering/demo-slice-delivery-program.md) 推进 PR0 → PR A → PR B**；M7 见 [ADR 009](adr/009-release-governance.md)

## 维护规则

1. [核心词汇表](glossary.md) 是共享术语来源。
2. 插件可见的类型、生命周期语义归 [Plugin SDK](sdk/README.md) 维护。
3. 运行时策略、性能规则、遥测和安全行为归 [工程文档](engineering/README.md) 维护。
4. 架构约束、范围、兼容策略、路线图和 CI 门禁归 [架构文档](architecture/README.md) 维护。
5. 重要取舍在成为项目约束前，应记录为 ADR。
