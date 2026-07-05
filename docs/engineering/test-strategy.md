# 测试策略

> 状态：M1 Core Bootstrap、M2 Command/Event Runtime、M3 Adapter 基座、M4 GFM Preset、M4.5 Editor Orchestration 与 M5 React Shell 已实现并通过验证。本页定义 MVP 的最小测试矩阵。

## 测试目标

测试应优先保护公开契约和架构边界，而不是覆盖所有内部实现细节。

## 测试分层

| 层级 | 目标 | 示例 |
| --- | --- | --- |
| Unit | 纯函数与小模块 | Manifest 规范化、Capability 校验、ConflictResolver |
| Contract | 包之间协议 | Adapter 协议、Command/Event 协议、Lifecycle 顺序 |
| Integration | 多模块主路径 | Markdown 初始化、命令执行、序列化、React Shell 挂载 |
| Regression | 已知错误 | 插件异常隔离、事务回滚、权限拒绝 |

## MVP 必测场景

- 不支持的 `manifestVersion` 会中止启动。（M1 已覆盖）
- 缺失 `metadata.requires` 的 Service Capability 会中止启动。（M1 已覆盖）
- `metadata.dependsOn` 按拓扑顺序执行生命周期。（M1 已覆盖）
- Command handler 成功 `dispatch` 返回 `ok: true`。（M2 已覆盖）
- Command handler 返回 `false` 或未知命令时返回失败结果。（M2 已覆盖）
- Command handler 抛错时返回 `PluginError` 并发出 `pluginError`，不向宿主抛出。（M2 已覆盖；事务回滚延后到 Adapter 里程碑）
- Event Hub 订阅、投递与取消订阅。（M2 已覆盖）
- dispose 后 `dispatch` fail-closed，`emit` 为 no-op。（M2 已覆盖）
- Adapter 失败时保留上一次可见文档快照。（M3 已覆盖 — `EngineAdapter.apply` contract tests）
- M3 最小 Markdown round-trip：paragraph、heading+paragraph。（M3 已覆盖 — cross-package integration tests）
- 段落、标题、加粗、斜体、列表、链接完成 Markdown round-trip。（M4 已覆盖 — `@aether-md/preset-gfm` 六语法 integration tests）
- `dispose` 按逆序调用 `onDestroy`。（M1 已覆盖）
- 未授权 Runtime Permission 不进入受保护能力路径。（尚未实现）
- React Shell 挂载、dispatch 路径变更、`onChange` 回调与 `dispose`。（M5 已覆盖 — `@aether-md/react` happy-dom 集成测试）
- GateLock：`prevValue === nextValue` 时不重设文档。（M5 已覆盖 — `gate-lock.integration.test.tsx`）
- GFM preset 经 React Shell 的 paragraph、strong、list smoke。（M5 已覆盖 — `gfm-react-smoke.test.tsx`）

## M1 Core Bootstrap 验证基线

`packages/core` 当前使用 Node built-in test runner 和 TypeScript 编译输出作为最小可重复验证方案。M1 baseline 覆盖：

- Manifest version 与 shape validation。
- Service Capability validation，包括 Adapter-backed capability 不被 M1 silent provide。
- `metadata.dependsOn` dependency order、missing dependency 和 cycle failure。
- `runtime.onInit` / `runtime.onReady` startup order。
- `dispose()` reverse `runtime.onDestroy` order，重复 dispose 不重复调用 destroy hooks。
- package export boundary，确认不暴露后续里程碑 API。

## M2 Command/Event Runtime 验证基线

M2 baseline 覆盖：

- public types 与 `createCommandEventRuntime` / `CommandEventRuntime` 导出。
- 同步 `register` / `dispatch` 与 `CommandResult` 成功/失败映射。
- Event Hub `on` / `emit` / unsubscribe，以及 `change` / `pluginError` 投递。
- handler 抛错隔离为 `PluginError`，并发出 `pluginError`。
- dispose 后 `dispatch` 返回 core 失败结果，`emit` no-op，重复 dispose 不抛出。
- package export boundary：允许 Command/Event 与 M4.5 `createEditor`；继续禁止 Shell、GFM preset re-export；允许 M3 document/adapter types 与 error classes。

## M3 Adapter 基座验证基线

M3 baseline 覆盖：

- `AetherDoc` / `AetherSchema` export 与 JSON 可序列化 shape tests。
- Adapter 协议 types 与 `AdapterError` / `SerializationError` shape tests。
- `@aether-md/plugin-remark`：paragraph/heading parse、unknown syntax 降级、deterministic serialize。
- `@aether-md/plugin-prosemirror`：create/apply/getDocument/dispose、失败 apply 快照保持。
- cross-package round-trip integration（不依赖 `createEditor` / React / GFM）。
- package export boundary：M3 允许面 + M4/M5 禁止面；Core 无 remark/prosemirror/react/vue runtime deps。

