# 项目状态

AetherMD 当前是设计阶段的开源项目。

## 当前阶段

| 字段 | 值 |
| --- | --- |
| 阶段 | 设计草案 |
| 实现 | 尚未开始 |
| 主要产物 | 文档 |
| 当前目标 | 形成可进入最小实现的架构与 SDK 契约 |

## 已有内容

- 架构原则与边界
- 插件 SDK 契约草案
- 工程实现策略
- 已接受的 ADR
- 最小实现路线图与 CI 校验计划
- 传统设计文档映射
- MVP 实施计划、Core API、文档模型、Adapter 协议与测试策略草案

## 尚未开始

- Core 实现
- 已发布包
- Runtime Adapter
- Plugin SDK 包
- Demo 应用
- CI 流水线
- 发布流程

## 近期重点

1. 稳定文档体系。
2. 在代码出现前审查 SDK 契约。
3. 将路线图和 CI 校验计划转化为实现里程碑。
4. 决定仓库治理、许可证、包管理器和发布策略。
5. 审查 [MVP 实施计划](engineering/mvp-implementation-plan.md)、[Core API](architecture/core-api.md)、[文档模型](architecture/document-model.md)、[Adapter 协议](engineering/adapter-protocol.md) 和 [测试策略](engineering/test-strategy.md)。
6. 设计草案足够清晰后，再开始最小实现。

## 贡献建议

实现开始前，优先做能减少歧义的修改：

- 澄清契约语言
- 暴露隐藏假设
- 将宽泛路线图拆成可执行任务
- 为未决取舍新增 ADR
- 明确标出开放问题
