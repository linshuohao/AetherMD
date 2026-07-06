# 产品与交付

> 主题：**什么叫「做完了」、怎么切里程碑、demo 如何驱动设计**

本系列讨论 AetherMD 在 M1–M6 阶段的交付策略复盘——设计先行 vs 先能用、架构验证 vs 可摸到的编辑器体验、横向铺层 vs 纵向切片。与 [`docs/architecture/roadmap.md`](../../docs/architecture/roadmap.md) 和 [`docs/engineering/mvp-implementation-plan.md`](../../docs/engineering/mvp-implementation-plan.md) 不同：后者是**计划**，这里是**事后反思**。

**当前可执行计划（权威）** 已沉淀至 [`docs/engineering/demo-slice-delivery-program.md`](../../docs/engineering/demo-slice-delivery-program.md)。**Demo Slice 程序已于 2026-07-06 闭合**；下一优先级见 [`docs/project-status.md`](../../docs/project-status.md)。

## 阅读顺序

| # | 标题 | 要点 |
| --- | --- | --- |
| 01 | [MVP 措辞没错，验收偏了](./01-mvp-intent-vs-architecture-proof.md) | 架构验证套件 vs 能打开的编辑器；纵向切片 |

## 相关主题

- [AI-native 工作流](../ai-native-workflow/) — 流程产物厚度、Full Change 门槛；见该系列 [05 · 工作流产物债务](../ai-native-workflow/05-workflow-artifact-debt.md)

## Backlog

- ~~Slice 里程碑如何写进 roadmap~~ → **PR B**（见 [Demo Slice 交付计划](../../docs/engineering/demo-slice-delivery-program.md)）
- `examples/react-basic` 作为 north star → **PR A**（同上）
- 验收标准 `clone → dev → 能打字` → **PR0 / PR A**（同上）
- workflow retention / Discover 降档 → **PR B**（同上）

## 规范入口

里程碑与差距以 [`docs/project-status.md`](../../docs/project-status.md) 为准；**当前 PR 阶段与边界**以 [`docs/engineering/demo-slice-delivery-program.md`](../../docs/engineering/demo-slice-delivery-program.md) 为准。
