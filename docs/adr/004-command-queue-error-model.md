# ADR 004: Command Queue 与类型化 Error Model

| Field | Value |
| --- | --- |
| **Status** | Accepted |
| **Date** | 2026-06-01 |
| **Supersedes** | — |

**Context**
并发命令无裁决顺序；异常无分类，Error Boundary 易膨胀。

**Decision**
引入 FIFO Command Queue 与优先级；定义五级 `AetherError` 及恢复矩阵。

**Trade-offs**
* *优点*：middleware / telemetry / 沙盒有标准插槽。
* *代价*：调度复杂度上升；队列延迟目标 < 1ms。

**Consequences**
工程文档承载 Error Model 与 Concurrency 详细规范。

---
