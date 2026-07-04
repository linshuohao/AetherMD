# Engineering Workflow Spec

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

### Requirement: Workflow steps run version and code management hooks

Each Aether workflow step SHALL run version-management and code-management hooks appropriate to that step before reporting completion.

References:

- `AI_NATIVE_ENGINEERING_WORKFLOW.md`
- `docs/community/git-workflow.md`
- `docs/architecture/compatibility.md`
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

#### Scenario: Commit and PR readiness is explicit

- **GIVEN** a workflow step prepares a commit, PR, archive, or final report
- **WHEN** Codex reports completion
- **THEN** the report includes changed-file summary, validation status, deviations, version impact, and suggested Conventional Commit scope
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
