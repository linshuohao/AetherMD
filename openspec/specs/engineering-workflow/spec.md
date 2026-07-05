# Engineering Workflow Spec

## Purpose

Define the AetherMD AI-native engineering workflow contract for OpenSpec, Superpowers, workflow skills, host mirrors, task execution, validation, compliance review, and archive traceability.

## Requirements

### Requirement: Workflow skills delegate to installed lower-level tools

Aether workflow skills SHALL delegate OpenSpec lifecycle operations and Superpowers execution operations to the installed lower-level skills or commands before editing workflow artifacts.

References:

- `AI_NATIVE_ENGINEERING_WORKFLOW.md`
- `.codex/skills/openspec-propose/SKILL.md`
- `.codex/skills/openspec-sync-specs/SKILL.md`
- `.codex/skills/openspec-archive-change/SKILL.md`
- `.codex/skills/aether-workflow-create-plan/SKILL.md`
- `.codex/skills/aether-workflow-create-task/SKILL.md`
- `.codex/skills/aether-workflow-execute-task-loop/SKILL.md`

#### Scenario: OpenSpec lifecycle is delegated

- **GIVEN** a workflow step creates, validates, syncs, or archives OpenSpec artifacts
- **WHEN** Codex executes that Aether workflow step
- **THEN** Codex invokes the installed OpenSpec skill or command path first
- **AND** direct edits to `openspec/` artifacts only occur after the OpenSpec layer establishes artifact paths and structure

#### Scenario: Superpowers execution is delegated

- **GIVEN** a workflow step creates a plan, creates tasks, executes tasks, records validation, reviews compliance, or writes a final report
- **WHEN** Codex executes that Aether workflow step
- **THEN** Codex invokes the globally installed Superpowers command or skill first
- **AND** direct edits to `.superpowers/` artifacts only occur as outputs of that Superpowers layer

#### Scenario: Missing lower-level tool pauses the workflow

- **GIVEN** a required OpenSpec or Superpowers lower-level capability is not callable in the current host
- **WHEN** Codex reaches the workflow step that requires it
- **THEN** Codex pauses and reports the tool visibility problem
- **AND** Codex does not silently fall back to hand-writing workflow artifacts

### Requirement: Workflow skills use a single authoritative source

Aether workflow skills SHALL be maintained from a single repository-local authoritative source and synchronized into host-specific skill mirror directories.

References:

- `AI_NATIVE_ENGINEERING_WORKFLOW.md`
- `.skills/aether-workflow/`
- `.codex/skills/`
- `.cursor/skills/`
- `package.json`

#### Scenario: Host mirrors are generated from the authoritative source

- **GIVEN** a project Aether workflow skill is maintained under the authoritative source directory
- **WHEN** the workflow skill sync command runs
- **THEN** the corresponding `.codex/skills/<skill>/` mirror is updated from that source
- **AND** the corresponding `.cursor/skills/<skill>/` mirror is updated from that source
- **AND** generated mirror files identify the authoritative source path

#### Scenario: Skill mirror drift is detected

- **GIVEN** `.codex/skills/` or `.cursor/skills/` differs from the authoritative workflow skill source after rendering
- **WHEN** the workflow skill check command runs locally or in CI
- **THEN** the command fails
- **AND** the output identifies the drifted mirror path

#### Scenario: Direct mirror edits are rejected by workflow review

- **GIVEN** a change modifies `.codex/skills/aether-workflow-*` or `.cursor/skills/aether-workflow-*`
- **WHEN** the compliance review maps changed files to workflow scope
- **THEN** the review verifies the corresponding `.skills/aether-workflow/` source change exists
- **AND** direct mirror-only edits are treated as blockers unless explicitly recorded as generated output repair

### Requirement: Workflow changes start on scoped branches

Aether workflow changes that create OpenSpec artifacts, Superpowers artifacts, implementation code, or long-lived project documentation SHALL start on a scoped Git branch before change artifacts are written.

References:

- `AI_NATIVE_ENGINEERING_WORKFLOW.md`
- `docs/community/git-workflow.md`
- `.codex/skills/aether-workflow-create-change/SKILL.md`
- `.codex/skills/aether-workflow-implement-task/SKILL.md`
- `.codex/skills/aether-workflow-archive-change/SKILL.md`

#### Scenario: Branch is prepared before OpenSpec artifacts

- **GIVEN** a non-trivial request will create or update an OpenSpec change
- **WHEN** Codex enters the change creation step
- **THEN** Codex checks the current branch and `git status --short`
- **AND** Codex ensures the current branch is not `main` before writing OpenSpec artifacts
- **AND** the branch name follows the `<type>/<kebab-topic>` convention from `docs/community/git-workflow.md`

#### Scenario: Branch matches change traceability

- **GIVEN** an OpenSpec change has an associated scoped branch
- **WHEN** Codex creates proposal, design, plan, task, validation, review, or archive artifacts
- **THEN** the workflow output records the current branch
- **AND** the branch topic SHOULD match the OpenSpec change name unless a human records a different rationale

#### Scenario: Unsafe branch creation pauses the workflow

- **GIVEN** Codex is on `main` or on a branch that does not match the intended change
- **WHEN** unrelated dirty files, ambiguous change type, or branch naming conflicts prevent safe branch creation
- **THEN** Codex pauses before writing change artifacts
- **AND** Codex reports the blocking Git state instead of mixing workflow scopes

