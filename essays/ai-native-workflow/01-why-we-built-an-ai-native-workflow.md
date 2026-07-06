# 01 · 为什么需要一套 AI-native 工作流

> 状态：初稿 · 2026-07  
> 相关规范：[AI_NATIVE_ENGINEERING_WORKFLOW.md](../../AI_NATIVE_ENGINEERING_WORKFLOW.md)

## 出发点

AetherMD 是一个 Markdown 编辑器架构项目，长期事实来源是 `docs/` 里的设计文档。当我们开始用 Codex、Cursor 等 Agent 辅助实现时，遇到的不是「写得不够快」，而是另一类风险：

**Agent 写得太快、太散、太难追踪。**

具体表现包括：

- 一次性读取大量文档，自行挑选「看起来相关」的片段后开始编码
- 跨架构层修改（Core、Adapter、React Shell 边界被模糊）
- public contract 在 spec 未更新时被悄悄改动
- 测试被弱化或跳过，偏差没有留下记录
- 人很难回答：「这个 PR 为什么改这些文件？它对应哪条需求？」

这些问题在纯人工开发中也存在，但 Agent 把**吞吐**提高了几个数量级，却没有自动提高**可审查性**。如果不在流程层做约束，审查成本会反过来拖垮项目。

## 核心假设

我们采纳了一个与常见「vibe coding」相反的假设：

> **AI Coding 的主要矛盾不是效率，而是可控性与可追溯性。**

因此工作流优先保护：

1. 长期可维护性（架构边界、SDK 契约）
2. 变更可追溯（从需求到代码的链路）
3. 小步、可回滚（失败时能定位到单个 task）

效率通过**小 task + 自动化验证 + 可选并行 loop** 释放，而不是通过放宽边界。

## 防腐目标

工作流要防的不是「Agent 犯错」——犯错不可避免——而是以下几类**系统性腐化**：

| 腐化类型   | 典型症状                                |
| ---------- | --------------------------------------- |
| 文档漂移   | `docs/` 与实现各说各话，术语不一致      |
| Spec 漂移  | OpenSpec 与 main spec 长期不同步        |
| 上下文幻觉 | Agent 引用不存在的契约或编造 API        |
| 范围蔓延   | 一个 task 里同时改 contract + 实现 + CI |
| 静默偏差   | 「先这样，以后再说」且未写入 deviation  |
| 审查失效   | PR 很大，无法映射到 spec requirement    |

## 设计取向：先约束，再执行

最终成型的原则可以概括为 **「先约束，再执行」**：

```
Existing Docs
  → Discover（分类 + 权威文档）
  → 按路径选择产物厚度（Maintenance / Quick / Spec / Full）
  → OpenSpec change（如需）
  → Superpowers plan → task
  → 单 task 实现 + 验证
  → compliance review → docs/spec sync → archive
```

Agent **不**从一句需求直接跳到代码。它只在：

- 当前 OpenSpec change（如有）
- 当前 Superpowers task
- task 显式引用的 Docs 片段

范围内行动。

这与「把整份 AGENTS.md + docs/ 塞进 system prompt」形成对比：后者在 token 预算和注意力分配上都不可持续。

## 与「文档驱动开发」的关系

本工作流**不是**替代 `docs/`，而是在 Docs 之上增加**变更切片层**（OpenSpec）和**执行切片层**（Superpowers）。

- `docs/`：长期事实，回答「系统应该是什么样」
- `openspec/`：本次变更的 implementation contract，回答「这次必须满足什么」
- `.superpowers/`：执行记录，回答「我们实际做了什么、验证结果如何」

没有 OpenSpec 复制整套 Docs，是为了避免两套事实来源互相漂移；也没有让 Agent 直接消费完整 Docs，是为了避免上下文噪声。

## 适用边界

这套工作流为 **设计约束强、public contract 敏感、需要长期维护** 的项目设计。它**不适合**：

- 一次性原型或 hackathon（产物厚度会拖慢节奏）
- 纯内部工具、无公开 API 且团队极小（可简化为 Quick Change 或更轻流程）
- 已有成熟 CI + code review 文化但完全拒绝写 spec 的团队（需要先达成「可追溯」共识）

AetherMD 处于「设计草案 → 最小实现」过渡阶段，契约和边界比功能数量更重要，因此选择了偏重的默认路径（Full Change），再逐步拆出更轻的中间路径——这是 [03 · 四条路径](./03-workflow-path-classification.md) 的主题。

## 小结

AI-native 工作流不是为了给 Agent 加枷锁，而是把**人类审查能跟上的粒度**设为默认。每一步留下可审查产物，让「快」建立在「可解释、可回滚、可升级」之上，而不是建立在 hope 之上。

下一篇：[02 · 四层产物与职责边界](./02-layered-artifacts-and-boundaries.md)
