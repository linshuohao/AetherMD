# ADR 001: 采用微内核架构，而非一体化组件

| Field      | Value      |
| ---------- | ---------- |
| **Status** | Accepted   |
| **Date**   | 2026-01-15 |

**Context**
市面上大量编辑器直接绑定所有 Markdown 语法，非标准扩展需 Fork 或 DOM 注入。

**Decision**
核心库剥离至生命周期驱动与 IoC 上下文；语法与渲染降维为独立插件；Undo / Selection / Clipboard 内核托管。

**Trade-offs**

- _优点_：低维护成本、高扩展灵活性。
- _代价_：Manifest Merger 复杂度上升。

**Consequences**
所有语法变更通过插件交付；Core 团队聚焦调度与契约，不碰业务语义。

---
