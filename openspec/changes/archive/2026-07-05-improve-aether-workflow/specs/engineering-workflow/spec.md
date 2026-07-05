## ADDED Requirements

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

## MODIFIED Requirements

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

#### Scenario: Branch scope is checked

- **GIVEN** a workflow step belongs to an active OpenSpec change or Superpowers task
- **WHEN** Codex begins or completes that step
- **THEN** Codex records the current branch
- **AND** Codex flags branches that do not match the active change scope

#### Scenario: Changed files are mapped to workflow scope

- **GIVEN** a workflow step changes repository files
- **WHEN** Codex completes that step
- **THEN** each changed file maps to the current OpenSpec change, Superpowers task, docs reference, or accepted workflow artifact
- **AND** unrelated dirty files are not staged, committed, or reported as part of the step

#### Scenario: Commit and PR readiness is explicit

- **GIVEN** a workflow step prepares a commit, PR, archive, or final report
- **WHEN** Codex reports completion
- **THEN** the report includes branch name, changed-file summary, validation status, deviations, version impact, and suggested Conventional Commit scope
- **AND** staging, commit, push, or PR creation only occurs when explicitly requested
