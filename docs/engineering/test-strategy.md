# 测试策略

> 状态：M1 Core Bootstrap 与 M2 Command/Event Runtime 已开始。本页定义 MVP 的最小测试矩阵。

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
- Adapter 失败时保留上一次可见文档快照。（尚未实现）
- 段落、标题、加粗、斜体、列表、链接完成 Markdown round-trip。（尚未实现）
- `dispose` 按逆序调用 `onDestroy`。（M1 已覆盖）
- 未授权 Runtime Permission 不进入受保护能力路径。（尚未实现）

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
- package export boundary：允许 Command/Event，继续禁止 Adapter、Markdown parse/serialize、React Shell、Remark、ProseMirror、GFM preset。

## 契约测试要求

Adapter 实现 **SHOULD** 共用同一套 contract tests。任何新的 Adapter 只有通过以下测试，才可视为可用：

- `parse` 返回合法 `AetherDoc`
- `serialize` 对内置结构确定性输出
- `apply` 成功返回新快照
- `apply` 失败不污染旧快照
- `dispose` 可重复或可安全拒绝重复调用

## CI 门禁

进入实现阶段后，CI **SHOULD** 至少包含：

- TypeScript 类型检查
- 单元测试
- 契约测试
- Markdown 文档链接检查
- 包导出边界检查

---
