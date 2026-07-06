# 04 · Task 是最小执行单元

> 状态：初稿 · 2026-07  
> 相关变更：`improve-task-loop-parallel-scheduling`（已归档）  
> 相关规范：[AI_NATIVE_ENGINEERING_WORKFLOW.md](../../AI_NATIVE_ENGINEERING_WORKFLOW.md) Step 5–6.5

## 为什么是 task，不是 PR，不是 change

PR 往往太大：一个 MVP milestone 可能包含 orchestration、adapter、测试、文档，reviewer 无法逐条对照 spec requirement。

OpenSpec **change** 仍然太大：它描述意图与验收，但不限定「这一次 Agent 运行该改哪些文件」。

**Task** 是我们认定的最小执行单元，因为它同时满足：

| 属性 | 含义 |
| --- | --- |
| 单一目标 | 一句话说清完成态 |
| 文件边界 | Allowed / Forbidden files |
| Spec 绑定 | 对应 capability / requirement |
| 验证方式 | 命令、测试或 design-stage check |
| 可回滚 | 失败时不拖垮整个 change |

M1–M6 的实现计划被拆成 `.superpowers/tasks/<change>/01-*.md` 这样的文件，不是形式主义——而是让 **Codex 每次只处理一个工作单**，human 也可以只 review 一个工作单的 diff。

## Task 模板里的关键字段

一个合格的 task 至少声明：

```markdown
Depends On:
Parallel Group:
Barrier:
Allowed Files:
Forbidden Files:
TDD Notes:
Validation:
```

早期模板已有 Allowed Files 和 Validation；`improve-task-loop-parallel-scheduling` 补全了 **调度 metadata**，因为多 task change 开始暴露新问题。

## 第一次痛点：plan 与 task 调度脱节

Full Change 的 plan（`.superpowers/plans/<change>.md`）会写 task breakdown，但早期 task 文件不强制从 plan **复制** Depends On / Parallel Group / Barrier。

后果：

- Agent 在 task 阶段「重新发明」执行顺序
- 本可并行的 task 被串行执行
- 本需串行的 task 因并行 dispatch 冲突 allowed files

迭代原则：**调度关系在 plan 定稿，task 只复制，不重写。**

## 第二次痛点：loop 只会串行

Step 6.5 引入 `aether-workflow-execute-task-loop` 后，默认是 sequential loop：task 01 → validate → task 02 → …

对 `add-validation-suite`（9 个 task）、`add-react-shell`（10 个 task）这类 change，串行意味着：

-  wall-clock 时间线性增长
- coordinator Agent 上下文反复加载相似 material

但**不能**为了快而让两个 implementer 同时改同一文件，也不能让单个 Agent session 一次「顺便」做 task 03 和 04。

## 并行模型：coordinator vs implementer

`improve-task-loop-parallel-scheduling` 确立的分工：

```
                    ┌─────────────────────┐
                    │  Coordinator loop   │
                    │  (execute-task-loop)│
                    └──────────┬──────────┘
                               │
           ┌───────────────────┼───────────────────┐
           ▼                   ▼                   ▼
    ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
    │ Implementer │     │ Implementer │     │ Implementer │
    │  task 02    │     │  task 03    │     │  task 04    │
    │ (1 session  │     │ (1 session  │     │ (1 session  │
    │  = 1 task)  │     │  = 1 task)  │     │  = 1 task)  │
    └─────────────┘     └─────────────┘     └─────────────┘
           │                   │                   │
           └───────────────────┴───────────────────┘
                               ▼
                      wave-level validation
                               ▼
                         next wave / barrier
```

要点：

1. **并行只存在于 coordinator 调度层**
2. **一个 implementer agent session 只能处理一个 task**（single-task guardrail）
3. 同一 parallel wave 的 task 必须 **allowed files 不交叠**；交叠则串行或 worktree
4. **Barrier task**（如 full `pnpm check`）在 wave 末或 plan 指定节点执行

## Host Capability Probe

并非每个 host 都能 dispatch 子 Agent 或并行 wave。loop skill 要求 **Host Capability Probe**：记录 `subagent-driven-development`、`dispatching-parallel-agents`、`executing-plans` 等是否可用，再选择 sequential 或 wave-parallel mode。

这是 pragmatic 设计：**协议上支持并行，运行时优雅降级为串行**，并在 validation 记录里写下 fallback 原因，而不是 silent 串行。

## TDD 与 task 边界

Implement skill 要求识别 TDD entry point：优先 red-green-refactor。若无法从失败测试开始，必须在 Deviation 说明。

这与 task 粒度相互强化：如果一个 task 太大，往往找不到单一 failing test；那是 **task 该继续拆** 的信号，而不是跳过 TDD 的理由。

## 什么不值得写进 task

反过来看，以下情况**不应**单独占一个 task 文件（也不值得写一篇 essay）：

- 修 typo、单文件 import 排序
- 修 CI 偶发 flake 的单行 retry（除非改变 test strategy）
- mirror sync 后的无语义 diff

这些走 Maintenance 或 Quick Change，不污染 Superpowers task 目录的 signal-to-noise ratio。

## 小结

Task 是连接 **spec requirement** 与 **git diff** 的桥梁。Loop 编排解决的是 **many task 如何高效且安全地跑完**；并行是 accelerator，不是对单 task 边界的放松。

若 Agent 时代只能记住一条执行纪律，我会选：

> **一次运行，一个 task，一份 validation 记录。**

---

系列目录：[AI-native 工作流](./README.md) · [随笔总索引](../README.md)  
上一篇：[03 · 四条路径](./03-workflow-path-classification.md)  
下一篇：[05 · 工作流产物债务与路径降档](./05-workflow-artifact-debt.md)
