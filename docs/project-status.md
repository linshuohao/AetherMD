# 项目状态

AetherMD 当前是设计到最小实现过渡阶段的开源项目。

## 当前阶段

| 字段 | 值 |
| --- | --- |
| 阶段 | 设计草案 + M1 Core Bootstrap + M2 Command/Event Runtime + M3 Adapter 基座 + M4 GFM Preset + M4.5 Editor Orchestration + M5 React Shell |
| 实现 | `@aether-md/core` 已提供 M1 bootstrap、M2 Command/Event、M3 document/adapter 类型与 M4.5 `createEditor` / `AetherEditor` headless 编排；`@aether-md/plugin-remark` 与 `@aether-md/plugin-prosemirror` 提供 Adapter 实现；`@aether-md/preset-gfm` 提供 GFM preset 与 round-trip 集成测试；`@aether-md/react` 提供 M5 React Shell（Root / Content / hook、GateLock、happy-dom 集成测试） |
| 主要产物 | 文档、OpenSpec 规格、`packages/core`、两个 Adapter plugin packages、`packages/preset-gfm`、`packages/react` |
| 当前目标 | 进入 M6 验证套件；按 [ADR 009](adr/009-release-governance.md) 落实 LICENSE 与 publish 预备项 |

## 已有内容

- 架构原则与边界
- 插件 SDK 契约草案
- 工程实现策略
- 已接受的 ADR（含 [ADR 009：发布与治理策略](adr/009-release-governance.md)）
- 最小实现路线图与 CI 校验计划
- 传统设计文档映射
- MVP 实施计划、Core API、文档模型、Adapter 协议与测试策略草案
- pnpm workspace、Turborepo 支撑的根级 `pnpm build` / `pnpm typecheck` / `pnpm test` / `pnpm check` 入口、Changesets 版本影响记录底座、最小 CI 质量门禁与仓库级 Git 规范检查
- `@aether-md/core` M1 Core Bootstrap 基线：Manifest version/shape validation、duplicate `metadata.name` rejection（`PLUGIN_NAME_DUPLICATE`）、Service Capability validation、`metadata.dependsOn` lifecycle order、`onInit` / `onReady` startup、startup failure reverse cleanup、reverse `onDestroy` dispose、bootstrap `dispose()` 公开幂等契约
- `@aether-md/core` M2 Command/Event Runtime 基线：`createCommandEventRuntime`、同步 `register` / `dispatch`、`CommandResult`、Event Hub `on` / `emit` / unsubscribe、handler 抛错隔离为 `PluginError` 与 `pluginError` 事件、dispose fail-closed
- `@aether-md/core` M3 document-model / adapter-base 基线：`AetherDoc`、`AetherSchema`、三类 Adapter 协议类型、`AdapterError` / `SerializationError`；package-boundary 允许 M3 export；GFM preset 存在于 workspace 但 Core 不 re-export
- `@aether-md/core` M4.5 editor orchestration 基线：`createEditor(config): Promise<AetherEditor>`（async-only）、`AetherEditor` 宿主 API（`dispatch`、`on`、`getMarkdown`、`getDocument`、`dispose`）、显式 Adapter wiring、最小编排 rollback（`core:replaceText`）、`ready` / `change` / `transactionFailed` / `disposed` 事件；headless GFM integration tests（paragraph、strong、list）；**无** React Shell、**无** Core store API、**无** bootstrap silent provide
- `@aether-md/plugin-remark` M3 基线：最小 `ParserAdapter` / `SerializerAdapter`（paragraph、heading M3 子集）
- `@aether-md/plugin-prosemirror` M3 基线：最小 `EngineAdapter`（create/apply/getDocument/dispose）；跨包 round-trip integration tests
- `@aether-md/preset-gfm` M4 基线：`createGfmPreset()` 工厂、`metadata.name: gfm` Manifest；六语法 GFM round-trip integration tests（paragraph、heading、strong、emphasis、list、link）
- `@aether-md/plugin-remark` M4 扩展：GFM parse/serialize（`remark-gfm`）；`CustomBlock` 占位符 `[unsupported:block:<name>]`；不支持节点 `SerializationError` 拒绝
- `@aether-md/plugin-prosemirror` M4 扩展：GFM schema/conversion；edit leg 后保留 list、link、mark 结构；M5 扩展：`createProseMirrorView` view-bridge、`prosemirror-view` 依赖隔离在本 package
- `@aether-md/react` M5 基线：`AetherEditorRoot` / `AetherEditorContent` / `useAetherEditor` 公开 API；直接消费 `AetherEditor`（无 Shell Adapter）；Shell GateLock（`prevValue === nextValue` 跳过重设）；`plugin-prosemirror` view-bridge 挂载；happy-dom 集成测试与 GFM React smoke（paragraph、strong、list）；**无** `prosemirror-view` 直接依赖
- `openspec/specs/core-bootstrap/spec.md` 作为已同步的 Core Bootstrap main spec
- `openspec/specs/command-event-runtime/spec.md` 作为已同步的 Command/Event Runtime main spec
- `openspec/specs/document-model/spec.md` 作为已同步的 Document Model main spec
- `openspec/specs/adapter-base/spec.md` 作为已同步的 Adapter Base main spec
- `openspec/specs/gfm-preset/spec.md` 作为已同步的 GFM Preset main spec
- `openspec/specs/editor-orchestration/spec.md` 作为已同步的 Editor Orchestration main spec（含 M5 React Shell 桥接措辞）
- `openspec/specs/react-shell/spec.md` 作为已同步的 React Shell main spec
- `openspec/specs/engineering-workflow/spec.md` 作为已同步的工程工作流 main spec

