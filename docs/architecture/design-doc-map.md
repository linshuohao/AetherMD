# 设计文档映射

> 状态：设计草案 + M1–M5 最小实现已实现。本页作为传统软件设计文档与 AetherMD 文档体系的映射入口。

## 目的

AetherMD 不单独维护一套并行的《概要设计说明书》《详细设计说明书》。这些内容会拆入现有文档分区，避免同一约束在多个位置重复维护。

如果需要对外提交传统交付物，可以从本页列出的权威文档整理生成。

## 传统文档映射

| 传统文档       | AetherMD 权威位置                                                                                                                                                                                    | 维护内容                                                              |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| 需求规格说明   | [项目状态](../project-status.md)、[路线图](roadmap.md)                                                                                                                                               | 项目目标、非目标、MVP 范围、尚未开始事项                              |
| 概要设计       | [架构原则](principles.md)、[架构优化原则与设计模式](architecture-optimization-principles.md)、[架构总览](overview.md)、[产品交互体验规范](product-experience-spec.md)、[目录结构](package-layout.md) | 系统边界、模块关系、质量目标、包边界、产品 north star、桥接层设计护栏 |
| 详细设计       | [工程文档](../engineering/README.md)                                                                                                                                                                 | Core 实现策略、运行时流程、错误恢复、并发、安全                       |
| 接口设计       | [Core API](core-api.md)、[Plugin SDK](../sdk/README.md)、[Adapter 协议](../engineering/adapter-protocol.md)                                                                                          | 宿主 API、插件契约、适配器契约                                        |
| 数据结构设计   | [文档模型](document-model.md)、[Manifest](../sdk/manifest.md)                                                                                                                                        | AetherDoc、AetherSchema、插件 Manifest                                |
| 测试设计       | [测试策略](../engineering/test-strategy.md)、[CI 校验计划](ci-checklist.md)                                                                                                                          | 契约测试、回归测试、CI 门禁                                           |
| 运维与维护设计 | [兼容策略](compatibility.md)、[文档维护规则](../maintenance.md)                                                                                                                                      | 版本兼容、弃用策略、文档更新规则                                      |

## 维护规则

1. 架构分区维护长期边界，不承载具体实现细节。
2. 工程分区维护可实现、可测试的运行时策略。
3. SDK 分区维护插件作者可见的公开契约。
4. ADR 记录关键取舍，不替代长期文档。
5. 传统交付物如果需要生成，**SHOULD** 作为派生视图维护在 `docs/deliverables/`，不能成为新的权威来源。

---
