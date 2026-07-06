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

### Requirement: Validation suite distinguishes architecture demo from product north star

The validation suite SHALL distinguish two north-star layers:

1. **Architecture pipeline demo (L1)** — `examples/react-basic` proves React Shell + GFM wiring, GateLock, and markdown preview sync. This is the Demo Slice program outcome.
2. **Product interaction north star (L2)** — a future morphing demo (for example `examples/block-morphing`, name deferred to its change) proves Instant Morphing and Block Focus per `product-experience`.

L1 passing SHALL NOT be interpreted as L2 satisfied. Documentation and project status SHALL state both layers explicitly.

References:

- `docs/engineering/demo-slice-delivery-program.md`
- `docs/architecture/product-experience-spec.md`
- `openspec/specs/product-experience/spec.md`

#### Scenario: Project status lists both north-star layers

- **GIVEN** this change is merged
- **WHEN** a reader opens `docs/project-status.md`
- **THEN** architecture demo delivery (L1) and product morphing north star (L2) are listed separately
- **AND** L2 is marked Slice A delivered or in progress with a link to `product-experience-spec` and `examples/block-morphing`

#### Scenario: React basic README does not claim product morphing

- **GIVEN** `examples/react-basic/README.md`
- **WHEN** a reader evaluates what the example proves
- **THEN** the README describes architecture/pipeline verification
- **AND** the README does not claim Instant Morphing or Block Focus

### Requirement: React basic demo slice north star acceptance is frozen and verified

The repository SHALL treat `examples/react-basic` as the **L1 architecture pipeline browser demo** per `docs/engineering/demo-slice-delivery-program.md`. Maintainers SHALL be able to run `pnpm --filter @aether-md/example-react-basic dev` and continuously edit a frozen GFM subset (heading, strong emphasis, list, link) without GateLock document reset when the controlled `value` is unchanged.

`@aether-md/react` SHALL include integration tests mirroring the controlled Shell layout that verify:

1. **ProseMirror user input path** — keyboard-equivalent edits through mounted `AetherEditorContent` update markdown preview for paragraph, heading, and list-item paragraph surfaces.
2. **Programmatic dispatch path** — consecutive `core:replaceText` edits and GateLock preservation across parent rerender (existing `demo-slice-pr0-acceptance` coverage).

This requirement validates **L1 only**. Product north star **L2** (Instant Morphing / Block Focus) is specified in `product-experience` and SHALL be demonstrated by `examples/block-morphing` after Slice A.

CI MUST enforce both L1 paths where automatable; browser maintainer sign-off remains required before M7 demo sign-off but is not a CI gate for L1.

References:

- `docs/engineering/demo-slice-delivery-program.md`
- `examples/react-basic/README.md`
- `docs/architecture/product-experience-spec.md`
- `examples/block-morphing/README.md`
- `openspec/changes/archive/2026-07-06-demo-slice-react-basic-pr0/baseline-record.md`

#### Scenario: Maintainer can start the browser demo from workspace

- **GIVEN** the workspace is installed and built per `examples/react-basic/README.md`
- **WHEN** a maintainer runs `pnpm --filter @aether-md/example-react-basic dev`
- **THEN** a browser-rendered editor loads without startup error
- **AND** initial content showcases heading, strong emphasis, list, and link GFM structures

#### Scenario: ProseMirror typing updates markdown preview in CI

- **GIVEN** a mounted controlled Shell with `AetherEditorContent` and markdown preview (mirroring `examples/react-basic`)
- **WHEN** integration tests simulate consecutive ProseMirror user input on paragraph, heading, and list-item surfaces
- **THEN** markdown preview reflects the latest edited content for each surface

#### Scenario: GateLock preserves edits across parent rerender in CI

- **GIVEN** a controlled Shell with `value` and `onChange` wired like `examples/react-basic`
- **WHEN** tests edit content and trigger a parent rerender without changing `value`
- **THEN** the document content is preserved
- **AND** markdown preview still reflects the edited content

### Requirement: Block morphing example is part of the validation suite

