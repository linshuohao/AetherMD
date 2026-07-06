# 项目状态

AetherMD 当前是设计到最小实现过渡阶段的开源项目。

## 当前阶段

| 字段 | 值 |
| --- | --- |
| 阶段 | 设计草案 + M1 Core Bootstrap + M2 Command/Event Runtime + M3 Adapter 基座 + M4 GFM Preset + M4.5 Editor Orchestration + M5 React Shell + **M6 验证套件** |
| 实现 | `@aether-md/core` 已提供 M1 bootstrap、M2 Command/Event、M3 document/adapter 类型与 M4.5 `createEditor` / `AetherEditor` headless 编排；`@aether-md/plugin-remark` 与 `@aether-md/plugin-prosemirror` 提供 Adapter 实现；`@aether-md/preset-gfm` 提供 GFM preset 与 round-trip 集成测试；`@aether-md/react` 提供 M5 React Shell（Root / Content / hook、GateLock、happy-dom 集成测试）；**M6** 交付 `examples/headless-gfm` headless GFM 集成证明、G11 manifest 文档一致性、G6 example `typecheck` 门禁、`createEditor` 启动中止行为回归、五包 publish 预备元数据与 Changesets `linked` 配置 |
| 主要产物 | 文档、OpenSpec 规格、`packages/core`、两个 Adapter plugin packages、`packages/preset-gfm`、`packages/react`、`examples/headless-gfm`、`examples/react-basic` |
| 当前目标 | **产品体验纠偏**（`align-instant-morphing-north-star`）：冻结 [产品交互体验规范](architecture/product-experience-spec.md)；L2 Block Morphing 实现待 `block-morphing-slice-1`；M7 发布条件见 [ADR 009](adr/009-release-governance.md) |

## North star 分层

| 层级 | 载体 | 状态 | 证明 |
| --- | --- | --- | --- |
| **L1 架构管线 demo** | `examples/react-basic` | ✅ Demo Slice 已闭合 | React Shell + GFM + GateLock + 连续编辑 + preview 同步 |
| **L2 产品交互 north star** | 未来 morphing demo（名待定） | ⏳ 规格已冻结，实现未开始 | Instant Morphing + Block Focus（见 [产品交互体验规范](architecture/product-experience-spec.md)） |

L1 通过 **不得** 解释为 L2 已满足。

## 已有内容

- 架构原则与边界（含 [产品交互体验设计规范](architecture/product-experience-spec.md)）
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
- `openspec/specs/validation-suite/spec.md` 作为已同步的 M6 验证套件 main spec
- **M6 验证套件基线**：`examples/headless-gfm`（`@aether-md/example-headless-gfm`，`private: true`）Node 可运行 headless GFM 集成演示（`createEditor` + `createGfmPreset()` + 显式 adapter wiring）；`examples/react-basic`（`@aether-md/example-react-basic`，`private: true`）Vite + React 最小 demo（`AetherEditorRoot` / `AetherEditorContent` / `useAetherEditor`、GFM wiring、GateLock 受控演示）；G11 `manifest-doc-consistency.test.ts`（`SUPPORTED_MANIFEST_VERSIONS` ↔ `docs/sdk/manifest.md`、官方包 `manifestVersion` 扫描）；G6 `examples/headless-gfm` 与 `examples/react-basic` `typecheck` 纳入根 `pnpm check`；`createEditor` 启动中止集成测试（duplicate `metadata.name`、`manifestVersion` unsupported）；五包 MIT `license` / `repository` / `files` / `publishConfig`；Changesets `linked` 五包；根 `changeset:publish` 脚本（**未执行 publish**）

## v1.0 差距

对照 [v1.0 路线图](architecture/roadmap.md)「必须实现」与当前 M6 基线，以下能力**尚未落地**或仅部分实现。完整路线图见 `docs/architecture/roadmap.md`；本小节为 G12 差距主锚点。

