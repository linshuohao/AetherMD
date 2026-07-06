## Context

AetherMD 的 AI-native workflow 在 Step 1 已允许跳过 OpenSpec，但缺少 Maintenance、Quick Change、Spec Change 三条中间路径的规范定义与专用 skill。Agent 容易在「直接改代码」与「完整九步流程」之间二选一，中间态不可审查、不可升级。

本 change 自身属于 **Full Change**：触及 workflow semantics、新增多个 workflow skill、修改 `engineering-workflow` requirement。

## Goals / Non-Goals

**Goals:**

- 引入四条 Workflow Path Classification，在 Discover 阶段显式输出。
- 为 Quick Change 与 Spec Change 提供 constrained execution path 与最小审查产物。
- 定义强制升级 ladder，禁止通过降级 path 逃避审查。
- 保持 Full Change 路径完全不变。

**Non-Goals:**

- 不放宽 architecture、SDK、ADR、CI guardrail。
- 不允许 agent 无结构化约束地自由实现。
- 轻量路径不是绕过 OpenSpec / Superpowers 验证的例外通道。

## Decisions

### Decision 1: 四 path 命名

采用 Maintenance / Quick Change / Spec Change / Full Change，不使用 L0–L3 编号，避免与历史草案混淆。

### Decision 2: OpenSpec 必要性与产物厚度分离

| Path         | OpenSpec   | 产物厚度                                           |
| ------------ | ---------- | -------------------------------------------------- |
| Maintenance  | 否         | PR 最小 traceability                               |
| Quick Change | 否         | scoped branch + 结构化 PR + validation             |
| Spec Change  | 是（轻量） | change-brief + delta + 单 task                     |
| Full Change  | 是（完整） | proposal + design + delta + tasks + plan + 多 task |

### Decision 3: Spec Change 轻量 OpenSpec 产物

Spec Change 使用 `change-brief.md`（合并 proposal/design 摘要）+ delta spec，不要求独立 `proposal.md`、`design.md`、`tasks.md`。仍委托 `openspec-propose` / `openspec-apply-change` 建立 change 目录。

### Decision 4: 升级 ladder

路径只能向上升级：`Maintenance → Quick Change → Spec Change → Full Change`。执行中 scope 扩大必须暂停并重新 Discover。

### Decision 5: workflow semantics 一律 Full Change

以下视为 workflow semantics，Discover 不得分类为 Maintenance / Quick Change / Spec Change：

- 修改 path classification、升级 ladder、OpenSpec 必填条件
- 修改 task loop、TDD/validation 必填条件
- 新增/删除 workflow skill 或改变 skill 间路由
- 修改 `engineering-workflow` requirement 的 SHALL/MUST 语义

## Path Contracts

### Maintenance Path

- **允许:** typo、坏链、纯格式、无语义 docs 清理
- **禁止:** `packages/**`、`openspec/**`、`.skills/**`、ADR、任何语义变更
- **产物:** PR `## Workflow Traceability` 最小字段
- **升级:** 语义 / 受保护路径 → Quick Change 或更高

### Quick Change Path

- **允许:** 单点 bug fix、小范围 docs clarification、无 public contract 的 chore/refactor
- **禁止:** protected boundaries、需 OpenSpec delta 的 spec wording、workflow semantics
- **Skill:** `aether-workflow-quick-change`
- **委托:** `test-driven-development`（有测试入口）、`verification-before-completion`
- **升级:** spec wording、多文件扩散、public export → Spec Change 或 Full Change

### Spec Change Path

- **允许:** 单 capability delta；1 task 可完成的 localized 实现/docs
- **禁止:** 多 task、parallel wave、architecture/SDK/ADR/CI/workflow semantics
- **Skills:** `aether-workflow-create-spec-change` → `aether-workflow-execute-spec-change`
- **OpenSpec:** `change-brief.md` + `specs/<capability>/spec.md`
- **Superpowers:** 单 task + validation + 轻量 review；无 plan、无 task loop
- **升级:** 第二 task 需求 → Full Change

### Full Change Path

保持现有 Step 2–9 不变。

## Workflow Semantics 判例

| 场景                                                    | Path         |
| ------------------------------------------------------- | ------------ |
| 修复 README typo                                        | Maintenance  |
| 修复 docs 段落表述（有语义）                            | Quick Change |
| 单包单文件 bug + 测试                                   | Quick Change |
| 更新 `engineering-workflow` 一条 requirement（单 task） | Spec Change  |
| 新增 workflow skill 并改路由                            | Full Change  |
| 本 change（四 path 体系）                               | Full Change  |

## PR Traceability 模板

见 `aether-workflow-quick-change/assets/pr-traceability-template.md` 与 `docs/community/git-workflow.md`。

## Risks / Trade-offs

- 四 path 边界复杂 → design 判例表 + Discover `why sufficient` + escalation triggers
- Spec Change 被滥用 → 硬升级规则 + execute-spec-change 第二 task 暂停
- change-brief 为 Aether 扩展 artifact → create-spec-change 仍委托 OpenSpec 底层工具

## Open Questions

- Spec Change 允许 touch 单文件 `packages/**`（默认允许，需 validation）。
- GitHub Action PR-body lint 暂不纳入本 change；本地 `pnpm workflow:pr-check` 先行。

## Branch

- `docs/add-workflow-path-classification`
