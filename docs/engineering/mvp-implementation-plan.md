# MVP 实施计划

> 状态：M1 Core Bootstrap、M2 Command/Event Runtime、M3 Adapter 基座、M4 GFM Preset、M4.5 Editor Orchestration 与 M5 React Shell 已实现并通过验证。本页把 v1.0 路线图拆成可执行的最小实现任务。

## 实施目标

MVP 的目标是验证 AetherMD 的核心假设：声明式插件、微内核调度、适配器隔离、Markdown 往返和 React Shell 能组成一个最小可运行编辑器。

MVP 不追求完整生产能力。

## 里程碑

| 阶段 | 交付物 | 验收标准 |
| --- | --- | --- |
| M1 Core Bootstrap | `@aether-md/core` 雏形 | 已建立最小基线：能加载插件 Manifest，校验版本与依赖，启动生命周期 |
| M2 Command/Event | Command Bus、Event Hub | 已建立最小基线：能派发命令、返回结果、发出 `change` 与错误事件 |
| M3 Adapter 基座 | ProseMirror / Remark 最小适配器 | 已建立最小基线：能 parse Markdown（paragraph/heading）、编辑文档（`replaceText`）、serialize Markdown；跨包 round-trip 已验证 |
| M4 GFM Preset | 段落、标题、加粗、斜体、列表、链接 | 已建立基线：`@aether-md/preset-gfm` 六语法 round-trip 已验证；Remark/ProseMirror GFM 扩展；`SerializationError` 占位符策略已实现 |
| M4.5 Editor Orchestration | headless `createEditor` / `AetherEditor` | 已建立基线：async-only `createEditor`、宿主 `getMarkdown` / `getDocument`、显式 Adapter wiring、最小编排 rollback、GFM headless integration tests；**无** React Shell |
| M5 React Shell | `@aether-md/react` 最小组件 | 已建立基线：能挂载编辑器、通过 dispatch 路径更新内容、监听 `onChange`、GateLock 防重设、销毁实例；happy-dom 集成测试；**无** Shell Adapter |
| M6 验证套件 | 契约测试与 `examples/headless-gfm` | 关键路径测试可在 CI 中运行；SDK examples 可 `tsc --noEmit` |
| M7 首次发布与生态 | npm canary、LICENSE 落地、`examples/react-basic`、Release CI | `pnpm pack` consumer smoke 通过；canary dist-tag 可安装；见 [ADR 009](../adr/009-release-governance.md) |

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
- M5：`@aether-md/react`（`AetherEditorRoot` / `AetherEditorContent` / `useAetherEditor`）；Shell GateLock；`@aether-md/plugin-prosemirror` additive `createProseMirrorView` view-bridge；happy-dom 集成测试与 GFM React smoke；Core **仍无** remark/prosemirror/react runtime deps。
- M5 main spec：`openspec/specs/react-shell/spec.md`；`editor-orchestration` main spec 已同步 M5 React Shell 桥接 delta。

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

M5 已实现 React Shell 最小挂载与变更桥接，但 **不** 等同于 v1.0 完整 Shell 能力：

- 无 Vue Shell、toolbar、theme、History UI
- 集成测试使用 happy-dom + dispatch 路径（非 Playwright / 浏览器 CI）
- 无 Permission enforce / 完整 Guard 链

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

进入 M6 验证套件及后续代码实现前，以下文档 **SHOULD** 保持可审查状态：

- [Core API](../architecture/core-api.md)
- [文档模型](../architecture/document-model.md)
- [Adapter 协议](adapter-protocol.md)
- [Command/Event 协议](../sdk/command-event-protocol.md)
- [测试策略](test-strategy.md)

---
