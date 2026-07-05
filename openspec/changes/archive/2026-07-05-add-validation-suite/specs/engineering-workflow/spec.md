## ADDED Requirements

### Requirement: M6 validation gates participate in root check pipeline

When the M6 validation suite adds manifest consistency checks or examples TypeScript checks, those checks SHALL be executed as part of root `pnpm check` through the workspace turbo `check` pipeline. A failing M6 validation gate SHALL cause `pnpm check` to fail.

References:

- `docs/architecture/ci-checklist.md`
- `docs/engineering/test-strategy.md`
- `AI_NATIVE_ENGINEERING_WORKFLOW.md`

#### Scenario: Manifest consistency gate fails check pipeline

- **GIVEN** `SUPPORTED_MANIFEST_VERSIONS` drifts from `docs/sdk/manifest.md`
- **WHEN** `pnpm check` runs at the repository root
- **THEN** the check pipeline fails before merge

#### Scenario: Examples typecheck gate fails check pipeline

- **GIVEN** `examples/headless-gfm` has a TypeScript error
- **WHEN** `pnpm check` runs at the repository root
- **THEN** the check pipeline fails before merge
