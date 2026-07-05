# Validation Suite Spec

## Purpose

M6 validation suite baseline: headless GFM integration proof (`examples/headless-gfm`), publish preparation metadata without npm publish, G11/G6/G5 CI gates, `createEditor` startup abort regression coverage, and G12 v1.0 roadmap gap documentation.

## Requirements

### Requirement: Headless GFM example package demonstrates integration path

The workspace SHALL include `examples/headless-gfm` as a private workspace package that runs in Node without a UI. The example SHALL use `createEditor` from `@aether-md/core` with `createGfmPreset()` and explicit Parser, Serializer, and Engine adapter wiring consistent with M4.5 headless integration patterns. The example SHALL NOT depend on React or a browser DOM.

References:

- `docs/adr/009-release-governance.md`
- `docs/engineering/mvp-implementation-plan.md`
- `docs/architecture/roadmap.md`

#### Scenario: Headless example runs from workspace

- **GIVEN** the workspace is installed and built
- **WHEN** a maintainer runs the `examples/headless-gfm` start script
- **THEN** the script completes without error using `createEditor` and `createGfmPreset()`
- **AND** the example demonstrates a headless GFM Markdown round-trip or equivalent success output

#### Scenario: Headless example is private and not published

- **GIVEN** M6 validation suite implementation
- **WHEN** package manifests are reviewed
- **THEN** `examples/headless-gfm` declares `private: true`
- **AND** the example package is excluded from npm publish matrices in `docs/community/release-process.md`

### Requirement: M6 publish preparation metadata is configured without publishing

M6 SHALL complete ADR 009 publish **preparation** without executing npm publish. The five publish-target packages (`@aether-md/core`, `@aether-md/plugin-remark`, `@aether-md/plugin-prosemirror`, `@aether-md/preset-gfm`, `@aether-md/react`) SHALL declare `license: "MIT"`, `repository`, `files`, and `publishConfig` metadata. The repository root SHALL expose a `changeset:publish` script that invokes Changesets publish. Changesets configuration SHALL define a `linked` version group containing all five packages. Packages SHALL remain `private: true` until M7.

References:

- `docs/adr/009-release-governance.md`
- `docs/community/release-process.md`

#### Scenario: Five packages declare MIT license metadata

- **GIVEN** M6 publish preparation is complete
- **WHEN** each of the five linked packages is inspected
- **THEN** `license` is set to `MIT`
- **AND** `repository`, `files`, and `publishConfig` are present per package layout conventions

#### Scenario: Changesets linked group covers five packages

- **GIVEN** `.changeset/config.json` after M6 implementation
- **WHEN** the linked configuration is read
- **THEN** one linked group includes `@aether-md/core`, `@aether-md/plugin-remark`, `@aether-md/plugin-prosemirror`, `@aether-md/preset-gfm`, and `@aether-md/react`

#### Scenario: Publish script exists but M6 does not publish

- **GIVEN** the repository root `package.json`
- **WHEN** M6 validation suite is complete
- **THEN** a `changeset:publish` script is defined
- **AND** no M6 workflow configures `NPM_TOKEN` or executes npm publish

### Requirement: Supported manifest versions stay consistent with SDK documentation

The repository SHALL enforce that `SUPPORTED_MANIFEST_VERSIONS` exported from `@aether-md/core` matches the supported Manifest version list documented in `docs/sdk/manifest.md`. Official workspace plugins and presets SHALL use a `manifestVersion` contained in `SUPPORTED_MANIFEST_VERSIONS`. This check SHALL fail `pnpm check` when documentation and code drift.

References:

- `docs/sdk/manifest.md`
- `docs/architecture/ci-checklist.md`
- `docs/adr/009-release-governance.md`

#### Scenario: Manifest version constant matches SDK docs

- **GIVEN** `SUPPORTED_MANIFEST_VERSIONS` in `@aether-md/core` and the version table in `docs/sdk/manifest.md`
- **WHEN** the M6 manifest consistency check runs
- **THEN** the check passes if and only if both sources list the same supported versions

#### Scenario: Official packages use supported manifest versions

- **GIVEN** official plugin, preset, and react packages under `packages/`
- **WHEN** the M6 manifest consistency check runs
- **THEN** each package Manifest `metadata.manifestVersion` is included in `SUPPORTED_MANIFEST_VERSIONS`

