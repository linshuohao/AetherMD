## Context

AetherMD 当前的 workflow 已经把长期事实、变更规格、执行计划、单 task 实现、验证、合规审查和归档分成不同产物层。这个骨架保护了架构边界，但 Step 3/4/6.5 之间仍存在一个执行语义缺口：plan 可以写 `Dependency Order`，task 文件却没有结构化依赖字段；execute-task-loop 声明 preferred driver 是 `subagent-driven-development`，但没有 upfront host capability probe，也没有 wave-parallel 调度协议。

这个 change 只调整 workflow skill、模板、reference 和长期 workflow 文档，不改变 Core、SDK、Adapter 或 package runtime 行为。

## Goals / Non-Goals

**Goals:**

- 让 plan 中的依赖、并行分组和 barrier 信息下沉到 task 文件。
- 让 task loop 在启动前明确记录 host 支持的 subagent、parallel dispatch、Superpowers CLI / skill fallback 能力。
- 让 execute-task-loop 支持 sequential loop 与 wave-parallel loop 两种可审查 driver。
- 保持单 task 边界：并行只允许 coordinator dispatch 多个单 task implementer，不允许一个 implementer session 混做多个 task。
- 为 parallel wave 增加 allowed files 不交叠、barrier 串行、wave validation 和 worktree fallback 的 guardrail。

**Non-Goals:**

- 不实现新的自动 DAG parser 或 CLI。
- 不要求所有历史 `.superpowers/tasks/` 回填新字段。
- 不改变 OpenSpec CLI、Superpowers plugin 或 Codex host 的实际能力。
- 不放宽 Step 5 / Step 6 的 TDD、validation、deviation 和 compliance review 要求。
- 不改变 package SemVer、`manifestVersion`、public SDK contracts、runtime exports 或 lockfile。

## Decisions

### Decision 1: 在 task 模板中加入调度元数据

新增 `Depends On`、`Parallel Group`、`Barrier` 字段。`Depends On` 记录 task id 或空值；`Parallel Group` 标记可同 wave 调度的语义组；`Barrier` 标记必须在前序 wave 完成后串行执行、或在其后阻断后续 task 的节点。

替代方案是继续把依赖写在 `Implementation Notes` 或 `Dependency Order` prose 中。该方案对人类可读，但对 coordinator 不够稳定，无法可靠判断 wave。

### Decision 2: Plan 是 task DAG 的来源

`implementation-plan-template.md` 的 `Task Breakdown` 增加 `Depends On | Parallel Group | Barrier` 列，create-task skill 从 plan 下沉这些字段。这样 task 文件不自行发明调度关系，而是承接 plan 中已经审查过的拆分。

治理类或 workflow-only change 仍然可以保持很小的 plan，但不应跳过 plan 后直接创建 task，因为 task DAG 需要一个可追踪来源。

### Decision 3: execute-task-loop 先探测 host capability

Loop 启动时记录 capability matrix，包括 task/subagent dispatch、`subagent-driven-development`、`dispatching-parallel-agents`、`executing-plans`、Superpowers CLI / skill fallback。能力存在时必须按对应 driver 执行；能力不存在时可以降级，但必须写入 validation 或 loop run log。

替代方案是在 deviation 中事后解释。该方案保留了历史，但不能防止 agent 在可用能力存在时 silent fallback。

### Decision 4: 并行调度是 coordinator 行为，不是单 task guardrail 放宽

`aether-workflow-implement-task` 的 guardrail 改为禁止在单个 agent session 中实现多个 task。`aether-workflow-execute-task-loop` 可以在 wave-parallel mode 中并行 dispatch 多个 implementer，但每个 implementer 仍必须加载 implement/validate skills，并只处理一个 task 文件。

这能同时保留防腐边界和释放 remark / prosemirror 等不交叠 track 的执行效率。

### Decision 5: 默认并行策略是 disjoint files，交叠时才考虑 worktree

同一 wave 内的 task 必须先通过 `Allowed Files` 不交叠检查。若任务必须修改同一文件，默认不并行；只有在维护者明确接受时，才使用 Superpowers `using-git-worktrees` 让每个 implementer 在单独 worktree 中执行，并在 wave 结束后合并与联合验证。

## Risks / Trade-offs

- [Risk] 调度字段增加 task 模板复杂度 → Mitigation: 字段保持三项，允许无依赖 task 填空或 `none`，不引入复杂 DSL。
- [Risk] Host capability probe 可能因不同 host 工具名不同而变成噪声 → Mitigation: 记录 capability/fallback，而不是要求固定 CLI 检测命令。
- [Risk] Agent 误以为 parallel group 可以覆盖 allowed files 冲突 → Mitigation: task quality rules 明确同 wave allowed files 不得交叠；冲突时串行或 worktree。
- [Risk] 并行 task 的 validation 结果更难合并 → Mitigation: 每 task 仍独立 validation，wave 结束增加 wave-level smoke 或 barrier validation。
- [Risk] 历史 task 缺少新字段 → Mitigation: 不要求回填，只有新建 task 和需要 rerun 的历史 task 才适用新字段。

## Migration Plan

1. 更新 `.skills/aether-workflow/` 权威 skill、模板和 reference。
2. 运行 `pnpm skills:sync` 生成 `.codex/skills/` 与 `.cursor/skills/` mirrors。
3. 运行 `pnpm skills:check` 确认 mirror 无 drift。
4. 更新 `AI_NATIVE_ENGINEERING_WORKFLOW.md` 与 `openspec/specs/engineering-workflow/spec.md`。
5. 运行 `openspec validate improve-task-loop-parallel-scheduling` 和 `pnpm check`。

Rollback 策略：回滚本 change 修改的 workflow skill、template、reference、OpenSpec delta 和文档；不需要 runtime data migration。
