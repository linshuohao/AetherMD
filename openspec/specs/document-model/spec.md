# Document Model Spec

## Purpose

Framework-independent `AetherDoc` and minimal `AetherSchema` public types exported from `@aether-md/core` for M3 Adapter baseline. Aligns with `docs/architecture/document-model.md` v1.0 built-in block/inline subset.

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

`@aether-md/core` SHALL export document types defined in `docs/architecture/document-model.md` beyond the M3 test matrix, such as `ListBlock`, `LinkInline`, `MarkedInline`, and `CustomBlock`, without requiring M3 adapter round-trip tests for those structures.

References:

- `docs/architecture/document-model.md`

#### Scenario: Extended types are exported but not required for M3 adapter tests

- **GIVEN** M3 contract tests run
- **WHEN** tests validate the M3 minimal Markdown subset
- **THEN** tests are not required to parse, edit, or serialize list, link, mark, or custom block round-trips
- **AND** exported types remain available for later milestones
