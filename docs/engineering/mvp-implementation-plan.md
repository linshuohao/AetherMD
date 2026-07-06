# MVP 实施计划

> 状态：M1 Core Bootstrap、M2 Command/Event Runtime、M3 Adapter 基座、M4 GFM Preset、M4.5 Editor Orchestration、M5 React Shell 与 M6 验证套件已实现并通过验证。本页把 v1.0 路线图拆成可执行的最小实现任务。

## 实施目标

MVP 分两轨验证 AetherMD 的核心假设：

1. **架构轨（L1）**：声明式插件、微内核调度、Adapter 隔离、Markdown 往返与 Phase 0 React Shell 能组成**可运行的集成管线**（`examples/react-basic`）。
2. **产品轨（L2）**：Instant Morphing + Block Focus 能组成**可感知的产品 north star**（规划载体 `examples/block-morphing`；Slice A 为 M7 发布前置）。

MVP 不追求完整生产能力。L1 通过 **不得** 解释为 L2 已满足（见 [产品交互体验规范](../architecture/product-experience-spec.md)）。

## 里程碑

| 阶段 | 交付物 | 验收标准 |
| --- | --- | --- |
| M1 Core Bootstrap | `@aether-md/core` 雏形 | 已建立最小基线：能加载插件 Manifest，校验版本与依赖，启动生命周期 |
| M2 Command/Event | Command Bus、Event Hub | 已建立最小基线：能派发命令、返回结果、发出 `change` 与错误事件 |
| M3 Adapter 基座 | ProseMirror / Remark 最小适配器 | 已建立最小基线：能 parse Markdown（paragraph/heading）、编辑文档（`replaceText`）、serialize Markdown；跨包 round-trip 已验证 |
| M4 GFM Preset | 段落、标题、加粗、斜体、列表、链接 | 已建立基线：`@aether-md/preset-gfm` 六语法 round-trip 已验证；Remark/ProseMirror GFM 扩展；`SerializationError` 占位符策略已实现 |
| M4.5 Editor Orchestration | headless `createEditor` / `AetherEditor` | 已建立基线：async-only `createEditor`、宿主 `getMarkdown` / `getDocument`、显式 Adapter wiring、最小编排 rollback、GFM headless integration tests；**无** React Shell |
| M5 React Shell | `@aether-md/react` 最小组件（**Phase 0 interim shell**） | 已建立基线：能挂载编辑器、通过 dispatch 路径更新内容、监听 `onChange`、GateLock 防重设、销毁实例；happy-dom 集成测试；**无** Shell Adapter；**不是**产品 north star 终态 |
| M6 验证套件 | 契约测试与 `examples/headless-gfm` + L1 `examples/react-basic` | 已建立基线：G11 manifest 文档一致性、G6 两个 example `typecheck` 纳入 `pnpm check`、`createEditor` 启动中止回归、五包 publish 预备与 Changesets `linked`、G12 v1.0 差距文档；Demo Slice 程序闭合 L1；**未** npm publish |
| M7 首次发布与生态 | npm canary、LICENSE 落地、Release CI | **前置（维护者 sign-off）**：L1 `react-basic` 可演示 **且** L2 **Slice A**（单段落 morphing MVP）可演示；`pnpm pack` consumer smoke 通过；canary dist-tag 可安装；见 [ADR 009](../adr/009-release-governance.md) |

## 包范围

v1.0 **MUST** 至少包含：

- `packages/core`
- `packages/plugin-prosemirror`
- `packages/plugin-remark`
- `packages/preset-gfm`
- `packages/react`

`packages/vue` **MAY** 保留目录规划，但不进入 MVP 实现范围。

当前实现状态：

