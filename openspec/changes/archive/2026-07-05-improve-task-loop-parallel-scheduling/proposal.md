## Why

现有 Aether workflow 已经定义了 Docs -> OpenSpec -> Plan -> Task -> Implement -> Validate -> Review -> Archive 的防腐骨架，但 task loop 的实际执行仍主要依赖文件名顺序和自然语言说明。随着 M4+ change 的 task 数量增加，remark / prosemirror 等相互独立 track 会自然出现；如果 workflow 不把依赖、barrier 和 host 能力探测前置，Agent 容易继续串行执行、静默 fallback，或把“单 task 边界”误读为禁止 coordinator 并行调度。

## What Changes

- 为 Superpowers task 模板增加结构化调度字段：`Depends On`、`Parallel Group`、`Barrier`。
- 要求 implementation plan 的 task breakdown 下沉依赖、并行分组和 barrier 信息。
- 更新 task quality rules，使同一 parallel wave 的任务必须具备不交叠的 allowed files，barrier task 必须显式标记。
- 为 Step 6.5 task loop 增加 host capability probe，并要求记录 subagent、parallel dispatch、Superpowers fallback 等能力与降级路径。
- 为 task loop 增加 sequential loop 与 wave-parallel loop 两种 driver 语义；并行只发生在 coordinator dispatch 层，单个 implementer session 仍只能处理一个 task。
- 新增 parallel wave protocol reference，定义 DAG 构建、wave 分层、allowed files 冲突检查、barrier 串行执行和 validation 节点。
- 澄清 `aether-workflow-implement-task` 的 guardrail：禁止单个 agent session 同时实现多个 task，但允许 coordinator 并行派发多个互不冲突的单 task implementer。
- 同步更新 `AI_NATIVE_ENGINEERING_WORKFLOW.md` 的 Step 4 / Step 6.5 说明。

## Capabilities

### New Capabilities

- 无。

### Modified Capabilities

- `engineering-workflow`: 修改 task planning、task creation 与 task execution loop 的调度要求，使依赖、parallel group、barrier、host capability probe 和 wave-parallel execution 成为可审查的 workflow contract。

## Impact

- 影响 `.skills/aether-workflow/` 权威 workflow skill 源，尤其是 create-plan、create-task、execute-task-loop、implement-task 及其模板/reference。
- 影响由 `pnpm skills:sync` 生成的 `.codex/skills/` 与 `.cursor/skills/` host mirrors。
- 影响 `AI_NATIVE_ENGINEERING_WORKFLOW.md` 中 Step 4 与 Step 6.5 的长期流程说明。
- 影响 `openspec/specs/engineering-workflow/spec.md` 的主规格同步路径。
- 不影响 package SemVer、`manifestVersion`、public SDK contracts、runtime public exports、lockfile 或 adapter/core implementation behavior。
