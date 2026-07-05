# Parallel Wave Protocol

Use this reference when `aether-workflow-execute-task-loop` considers wave-parallel execution for one small AetherMD change.

Wave-parallel execution is a coordinator behavior. It does not loosen `aether-workflow-implement-task` or `aether-workflow-validate-task`; each implementer session still handles exactly one task file.

## Host Capability Probe

Before selecting a driver, record a capability matrix in `.superpowers/runs/<change>/validation.md` or the loop run log:

| Capability | Available | Fallback |
| --- | --- | --- |
| Task/subagent dispatch | yes/no | `executing-plans` or sequential single-session |
| `subagent-driven-development` | yes/no | `executing-plans` |
| `dispatching-parallel-agents` | yes/no | sequential loop |
| `executing-plans` | yes/no | pause and report missing skill |
| Superpowers CLI / skill fallback | yes/no | Aether skills direct only when the required skill has been loaded |

Rules:

- If subagent dispatch is available, use a subagent-capable driver; do not silently fall back to a single-session loop.
- If parallel dispatch is unavailable, degrade to sequential loop and record the fallback.
- If a required skill cannot be loaded, pause instead of hand-writing execution records as a substitute.

## Build The Task DAG

1. Read every task file for `Depends On`, `Parallel Group`, `Barrier`, `Allowed Files`, `Forbidden Files`, and validation.
2. Treat each task as a node.
3. Add an edge for every `Depends On` entry.
4. Treat `Barrier: true` as a serial node: all prior eligible work must be complete before it starts, and later work waits for it to finish.
5. If dependency metadata is missing or contradictory, pause and repair the task split before implementation.

## Choose Loop Mode

Use **sequential loop** when:

- the change has three or fewer tasks;
- dependencies form a chain;
- task files lack `Parallel Group` metadata;
- the host lacks parallel dispatch;
- allowed files overlap and no worktree strategy is accepted;
- the maintainer requests serial execution.

Use **wave-parallel loop** when:

- the change has four or more tasks;
- task files have explicit `Parallel Group` metadata;
- the DAG has independent tasks in the same wave;
- those tasks have disjoint `Allowed Files`, or a worktree strategy is recorded;
- the host supports `dispatching-parallel-agents`.

## Build Waves

1. Topologically sort the DAG.
2. Group ready nodes with no unmet dependencies into the same wave.
3. Split a wave when tasks have overlapping `Allowed Files`.
4. Split before and after any `Barrier: true` task.
5. Preserve filename order as the tie-breaker inside a wave for reporting.

## Dispatch A Wave

For each task in the wave:

1. Dispatch one implementer session for that task only.
2. The implementer loads and follows `aether-workflow-implement-task`.
3. The validator loads and follows `aether-workflow-validate-task`.
4. The task records `Status`, `Run Log`, `Deviation`, and validation results before the wave closes.

The coordinator must not ask one implementer to process multiple task files.

## Allowed Files And Worktrees

Default strategy: only parallelize tasks with disjoint `Allowed Files`.

If tasks must touch overlapping files:

1. Prefer splitting or serializing the tasks.
2. If parallel execution is still justified, load Superpowers `using-git-worktrees`.
3. Assign each implementer a separate worktree.
4. Merge after the wave.
5. Run joint validation before starting the next wave.

Record the chosen strategy before dispatch.

## Wave Validation

After all tasks in a wave finish:

1. Confirm each task has task-level validation.
2. Run a wave-level smoke command when tasks affect the same package, docs surface, or generated output.
3. If no wave-level validation applies, record why.
4. Do not start the next wave until validation passes or accepted deviations are recorded.

Barrier tasks such as full validation, docs/spec sync, generated mirror sync, compliance preparation, or final report preparation always run serially.
