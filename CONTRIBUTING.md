# 贡献指南

感谢你关注 AetherMD。

项目当前处于设计到最小实现过渡阶段，`@aether-md/core`、两个 Adapter plugin packages、`@aether-md/preset-gfm`、`@aether-md/react` 与 `examples/headless-gfm` 已提供 M1–M6 最小基线。因此，现阶段最有价值的贡献是文档审查、架构质疑、SDK 契约反馈、已实现边界验证、ADR 讨论和实现计划拆解。

## 现在适合贡献什么

- 审查 [docs/architecture](docs/architecture/README.md) 中的架构假设。
- 审查 [docs/sdk](docs/sdk/README.md) 中的插件公开契约。
- 审查 [docs/engineering](docs/engineering/README.md) 中的运行时和工程策略。
- 在 [docs/adr](docs/adr/README.md) 中提出或挑战架构决策。
- 改进 [docs/glossary.md](docs/glossary.md) 的术语一致性。
- 帮助把设计约束拆成后续可实现任务。
- 运行或审查 `examples/headless-gfm` headless 集成路径（`pnpm build && pnpm --filter @aether-md/example-headless-gfm start`）以验证 M4.5/M6 边界。

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
7. 遵守 [Git 工作流规范](docs/community/git-workflow.md) 与 [AI-native 工程工作流](../AI_NATIVE_ENGINEERING_WORKFLOW.md) 的路径分类。
8. 每次修改尽量只处理一个主题。

### Workflow Path 选择（简表）

| 场景                                      | 路径         |
| ----------------------------------------- | ------------ |
| typo / 坏链 / 纯格式                      | Maintenance  |
| 小范围 docs 澄清、单点 fix                | Quick Change |
| 单 capability spec delta、1 task          | Spec Change  |
| 架构 / SDK / workflow semantics / 多 task | Full Change  |

Discover 阶段必须使用 `aether-workflow-discover-context`；不得跳过分类直接实现。

## 审查期望

文档修改应满足：

- 能追溯到当前设计草案
- 明确说明它改变的是架构、SDK 契约还是工程策略
- 与核心词汇表保持一致
- 谨慎使用 MUST、SHOULD、MAY 等 RFC 关键词
- 提交信息和 PR 描述能说明变更范围、验证方式和追踪关系

## License

项目采用 [MIT License](https://opensource.org/licenses/MIT)，见仓库根目录 [LICENSE](LICENSE) 与 [ADR 009](docs/adr/009-release-governance.md)。