- `packages/core` 已存在，覆盖 M1 Core Bootstrap、M2 Command/Event Runtime 与 M3 document-model / adapter-base 类型子集。
- M1：`bootstrapCore`、Manifest / Service Capability 校验、duplicate `metadata.name` 拒绝、lifecycle startup/dispose（含 startup failure cleanup 与 bootstrap dispose 公开幂等契约）。
- M2：`createCommandEventRuntime`、同步 Command Bus、Event Hub、`PluginError` 错误边界；独立于 `bootstrapCore`。
- M3：`AetherDoc` / `AetherSchema`、Adapter 协议类型、`AdapterError` / `SerializationError` export；`@aether-md/plugin-remark` 与 `@aether-md/plugin-prosemirror` 最小实现；M3 round-trip（paragraph、heading+paragraph）integration tests。
- M4：`@aether-md/preset-gfm`（`createGfmPreset()`、`metadata.name: gfm`）；GFM 六语法 round-trip integration tests；Remark GFM parse/serialize（`remark-gfm`）；ProseMirror GFM schema/conversion；`CustomBlock` 占位符与 `SerializationError` 拒绝路径。
- M4.5：`createEditor(config): Promise<AetherEditor>`（async-only）；`AetherEditor` 宿主 API；显式 Adapter wiring（**不**通过 `bootstrapCore` silent provide）；engine-bound `core:replaceText` 最小编排 rollback；`ready` / `change` / `transactionFailed` / `disposed`；headless GFM integration tests（paragraph、strong、list）；Core **仍无** remark/prosemirror/react runtime deps，**不** re-export GFM preset。
- M1 main spec：`openspec/specs/core-bootstrap/spec.md`。
- M2 main spec：`openspec/specs/command-event-runtime/spec.md`。
- M3 main specs：`openspec/specs/document-model/spec.md`、`openspec/specs/adapter-base/spec.md`。
- M4 main specs：`openspec/specs/gfm-preset/spec.md`；`document-model`、`adapter-base`、`core-bootstrap` main specs 已同步 M4 delta。
- M4.5 main spec：`openspec/specs/editor-orchestration/spec.md`；`command-event-runtime`、`adapter-base`、`core-bootstrap` main specs 已同步 M4.5 delta。
- M5：`@aether-md/react`（`AetherEditorRoot` / `AetherEditorContent` / `useAetherEditor`）；Shell GateLock；`@aether-md/plugin-prosemirror` additive `createProseMirrorView` view-bridge；happy-dom 集成测试与 GFM React smoke；**Phase 0 interim integration shell**（非常驻 PM 产品终态）；Core **仍无** remark/prosemirror/react runtime deps。
- M5 main spec：`openspec/specs/react-shell/spec.md`；`editor-orchestration` main spec 已同步 M5 React Shell 桥接 delta。
- M6：`examples/headless-gfm`（`@aether-md/example-headless-gfm`）与 `examples/react-basic`（`@aether-md/example-react-basic`，**L1**）；G11 `manifest-doc-consistency.test.ts`；G6 两个 example `typecheck` 纳入根 `pnpm check`；`startup-abort.integration.test.ts`；五包 MIT publish 预备元数据；Changesets `linked` 五包；根 `changeset:publish` 脚本（**未**执行 publish）。
- M6 main spec：`openspec/specs/validation-suite/spec.md`；`engineering-workflow` main spec 已同步 M6 CI 门禁 delta。

## 必须实现

- Manifest 分层加载与规范化（M1 已有最小 shape validation）
- `SUPPORTED_MANIFEST_VERSIONS` 校验（M1 已有）
- Service Capability 校验（M1 已有 Core + loaded plugin provider 校验）
- Lifecycle：`load -> onInit -> onReady -> dispose -> onDestroy`（M1 已覆盖 startup order、startup failure reverse cleanup、reverse destroy 与 bootstrap dispose 幂等公开契约）
- Command Pipeline 的同步路径（M2 已有：`register` / `dispatch`，仅错误边界 Middleware）
- `CoreError`（M1/M2 已有）、`PluginError`（M2 已有 command handler 隔离）
- `AdapterError`（M3 已有，Engine apply 失败路径）
- `SerializationError`（M4 已实现：类 export + Serializer 占位符 `[unsupported:block:<name>]` 与不支持节点拒绝）
- Markdown 字符串初始化（M4.5：`createEditor` 经 Parser Adapter；M3/M4 亦经 plugin round-trip tests 验证）
- `getMarkdown()` 与 `getDocument()`（M4.5 宿主 API 已实现；lazy serialize on call）

## 暂不实现

- Worker Thread
- Command Queue 优先级与 coalescing（M2 保留 `meta.priority` 字段但忽略）
- 第三方插件完整沙盒
- Telemetry 后端
- Vue Shell
- 插件热插拔
- 多人协作

M1/M2 已明确排除（M3/M4/M4.5 仍排除）：

- React / Vue Shell、完整 Guard 链
- standalone M2 Command Bus 自动 Adapter rollback / `transactionFailed` auto emit
- `bootstrapCore` Adapter plugin 加载与 silent provide

