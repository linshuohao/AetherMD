## 1. Task scheduling metadata

- [x] 1.1 Update the implementation plan template so `Task Breakdown` includes `Depends On`, `Parallel Group`, and `Barrier`.
- [x] 1.2 Update the task template so generated task files include `Depends On`, `Parallel Group`, and `Barrier`.
- [x] 1.3 Update `aether-workflow-create-plan` and `aether-workflow-create-task` instructions so scheduling metadata is produced from the plan and copied into task files.
- [x] 1.4 Update task quality rules so same-wave tasks require disjoint `Allowed Files`, and barrier tasks must be explicitly marked.

## 2. Task loop execution model

- [x] 2.1 Add a host capability probe requirement to `aether-workflow-execute-task-loop`.
- [x] 2.2 Add sequential loop and wave-parallel loop driver selection rules to `aether-workflow-execute-task-loop`.
- [x] 2.3 Add `parallel-wave-protocol.md` with DAG construction, wave grouping, allowed-files conflict checks, barrier execution, wave validation, and worktree fallback guidance.
- [x] 2.4 Clarify validation/run-log recording for capability fallbacks and wave completion.

## 3. Single-task guardrail wording

- [x] 3.1 Update `aether-workflow-implement-task` so “do not process multiple tasks” clearly applies to one implementer session.
- [x] 3.2 Update execute-loop guardrails so coordinator-level parallel dispatch is allowed only for independent single-task implementer sessions.

## 4. Docs, specs, sync, and validation

- [x] 4.1 Update `AI_NATIVE_ENGINEERING_WORKFLOW.md` Step 3/4/6.5 text to describe scheduling metadata and loop modes.
- [x] 4.2 Update `openspec/specs/engineering-workflow/spec.md` with the accepted task scheduling and capability-probe requirements.
- [x] 4.3 Run `pnpm skills:sync` and verify generated `.codex/skills/` and `.cursor/skills/` mirrors are updated from `.skills/aether-workflow/`.
- [x] 4.4 Run `openspec validate improve-task-loop-parallel-scheduling`, `pnpm skills:check`, and `pnpm check`.
