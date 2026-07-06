## ADDED Requirements

### Requirement: Consumer smoke validates packed package imports

M7 SHALL include a root `consumer:smoke` script that builds the workspace, packs all five linked publish-target packages, installs them into a temporary consumer project via `file:` tarball references, and verifies each package main entry can be imported without error. The script SHALL run as part of CI quality gates before merge to `main`.

References:

- `docs/adr/009-release-governance.md` (G8)
- `docs/community/release-process.md`

#### Scenario: Consumer smoke passes after build

- **GIVEN** the workspace is installed
- **WHEN** a maintainer runs `pnpm consumer:smoke`
- **THEN** all five linked packages pack successfully
- **AND** a temporary consumer project imports each package main entry without throw

### Requirement: Release CI workflow is configured for Changesets publish

M7 SHALL add a GitHub Actions release workflow that uses Changesets to version and publish the five linked packages. Publish SHALL only run in CI with `NPM_TOKEN`. The workflow SHALL document canary prerelease mode (`changeset pre enter canary`) as a maintainer prerequisite.

References:

- `docs/adr/009-release-governance.md` (G10)
- `docs/community/release-process.md`

#### Scenario: Release workflow file exists and documents secrets

- **GIVEN** M7 release engineering is complete
- **WHEN** `.github/workflows/release.yml` is reviewed
- **THEN** it triggers on push to `main` and invokes Changesets publish
- **AND** `NPM_TOKEN` is documented as a required repository secret

### Requirement: Publish-target packages are no longer private

M7 SHALL remove `private: true` from all five linked publish-target packages while keeping `examples/*` private.

#### Scenario: Five packages are publishable

- **GIVEN** M7 metadata changes are complete
- **WHEN** each linked package manifest is inspected
- **THEN** `private: true` is absent
- **AND** `pnpm pack` produces a non-private tarball for each package
