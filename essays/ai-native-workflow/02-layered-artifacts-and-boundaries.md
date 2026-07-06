# 02 · 四层产物与职责边界

> 状态：初稿 · 2026-07  
> 相关规范：[AI_NATIVE_ENGINEERING_WORKFLOW.md](../../AI_NATIVE_ENGINEERING_WORKFLOW.md) · [docs/maintenance.md](../../docs/maintenance.md)

## 问题：一层文档扛所有事

早期常见做法是：维护一份大而全的 `CONTRIBUTING.md` 或 `AGENTS.md`，希望 Agent 读后就能正确实现。

这在 small fix 上偶尔有效，但在 AetherMD 这类项目上会快速失效：

- **长期事实**（架构原则）与**一次性步骤**（本次 task 的 allowed files）混在同一层
- Agent 无法区分「必须永远遵守」与「仅本次变更适用」
- 人也无法区分「文档过期」与「文档故意保留历史表述」

我们需要的是**分层**，每层只回答一类问题。

## 四层模型

```
┌─────────────────────────────────────────────────────────┐
│  Docs (docs/, ADR)          长期事实、边界、术语         │
├─────────────────────────────────────────────────────────┤
│  OpenSpec (openspec/)       单次变更的 spec delta        │
├─────────────────────────────────────────────────────────┤
│  Superpowers (.superpowers/) plan / task / validation    │
├─────────────────────────────────────────────────────────┤
│  Workflow Skills (.skills/aether-workflow/)  阶段规则    │
└─────────────────────────────────────────────────────────┘
                              ↓
                         Code / 实现
```

### Docs：长期事实来源

职责：产品目标、架构边界、SDK 契约、工程策略、ADR、术语。

**不负责**：临时 task 状态、Agent 运行日志、未审查的实现偏差。

维护规则见 `docs/maintenance.md`：改最小归属分区，持久取舍进 ADR，不维护多套事实来源。

### OpenSpec：变更规格层

职责：一次 change 的 why / what / non-goals、design 合同、delta spec、验收标准。

**不应**复制完整 Docs；应**引用**权威 Docs 并抽取本次 implementation contract。

OpenSpec 解决的是：「这次 PR 必须证明它满足了哪些 requirement」，而不是重讲整个架构。

### Superpowers：执行层

职责：把 change 拆成 plan → 多个小 task → 记录 validation、review、final report。

**不**重新定义需求，**不**替代 OpenSpec spec，**不**成为长期事实来源。

`.superpowers/` 里的 task 文件是 Agent 的「工作单」：allowed files、forbidden files、TDD entry point、validation 命令。M1–M6 的实现几乎每条 meaningful change 都留下了 plan + task + validation 轨迹，这也是后来 compliance review 能工作的前提。

### Workflow Skills：阶段边界

职责：让 Agent 在**正确阶段**加载**最小必要**规则（Discover 只分类，Implement 只读一个 task）。

Skill **不是**新的长期事实来源；权威源在 `.skills/aether-workflow/`，Codex/Cursor 下的 mirror 由 `pnpm skills:sync` 生成，`pnpm skills:check` 防漂移。

这一点来自 `improve-aether-workflow` 变更：早期 `.codex/skills/` 与 `.cursor/skills/` 双份手工维护，极易漏改。单一权威源 + 生成 mirror 是把「流程规则」当成**代码**来管，而不是当成**文档**来抄。

## 渐进式披露

四层模型的操作含义是 **progressive disclosure**：

| 阶段 | Agent 应读什么 | 不应读什么 |
| --- | --- | --- |
| Discover | 相关 Docs 索引、分类规则 | 完整 openspec 历史 |
| Create change | 当前 change 的 source docs | 所有 archived change |
| Implement task | **一个** task + 其引用的 Docs 片段 | 整个 `docs/` 树 |
| Review | diff + spec + task logs + validation | 无关 package 源码 |

这直接降低 hallucinate 概率，也降低 human review 时的认知负担。

## 职责冲突时怎么办

边界清晰后，仍会出现张力。我们的处理优先级：

1. **Public contract / SDK** → Docs + OpenSpec spec 优先；实现必须改或 deviation 必须记录
2. **实现发现设计问题** → 暂停 task，升级 OpenSpec 或 ADR，而不是 silent fix
3. **Skill 与顶层 workflow 文档不一致** → 以 `.skills/aether-workflow/` 与 `AI_NATIVE_ENGINEERING_WORKFLOW.md` 为准，修 skill 后 sync mirror
4. **Superpowers task 与 plan 调度不一致** → task 必须从 plan 复制 Depends On / Parallel Group / Barrier，不得在 task 阶段重发明调度

## 反模式

| 反模式 | 为什么有害 |
| --- | --- |
| 把 task 步骤写进 `docs/architecture/` | 污染长期事实，难以归档 |
| 没有 change 直接改 main spec | 丢失变更意图与 review 上下文 |
| Agent 手写 `.superpowers/` 绕过 Superpowers 工具 | 产物结构漂移，loop 无法复用 |
| 在 skill 里重新定义 SDK 契约 | 多源事实，mirror 同步失效 |

## 小结

四层不是官僚叠层，而是**不同生命周期**的产物：Docs 活得最久，OpenSpec 随 change 归档，Superpowers 记录一次执行的细节，Skill 约束 Agent 当前步的行为。

下一层级的「路径分级」（Maintenance / Quick / Spec / Full）解决的是：**并非每次变更都需要四层全满**——见 [03 · 四条路径](./03-workflow-path-classification.md)。

上一篇：[01 · 为什么需要一套 AI-native 工作流](./01-why-we-built-an-ai-native-workflow.md)
