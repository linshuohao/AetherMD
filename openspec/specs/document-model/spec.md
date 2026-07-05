# Document Model Spec

## Purpose

Framework-independent `AetherDoc` and minimal `AetherSchema` public types exported from `@aether-md/core` for M3 Adapter baseline and M4 GFM structured round-trip. Aligns with `docs/architecture/document-model.md` v1.0 built-in block/inline subset.

## Requirements

### Requirement: AetherDoc public types are exported from core

`@aether-md/core` SHALL export framework-independent `AetherDoc` and related block/inline types aligned with the M3 minimal subset of `docs/architecture/document-model.md`.

References:

- `docs/architecture/document-model.md`
- `docs/glossary.md`
- `docs/engineering/mvp-implementation-plan.md`

#### Scenario: Consumer imports AetherDoc types

- **GIVEN** a consumer imports from `@aether-md/core`
- **WHEN** the M3 package is built
- **THEN** the package exposes `AetherDoc` with `type: 'doc'` and `children`
- **AND** the package exposes M3-relevant block types including `ParagraphBlock` and `HeadingBlock`
- **AND** the package exposes M3-relevant inline types including `TextInline`

#### Scenario: Document types are framework-independent

- **GIVEN** an `AetherDoc` value produced by M3 adapters or tests
- **WHEN** the value is serialized with `JSON.stringify`
- **THEN** the result contains no ProseMirror Node, Remark Node, DOM, or function values

### Requirement: Minimal AetherSchema type is exported

`@aether-md/core` SHALL export a minimal `AetherSchema` type for Parser and Serializer Adapter signatures.

References:

- `docs/engineering/adapter-protocol.md`
- `docs/architecture/document-model.md`
- `docs/glossary.md`

#### Scenario: AetherSchema supports M3 placeholder shape

- **GIVEN** a consumer imports `AetherSchema` from `@aether-md/core`
- **WHEN** constructing a schema value for M3 adapters
- **THEN** a schema with `version: 1` is accepted by Parser and Serializer Adapter signatures
- **AND** M3 does not require compile-layer Manifest schema merge

### Requirement: Extended document types are exported without M3 round-trip coverage

`@aether-md/core` SHALL export document types defined in `docs/architecture/document-model.md` beyond the M3 test matrix, such as `ListBlock`, `LinkInline`, `MarkedInline`, and `CustomBlock`. M3 adapter tests are not required to round-trip those structures; M4 GFM adapter tests SHALL round-trip `ListBlock`, `LinkInline`, and `MarkedInline` for the GFM subset while `CustomBlock` round-trip remains deferred.

References:

- `docs/architecture/document-model.md`
- `docs/engineering/test-strategy.md`

#### Scenario: Extended types are exported but M3 minimal tests remain scoped

- **GIVEN** M3 contract tests run
- **WHEN** tests validate the M3 minimal Markdown subset
- **THEN** M3 tests are not required to fail if extended types lack structured round-trip
- **AND** exported types remain available for M4 and later milestones

#### Scenario: M4 requires GFM extended type round-trip

- **GIVEN** M4 GFM integration tests run
- **WHEN** tests validate the GFM six-syntax matrix
- **THEN** tests require structured round-trip for `ListBlock`, `LinkInline`, and `MarkedInline`
- **AND** tests do not require `CustomBlock` structured round-trip

### Requirement: GFM built-in types have structured round-trip coverage

M4 SHALL verify structured parse, edit, and serialize round-trip for v1.0 GFM built-in document types exported from `@aether-md/core`: `ListBlock`, `LinkInline`, and `MarkedInline` with `mark: 'strong' | 'emphasis'`, in addition to M3 `ParagraphBlock`, `HeadingBlock`, and `TextInline`.

References:

- `docs/architecture/document-model.md`
- `docs/engineering/test-strategy.md`
- `docs/engineering/mvp-implementation-plan.md`

#### Scenario: Strong and emphasis inline round-trip

- **GIVEN** Markdown containing `**bold**` and `*italic*` inline syntax
- **WHEN** the GFM round-trip pipeline runs through remark and prosemirror adapters
- **THEN** parsed `AetherDoc` contains `MarkedInline` nodes with `mark: 'strong'` and `mark: 'emphasis'`
- **AND** serialized Markdown restores `**bold**` and `*italic*` after a minimal successful edit leg

#### Scenario: List block round-trip

- **GIVEN** Markdown containing an unordered or ordered list with at least one item
- **WHEN** the GFM round-trip pipeline runs
- **THEN** parsed `AetherDoc` contains a `ListBlock` with correct `ordered` flag
- **AND** serialized Markdown restores list markers after a minimal successful edit leg

#### Scenario: Link inline round-trip

- **GIVEN** Markdown containing `[label](https://example.com)` link syntax
- **WHEN** the GFM round-trip pipeline runs
- **THEN** parsed `AetherDoc` contains a `LinkInline` with matching `href` and text children
- **AND** serialized Markdown restores `[label](https://example.com)` after a minimal successful edit leg

### Requirement: CustomBlock remains outside M4 GFM round-trip matrix

M4 GFM round-trip tests SHALL NOT require `CustomBlock` parse or serialize round-trip. `CustomBlock` export from `@aether-md/core` remains available for later milestones.

References:

- `docs/architecture/document-model.md`
- `openspec/specs/document-model/spec.md`

#### Scenario: CustomBlock is not required in GFM round-trip tests

- **GIVEN** M4 GFM integration tests run
- **WHEN** tests validate the six-syntax GFM matrix
- **THEN** tests do not require `CustomBlock` structured round-trip
- **AND** `CustomBlock` types remain exported from `@aether-md/core`
