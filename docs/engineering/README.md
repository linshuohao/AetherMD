# 工程文档

工程文档说明当前与未来 Core 实现如何满足架构与 SDK 契约。

## 页面

| 页面 | 作用 |
| --- | --- |
| [MVP 实施计划](mvp-implementation-plan.md) | 将 v1.0 路线图拆成可执行里程碑和验收标准 |
| [数据流](data-flow.md) | 确定性双向数据流 |
| [Adapter 协议](adapter-protocol.md) | Core 与编辑、解析、序列化引擎之间的协议边界 |
| [错误模型](error-model.md) | 类型化错误、恢复矩阵、Error Boundary 层级 |
| [线程模型](thread-model.md) | 主线程、Worker、Adapter、Shell 职责 |
| [可观测性](observability.md) | TelemetryService 与默认指标 |
| [并发策略](concurrency.md) | Command Queue、优先级、原子性、取消策略 |
| [安全模型](security.md) | Runtime Permission 授予流程与沙盒隔离 |
| [性能原则](performance.md) | 性能防御性原则 |
| [Manifest 加载](manifest-loading.md) | Manifest 加载与规范化策略 |
| [ConflictResolver](conflict-resolver.md) | 默认 Resolver 实现参考 |
| [测试策略](test-strategy.md) | MVP 测试矩阵、契约测试和 CI 门禁 |

## 权威边界

工程文档负责维护：

- 运行时行为
- 实现策略
- MVP 任务拆解
- Adapter 协议
- 故障恢复
- 可观测性
- 并发与取消
- 性能约束
- 安全执行模型
- 测试策略

本分区不能悄悄改变公开 SDK 契约或架构原则。