| 差距项 | 当前状态 | 备注 |
| --- | --- | --- |
| **compile-layer schema merge** | 未实现 | M6 以 `createDefaultConflictResolver` schema abort **单元测试**与 `createEditor` fatal startup 回归替代；完整 compile-layer 合并 deferred |
| **ConflictResolver 完整集成** | 部分 | 默认策略单元可测；`createEditor` 编排层未接入完整 command / keymap / capability 冲突解析 |
| **History / Selection / Clipboard** | 未实现 | v1.0 路线图「内置底座」；无对应 Service Capability 与 runtime |
| **PermissionGuard 沙盒** | 未实现 | 未授权 Runtime Permission 拦截未 enforce |
| **Worker Thread** | 未实现 | Parser / Serializer Worker 化 deferred（见 [线程模型](engineering/thread-model.md)） |
| **Command Bus 完整 Pipeline** | 部分 | 无 ReadOnlyGuard、CapabilityGuard 等完整 Guard 链 |
| **`bootstrapCore` Adapter 加载** | 未实现 | 无 `core:engine` / `core:parser` silent provide |
| **分层 Manifest 合并** | 部分 | `metadata` 层校验已有；`compile` / `runtime` / `security` 分层合并未完整 |
| **npm publish** | 未执行 | M6 仅 publish **预备**（元数据 + Changesets `linked` + `changeset:publish` 脚本）；实际发布 deferred 至 **M7**（[发布流程](community/release-process.md)） |

**M6 已闭合、不计入差距：** headless GFM 集成路径（`examples/headless-gfm`）、React Shell 集成 demo（`examples/react-basic`）、GFM preset 六语法 round-trip、React Shell 基线、G11/G6 CI 门禁、manifest 启动中止回归、五包 publish 预备元数据。

## 尚未开始

- 已发布包（npm；M6 预备已完成，见 [发布流程](community/release-process.md)）
- npm publish、canary release、release token（**M7**，ADR 009）
- Vue Shell、`packages/vue`
- examples matrix（M7 后）
- 发布流程 CI workflow（**M7**，ADR 009）
- `createEditor` / `AetherEditor` 完整 Guard 链与 Permission enforce
- Command Bus 完整 Pipeline（ReadOnlyGuard、CapabilityGuard 等）
- `bootstrapCore` Adapter plugin 加载与 `core:engine` / `core:parser` silent provide

## 已拍板、待工程落地（ADR 009）

- **许可证（O4 ✅）**：MIT（根目录 `LICENSE` 与各 package `license` 字段 M6 已同步；无需为此单独开 ADR）
- **Changelog（O3 ✅）**：M7 之前延续 Changesets `changelog: false`；真正首次 `latest` 前再选手写 `CHANGELOG.md` 或 `@changesets/changelog-github`
- **Plugin SDK**：不独立 npm 包；类型入口为 `@aether-md/core`（非 `@aether-md/sdk`）
- **首发版本号（O1 ⏸）**、**Canary dist-tag（O2 ⏸）**：延后至 demo 完善且维护者满意后再议；延后期间不 publish、不配置 `NPM_TOKEN`
- **Canary 工程**：M6 publish 预备已完成；M7 启用 Changesets prerelease + CI（待 O1/O2 闭合后执行）
- **Examples 形态**：headless-gfm（M6 ✅）+ react-basic（M6 ✅），不发布 npm

## 近期重点

**Demo Slice 程序（PR0→PR A→PR B）已于 2026-07-06 闭合。** 见 [Demo Slice 交付计划](engineering/demo-slice-delivery-program.md)。

1. **下一 slice：** History（或 Selection）— 默认 **Spec Change**；见 [v1.0 差距](#v10-差距)。
2. **M7 发布条件：** `react-basic` 可演示 + 至少一个 post-demo slice 满意 + 维护者 sign-off；闭合 ADR 009 O1/O2 后再启动 Release CI / `NPM_TOKEN`。
3. 新 demo/example 改动默认 **Spec Change**；public contract 变更仍 **Full Change**（见 `AI_NATIVE_ENGINEERING_WORKFLOW.md`）。
4. 归档 change 时执行 Superpowers retention（`aether-workflow-archive-change`）。
5. 继续保持 `pnpm check` 绿。

## 贡献建议

当前阶段优先做能减少歧义并保护已实现边界的修改：

- 澄清契约语言
- 暴露隐藏假设
- 将宽泛路线图拆成可执行任务
- 为未决取舍新增 ADR
- 明确标出开放问题
