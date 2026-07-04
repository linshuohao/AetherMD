## Why

M1 Core Bootstrap 已验证 Manifest、Service Capability、依赖顺序与 lifecycle startup/dispose，但 `@aether-md/core` 仍无法派发命令或观察运行时事件。M2 需要最小 Command Bus 与 Event Hub，才能在不引入 Adapter 或 Shell 的前提下，验证「命令驱动意图、事件驱动观察」的架构宪章。

## What Changes

- 在 `@aether-md/core` 中新增最小 Command/Event 运行时表面：公开类型、`createCommandEventRuntime`、同步 `register` / `dispatch`、`CommandResult`、Event Hub（`on` / `emit` / unsubscribe）与基础 `EventEnvelope`。
- handler 抛错时转换为可审查的失败结果与 `pluginError` 事件，而不是让异常穿透宿主；M2 **不**实现 Adapter 事务回滚。
- 更新包导出边界测试：允许 M2 Command/Event API，继续禁止后续里程碑 API。
- 记录 M1 遗留 follow-up（duplicate `metadata.name`、partial startup cleanup、dispose idempotency public contract）为**后续独立 change**，本 change **不实现**。
- **非 BREAKING**（相对已发布消费者）：当前尚无已发布包；相对 M1 实现，这是 public export 增量扩展。

## Capabilities

### New Capabilities

- `command-event-runtime`: `@aether-md/core` 的最小 Command Bus 与 Event Hub 运行时，覆盖公开类型、同步派发、结果形状、事件订阅与 handler 错误隔离。

### Modified Capabilities

- `core-bootstrap`: 收窄「后续里程碑 API 不得暴露」中对 Command Bus / Event Hub 的排除，使包边界允许 M2 Command/Event API，同时继续排除 Adapter、Markdown parse/serialize、React Shell、Remark、ProseMirror 与 GFM preset。

## Impact

- 代码：`packages/core` public exports、Command/Event 模块、包边界与契约测试。
- API：新增 Command/Event public types 与运行时入口；保留既有 `bootstrapCore` 与 M1 bootstrap 行为。
- 契约：`docs/sdk/command-event-protocol.md`、`docs/sdk/commands.md`、`docs/architecture/core-api.md` 中的 M2 子集成为可执行合同。
- 依赖：不新增运行时依赖；不引入 Adapter、UI 或 Markdown 包。
- 测试策略：新增 Command/Event 契约测试；更新 package export boundary 断言。

## 非目标

- 不实现 Adapter 创建、ProseMirror、Remark、Markdown parse/serialize。
- 不实现 React Shell、Vue Shell 或任何 UI 包。
- 不实现 GFM preset 或官方语法插件。
- 不实现 Command Queue priority、coalescing 或 Worker Thread。
- 不实现完整权限沙盒、Telemetry 后端、插件热插拔或多人协作。
- 不实现完整 `createEditor` / `AetherEditor`（含 `Promise`-based `dispatch`、`getMarkdown`、`getDocument`、Adapter 与初始 Markdown）。
- 不实现默认 ConflictResolver 的 compile-layer merge，以及完整 Middleware Guard 链。
- 不实现 `docs/engineering/test-strategy.md` 中依赖 Adapter 的「handler 抛错时事务回滚」；M2 仅覆盖错误隔离与 `PluginError` 形状失败结果。
- 不在本 change 中实现下列 **M1 follow-up**（仅记录，留给后续 lifecycle/Manifest hardening change）：
  - duplicate `metadata.name` 拒绝或裁决语义；
  - partial startup cleanup（`onInit` / `onReady` 失败后的清理）；
  - `bootstrapCore` dispose idempotency 作为文档化 public contract。
- 不在本 change 中修改长期 Docs；Docs/spec sync 留到 compliance review 之后。

## Source Docs

- `AI_NATIVE_ENGINEERING_WORKFLOW.md`
- `docs/project-status.md`
- `docs/engineering/mvp-implementation-plan.md`
- `docs/architecture/core-api.md`
- `docs/architecture/principles.md`
- `docs/sdk/command-event-protocol.md`
- `docs/sdk/commands.md`
- `docs/sdk/lifecycle.md`
- `docs/engineering/error-model.md`
- `docs/engineering/test-strategy.md`
- `docs/engineering/data-flow.md`
- `docs/engineering/concurrency.md`
- `openspec/specs/core-bootstrap/spec.md`
- `packages/core/src/index.ts`

