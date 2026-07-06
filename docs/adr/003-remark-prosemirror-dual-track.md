# ADR 003: Remark 与 ProseMirror 双轨分离

| Field      | Value      |
| ---------- | ---------- |
| **Status** | Accepted   |
| **Date**   | 2026-01-20 |

**Context**
解析与视图揉合导致规范变更时全线崩溃；部分编辑器放弃独立 AST。

**Decision**
Remark 负责 MDAST；ProseMirror 负责编辑事务；Adapter 中转 AetherDoc。

**Trade-offs**

- _优点_：解析层与视图层解耦；5~10 年技术栈抗性。
- _代价_：序列化链路变长；需 Dirty Check 优化。

**Consequences**
全量导出经历四段转换；增量序列化成为工程文档的性能优化重点。

---
