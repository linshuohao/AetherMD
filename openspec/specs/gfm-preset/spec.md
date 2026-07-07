# GFM Preset Spec

## Purpose

M4 GFM preset package (`@aether-md/preset-gfm`) wiring official GFM Manifest and factory entry, hosting the six-syntax GFM round-trip integration matrix without `createEditor`, React Shell, or `bootstrapCore` Adapter loading.

## Requirements

### Requirement: GFM preset package exists in workspace

The workspace SHALL include `@aether-md/preset-gfm` at `packages/preset-gfm` as the official GFM preset package aligned with `docs/architecture/package-layout.md` and `docs/engineering/mvp-implementation-plan.md`.

References:

- `docs/architecture/package-layout.md`
- `docs/engineering/mvp-implementation-plan.md`
- `docs/architecture/roadmap.md`

#### Scenario: Preset package participates in workspace verification

- **GIVEN** `@aether-md/preset-gfm` exists in the workspace
- **WHEN** `pnpm check` runs at the repository root
- **THEN** the preset package build, typecheck, and tests are executed through the workspace pipeline
- **AND** the package declares `build`, `typecheck`, and `test` scripts

#### Scenario: Preset package does not place Remark or ProseMirror dependencies in core

- **GIVEN** `@aether-md/preset-gfm` is built
- **WHEN** package dependencies are inspected
- **THEN** Remark and ProseMirror runtime dependencies remain in adapter plugin packages
- **AND** `@aether-md/core` does not gain Remark, ProseMirror, React, or Vue runtime dependencies

### Requirement: GFM preset exposes Manifest and public factory entry

`@aether-md/preset-gfm` SHALL export a reviewable GFM preset Manifest and at least one public factory entry for consumers and integration tests.

References:

- `docs/sdk/manifest.md`
- `docs/engineering/mvp-implementation-plan.md`

#### Scenario: Preset Manifest uses supported manifest version

- **GIVEN** a consumer imports the GFM preset factory from `@aether-md/preset-gfm`
- **WHEN** the preset Manifest is read
- **THEN** `metadata.manifestVersion` is `1`
- **AND** `metadata.name` identifies the official GFM preset (`gfm` or equivalent documented official name)

#### Scenario: Preset factory is importable without createEditor

- **GIVEN** M4 integration tests or consumers import from `@aether-md/preset-gfm`
- **WHEN** the public factory entry is invoked
- **THEN** the result exposes preset Manifest and/or wired adapter references usable for GFM round-trip tests
- **AND** the import does not require `createEditor`, React Shell, or `bootstrapCore` Adapter loading

### Requirement: GFM preset owns GFM round-trip integration test matrix

`@aether-md/preset-gfm` SHALL host or coordinate integration tests that verify the M4 GFM Markdown round-trip matrix defined by `docs/engineering/test-strategy.md`.

References:

- `docs/engineering/test-strategy.md`
- `docs/engineering/adapter-protocol.md`
- `docs/adr/003-remark-prosemirror-dual-track.md`

#### Scenario: Six-syntax GFM round-trip matrix is verified

- **GIVEN** M4 adapter extensions and `@aether-md/preset-gfm` are built
- **WHEN** GFM integration tests run for paragraph, heading, strong, emphasis, list, and link fixtures
- **THEN** each fixture completes Markdown → parse → `EngineAdapter.apply` (minimal edit) → serialize
- **AND** final Markdown matches deterministic golden strings for the edited fixture
- **AND** tests do not require `createEditor` or React Shell

#### Scenario: M3 minimal round-trip remains verified

- **GIVEN** M4 implementation is complete
- **WHEN** existing M3 paragraph and heading round-trip tests run
- **THEN** they continue to pass without requiring GFM preset package for M3-only scenarios

### Requirement: GFM preset provides headless inline morphing serialize contract

The `@aether-md/preset-gfm` package SHALL export a headless module for serializing paragraph inline nodes to GFM Markdown source suitable for morphing source surfaces. The module SHALL depend only on `@aether-md/core` types (`ParagraphBlock`, `AetherInline`) and MUST NOT depend on React or DOM APIs. `serializeParagraphInlines(block)` SHALL round-trip with the remark parser for strong, emphasis, and link marks within a single paragraph.

References:

- `openspec/changes/archive/2026-07-06-block-morphing-slice-b/design.md`
- `docs/sdk/manifest.md`

#### Scenario: Serialize paragraph inlines to GFM source

- **GIVEN** a `ParagraphBlock` with strong, emphasis, and link children
- **WHEN** `serializeParagraphInlines(block)` is called
- **THEN** the result contains `**`, `*`, and `[](url)` syntax matching the inline tree

#### Scenario: Headless module has no React dependency

- **GIVEN** the preset-gfm package manifest
- **WHEN** the inline morphing module is imported
- **THEN** no React peer or dependency is required

### Requirement: GFM manifest registers interactiveRenderers for morphing

The `gfmManifest` SHALL register `runtime.interactiveRenderers` for GFM `paragraph` and `list` block-level DOM morphing renderers. Inline morphing serialize remains headless in `@aether-md/plugin-remark` / preset helpers.

References:

- `docs/sdk/manifest.md`
- `docs/sdk/custom-block-renderer.md`
- `docs/architecture/architecture-optimization-principles.md`

#### Scenario: GFM manifest exposes interactive renderers

- **GIVEN** `createGfmPreset()` is called
- **WHEN** a maintainer inspects `manifest.runtime.interactiveRenderers`
- **THEN** `paragraph` and `list` renderer entries are present
- **AND** entries implement mount/unmount for block-level rendered surfaces

### Requirement: GFM preset owns morphing strategy contracts

`@aether-md/preset-gfm` SHALL own and export morphing strategy contracts needed for GFM block/source rendering behavior. Core SHALL consume these through adapter/preset wiring without re-exporting strategy/renderer contracts from kernel public API.

#### Scenario: Preset provides strategy contracts without Core re-export

- **WHEN** maintainers inspect preset and core public exports
- **THEN** morphing strategy contracts are exported by preset-facing modules
- **AND** Core public exports do not mirror those contracts
