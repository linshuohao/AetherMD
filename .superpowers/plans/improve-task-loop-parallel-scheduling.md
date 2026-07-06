# Improve Task Loop Parallel Scheduling Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: use `aether-workflow-execute-task-loop`（推荐）或 Superpowers `executing-plans` / `subagent-driven-development` 按 task 逐步执行。每个 Superpowers task 绑定本 plan 的一个 Task；步骤使用 checkbox 跟踪。

**Goal:** 让 Aether workflow 的 task plan、task file 与 execute loop 具备可审查的依赖、并行分组、barrier 和 host capability fallback 语义。

**Architecture:** 变更集中在 workflow skill 权威源 `.skills/aether-workflow/`、顶层 workflow 文档和 `engineering-workflow` OpenSpec spec。Host mirrors 只由 `pnpm skills:sync` 生成，不直接维护。并行能力只存在于 coordinator 调度层；implementer 仍执行单 task。

**Tech Stack:** Markdown workflow skills, OpenSpec, Superpowers task records, pnpm skill sync/check scripts.

---

## Change

- OpenSpec change: `improve-task-loop-parallel-scheduling`
- Status: active
- Version impact: no package SemVer, `manifestVersion`, public SDK contracts, package exports, lockfiles, or runtime compatibility changes
- Expected commit scope: `docs(workflow)` or `spec(workflow)` through PR squash

## Source Artifacts

- Proposal: `openspec/changes/improve-task-loop-parallel-scheduling/proposal.md`
- Design: `openspec/changes/improve-task-loop-parallel-scheduling/design.md`
- Delta specs: `openspec/changes/improve-task-loop-parallel-scheduling/specs/engineering-workflow/spec.md`
- High-level tasks: `openspec/changes/improve-task-loop-parallel-scheduling/tasks.md`
- Source docs / ADRs: `AI_NATIVE_ENGINEERING_WORKFLOW.md`, `openspec/specs/engineering-workflow/spec.md`, `.skills/aether-workflow/`

## Implementation Phases

1. Update plan/task scheduling metadata in templates and create-plan/create-task skills.
2. Update execute-task-loop with capability probe, driver selection, wave protocol, and fallback recording.
3. Clarify single implementer guardrails in implement-task and execute-task-loop.
4. Sync long-lived workflow docs/specs, regenerate mirrors, and validate.

## Dependency Order

1. Task 01 -> defines template/source metadata consumed by future task creation.
2. Task 02 -> depends on Task 01 terms and defines loop execution protocol.
3. Task 03 -> depends on Task 02 terminology to clarify coordinator vs implementer scope.
4. Task 04 -> barrier task; syncs docs/specs/mirrors and runs validation after Tasks 01-03.

## Boundary Risks

- Architecture: no runtime architecture change; only engineering workflow contract changes.
- Public contracts: no SDK or package public contract impact.
- Package/versioning: no package metadata or lockfile impact.
- Docs/spec drift: high risk if `.skills/`, `AI_NATIVE_ENGINEERING_WORKFLOW.md`, OpenSpec main spec, and mirrors are not synchronized.

## Validation Matrix

| Phase                | Requirement                                                | Validation                                                                                   | Intuitive Verification                | Notes                                            |
| -------------------- | ---------------------------------------------------------- | -------------------------------------------------------------------------------------------- | ------------------------------------- | ------------------------------------------------ |
| Task metadata        | Task artifacts carry scheduling metadata                   | `rg "Depends On                                                                              | Parallel Group                        | Barrier" .skills/aether-workflow`                | Inspect templates and create skill text | Design-stage validation |
| Loop probe and modes | Task loop probes host capabilities and supports loop modes | `rg "Host Capability Probe                                                                   | wave-parallel                         | parallel-wave-protocol" .skills/aether-workflow` | Inspect protocol for fallback paths     | Design-stage validation |
| Guardrail wording    | Single-task guardrails distinguish implementer/coordinator | `rg "single agent session                                                                    | coordinator" .skills/aether-workflow` | Compare implement-task and execute-loop wording  | Design-stage validation                 |
| Sync and specs       | Mirrors and specs match source                             | `openspec validate improve-task-loop-parallel-scheduling`, `pnpm skills:check`, `pnpm check` | Review changed-file mapping           | Barrier validation                               |

## Task Breakdown

| Task                    | Outcome                                                                                   | Allowed Area                                                                                                                                                                                                                                                 | Validation                                                                                   | Version Impact                                                                                                                 | Depends On                                                                         | Parallel Group | Barrier    |
| ----------------------- | ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------- | -------------- | ---------- |
| 01 Scheduling metadata  | Templates and create-plan/create-task instructions carry scheduling fields                | `.skills/aether-workflow/aether-workflow-create-plan/**`, `.skills/aether-workflow/aether-workflow-create-task/**`                                                                                                                                           | `rg "Depends On                                                                              | Parallel Group                                                                                                                 | Barrier" .skills/aether-workflow/aether-workflow-create-*`                         | none           | none       | metadata | false |
| 02 Loop protocol        | execute-task-loop has capability probe, loop modes, and parallel-wave reference           | `.skills/aether-workflow/aether-workflow-execute-task-loop/**`                                                                                                                                                                                               | `rg "Host Capability Probe                                                                   | wave-parallel                                                                                                                  | parallel-wave-protocol" .skills/aether-workflow/aether-workflow-execute-task-loop` | none           | 01         | loop     | false |
| 03 Guardrail wording    | implement-task and execute-loop distinguish implementer session from coordinator dispatch | `.skills/aether-workflow/aether-workflow-implement-task/**`, `.skills/aether-workflow/aether-workflow-execute-task-loop/**`                                                                                                                                  | `rg "single agent session                                                                    | coordinator" .skills/aether-workflow/aether-workflow-implement-task .skills/aether-workflow/aether-workflow-execute-task-loop` | none                                                                               | 02             | guardrails | false    |
| 04 Docs sync validation | Long-lived docs/specs updated, mirrors regenerated, validation run                        | `AI_NATIVE_ENGINEERING_WORKFLOW.md`, `openspec/specs/engineering-workflow/spec.md`, `.codex/skills/**`, `.cursor/skills/**`, `openspec/changes/improve-task-loop-parallel-scheduling/tasks.md`, `.superpowers/runs/improve-task-loop-parallel-scheduling/**` | `openspec validate improve-task-loop-parallel-scheduling`, `pnpm skills:check`, `pnpm check` | main OpenSpec spec/docs only; no package version impact                                                                        | 01, 02, 03                                                                         | validation     | true       |

## Review Focus

- Changed files must map to one of the four tasks above.
- Tasks must map to OpenSpec requirements in `engineering-workflow`.
- `.codex/skills/` and `.cursor/skills/` changes must be generated from `.skills/aether-workflow/`.
- Public SDK/Core/Adapter contracts must remain unchanged.
- Parallel dispatch language must not weaken single task implementer scope.

## Open Questions

- none
