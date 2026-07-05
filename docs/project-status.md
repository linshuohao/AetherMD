# 项目状态

AetherMD 当前是设计到最小实现过渡阶段的开源项目。

## 当前阶段

| 字段 | 值 |
| --- | --- |
| 阶段 | 设计草案 + M1 Core Bootstrap + M2 Command/Event Runtime + M3 Adapter 基座 |
| 实现 | `@aether-md/core` 已提供 M1 bootstrap、M2 Command/Event 与 M3 document/adapter 类型；`@aether-md/plugin-remark` 与 `@aether-md/plugin-prosemirror` 提供最小 Adapter 实现 |
| 主要产物 | 文档、OpenSpec 规格、`packages/core` 与两个 Adapter plugin packages |
| 当前目标 | 保持已实现里程碑与长期架构和 SDK 契约同步，再进入后续里程碑 |

## 已有内容

- 架构原则与边界
- 插件 SDK 契约草案
- 工程实现策略
- 已接受的 ADR
- 最小实现路线图与 CI 校验计划
- 传统设计文档映射
- MVP 实施计划、Core API、文档模型、Adapter 协议与测试策略草案
- pnpm workspace、Turborepo 支撑的根级 `pnpm build` / `pnpm typecheck` / `pnpm test` / `pnpm check` 入口、Changesets 版本影响记录底座、最小 CI 质量门禁与仓库级 Git 规范检查
- `@aether-md/core` M1 Core Bootstrap 基线：Manifest version/shape validation、Service Capability validation、`metadata.dependsOn` lifecycle order、`onInit` / `onReady` startup、reverse `onDestroy` dispose
- `@aether-md/core` M2 Command/Event Runtime 基线：`createCommandEventRuntime`、同步 `register` / `dispatch`、`CommandResult`、Event Hub `on` / `emit` / unsubscribe、handler 抛错隔离为 `PluginError` 与 `pluginError` 事件、dispose fail-closed
- `@aether-md/core` M3 document-model / adapter-base 基线：`AetherDoc`、`AetherSchema`、三类 Adapter 协议类型、`AdapterError` / `SerializationError`；package-boundary 允许 M3 export，继续禁止 editor/Shell/GFM
- `@aether-md/plugin-remark` M3 基线：最小 `ParserAdapter` / `SerializerAdapter`（paragraph、heading M3 子集）
- `@aether-md/plugin-prosemirror` M3 基线：最小 `EngineAdapter`（create/apply/getDocument/dispose）；跨包 round-trip integration tests
- `openspec/specs/core-bootstrap/spec.md` 作为已同步的 Core Bootstrap main spec
- `openspec/specs/command-event-runtime/spec.md` 作为已同步的 Command/Event Runtime main spec
- `openspec/specs/document-model/spec.md` 作为已同步的 Document Model main spec
- `openspec/specs/adapter-base/spec.md` 作为已同步的 Adapter Base main spec
- `openspec/specs/engineering-workflow/spec.md` 作为已同步的工程工作流 main spec

## 尚未开始

- 已发布包
- npm publish、canary release、release token
- Plugin SDK 包（独立 npm 包）
- React / Vue Shell、`packages/preset-gfm`
- Demo 应用
- examples matrix
- 发布流程
- `createEditor` / `AetherEditor` 完整编辑器入口
- GFM 全覆盖 round-trip（加粗、斜体、列表、链接等 M4 语法矩阵）
- Command Bus 与 Adapter 深度集成（自动 rollback / `transactionFailed`）
- `bootstrapCore` Adapter plugin 加载与 `core:engine` / `core:parser` silent provide

## 近期重点

1. 稳定文档体系并与 M3 实现对齐。
2. 持续审查 SDK 契约与已实现 Core / Adapter 边界（M1 bootstrap、M2 Command/Event、M3 adapter-base）。
3. 将路线图和 CI 校验计划转化为 M4 GFM preset 与 M5 Shell 里程碑。
4. 决定仓库治理、许可证和发布策略。
5. 审查 [MVP 实施计划](engineering/mvp-implementation-plan.md)、[Core API](architecture/core-api.md)、[文档模型](architecture/document-model.md)、[Adapter 协议](engineering/adapter-protocol.md) 和 [测试策略](engineering/test-strategy.md)。
6. 在进入 GFM preset 或 Shell 里程碑前，继续保持 OpenSpec、Docs 和实现同步。

## 贡献建议

当前阶段优先做能减少歧义并保护已实现边界的修改：

- 澄清契约语言
- 暴露隐藏假设
- 将宽泛路线图拆成可执行任务
- 为未决取舍新增 ADR
- 明确标出开放问题