M3 **不**覆盖：Command Bus 自动 rollback。

## M4 GFM Preset 验证基线

M4 baseline 覆盖：

- `@aether-md/preset-gfm`：Manifest（`manifestVersion: 1`、`name: gfm`）、`createGfmPreset()` 工厂、package-boundary guards（无 `createEditor` / React / `bootstrapCore` wiring）。
- 六语法 GFM round-trip matrix：paragraph、heading、strong、emphasis、unordered list、ordered list、link — Markdown → parse → `EngineAdapter.apply`（minimal edit）→ serialize，golden strings 可审查。
- `@aether-md/plugin-remark` GFM parse/serialize contract tests；`CustomBlock` 占位符 `[unsupported:block:<name>]`；不支持节点 `SerializationError` 拒绝。
- `@aether-md/plugin-prosemirror` GFM conversion/engine preservation tests（成功 apply 与失败 apply 快照语义）。
- M3 paragraph/heading round-trip regression（不依赖 preset package）。
- `CustomBlock` structured round-trip **不**纳入 M4 GFM matrix。

M4 **不**覆盖：React Shell、`bootstrapCore` Adapter loading、standalone M2 Command Bus 自动 rollback、nested lists/tables、compile-layer。

## M4.5 Editor Orchestration 验证基线

M4.5 baseline 覆盖：

- `@aether-md/core`：`createEditor` orchestration unit tests（startup、`CoreError` reject、Parser `initialValue`、lazy `getMarkdown`、dispatch rollback、`ready` / `disposed` / `change` / `transactionFailed`）。
- headless GFM integration：`createEditor` + `@aether-md/preset-gfm` round-trip（paragraph、strong、unordered list fixtures）；Node 执行，无 React/DOM import。
- package export boundary：允许 `createEditor` / `AetherEditor`；禁止 `createGfmPreset` re-export、Shell exports、`createEditorSync`；Core 无 remark/prosemirror/react runtime deps。
- M2 regression：standalone `createCommandEventRuntime` 无 `transactionFailed` auto emit；M2 tests 不依赖 preset/plugins。

M4.5 **不**覆盖：React Shell、Guard 链、compile-layer merge、duplicate-command integration test（resolver unit-tested）、Permission enforce。

## M5 React Shell 验证基线

M5 baseline 覆盖：

- `@aether-md/react`：package-boundary guards（公开 exports、无 `ShellAdapter`、无 `prosemirror-view` 直接 import）；`useAetherEditor` change 桥接单元测试；GateLock 单元与集成测试。
- happy-dom 集成：`AetherEditorRoot` 挂载、`.ProseMirror` 视图、`dispatch` 路径 `onChange`、`dispose` 后 DOM 清理与 post-unmount `dispatch` fail-closed `EDITOR_DISPOSED`（`react-shell.integration.test.tsx`）；GateLock 受控 `value` 等值 rerender 不重设（`gate-lock.integration.test.tsx`）。
- GFM React smoke：`createGfmPreset()` + paragraph（含 `dispatch` minimal edit）、strong、unordered list fixtures（`gfm-react-smoke.test.tsx`）；与 M4.5 headless integration 区分。
- `@aether-md/plugin-prosemirror`：view-bridge unit tests（`createProseMirrorView`、`dispatchInput`、destroy）；additive `readSessionEditorState` 仅供 bridge sync。
- package export boundary：react 依赖 core + plugin-prosemirror；core 无 react/prosemirror/remark runtime deps；react 无 `prosemirror-view` 直接依赖。

M5 **不**覆盖：Playwright / 浏览器 CI（M6+ 决策）、DOM 键盘输入集成（dispatch 路径替代，见 compliance review D3）、Vue Shell、toolbar/theme。

## 契约测试要求

Adapter 实现 **SHOULD** 共用同一套 contract tests。M3 各 plugin package 内已实现等效 contract tests：

- `parse` 返回合法 `AetherDoc`（plugin-remark）
- `serialize` 对内置结构确定性输出（plugin-remark）
- `apply` 成功返回新快照（plugin-prosemirror）
- `apply` 失败不污染旧快照（plugin-prosemirror）
- `dispose` 可重复或可安全拒绝重复调用（plugin-prosemirror）

## CI 门禁

进入实现阶段后，CI **SHOULD** 至少包含：

- TypeScript 类型检查
- 单元测试
- 契约测试
- Markdown 文档链接检查
- 包导出边界检查

---