## 尚未开始

- 已发布包（npm；预备项见 ADR 009 M6）
- npm publish、canary release、release token（**M7**，ADR 009）
- Vue Shell、`packages/vue`
- `examples/headless-gfm`、`examples/react-basic`（M6 / M6 末，ADR 009）
- examples matrix（M7 后）
- 发布流程 CI workflow（**M7**，ADR 009）
- `createEditor` / `AetherEditor` 完整 Guard 链与 Permission enforce
- Command Bus 完整 Pipeline（ReadOnlyGuard、CapabilityGuard 等）
- `bootstrapCore` Adapter plugin 加载与 `core:engine` / `core:parser` silent provide

## 已拍板、待工程落地（ADR 009）

- **许可证**：MIT（M6 启动前添加根目录 `LICENSE` 与 package 元数据）
- **Plugin SDK**：不独立 npm 包；类型入口为 `@aether-md/core`（非 `@aether-md/sdk`）
- **Canary**：M6 仅 publish 预备；M7 启用 Changesets prerelease + CI
- **Examples 形态**：headless-gfm（M6）+ react-basic（M6 末或 M7 初），不发布 npm

## 近期重点

1. 稳定文档体系并与 M5 实现对齐。
2. 持续审查 SDK 契约与已实现 Core / Adapter / GFM preset / editor orchestration / React Shell 边界（M1–M5）。
3. 将路线图和 CI 校验计划转化为 M6 验证套件里程碑。
4. 按 [ADR 009](adr/009-release-governance.md) 落实 MIT 许可证与 publish 预备（M6），规划 M7 首次 canary 发布。
5. 审查 [MVP 实施计划](engineering/mvp-implementation-plan.md)、[Core API](architecture/core-api.md)、[文档模型](architecture/document-model.md)、[Adapter 协议](engineering/adapter-protocol.md) 和 [测试策略](engineering/test-strategy.md)。
6. 在进入 M6 验证套件前，继续保持 OpenSpec、Docs 和实现同步。

## 贡献建议

当前阶段优先做能减少歧义并保护已实现边界的修改：

- 澄清契约语言
- 暴露隐藏假设
- 将宽泛路线图拆成可执行任务
- 为未决取舍新增 ADR
- 明确标出开放问题
