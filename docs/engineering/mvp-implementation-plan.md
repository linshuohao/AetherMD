# MVP 实施计划

> 状态：M1 Core Bootstrap、M2 Command/Event Runtime 与 M3 Adapter 基座已实现并通过验证。本页把 v1.0 路线图拆成可执行的最小实现任务。

## 实施目标

MVP 的目标是验证 AetherMD 的核心假设：声明式插件、微内核调度、适配器隔离、Markdown 往返和 React Shell 能组成一个最小可运行编辑器。

MVP 不追求完整生产能力。

## 里程碑

| 阶段 | 交付物 | 验收标准 |
| --- | --- | --- |
| M1 Core Bootstrap | `@aether-md/core` 雏形 | 已建立最小基线：能加载插件 Manifest，校验版本与依赖，启动生命周期 |
| M2 Command/Event | Command Bus、Event Hub | 已建立最小基线：能派发命令、返回结果、发出 `change` 与错误事件 |
| M3 Adapter 基座 | ProseMirror / Remark 最小适配器 | 已建立最小基线：能 parse Markdown（paragraph/heading）、编辑文档（`replaceText`）、serialize Markdown；跨包 round-trip 已验证 |
| M4 GFM Preset | 段落、标题、加粗、斜体、列表、链接 | Markdown round-trip 覆盖内置语法 |
| M5 React Shell | `@aether-md/react` 最小组件 | 能挂载编辑器、输入内容、监听变更、销毁实例 |
| M6 验证套件 | 契约测试与示例插件 | 关键路径测试可在 CI 中运行 |

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
- `packages/core` 仍不提供 `createEditor`、`AetherEditor`、React Shell、GFM preset，也不通过 `bootstrapCore` 加载 Adapter plugin。
- M1 main spec：`openspec/specs/core-bootstrap/spec.md`。
- M2 main spec：`openspec/specs/command-event-runtime/spec.md`。
- M3 main specs：`openspec/specs/document-model/spec.md`、`openspec/specs/adapter-base/spec.md`。

## 必须实现

- Manifest 分层加载与规范化（M1 已有最小 shape validation）
- `SUPPORTED_MANIFEST_VERSIONS` 校验（M1 已有）
- Service Capability 校验（M1 已有 Core + loaded plugin provider 校验）
- Lifecycle：`load -> onInit -> onReady -> dispose -> onDestroy`（M1 已覆盖 startup order、startup failure reverse cleanup、reverse destroy 与 bootstrap dispose 幂等公开契约）
- Command Pipeline 的同步路径（M2 已有：`register` / `dispatch`，仅错误边界 Middleware）
- `CoreError`（M1/M2 已有）、`PluginError`（M2 已有 command handler 隔离）
- `AdapterError`（M3 已有，Engine apply 失败路径）
- `SerializationError`（M3 已 export 可实例化类；Serializer 失败占位符策略仍属 M4）
- Markdown 字符串初始化（通过 plugin round-trip tests 验证，非宿主 `createEditor` API）
- `getMarkdown()` 与 `getDocument()`（v1.0 宿主 API，尚未实现）

## 暂不实现

- Worker Thread
- Command Queue 优先级与 coalescing（M2 保留 `meta.priority` 字段但忽略）
- 第三方插件完整沙盒
- Telemetry 后端
- Vue Shell
- 插件热插拔
- 多人协作

M1/M2 已明确排除（M3 仍排除）：

- `createEditor` / `AetherEditor`、Guard 链
- React / Vue Shell、GFM preset
- Command Bus 自动 Adapter rollback / `transactionFailed` auto emit
- `bootstrapCore` Adapter plugin 加载

M3 已实现但 **不** 等同于 v1.0 完整 Adapter / 编辑器能力：

- Adapter 协议类型与最小 plugin 实现（paragraph/heading 子集）
- 显式 wiring 的 parse → apply → serialize round-trip（integration tests）

M3 仍排除：

- GFM 全覆盖 round-trip
- compile-layer Schema 合并、ConflictResolver
- SerializationError 占位符输出策略

## 后续里程碑门槛

进入 M4 GFM preset 及后续代码实现前，以下文档 **SHOULD** 保持可审查状态：

- [Core API](../architecture/core-api.md)
- [文档模型](../architecture/document-model.md)
- [Adapter 协议](adapter-protocol.md)
- [Command/Event 协议](../sdk/command-event-protocol.md)
- [测试策略](test-strategy.md)

---