## Version Impact

- **Package SemVer**：`@aether-md/core` 在首次发布前为 pre-release / 未发布基线；本 change 增加 public exports，属于 minor-level public API 扩展（相对 M1 表面）。
- **`manifestVersion`**：不变更。
- **Public SDK contracts**：新增 Command/Event 类型与运行时 API；不修改既有 Manifest / Capability / Lifecycle bootstrap 语义。
- **Package exports**：`packages/core` `exports` / 入口类型面扩展。
- **Lockfiles**：预期无依赖变更。
- **Compatibility docs**：实现后在 docs/spec sync 阶段更新项目状态与 Core API 实现边界说明；本 change 不直接改 Docs。

## Code-Management Status

创建 artifacts 前 `git status --short` 显示无关脏文件：`M AGENTS.md`。该文件不在本 change 范围，不得纳入本 change 的 commit / PR。

预期 Git 范围（见 `docs/community/git-workflow.md`）：

- 分支：从 `main` 创建，例如 `feat/add-command-event-runtime`。
- Conventional Commit type：`feat(core)` 用于实现；本 OpenSpec 产物可用 `docs(openspec)` 或与实现同 PR 的 `feat(core)` body 追踪。
- 追踪字段：OpenSpec change id `add-command-event-runtime`。

## Docs 子集关系

本 change 实现长期 Docs 的 **M2 可执行子集**，不是完整 v1.0 目标面：

| Docs | M2 采用 | M2 明确延后 |
| --- | --- | --- |
| `docs/sdk/command-event-protocol.md` | 类型形状、`false`→`ok: false`、内置事件名、`EventEnvelope`、payload JSON 可序列化 | 自动 `change` 文档快照、`transactionFailed` 事务语义 |
| `docs/architecture/core-api.md` | `dispatch` / `on` / dispose 后拒绝 `dispatch` 的语义 | `createEditor`、`Promise<CommandResult>`、完整 Middleware Guard 链、`getMarkdown` / `getDocument` |
| `docs/engineering/test-strategy.md` | Command/Event 契约测试、handler 抛错隔离与 `PluginError` | 事务回滚、Adapter 快照保留、Markdown round-trip、Permission 拒绝路径 |

## 风险

- 无 Adapter / document model 时，`change` 事件 payload（`doc` / `markdown?`）语义可能过度承诺；M2 只验证可 `emit` 与 JSON 可序列化 payload，不验证 `AetherDoc`。
- 若把完整 Middleware 链、Permission 沙盒、ConflictResolver 或 M1 follow-up 一并实现，范围会膨胀。
- 若不更新 `core-bootstrap` 包边界要求，M1 边界测试会与 M2 API 冲突。
- handler 错误若未统一为可审查结果，宿主将无法稳定处理失败路径。
- 若把 test-strategy 的「事务回滚」误读为 M2 必做，会错误引入 Adapter。

## 验收标准

- `openspec/changes/add-command-event-runtime/` 下存在 proposal、design、delta specs 与 high-level tasks。
- delta specs 覆盖 Command/Event 运行时（含规范 public API、错误行为、订阅/取消订阅、测试边界），并修改 `core-bootstrap` 包边界排除项。
- 范围明确排除 Adapter、Markdown parse/serialize、React Shell、Remark、ProseMirror、GFM preset、Command Queue priority/coalescing、Worker Thread、完整权限沙盒与事务回滚。
- M1 follow-up（duplicate `metadata.name`、partial startup cleanup、dispose idempotency public contract）已记录为 out of scope，且不是本 change 实现任务。
- requirements 可在后续 implementation task 中通过 unit 或 contract tests 验证。
- 所有 requirements 引用既有 Docs 作为长期事实来源，不复制大段文档。
- 说明性正文使用中文；API 名称、包名、路径与 OpenSpec 结构关键词保持英文。
