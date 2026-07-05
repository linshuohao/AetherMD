# 社区文档

AetherMD 正在准备成为可实现的开源项目。代码出现前，社区协作重点是让设计更清晰、更可审查、更容易落地。

## 页面

| 页面 | 作用 |
| --- | --- |
| [治理](governance.md) | 设计阶段的决策归属 |
| [审查指南](review-guide.md) | 如何审查架构、SDK 和工程文档 |
| [Git 工作流规范](git-workflow.md) | 分支、提交信息、PR 与合并规则 |
| [发布流程](release-process.md) | npm canary / `latest` 发布流程（ADR 009；M7 执行） |
| [AI-native Engineering Workflow](../../AI_NATIVE_ENGINEERING_WORKFLOW.md) | 顶层 AI 工程工作流原则 |

## 当前协作模型

- 改变架构约束的提案应写成 ADR。
- 影响插件作者的提案应先更新 SDK 文档。
- 工程提案应说明它满足的架构或 SDK 约束。
- 实现工作应等最小实现范围拆成里程碑后再开始。

## 待决事项

- 首次 npm 版本号与 canary dist-tag（[ADR 009](../adr/009-release-governance.md) 开放问题 O1、O2）
- 进入实现阶段后的具名维护者（角色定义见 [治理](governance.md)）

## 已拍板（ADR 009）

- 项目许可证：**MIT**（根目录 [LICENSE](../../LICENSE)）
- 包管理器与 monorepo 工具：pnpm workspace + Turborepo（[ADR 008](../adr/008-repo-toolchain-baseline.md)）
- 发布与版本流程：M6 预备、M7 Changesets canary + CI publish
- Plugin SDK：类型从 `@aether-md/core` 导出，无独立 `@aether-md/sdk` 包
