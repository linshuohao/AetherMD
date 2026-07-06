# ADR 002: 强声明式 Manifest 合并，而非弹性 Hook

| Field      | Value      |
| ---------- | ---------- |
| **Status** | Accepted   |
| **Date**   | 2026-01-15 |

**Context**
运行时动态魔改 Schema 导致行为不可预测、性能损耗、冲突难排查。

**Decision**
Schema / Keymap / Commands **MUST** 在 Manifest 中声明；启动时一次性静态合并；**MUST NOT** 在 `onInit` 注册 Command。

**Trade-offs**

- _优点_：可预测、高性能、冲突可检测。
- _代价_：丧失运行时动态修改 Schema 的灵活性。

**Consequences**
动态节点须在声明式 Schema 中预留变体参数；Plugin SDK 成为插件作者的首要参考。

---
