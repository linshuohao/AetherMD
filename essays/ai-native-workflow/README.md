# AI-native 工作流

> 主题：**如何用流程与产物约束 Agent，并保持可追溯**

本系列讨论 AetherMD 的 AI-native engineering workflow——从最初设计，到路径分级、task loop、产物债务等迭代。不重复 [`AI_NATIVE_ENGINEERING_WORKFLOW.md`](../../AI_NATIVE_ENGINEERING_WORKFLOW.md) 的步骤说明，而解释**为什么**这样设计、**改过什么**。

## 阅读顺序

| # | 标题 | 要点 |
| --- | --- | --- |
| 01 | [为什么需要一套 AI-native 工作流](./01-why-we-built-an-ai-native-workflow.md) | 可控性 > 速度；先约束再执行 |
| 02 | [四层产物与职责边界](./02-layered-artifacts-and-boundaries.md) | Docs / OpenSpec / Superpowers / Skill |
| 03 | [四条路径：工作流分类的迭代](./03-workflow-path-classification.md) | Maintenance → Full 升级 ladder |
| 04 | [Task 是最小执行单元](./04-task-as-minimum-execution-unit.md) | 单 task 边界、loop、wave-parallel |
| 05 | [工作流产物债务与路径降档](./05-workflow-artifact-debt.md) | Full Change 过度使用、Superpowers 归档 |

## 相关主题

- [产品与交付](../product-delivery/) — MVP 验收、纵向切片；与工作流「路径过重」互为因果
- *(待建)* [Agent 协作实践](../README.md#主题索引)

## Backlog

- Skill 单一权威源与 host mirror（`improve-aether-workflow` 复盘）
- 渐进式披露与 Agent 上下文加载
- deviation 文化与 compliance review
- Superpowers retention 落地（archive skill + 目录结构）

## 规范入口

执行工作流时以 [`AI_NATIVE_ENGINEERING_WORKFLOW.md`](../../AI_NATIVE_ENGINEERING_WORKFLOW.md) 与 [`.skills/aether-workflow/`](../../.skills/aether-workflow/) 为准；本系列是补充阅读。
