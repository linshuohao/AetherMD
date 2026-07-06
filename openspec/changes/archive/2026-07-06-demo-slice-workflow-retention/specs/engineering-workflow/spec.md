## ADDED Requirements

### Requirement: Discover distinguishes demo slice from public contract implementation

`aether-workflow-discover-context` SHALL classify demo and example slice work separately from public contract or new publishable package implementation. Changes limited to `examples/**` and demo-necessary fixes in `packages/react` or adapter packages **without** public export or `openspec/specs/**` main spec semantic changes SHALL default to **Spec Change** unless a single task cannot complete the slice. Example-only documentation, styling, or README updates without behavior changes MAY use **Quick Change**.

References:

- `docs/engineering/demo-slice-delivery-program.md`
- `AI_NATIVE_ENGINEERING_WORKFLOW.md`

#### Scenario: React basic demo slice defaults to Spec Change

- **GIVEN** a request improves `examples/react-basic` perceivable editing within PR0-frozen boundaries
- **WHEN** Discover classifies the request
- **THEN** the default path is Spec Change unless escalation triggers apply
- **AND** the agent does not default to Full Change solely because runtime editor behavior is touched

#### Scenario: Public contract implementation still requires Full Change

- **GIVEN** a request adds or changes public SDK exports, Core API, Manifest, or main spec capability semantics
- **WHEN** Discover classifies the request
- **THEN** the path is Full Change
- **AND** demo slice downgrade rules do not apply

### Requirement: Archive compresses completed Superpowers execution details

`aether-workflow-archive-change` SHALL, after successful OpenSpec archive, move completed Superpowers task files, plan files, and review files for the archived change into `.superpowers/archive/<YYYY-MM-DD>-<change>/` while preserving `final-report.md` and `validation.md` (and optional `deviations.md`) in that archive directory. Active `.superpowers/tasks/`, `.superpowers/plans/`, and `.superpowers/reviews/` SHALL contain only in-progress changes.

References:

- `AI_NATIVE_ENGINEERING_WORKFLOW.md`
- `docs/engineering/demo-slice-delivery-program.md`

#### Scenario: Archived change tasks leave active directories

- **GIVEN** a completed change is archived through the archive workflow step
- **WHEN** Superpowers retention runs
- **THEN** `.superpowers/tasks/<change>/` is removed or relocated under `.superpowers/archive/<date>-<change>/`
- **AND** `.superpowers/plans/<change>.md` and `.superpowers/reviews/<change>.md` are removed or relocated similarly
- **AND** `final-report.md` remains available under the archive directory

#### Scenario: Active changes retain full Superpowers artifacts

- **GIVEN** a change is still in progress
- **WHEN** Superpowers directories are inspected
- **THEN** that change's task, plan, and review artifacts remain in active paths
- **AND** retention is not applied until archive completes
