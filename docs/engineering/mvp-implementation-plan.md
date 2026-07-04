# MVP 实施计划

> 状态：M1 Core Bootstrap 与 M2 Command/Event Runtime 已实现并通过验证。本页把 v1.0 路线图拆成可执行的最小实现任务。

## 实施目标

MVP 的目标是验证 AetherMD 的核心假设：声明式插件、微内核调度、适配器隔离、Markdown 往返和 React Shell 能组成一个最小可运行编辑器。

MVP 不追求完整生产能力。

## 里程碑

| 阶段 | 交付物 | 验收标准 |
| --- | --- | --- |
| M1 Core Bootstrap | `@aether-md/core` 雏形 | 已建立最小基线：能加载插件 Manifest，校验版本与依赖，启动生命周期 |
| M2 Command/Event | Command Bus、Event Hub | 已建立最小基线：能派发命令、返回结果、发出 `change` 与错误事件 |
| M3 Adapter 基座 | ProseMirror / Remark 最小适配器 | 能解析 Markdown、编辑文档、序列化 Markdown |
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

- `packages/core` 已存在，覆盖 M1 Core Bootstrap 与 M2 Command/Event Runtime 子集。
- M1：`bootstrapCore`、Manifest / Service Capability 校验、lifecycle startup/dispose。
- M2：`createCommandEventRuntime`、同步 Command Bus、Event Hub、`PluginError` 错误边界；独立于 `bootstrapCore`。
- `packages/core` 暂不提供 Adapter、React Shell、Markdown parse/serialize、Remark、ProseMirror 或 GFM preset。
- M1 main spec：`openspec/specs/core-bootstrap/spec.md`。
- M2 main spec：`openspec/specs/command-event-runtime/spec.md`。

## 必须实现

- Manifest 分层加载与规范化（M1 已有最小 shape validation）
- `SUPPORTED_MANIFEST_VERSIONS` 校验（M1 已有）
- Service Capability 校验（M1 已有 Core + loaded plugin provider 校验）
- Lifecycle：`load -> onInit -> onReady -> dispose -> onDestroy`（M1 已覆盖 startup order 和 reverse destroy）
- Command Pipeline 的同步路径（M2 已有：`register` / `dispatch`，仅错误边界 Middleware）
- `CoreError`（M1/M2 已有）、`PluginError`（M2 已有 command handler 隔离）
- 默认 ConflictResolver
- `AdapterError`
- Markdown 字符串初始化
- `getMarkdown()` 与 `getDocument()`

## 暂不实现

- Worker Thread
- Command Queue 优先级与 coalescing（M2 保留 `meta.priority` 字段但忽略）
- 第三方插件完整沙盒
- Telemetry 后端
- Vue Shell
- 插件热插拔
- 多人协作

M1/M2 已明确排除：

- Adapter 创建
- Markdown 解析与序列化
- React Shell
- Remark、ProseMirror 与 GFM preset
- 完整 `createEditor` / `AetherEditor`、Guard 链、Adapter 事务回滚

M1 follow-up（仍未实现，不在 M2 范围）：

- duplicate `metadata.name` 处理
- partial startup cleanup
- `bootstrapCore` dispose idempotency 作为公开契约

## 后续里程碑门槛

进入 M3 及后续代码实现前，以下文档 **SHOULD** 保持可审查状态：

- [Core API](../architecture/core-api.md)
- [文档模型](../architecture/document-model.md)
- [Adapter 协议](adapter-protocol.md)
- [Command/Event 协议](../sdk/command-event-protocol.md)
- [测试策略](test-strategy.md)

---
