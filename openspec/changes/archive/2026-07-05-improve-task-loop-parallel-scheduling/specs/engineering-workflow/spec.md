## ADDED Requirements

### Requirement: Task artifacts carry scheduling metadata

Aether workflow task artifacts SHALL carry explicit scheduling metadata derived from the accepted implementation plan.

#### Scenario: Task template includes dependency metadata

- **GIVEN** a Superpowers task file is created for an Aether workflow change
- **WHEN** the task is written from the workflow task template
- **THEN** the task includes `Depends On`, `Parallel Group`, and `Barrier` fields
- **AND** those fields are filled from the implementation plan or explicitly marked as empty / false

#### Scenario: Plan task breakdown defines scheduling metadata

- **GIVEN** an implementation plan is created for an Aether workflow change
- **WHEN** the plan defines its task breakdown
- **THEN** the task breakdown includes dependency, parallel group, and barrier columns
- **AND** those columns provide the source for task-level scheduling metadata

#### Scenario: Parallel tasks have disjoint allowed files

- **GIVEN** two or more tasks are assigned to the same parallel wave
- **WHEN** the task split is reviewed or executed
- **THEN** their `Allowed Files` entries do not overlap
- **OR** the workflow records a worktree-based strategy before executing them in parallel

### Requirement: Task loop probes host capabilities before execution

Aether workflow task execution SHALL record host execution capabilities before choosing a loop driver or fallback path.

#### Scenario: Capability probe is recorded

- **GIVEN** an accepted implementation plan and task files exist
- **WHEN** `aether-workflow-execute-task-loop` starts
- **THEN** it records whether task/subagent dispatch, `subagent-driven-development`, `dispatching-parallel-agents`, `executing-plans`, and Superpowers CLI / skill fallback are available
- **AND** it records the chosen fallback for unavailable capabilities

#### Scenario: Available subagent capability is used

- **GIVEN** the host supports subagent task dispatch
- **WHEN** the task execution loop starts
- **THEN** the loop uses a subagent-capable driver for task implementation
- **AND** it does not silently fall back to a single-session loop

#### Scenario: Unavailable parallel capability degrades explicitly

- **GIVEN** task metadata would allow wave-parallel execution
- **AND** the host does not support parallel dispatch
- **WHEN** the task execution loop runs
- **THEN** the loop executes sequentially
- **AND** the fallback is recorded in the validation record or loop run log

### Requirement: Task loop supports sequential and wave-parallel drivers

The Step 6.5 task execution loop SHALL support both sequential loop and wave-parallel loop semantics while preserving single-task implementation boundaries.

#### Scenario: Sequential loop remains available

- **GIVEN** a change has three or fewer tasks, chained dependencies, unavailable parallel capability, or no parallel groups
- **WHEN** `aether-workflow-execute-task-loop` runs
- **THEN** it may execute tasks sequentially
- **AND** each task completes implementation, validation, run log, and deviation recording before the next task starts

#### Scenario: Wave-parallel loop dispatches independent tasks

- **GIVEN** a change has four or more tasks with explicit parallel groups
- **AND** dependency, barrier, and allowed-files checks identify independent tasks in the same wave
- **AND** the host supports parallel task dispatch
- **WHEN** `aether-workflow-execute-task-loop` runs in wave-parallel mode
- **THEN** it may dispatch those independent tasks concurrently
- **AND** each dispatched implementer session handles exactly one task file

#### Scenario: Barrier tasks execute serially

- **GIVEN** a task is marked `Barrier: true`
- **WHEN** the task execution loop builds waves
- **THEN** the barrier task is executed only after its prerequisites and prior wave tasks are complete
- **AND** subsequent tasks do not start until the barrier task validation has completed or an accepted deviation is recorded

#### Scenario: Wave completion records validation

- **GIVEN** all tasks in a wave have completed per-task validation
- **WHEN** the coordinator closes the wave
- **THEN** it records wave-level validation or the reason no wave-level validation was applicable
- **AND** final compliance review still runs after all tasks complete

### Requirement: Single-task guardrails distinguish implementer scope from coordinator scheduling

Aether workflow skills SHALL distinguish the guardrail for a single implementer session from the coordinator's ability to dispatch multiple independent task sessions.

#### Scenario: Implementer session handles one task

- **GIVEN** an agent session is executing `aether-workflow-implement-task`
- **WHEN** it edits files
- **THEN** it implements no more than one task file in that session
- **AND** every changed file maps to that task's allowed files or an accepted deviation

#### Scenario: Coordinator may dispatch multiple single-task sessions

- **GIVEN** the task execution loop is coordinating a wave with independent tasks
- **WHEN** all dependency, barrier, allowed-files, and host capability checks pass
- **THEN** the coordinator may dispatch multiple implementer sessions in parallel
- **AND** each implementer still follows `aether-workflow-implement-task` and `aether-workflow-validate-task`
