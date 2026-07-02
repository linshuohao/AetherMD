# ADR 007: 文档体系三分法

| Field | Value |
| --- | --- |
| **Status** | Accepted |
| **Date** | 2026-07-01 |

**Context**
早期单文档同时承担架构说明、SDK 契约、插件指南、工程手册四种角色，维护成本会随功能增长而加速膨胀。

**Decision**
拆分为架构文档、Plugin SDK、工程文档三套文档，各自独立演进。

**Trade-offs**
* *优点*：读者按需阅读；各文档演进节奏解耦。
* *代价*：交叉引用维护；需防止三套文档漂移。

**Consequences**
进入最小实现前，按 [CI 校验计划](../architecture/ci-checklist.md) 执行；最小实现范围见 [路线图](../architecture/roadmap.md)。

---

 路线图

v1.0 目标是交付**最小可运行编辑器**，而非实现工程文档中全部预留能力。