The workspace SHALL include `examples/block-morphing` as a private workspace package (`@aether-md/example-block-morphing`) that demonstrates L2 Block Morphing including GFM inline mark fidelity (Slice B) and multi-paragraph Block Focus (Slice C). The example SHALL use `@aether-md/react` morphing surfaces with GFM preset wiring. The example `typecheck` task SHALL participate in root `pnpm check` through the workspace turbo pipeline.

References:

- `docs/architecture/product-experience-spec.md`
- `docs/engineering/mvp-implementation-plan.md`
- `examples/block-morphing/README.md`

#### Scenario: Block morphing example typechecks in CI

- **GIVEN** Slice C block morphing example is complete
- **WHEN** `pnpm check` runs at the repository root
- **THEN** `examples/block-morphing` `typecheck` (`tsc --noEmit`) succeeds
- **AND** the example documents multi-block Block Focus operation

#### Scenario: Maintainer can start block morphing browser demo

- **GIVEN** the workspace is installed and built per `examples/block-morphing/README.md`
- **WHEN** a maintainer runs `pnpm --filter @aether-md/example-block-morphing dev`
- **THEN** a browser-rendered morphing editor loads without startup error
- **AND** the UI demonstrates focus=source / blur=rendered without a separate preview panel

### Requirement: Slice B block morphing integration tests cover GFM inline marks

The `@aether-md/react` validation suite SHALL include happy-dom integration tests for L2 Slice B GFM inline mark morphing fidelity. Tests SHALL cover at least: (1) focused source shows emphasis sigils, (2) blurred render shows `<em>`, (3) source edit of emphasis does not strip marks. Slice A and Slice C regression scenarios SHALL remain passing after Slice B lands.

References:

- `openspec/changes/archive/2026-07-06-block-morphing-slice-b/design.md`
- `packages/react/src/block-morphing.integration.test.tsx`

#### Scenario: Slice B integration tests pass in CI

- **GIVEN** Slice B implementation is complete
- **WHEN** `pnpm --filter @aether-md/react test` runs
- **THEN** Slice B inline mark scenarios pass
- **AND** Slice A and Slice C scenarios continue to pass

#### Scenario: Block morphing example includes Slice B fixture

- **GIVEN** `examples/block-morphing` is updated for Slice B
- **WHEN** a maintainer runs the example
- **THEN** the demo fixture includes emphasis and link inline marks
- **AND** README documents Slice B scope

### Requirement: Playwright browser E2E Phase 1 covers block-morphing demo

The repository SHALL include Playwright browser E2E under `e2e/playwright/` that exercises `examples/block-morphing` in real Chromium. The suite SHALL verify smoke boot, Block Focus (single-block source state), Instant Morphing (source edit and blur re-render), and GateLock regression (parent rerender preserves edited content). Root scripts `e2e:install` and `e2e:test` SHALL run the suite after workspace build.

CI SHALL include an `e2e-playwright` job that runs the same suite. The job SHALL be **non-blocking** (`continue-on-error: true`) in Phase 1 and SHALL upload `playwright-report/` and `test-results/` artifacts on completion.

References:

- `docs/engineering/test-strategy.md`
- `docs/architecture/product-experience-spec.md`
- `docs/adr/009-release-governance.md`

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

### Requirement: Consumer smoke validates packed package imports

M7 SHALL include a root `consumer:smoke` script that builds the workspace, packs all five linked publish-target packages, installs them into a temporary consumer project via `file:` tarball references, and verifies each package main entry can be imported without error. The script SHALL run as part of CI quality gates before merge to `main`.

References:

- `docs/adr/009-release-governance.md`
- `docs/community/release-process.md`

#### Scenario: Consumer smoke passes after build

- **GIVEN** the workspace is installed
- **WHEN** a maintainer runs `pnpm consumer:smoke`
- **THEN** all five linked packages pack successfully
- **AND** a temporary consumer project imports each package main entry without throw

### Requirement: Release CI workflow is configured for Changesets publish

M7 SHALL add a GitHub Actions release workflow that uses Changesets to version and publish the five linked packages. Publish SHALL only run in CI with `NPM_TOKEN`. The workflow SHALL document canary prerelease mode (`changeset pre enter canary`) as a maintainer prerequisite.

References:

- `docs/adr/009-release-governance.md`
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