### Requirement: Examples package passes TypeScript noEmit check in CI

The M6 validation suite SHALL ensure `examples/headless-gfm` passes `tsc --noEmit` as the primary G6 gate. The example typecheck task SHALL participate in root `pnpm check` through the workspace turbo pipeline.

References:

- `docs/adr/009-release-governance.md`
- `docs/architecture/ci-checklist.md`
- `docs/engineering/test-strategy.md`

#### Scenario: Headless example typechecks in check pipeline

- **GIVEN** M6 validation suite implementation is complete
- **WHEN** `pnpm check` runs at the repository root
- **THEN** `examples/headless-gfm` `typecheck` (`tsc --noEmit`) succeeds

#### Scenario: Existing M1 through M5 tests remain green

- **GIVEN** M6 adds validation gates and the headless example
- **WHEN** `pnpm check` runs at the repository root
- **THEN** all existing workspace package build, typecheck, and test tasks continue to succeed

### Requirement: Editor startup abort paths are covered by integration regression tests

M6 SHALL add or consolidate `createEditor` integration tests that verify fatal `CoreError` startup abort for wired bootstrap failures, including unsupported `metadata.manifestVersion` and duplicate `metadata.name`. M6 SHALL retain unit coverage that `createDefaultConflictResolver` aborts `schema`-type conflicts. M6 SHALL NOT require compile-layer schema merge implementation solely to satisfy this requirement.

References:

- `docs/architecture/ci-checklist.md`
- `docs/sdk/conflict-resolution.md`
- `docs/engineering/mvp-implementation-plan.md`

#### Scenario: Unsupported manifest version aborts createEditor

- **GIVEN** an `EditorConfig` plugin Manifest with unsupported `metadata.manifestVersion`
- **WHEN** `createEditor` is invoked
- **THEN** startup rejects with fatal `CoreError`
- **AND** no running `AetherEditor` instance is returned

#### Scenario: Duplicate plugin name aborts createEditor

- **GIVEN** two plugins with the same `metadata.name`
- **WHEN** `createEditor` is invoked
- **THEN** startup rejects with fatal `CoreError`

#### Scenario: Default resolver aborts schema conflicts at unit level

- **GIVEN** `createDefaultConflictResolver()`
- **WHEN** `resolve` is called with `type: "schema"` and conflicting values
- **THEN** the resolution strategy is `abort`
- **AND** no winner is selected

### Requirement: v1.0 roadmap gap is explicitly documented for G12

M6 SHALL update project documentation to explicitly state the gap between v1.0 roadmap "must implement" capabilities and the current implementation baseline. The primary documentation anchor SHALL be `docs/project-status.md`, with cross-reference from `docs/architecture/roadmap.md`. Deferred items SHALL include compile-layer schema merge, full ConflictResolver integration, History, Selection, Clipboard, and PermissionGuard unless already implemented.

References:

- `docs/adr/009-release-governance.md`
- `docs/architecture/roadmap.md`
- `docs/project-status.md`

#### Scenario: Project status lists v1.0 gaps

- **GIVEN** M6 documentation sync is complete
- **WHEN** a reader opens `docs/project-status.md`
- **THEN** a dedicated section lists known gaps between v1.0 roadmap requirements and current implementation
- **AND** the section references `docs/architecture/roadmap.md`

#### Scenario: CI checklist reflects enabled M6 gates

- **GIVEN** M6 validation gates that are automated in CI
- **WHEN** `docs/architecture/ci-checklist.md` is updated
- **THEN** completed items for manifest consistency, examples typecheck, and startup abort regression are checked or annotated per M6 scope notes

### Requirement: Release process documents M6 preparation status

`docs/community/release-process.md` SHALL reflect M6 publish preparation progress, including linked Changesets configuration, package metadata readiness, and the explicit statement that npm publish remains deferred to M7.

References:

- `docs/community/release-process.md`
- `docs/adr/009-release-governance.md`

#### Scenario: Release process shows M6 prep without publish

- **GIVEN** M6 publish preparation is complete
- **WHEN** a reader opens `docs/community/release-process.md`
- **THEN** the M6 preparation stage is marked complete or in progress with concrete artifacts listed
- **AND** M7 publish steps remain marked as not started
