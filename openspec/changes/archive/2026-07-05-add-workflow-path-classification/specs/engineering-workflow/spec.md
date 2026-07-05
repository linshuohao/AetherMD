## ADDED Requirements

### Requirement: Discover classifies workflow execution path

`aether-workflow-discover-context` SHALL classify each request into one of Maintenance, Quick Change, Spec Change, or Full Change, and report why that path is sufficient plus escalation triggers before recommending the next workflow skill.

References:

- `AI_NATIVE_ENGINEERING_WORKFLOW.md`
- `.skills/aether-workflow/aether-workflow-discover-context/SKILL.md`

#### Scenario: Discover reports classification and escalation triggers

- **GIVEN** a maintainer or agent submits a workflow-scoped request
- **WHEN** `aether-workflow-discover-context` completes Step 1
- **THEN** the output includes workflow path classification, why the path is sufficient, escalation triggers, open_spec_required, and recommended next workflow skill
- **AND** the output includes request classification, source docs found, and missing docs or uncertainty

#### Scenario: Workflow semantics changes require full change

- **GIVEN** a request changes workflow path rules, workflow skill routing, task loop guardrails, or `engineering-workflow` SHALL/MUST semantics
- **WHEN** Discover classifies the request
- **THEN** the workflow path classification is Full Change
- **AND** open_spec_required is yes

### Requirement: Maintenance path skips workflow artifacts

The Maintenance path SHALL allow typo, broken-link, and formatting-only edits without OpenSpec or Superpowers workflow artifacts when protected boundaries are not crossed.

References:

- `AI_NATIVE_ENGINEERING_WORKFLOW.md`
- `docs/community/git-workflow.md`
- `.skills/aether-workflow/aether-workflow-discover-context/SKILL.md`

#### Scenario: Maintenance path skips workflow artifacts

- **GIVEN** a request is classified as Maintenance
- **WHEN** the agent completes the change
- **THEN** no OpenSpec change artifacts or Superpowers plan/task artifacts are required
- **AND** the PR includes minimal Workflow Traceability fields for the Maintenance path

### Requirement: Quick change uses structured PR traceability

The Quick Change path SHALL require a scoped branch, structured PR traceability, explicit validation, and delegation to verification skills without creating OpenSpec or Superpowers workflow artifacts.

References:

- `AI_NATIVE_ENGINEERING_WORKFLOW.md`
- `docs/community/git-workflow.md`
- `.skills/aether-workflow/aether-workflow-quick-change/SKILL.md`

#### Scenario: Quick change uses structured PR traceability

- **GIVEN** a request is classified as Quick Change
- **WHEN** `aether-workflow-quick-change` completes
- **THEN** the agent records allowed scope, changed files, validation command results, and version impact in PR traceability
- **AND** the agent does not create OpenSpec change artifacts or Superpowers plan/task artifacts

#### Scenario: Quick change touching protected scope escalates

- **GIVEN** a Quick Change execution touches protected paths, public exports, or requires OpenSpec spec wording
- **WHEN** scope guards detect the violation
- **THEN** the agent pauses and escalates to Spec Change or Full Change
- **AND** the agent does not continue on the Quick Change path

### Requirement: Spec change uses lightweight OpenSpec artifacts

The Spec Change path SHALL use lightweight OpenSpec artifacts (`change-brief.md` and delta specs) with exactly one Superpowers task and without plan files or task execution loops.

References:

- `AI_NATIVE_ENGINEERING_WORKFLOW.md`
- `.skills/aether-workflow/aether-workflow-create-spec-change/SKILL.md`
- `.skills/aether-workflow/aether-workflow-execute-spec-change/SKILL.md`

#### Scenario: Spec change creates change-brief and delta spec without full proposal design tasks

- **GIVEN** a request is classified as Spec Change
- **WHEN** `aether-workflow-create-spec-change` completes
- **THEN** the change directory contains `change-brief.md` and `specs/<capability>/spec.md`
- **AND** the change directory does not require separate `proposal.md`, `design.md`, or `tasks.md`

#### Scenario: Spec change executes exactly one Superpowers task without plan or task loop

- **GIVEN** a Spec Change has one accepted task file
- **WHEN** `aether-workflow-execute-spec-change` runs
- **THEN** it delegates single-task implement and validate skills for that one task
- **AND** it does not invoke plan creation or task execution loop skills

### Requirement: Spec change escalates to full change when scope expands

The Spec Change path SHALL pause and escalate to Full Change when a second task, parallel wave, or protected boundary crossing is required.

References:

- `.skills/aether-workflow/aether-workflow-execute-spec-change/SKILL.md`
- `.skills/aether-workflow/aether-workflow-create-change/SKILL.md`

#### Scenario: Second task requirement triggers full change escalation

- **GIVEN** a Spec Change is in progress with one task file
- **WHEN** implementation reveals a second independent task is required
- **THEN** the agent pauses Spec Change execution
- **AND** the agent escalates to Full Change with plan and multi-task artifacts

### Requirement: Full change path preserves existing workflow stack

The Full Change path SHALL preserve the existing OpenSpec proposal/design/delta/tasks workflow and Superpowers plan, multi-task, task loop, compliance review, docs/spec sync, and archive requirements.

References:

- `AI_NATIVE_ENGINEERING_WORKFLOW.md`
- `.skills/aether-workflow/aether-workflow-create-change/SKILL.md`
- `.skills/aether-workflow/aether-workflow-create-plan/SKILL.md`
- `.skills/aether-workflow/aether-workflow-execute-task-loop/SKILL.md`

#### Scenario: Full change still requires plan task loop and archive artifacts

- **GIVEN** a request is classified as Full Change
- **WHEN** the change completes through the AI-native workflow
- **THEN** the change includes OpenSpec proposal, design, delta specs, and tasks
- **AND** the change includes Superpowers plan, multiple tasks or task loop execution, compliance review, and archive artifacts
