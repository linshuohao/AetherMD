# Validation Suite Spec

## Purpose

M6 validation suite baseline: headless GFM integration proof (`examples/headless-gfm`), React Shell integration demo (`examples/react-basic`), publish preparation metadata without npm publish, G11/G6/G5 CI gates, `createEditor` startup abort regression coverage, and G12 v1.0 roadmap gap documentation.

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

### Requirement: React basic example package demonstrates React Shell integration path

The workspace SHALL include `examples/react-basic` as a private workspace package that runs in a browser with a minimal Vite + React setup. The example SHALL use `AetherEditorRoot`, `AetherEditorContent`, and `useAetherEditor` from `@aether-md/react` with `createGfmPreset()` and explicit Parser, Serializer, and Engine adapter wiring consistent with M4.5 and M5 React Shell integration patterns. The example SHALL demonstrate controlled `value` and `onChange` props with Shell GateLock behavior (`prevValue === nextValue` MUST NOT reset the document). The example SHALL NOT be published to npm.

References:

- `docs/adr/009-release-governance.md`
- `docs/community/release-process.md`
- `docs/architecture/package-layout.md`
- `openspec/specs/react-shell/spec.md`

#### Scenario: React example runs locally from workspace

- **GIVEN** the workspace is installed and built
- **WHEN** a maintainer runs the `examples/react-basic` dev script
- **THEN** a browser-rendered editor loads using `@aether-md/react` with `createGfmPreset()` wiring
- **AND** the user can edit Markdown in the mounted view

#### Scenario: React example demonstrates controlled value and GateLock

- **GIVEN** `examples/react-basic` is running with a controlled `value` prop
- **WHEN** a parent component rerenders without changing the `value` string
- **THEN** the editor session is not reset
- **AND** the example UI makes the GateLock demonstration observable to the maintainer

#### Scenario: React example is private and not published

- **GIVEN** `add-react-basic-example` implementation is complete
- **WHEN** package manifests are reviewed
- **THEN** `examples/react-basic` declares `private: true`
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

The validation suite SHALL ensure `examples/headless-gfm` and `examples/react-basic` each pass `tsc --noEmit` as G6 gates. Each example `typecheck` task SHALL participate in root `pnpm check` through the workspace turbo pipeline.

References:

- `docs/adr/009-release-governance.md`
- `docs/architecture/ci-checklist.md`
- `docs/engineering/test-strategy.md`

#### Scenario: Headless example typechecks in check pipeline

- **GIVEN** M6 validation suite implementation is complete
- **WHEN** `pnpm check` runs at the repository root
- **THEN** `examples/headless-gfm` `typecheck` (`tsc --noEmit`) succeeds

#### Scenario: React basic example typechecks in check pipeline

- **GIVEN** `add-react-basic-example` implementation is complete
- **WHEN** `pnpm check` runs at the repository root
- **THEN** `examples/react-basic` `typecheck` (`tsc --noEmit`) succeeds

#### Scenario: Existing M1 through M6 tests remain green

- **GIVEN** the validation suite adds or extends example typecheck gates
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

### Requirement: React basic demo slice north star acceptance is frozen and verified

The repository SHALL treat `examples/react-basic` as the north star browser demo per `docs/engineering/demo-slice-delivery-program.md`. Maintainers SHALL be able to run `pnpm --filter @aether-md/example-react-basic dev` and continuously edit a frozen GFM subset (heading, strong emphasis, list, link) without GateLock document reset when the controlled `value` is unchanged.

`@aether-md/react` SHALL include integration tests mirroring the controlled Shell layout that verify:

1. **ProseMirror user input path** — keyboard-equivalent edits through mounted `AetherEditorContent` update markdown preview for paragraph, heading, and list-item paragraph surfaces.
2. **Programmatic dispatch path** — consecutive `core:replaceText` edits and GateLock preservation across parent rerender (existing `demo-slice-pr0-acceptance` coverage).

CI MUST enforce both paths where automatable; browser maintainer sign-off remains required before M7 demo sign-off but is not a CI gate in this change.

References:

- `docs/engineering/demo-slice-delivery-program.md`
- `examples/react-basic/README.md`
- `openspec/changes/archive/2026-07-06-demo-slice-react-basic-pr0/baseline-record.md`

#### Scenario: Maintainer can start the browser demo from workspace

- **GIVEN** the workspace is installed and built per `examples/react-basic/README.md`
- **WHEN** a maintainer runs `pnpm --filter @aether-md/example-react-basic dev`
- **THEN** a browser-rendered editor loads without startup error
- **AND** initial content showcases heading, strong emphasis, list, and link GFM structures

#### Scenario: ProseMirror typing updates markdown preview in CI

- **GIVEN** a mounted controlled Shell with `AetherEditorContent` and markdown preview (mirroring `examples/react-basic`)
- **WHEN** tests apply ProseMirror `insertText` (or equivalent user-input transactions) to edit plain paragraph, heading, and list-item paragraph content
- **THEN** the preview reflects the typed text after each edit sequence
- **AND** adjacent strong emphasis and link marks remain structurally stable where the fixture includes them

#### Scenario: Demo slice dispatch acceptance remains enforced in CI

- **GIVEN** `demo-slice-typing-sync` implementation is complete
- **WHEN** `pnpm --filter @aether-md/react test` runs
- **THEN** `demo-slice-pr0-acceptance.integration.test.tsx` passes
- **AND** existing React Shell and GateLock integration tests continue to pass

#### Scenario: Maintainer browser sign-off is documented

- **GIVEN** CI typing and dispatch tests pass
- **WHEN** a maintainer follows `examples/react-basic/README.md` sign-off steps
- **THEN** continuous keyboard typing in the browser demo is confirmed before claiming demo sign-off for M7
- **AND** any remaining browser-only gaps are recorded in `baseline-record.md` rather than implied as complete by CI alone