M5 已实现 React Shell 最小挂载与变更桥接，但 **不** 等同于 v1.0 完整 Shell 能力，也 **不** 等同于 [产品交互 north star（L2）](../architecture/product-experience-spec.md)：

- **Phase 0 interim shell**：常驻 ProseMirror + preview，证明集成管线
- 无 Vue Shell、toolbar、theme、History UI
- 集成测试使用 happy-dom + dispatch 路径（非 Playwright / 浏览器 CI）
- 无 Permission enforce / 完整 Guard 链
- **Instant Morphing / Block Focus** 由 L2 Slice A–D 交付，为 **M7 发布前置（Slice A）**

M4.5 已实现 headless `createEditor` / `AetherEditor`，但 **不** 等同于 v1.0 完整编辑器能力：

- 无 Permission enforce / Command Queue
- compile-layer Schema 合并、宿主自定义 ConflictResolver 注入仍排除
- History / Selection / Clipboard 完整语义仍为 stub

M3 已实现但 **不** 等同于 v1.0 完整 Adapter / 编辑器能力：

- Adapter 协议类型与最小 plugin 实现（paragraph/heading 子集）
- 显式 wiring 的 parse → apply → serialize round-trip（integration tests）

M4 已实现 GFM preset 与六语法 round-trip，但 **不** 等同于 v1.0 完整编辑器能力：

- `@aether-md/preset-gfm` 工厂与 Manifest；不依赖 `createEditor` / React Shell
- GFM 六语法 round-trip（paragraph、heading、strong、emphasis、list、link）
- `CustomBlock` 占位符输出；不支持节点 `SerializationError` 拒绝

M3/M4 仍排除：

- compile-layer Schema 合并、ConflictResolver
- nested lists、tables 等 GFM 扩展语法
- `CustomBlock` structured round-trip

## 后续里程碑门槛

进入 M7 首次发布及后续代码实现前，以下文档 **SHOULD** 保持可审查状态：

- [Core API](../architecture/core-api.md)
- [文档模型](../architecture/document-model.md)
- [Adapter 协议](adapter-protocol.md)
- [Command/Event 协议](../sdk/command-event-protocol.md)
- [测试策略](test-strategy.md)
- [ADR 009：发布与治理策略](../adr/009-release-governance.md)
- [发布流程](../community/release-process.md)（M6 预备已完成；M7 publish 未开始）
- [**Demo Slice 交付计划**](demo-slice-delivery-program.md)（L1 程序，**已闭合**）
- [产品交互体验规范](../architecture/product-experience-spec.md)（L2 north star 权威规格）

## M6 之后：纵向 Block Morphing（活跃）

M1–M6 横向里程碑与 L1 Demo Slice 程序均已闭合。**当前主叙事**为产品 north star 纵向切片（与 M 编号并行，不替代包边界）：

| 切片 | 范围 | 状态 |
| --- | --- | --- |
| **纠偏规格** | `product-experience-spec`、L1/L2 分层、Phase 0 定性 | ✅ 已完成（`align-instant-morphing-north-star`） |
| **Slice A** | 单段落块 rendered ↔ source morphing MVP | ✅ 已完成（`block-morphing-slice-1`） |
| **Slice B** | GFM inline marks 在 source 态保真 | 未开始 |
| **Slice C** | 多块 + Block Focus 切换 | ✅ 已完成（`block-morphing-slice-c`） |
| **Slice D** | 列表 / 链接块插件化 | 未开始 |

L1 历史执行记录见 [Demo Slice 交付计划](demo-slice-delivery-program.md)（PR0 → PR A → PR B，已闭合）。

### M7 发布触发条件（已拍板：方案 B）

进入 M7 canary **MUST** 同时满足：

1. **L1**：`examples/react-basic` 可演示；CI 与维护者 sign-off 已闭合（Demo Slice + typing-sync）。
2. **L2 Slice A**：单段落 Instant Morphing MVP 可演示；维护者 sign-off（规划载体 `examples/block-morphing` 或等价 demo，由 `block-morphing-slice-1` 定义）。
3. **工程门禁**：ADR 009 G1–G12、consumer smoke、`pnpm check` 绿；O1/O2 闭合后启用 Release CI / `NPM_TOKEN`。

History / Selection / Clipboard **不在** M7 前置范围内；于 Slice A 之后独立 backlog。

---
