# ADR 005: Manifest 能力系统与 manifestVersion

| Field | Value |
| --- | --- |
| **Status** | Accepted |
| **Date** | 2026-06-01 |

**Context**
隐式插件依赖难以在启动阶段发现；Manifest 结构演进缺乏版本锚点。

**Decision**
引入 `manifestVersion`、`provides` / `requires` / `dependsOn`；Schema 冲突启动失败。

**Trade-offs**
* *优点*：启动期发现依赖缺失；迁移路径明确。
* *代价*：插件作者需额外声明；Merger 复杂度上升。

**Consequences**
后续设计进一步类型化 Capability 并拆分 Manifest 层级（ADR 006）。

---