### Requirement: Workflow steps run version and code management hooks

Each Aether workflow step SHALL run version-management, branch-management, and code-management hooks appropriate to that step before reporting completion.

References:

- `AI_NATIVE_ENGINEERING_WORKFLOW.md`
- `docs/community/git-workflow.md`
- `docs/architecture/compatibility.md`
- `.codex/skills/aether-workflow-create-change/SKILL.md`
- `.codex/skills/aether-workflow-create-task/SKILL.md`
- `.codex/skills/aether-workflow-implement-task/SKILL.md`
- `.codex/skills/aether-workflow-review-compliance/SKILL.md`
- `.codex/skills/aether-workflow-archive-change/SKILL.md`

#### Scenario: Version impact is classified

- **GIVEN** a workflow step may affect package metadata, lockfiles, public exports, Manifest versions, SDK docs, compatibility docs, ADRs, or main OpenSpec specs
- **WHEN** Codex completes that step
- **THEN** the step records whether versioned contracts changed
- **AND** any versioned contract change is covered by OpenSpec, docs, validation, or a recorded follow-up

#### Scenario: Changed files are mapped to workflow scope

- **GIVEN** a workflow step changes repository files
- **WHEN** Codex completes that step
- **THEN** each changed file maps to the current OpenSpec change, Superpowers task, docs reference, or accepted workflow artifact
- **AND** unrelated dirty files are not staged, committed, or reported as part of the step

#### Scenario: Branch scope is checked

- **GIVEN** a workflow step belongs to an active OpenSpec change or Superpowers task
- **WHEN** Codex begins or completes that step
- **THEN** Codex records the current branch
- **AND** Codex flags branches that do not match the active change scope

#### Scenario: Commit and PR readiness is explicit

- **GIVEN** a workflow step prepares a commit, PR, archive, or final report
- **WHEN** Codex reports completion
- **THEN** the report includes branch name, changed-file summary, validation status, deviations, version impact, and suggested Conventional Commit scope
- **AND** staging, commit, push, or PR creation only occurs when explicitly requested

### Requirement: Workflow documents are written in Chinese

OpenSpec changes and Superpowers workflow artifacts for this repository SHALL use Chinese explanatory prose while preserving code identifiers, API names, package names, file paths, and tool-required structural keywords in English.

References:

- `AI_NATIVE_ENGINEERING_WORKFLOW.md`
- `docs/maintenance.md`

#### Scenario: OpenSpec artifacts use Chinese prose

- **GIVEN** a reviewer opens a proposal, design, delta spec, or tasks file for a change
- **WHEN** the reviewer reads explanatory content
- **THEN** prose is written in Chinese
- **AND** code identifiers, API names, package names, file paths, and OpenSpec structural keywords remain English

#### Scenario: Follow-up workflow artifacts use Chinese prose

- **GIVEN** a workflow generates plan, task, validation, review, or archive artifacts
- **WHEN** the artifact contains explanatory content
- **THEN** prose is written in Chinese
- **AND** code identifiers, API names, package names, file paths, and tool-required structural keywords remain English

### Requirement: Task execution loop preserves single-task boundaries

The Step 6.5 task execution loop SHALL orchestrate implementation and validation for one task at a time without loosening Step 5 and Step 6 guardrails.

References:

- `AI_NATIVE_ENGINEERING_WORKFLOW.md`
- `.codex/skills/aether-workflow-execute-task-loop/SKILL.md`

#### Scenario: Tasks execute in order with validation

- **GIVEN** an OpenSpec change has accepted Superpowers task files
- **WHEN** the task execution loop runs
- **THEN** tasks execute in filename order
- **AND** each task records implementation status, validation results, and deviations before the next task starts

#### Scenario: TDD entry point is required or deviated

- **GIVEN** a task is selected for implementation
- **WHEN** Codex begins that task
- **THEN** the task identifies a failing test, contract check, package-boundary check, or design assertion
- **OR** the task records a deviation explaining why no meaningful TDD entry point exists

#### Scenario: Intuitive verification does not replace validation

- **GIVEN** a task defines intuitive verification such as a CLI trace, screenshot, demo path, or manual smoke path
- **WHEN** validation is recorded
- **THEN** intuitive verification is recorded separately
- **AND** it does not replace required automated or design-stage validation

### Requirement: Task artifacts carry scheduling metadata

Aether workflow task artifacts SHALL carry explicit scheduling metadata derived from the accepted implementation plan.

References:

- `AI_NATIVE_ENGINEERING_WORKFLOW.md`
- `.codex/skills/aether-workflow-create-plan/SKILL.md`
- `.codex/skills/aether-workflow-create-task/SKILL.md`

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

References:

- `AI_NATIVE_ENGINEERING_WORKFLOW.md`
- `.codex/skills/aether-workflow-execute-task-loop/SKILL.md`

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

References:

- `AI_NATIVE_ENGINEERING_WORKFLOW.md`
- `.codex/skills/aether-workflow-execute-task-loop/SKILL.md`

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

References:

- `AI_NATIVE_ENGINEERING_WORKFLOW.md`
- `.codex/skills/aether-workflow-implement-task/SKILL.md`
- `.codex/skills/aether-workflow-execute-task-loop/SKILL.md`

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
