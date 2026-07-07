# 治理

AetherMD 治理模型刻意保持轻量。

## 决策类型

| 决策               | 需要的文档     |
| ------------------ | -------------- |
| 架构原则或原则反转 | ADR            |
| 公开 SDK 契约      | SDK 文档更新   |
| 运行时实现策略     | 工程文档更新   |
| 路线图范围         | 架构路线图更新 |
| 贡献流程           | 社区文档更新   |

## 维护者职责

维护者应：

- 保持文档归属边界清晰
- 在取舍变成长期约束时要求 ADR
- 防止 SDK 契约在多个文档间漂移
- 确保文档诚实标注“尚未实现”
- 在契约稳定前避免接受大规模实现工作

## 贡献者职责

贡献者应：

- 找到提案所属的文档分区
- 保持修改范围聚焦
- 说明提案改变的是架构、SDK 契约还是工程策略
- 尽量使用既有术语
- 决策尚未成熟时明确列出开放问题

## 决策状态

已接受的 ADR 是最强项目约束。ADR 可以被替代，但反转必须显式且可追溯。

发布、许可证、SDK 包边界与 examples 范围以 [ADR 009](../adr/009-release-governance.md) 为准。

## 治理角色（占位）

以下角色可指派具名维护者；Review 时应明确判断归属：

| 角色               | 负责内容                                                      |
| ------------------ | ------------------------------------------------------------- |
| Release owner      | Changeset、SemVer、canary / `latest` 通道、CI 发布（ADR 009） |
| SDK contract owner | Manifest、Capability、Permission、Lifecycle、Command/Event    |
| Core maintainer    | Core 边界、package `exports` surface                          |

详见 [组件库治理规范 §13](../engineering/component-library-governance.md)。
