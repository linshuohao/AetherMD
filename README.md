# AetherMD

AetherMD 是一个处于设计到最小实现过渡阶段的开源 Markdown 编辑器架构项目。

项目目标是沉淀一个交互驱动、框架无关、高度插件化的现代富文本 Markdown 引擎。当前仓库已引入 `@aether-md/core` 的 M1–M4.5 最小基线、`@aether-md/plugin-remark` 与 `@aether-md/plugin-prosemirror` 两个 Adapter plugin packages、`@aether-md/preset-gfm` GFM preset，以及 `@aether-md/react` M5 React Shell；主要产物仍是架构、插件契约、工程策略、OpenSpec 规格和最小 Core / Adapter / Preset / React 实现。

## 当前状态

- 阶段：设计草案 + M1 Core Bootstrap + M2 Command/Event Runtime + M3 Adapter 基座 + M4 GFM Preset + M4.5 Editor Orchestration + M5 React Shell
- 实现状态：`@aether-md/core` 已提供 M1 bootstrap、M2 Command/Event、M3 document/adapter 类型与 M4.5 headless `createEditor` / `AetherEditor`；两个 Adapter plugin packages、`@aether-md/preset-gfm` 与 `@aether-md/react` 提供 GFM round-trip 与 React Shell 挂载
- 主要产物：文档、OpenSpec 规格、`packages/core`、两个 Adapter plugin packages、`packages/preset-gfm`、`packages/react`
- 当前目标：进入 M6 验证套件；按 [ADR 009](docs/adr/009-release-governance.md) 落实 LICENSE 与 publish 预备项

## 文档入口

从 [docs/README.md](docs/README.md) 开始阅读。

推荐路径：

- 初次了解项目：[架构原则](docs/architecture/principles.md)、[AI-native Engineering Workflow](AI_NATIVE_ENGINEERING_WORKFLOW.md) 与 [架构总览](docs/architecture/overview.md)
- 插件作者：[SDK 概述](docs/sdk/overview.md)、[Manifest](docs/sdk/manifest.md)、[能力与权限](docs/sdk/capabilities-and-permissions.md)
- Core 维护者：[数据流](docs/engineering/data-flow.md)、[错误模型](docs/engineering/error-model.md)、[并发策略](docs/engineering/concurrency.md)
- 贡献者：[贡献指南](CONTRIBUTING.md)、[文档维护规则](docs/maintenance.md) 与 [组件库治理规范](docs/engineering/component-library-governance.md)

## 文档体系

- [架构文档](docs/architecture/README.md)：长期原则、系统边界、兼容策略、路线图、CI 校验计划
- [Plugin SDK](docs/sdk/README.md)：插件公开契约与示例
- [工程文档](docs/engineering/README.md)：实现策略、运行时行为、安全、可观测性
- [ADR](docs/adr/README.md)：架构决策记录
- [社区文档](docs/community/README.md)：开源协作模型
- [AI-native Engineering Workflow](AI_NATIVE_ENGINEERING_WORKFLOW.md)：顶层 AI 工程工作流原则

## 贡献

项目还不适合接收大规模代码贡献。当前最有价值的贡献是设计审查、契约审查、已实现里程碑（M1–M5）边界验证、术语整理、ADR 讨论和实现计划拆解。

详见 [CONTRIBUTING.md](CONTRIBUTING.md)。

## License

[MIT](LICENSE)
