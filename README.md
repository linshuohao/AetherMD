# AetherMD

AetherMD 是一个处于设计阶段的开源 Markdown 编辑器架构项目。

项目目标是沉淀一个交互驱动、框架无关、高度插件化的现代富文本 Markdown 引擎。当前仓库尚未开始实现，主要产物是架构、插件契约、工程策略和开源协作说明。

## 当前状态

- 阶段：设计草案
- 实现状态：尚未开始
- 主要产物：文档
- 当前目标：形成可进入最小实现的架构与 SDK 契约

## 文档入口

从 [docs/README.md](docs/README.md) 开始阅读。

推荐路径：

- 初次了解项目：[架构原则](docs/architecture/principles.md)、[AI-native Engineering Workflow](AI_NATIVE_ENGINEERING_WORKFLOW.md) 与 [架构总览](docs/architecture/overview.md)
- 插件作者：[SDK 概述](docs/sdk/overview.md)、[Manifest](docs/sdk/manifest.md)、[能力与权限](docs/sdk/capabilities-and-permissions.md)
- Core 维护者：[数据流](docs/engineering/data-flow.md)、[错误模型](docs/engineering/error-model.md)、[并发策略](docs/engineering/concurrency.md)
- 贡献者：[贡献指南](CONTRIBUTING.md) 与 [文档维护规则](docs/maintenance.md)

## 文档体系

- [架构文档](docs/architecture/README.md)：长期原则、系统边界、兼容策略、路线图、CI 校验计划
- [Plugin SDK](docs/sdk/README.md)：插件公开契约与示例
- [工程文档](docs/engineering/README.md)：实现策略、运行时行为、安全、可观测性
- [ADR](docs/adr/README.md)：架构决策记录
- [社区文档](docs/community/README.md)：开源协作模型
- [AI-native Engineering Workflow](AI_NATIVE_ENGINEERING_WORKFLOW.md)：顶层 AI 工程工作流原则

## 贡献

项目还不适合接收大规模代码贡献。当前最有价值的贡献是设计审查、契约审查、术语整理、ADR 讨论和实现计划拆解。

详见 [CONTRIBUTING.md](CONTRIBUTING.md)。
