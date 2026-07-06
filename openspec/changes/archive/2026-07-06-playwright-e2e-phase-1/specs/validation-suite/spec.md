## ADDED Requirements

### Requirement: Playwright browser E2E Phase 1 covers block-morphing demo

The repository SHALL include Playwright browser E2E under `e2e/playwright/` that exercises `examples/block-morphing` in real Chromium. The suite SHALL verify smoke boot, Block Focus (single-block source state), Instant Morphing (source edit and blur re-render), and GateLock regression (parent rerender preserves edited content). Root scripts `e2e:install` and `e2e:test` SHALL run the suite after workspace build.

CI SHALL include an `e2e-playwright` job that runs the same suite. The job SHALL be **non-blocking** (`continue-on-error: true`) in Phase 1 and SHALL upload `playwright-report/` and `test-results/` artifacts on completion.

References:

- `docs/engineering/test-strategy.md`
- `docs/architecture/product-experience-spec.md`
- `docs/adr/009-release-governance.md`
- `.superpowers/plans/m7-release-prep.md`

#### Scenario: Playwright smoke boots block-morphing demo

- **GIVEN** the workspace is installed and built
- **WHEN** a maintainer runs `pnpm e2e:test`
- **THEN** the block-morphing demo loads in Chromium without error
- **AND** morphing blocks with expected `data-block-type` values are visible

#### Scenario: Block Focus shows source for focused block only

- **GIVEN** the block-morphing demo is loaded
- **WHEN** a test focuses the list block rendered surface
- **THEN** only that block shows `morphing-source`
- **AND** other blocks remain in rendered state

#### Scenario: Instant Morphing re-renders after source blur

- **GIVEN** the list block is in source state
- **WHEN** a test edits list markdown and blurs the source surface
- **THEN** the block returns to rendered state with updated list items

#### Scenario: CI runs Playwright as non-blocking job

- **GIVEN** a pull request triggers CI
- **WHEN** the `e2e-playwright` job runs
- **THEN** it executes `pnpm e2e:test` after `pnpm build`
- **AND** job failure does not block merge in Phase 1
- **AND** Playwright report artifacts are uploaded when the job completes
