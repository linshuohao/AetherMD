# 03 · 四条路径：工作流分类的迭代

> 状态：初稿 · 2026-07  
> 相关变更：`add-workflow-path-classification`（已归档）  
> 相关规范：[AI_NATIVE_ENGINEERING_WORKFLOW.md](../../AI_NATIVE_ENGINEERING_WORKFLOW.md#workflow-path-classification)

## 初版工作流的缺口

2026-07-03 引入 [`AI_NATIVE_ENGINEERING_WORKFLOW.md`](../../AI_NATIVE_ENGINEERING_WORKFLOW.md) 时，端到端流程已经清晰：Discover → OpenSpec change → plan → task → loop → review → archive。

同时文档也承认部分变更**可以跳过 OpenSpec**——typo、坏链、纯格式等。

实践中很快出现灰色地带：

| 请求                                       | 初版困境                                 |
| ------------------------------------------ | ---------------------------------------- |
| 修正 SDK 文档里一段误导性表述              | 比 typo 重，但走 Full Change 过重        |
| 给 workflow skill 增加一个 guardrail 段落  | 影响工程规范，但不是新 capability        |
| 新增一个 OpenSpec requirement + 单文件实现 | 明显需要 spec trace，但不需要 10 个 task |

Discover 阶段只能输出「要 / 不要 OpenSpec」，**产物厚度**与**风险**没有显式映射。结果是：要么过度流程（小改也写 proposal），要么 under-process（该有 delta spec 的改动被当成 Maintenance）。

## 迭代动机

`add-workflow-path-classification` 的 proposal 用一句话概括了 why：

> 对非 trivial 但又明显不值得走完整变更栈的小改动，仓库缺少一条被规范承认、可审查、可升级的中间路径。

注意两个关键词：

- **被规范承认**：不是 maintainer 口头说「这次简单搞搞」
- **可升级**：分类错了可以向上走，不能向下偷懒

## 四条路径

| Path             | OpenSpec   | Superpowers                 | 典型场景                           |
| ---------------- | ---------- | --------------------------- | ---------------------------------- |
| **Maintenance**  | 否         | 否                          | typo、坏链、纯格式                 |
| **Quick Change** | 否         | 否（委托验证 skill）        | 单点 fix、小 docs 澄清             |
| **Spec Change**  | 是（轻量） | 是（单 task）               | 单 capability delta，1 task 可完成 |
| **Full Change**  | 是（完整） | 是（plan + 多 task + loop） | 架构 / SDK / 多步 MVP              |

### 升级 ladder（只能向上）

```
Maintenance → Quick Change → Spec Change → Full Change
```

不允许为了省事儿 **downgrade**。如果 Discover 判成 Quick Change，实现中发现 touching public contract，必须 **escalate**，而不是在 PR 里悄悄扩大范围。

这与「fail closed」的 security 思维同构：路径选错了，宁可多写产物，不可少留 trace。

## 每条路径「省」在哪里

### Maintenance

Discover 后直接改，PR 最小 traceability。仍然禁止动 `packages/**`、OpenSpec、workflow skills 等 protected 路径。

### Quick Change

专用 skill `aether-workflow-quick-change`：结构化 PR 描述、validation 清单，无需 OpenSpec 目录。适合**语义不变**的澄清或局部 fix。

### Spec Change

轻量 OpenSpec（change-brief + delta + **单个** task），走 `create-spec-change` → `execute-spec-change`，review/archive 有 Spec Change 模式。

这是 Full Change 与 Quick Change 之间的 **sweet spot**：有 spec requirement 可追踪，但没有 plan 里 10 行 task 表格的开销。

### Full Change

M1 Core Bootstrap、M5 React Shell、M6 Validation Suite 等里程碑走此路径。OpenSpec 四件套 + Superpowers plan + task loop + barrier validation。

**Full Change 步骤未被削弱**——分类迭代做的是给轻量改动让路，不是给 heavyweight 改松绑。

## Discover 的输出契约

分类不只是标签。Discover（`aether-workflow-discover-context`）需要输出完整字段，包括：

- Workflow Path Classification
- **why this path is sufficient**
- **escalation triggers**
- `open_spec_required`
- recommended next skill

这让 Agent 和人类在**进入实现前**就对齐预期，而不是 PR 阶段才争论「该不该有 OpenSpec」。

## 工程化：PR traceability

路径分类落地时增加了 `scripts/check-workflow-pr-traceability.mjs`（`pnpm workflow:pr-check`），用于 PR 声明 Workflow Traceability 时的字段校验。

这体现一个观点：**轻量路径不等于无 trace**。Quick Change 仍要有结构化 PR 体；Spec Change 仍要 link 到 change name 和 requirement。

## 反思：分类本身谁来做？

当前默认是 Agent 在 Discover 步做分类，maintainer 在 OpenSpec proposal 或 PR 阶段确认。风险是 Agent **系统性 under-classify**（倾向 Quick Change）。

缓解措施：

1. Protected boundaries 列表（workflow semantics、SDK、ADR 等 **强制 Full**）
2. Escalation triggers 写进 skill，而不只写在 essay 里
3. Compliance review 检查 path 与 diff 范围是否匹配

后续若发现 under-classify 频繁，可以考虑 CI 启发式（例如 PR 触及 `openspec/specs/` 却未 link change 则 warn）。

## 小结

四条路径不是给流程「减肥」的借口，而是把**变更风险**映射到**产物厚度**。大多数仓库缺的不是更多文档，而是**中间档位**——有 spec、有 task、但不必每次开 full orchestra。

下一篇：[04 · Task 是最小执行单元](./04-task-as-minimum-execution-unit.md)

上一篇：[02 · 四层产物与职责边界](./02-layered-artifacts-and-boundaries.md)
