# 贡献指南

感谢你关注 AetherMD。

项目当前处于设计到最小实现过渡阶段，`@aether-md/core` 与两个 Adapter plugin packages 已提供 M1–M3 最小基线。因此，现阶段最有价值的贡献是文档审查、架构质疑、SDK 契约反馈、已实现边界验证、ADR 讨论和实现计划拆解。

## 现在适合贡献什么

- 审查 [docs/architecture](docs/architecture/README.md) 中的架构假设。
- 审查 [docs/sdk](docs/sdk/README.md) 中的插件公开契约。
- 审查 [docs/engineering](docs/engineering/README.md) 中的运行时和工程策略。
- 在 [docs/adr](docs/adr/README.md) 中提出或挑战架构决策。
- 改进 [docs/glossary.md](docs/glossary.md) 的术语一致性。
- 帮助把设计约束拆成后续可实现任务。

## 现在暂不适合什么

- 大规模实现 PR
- 没有 SDK 文档支撑的公开 API 新增
- 没有 ADR 或工程说明支撑的运行时行为变更
- 与当前非目标冲突的功能请求

## 贡献流程

1. 阅读 [项目状态](docs/project-status.md)。
2. 找到对应主题的文档归属。
3. 小型澄清可以直接修改相关页面。
4. 涉及架构取舍时，新增或更新 ADR。
5. 涉及 SDK 契约时，先更新 SDK 文档，再说明实现影响。
6. 涉及 public API、package 边界、插件契约、发布或版本影响时，遵守 [组件库治理规范](docs/engineering/component-library-governance.md)。
7. 遵守 [Git 工作流规范](docs/community/git-workflow.md)。
8. 每次修改尽量只处理一个主题。

## 审查期望

文档修改应满足：

- 能追溯到当前设计草案
- 明确说明它改变的是架构、SDK 契约还是工程策略
- 与核心词汇表保持一致
- 谨慎使用 MUST、SHOULD、MAY 等 RFC 关键词
- 提交信息和 PR 描述能说明变更范围、验证方式和追踪关系

## License

本仓库尚未选择项目许可证。在添加 License 文件前，不应假设生产使用或再分发条款。
