# 测试策略

> 状态：设计草案。实现开始前，本页定义 MVP 的最小测试矩阵。

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

- 不支持的 `manifestVersion` 会中止启动。
- 缺失 `metadata.requires` 的 Service Capability 会中止启动。
- `metadata.dependsOn` 按拓扑顺序执行生命周期。
- Command handler 抛错时事务回滚并返回 `PluginError`。
- Adapter 失败时保留上一次可见文档快照。
- 段落、标题、加粗、斜体、列表、链接完成 Markdown round-trip。
- `dispose` 按逆序调用 `onDestroy`。
- 未授权 Runtime Permission 不进入受保护能力路径。

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
