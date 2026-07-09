# AetherMD

AetherMD 是一个开源 Markdown 编辑器架构项目，兼具设计规范与可运行实现。

项目目标是沉淀一个交互驱动、框架无关、高度插件化的现代富文本 Markdown 引擎。当前仓库已具备微内核 `@aether-md/core`（插件启动、命令/事件总线、文档模型、编辑器编排）、`@aether-md/plugin-remark` 与 `@aether-md/plugin-prosemirror` 两个 Adapter 插件包、`@aether-md/preset-gfm` GFM preset、`@aether-md/react` 与 `@aether-md/vue` Shell，以及集成演示 `examples/headless-gfm`（Node headless）、`examples/react`（React Shell）与 `examples/vue`（Vue Shell）；主要产物仍是架构、插件契约、工程策略、OpenSpec 规格和 Core / Adapter / Preset / Shell 实现。

## 当前状态

- 能力：`@aether-md/core` 提供插件 bootstrap、Command/Event 运行时、document/adapter 契约与 headless `createEditor` / `AetherEditor`；Adapter 插件、preset 与 Shell 包提供 GFM round-trip、Instant Morphing / Block Focus 与框架挂载；验证套件覆盖 headless 集成、示例 typecheck、契约测试与 publish 预备元数据
- 主要产物：文档、OpenSpec 规格、`packages/core`、两个 Adapter plugin packages、`packages/preset-gfm`、`packages/react`、`packages/vue`、`examples/headless-gfm`、`examples/react`、`examples/vue`
- 当前目标：**v1.0 完整发布**（`complete-v1-before-release` Wave 10）— examples matrix、E2E blocking CI、consumer smoke 扩展、`1.0.0` Changeset；待维护者 sign-off + `NPM_TOKEN` 后首次 publish（见 [ADR 009](docs/adr/009-release-governance.md)）

## 安装（v1.0.0，待 publish 后可用）

```bash
npm install @aether-md/core@latest @aether-md/react@latest @aether-md/vue@latest @aether-md/preset-gfm@latest \
  @aether-md/plugin-remark@latest @aether-md/plugin-prosemirror@latest
```

六包为 Changesets `linked` 组，版本同步。首次公开发布目标版本 **`1.0.0`** + dist-tag **`latest`**。

## 工作区示例

三个示例均为 workspace private package，**不发布 npm**。在仓库根目录执行 `pnpm install` 与 `pnpm build` 后：

| 示例                    | 说明                                                            | 本地运行                                                                                                     |
| ----------------------- | --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `examples/headless-gfm` | Node headless 壳（`createEditor` + GFM 插件）                   | `pnpm --filter @aether-md/example-headless-gfm build && pnpm --filter @aether-md/example-headless-gfm start` |
| `examples/react`        | React Shell — `AetherShellShowcase`（Content 模式 + Instant Morphing 模式） | `pnpm --filter @aether-md/example-react dev`                                                                 |
| `examples/vue`          | Vue Shell — `AetherShellShowcase`（Content 模式 + Instant Morphing 模式）   | `pnpm --filter @aether-md/example-vue dev`                                                                   |

三个示例的 `typecheck`（`tsc --noEmit`）均纳入根 `pnpm check`（G6）。详见 [Examples Matrix](docs/examples/matrix.md) 与各示例目录下的 `README.md`。

## 浏览器 E2E（Playwright）

仓库根目录在 `pnpm install` 与 `pnpm build` 后：

```bash
pnpm e2e:install   # 首次运行或 CI
pnpm e2e:test
```

Playwright 分 `react` 与 `vue` 两个 project：`examples/react`（24 tests — 21 morphing + 3 basic）通过 `AetherShellShowcase` 切换 `AetherEditorContent`（全文档 Content 编辑）与 `AetherMorphingDocument`（Instant Morphing），验证 smoke、Block Focus、GateLock、焦点/失焦场景、GFM inline marks、编辑隔离、click/Tab 焦点、逐键打字、序列化探针、`moveBlock` 身份、编辑器稳定性；`examples/vue`（持续扩展）覆盖 morphing smoke、content/morphing 双模式切换与多块 Block Focus。CI 以 **blocking** job `Playwright E2E` 运行。详见 [测试策略](docs/engineering/test-strategy.md) 与 [Examples Matrix](docs/examples/matrix.md)。

## 文档入口

从 [docs/README.md](docs/README.md) 开始阅读。

本地文档站点（[VitePress](https://vitepress.dev/)）：

```bash
pnpm docs:dev      # 开发服务器 http://localhost:5173
pnpm docs:build    # 构建静态站点到 docs/.vitepress/dist
pnpm docs:preview  # 预览构建产物
```

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

项目还不适合接收大规模代码贡献。当前最有价值的贡献是设计审查、契约审查、包边界与 public API 验证、术语整理、ADR 讨论和实现计划拆解。

详见 [CONTRIBUTING.md](CONTRIBUTING.md)。

## License

[MIT](LICENSE)
