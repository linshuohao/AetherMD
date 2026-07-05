## ADDED Requirements

### Requirement: Remark adapters support GFM subset parse and serialize

`@aether-md/plugin-remark` SHALL parse and serialize the M4 GFM Markdown subset: paragraph, heading, strong, emphasis, unordered list, ordered list, and link, producing framework-independent `AetherDoc` values aligned with `docs/architecture/document-model.md`.

References:

- `docs/engineering/adapter-protocol.md`
- `docs/architecture/document-model.md`
- `docs/adr/003-remark-prosemirror-dual-track.md`

#### Scenario: Remark parser produces structured GFM AetherDoc

- **GIVEN** `@aether-md/plugin-remark` is built
- **WHEN** `ParserAdapter.parse` is called with GFM fixtures for list, link, strong, and emphasis
- **THEN** the result is a framework-independent `AetherDoc` with `ListBlock`, `LinkInline`, or `MarkedInline` nodes as appropriate
- **AND** content is not silently dropped

#### Scenario: Remark serializer produces deterministic GFM Markdown

- **GIVEN** an `AetherDoc` containing M4-supported GFM structures
- **WHEN** `SerializerAdapter.serialize` is called
- **THEN** the output is a deterministic Markdown string using `**` for strong, `*` for emphasis, `-` or `1.` for lists, and `[text](href)` for links
- **AND** paragraph and heading output remains compatible with M3 deterministic output

### Requirement: ProseMirror engine preserves GFM structures through edit leg

`@aether-md/plugin-prosemirror` SHALL extend `EngineAdapter` conversion and schema so that GFM `AetherDoc` fixtures survive `create`, a successful minimal `apply`, and `getDocument` without degrading list, link, or mark structures to plain text or JSON paragraphs.

References:

- `docs/engineering/adapter-protocol.md`
- `docs/adr/003-remark-prosemirror-dual-track.md`
- `docs/engineering/test-strategy.md`

#### Scenario: Engine round-trips GFM document snapshot after minimal apply

- **GIVEN** an `EngineSession` created from a GFM fixture `AetherDoc` containing list, link, or mark nodes
- **WHEN** `EngineAdapter.apply` runs a supported minimal edit successfully
- **THEN** `getDocument(session)` returns an `AetherDoc` that preserves GFM structures on unedited blocks
- **AND** edited block text reflects the apply request

#### Scenario: Failed apply still preserves GFM snapshot semantics

- **GIVEN** an active `EngineSession` with a GFM fixture document before `apply`
- **WHEN** `EngineAdapter.apply` fails
- **THEN** `getDocument(session)` returns the pre-apply snapshot
- **AND** list, link, and mark structures are not corrupted relative to the pre-apply snapshot

### Requirement: SerializationError and placeholder strategy is implemented for Serializer paths

M4 SHALL implement the deferred Serializer failure strategy from `docs/engineering/error-model.md` and `docs/engineering/adapter-protocol.md`: deterministic output for supported GFM nodes, explicit placeholder output for `CustomBlock`, and `SerializationError` rejection for unsupported node types.

References:

- `docs/engineering/error-model.md`
- `docs/engineering/adapter-protocol.md`

#### Scenario: CustomBlock serializes to explicit placeholder

- **GIVEN** an `AetherDoc` containing a `CustomBlock` with `name: 'diagram'`
- **WHEN** `SerializerAdapter.serialize` is called
- **THEN** the resolved Markdown includes `[unsupported:block:diagram]`
- **AND** the Serializer does not throw for this degraded path

#### Scenario: Unsupported node type rejects SerializationError

- **GIVEN** an `AetherDoc` containing a block or inline type not supported by the M4 Serializer
- **WHEN** `SerializerAdapter.serialize` is called
- **THEN** the returned Promise is rejected with `SerializationError`
- **AND** the error has `source: 'serialization'`, `severity: 'degraded'`, and a reviewable `code` and `message`

### Requirement: GFM Markdown round-trip is verified across adapter packages

M4 SHALL verify GFM Markdown round-trip across remark and prosemirror adapter packages for the six-syntax matrix defined by `docs/engineering/test-strategy.md`.

References:

- `docs/engineering/test-strategy.md`
- `docs/engineering/mvp-implementation-plan.md`
- `docs/engineering/data-flow.md`

#### Scenario: Paragraph and heading GFM round-trip remains supported

- **GIVEN** M4 adapter packages are built
- **WHEN** M3 paragraph and heading Markdown samples are parsed, edited, and serialized
- **THEN** the pipeline completes successfully
- **AND** final Markdown reflects the applied edit predictably

#### Scenario: Full GFM six-syntax round-trip is supported

- **GIVEN** M4 adapter packages are built
- **WHEN** Markdown samples for paragraph, heading, strong, emphasis, list, and link are parsed, edited through `EngineAdapter.apply`, and serialized
- **THEN** each round-trip test passes
- **AND** tests do not require `createEditor`, React Shell, or Command Bus automatic rollback

## MODIFIED Requirements

### Requirement: Remark plugin package provides Parser and Serializer adapters

The workspace SHALL include `@aether-md/plugin-remark` at `packages/plugins/plugin-remark` implementing `ParserAdapter` and `SerializerAdapter` without placing Remark dependencies in `@aether-md/core`. M4 extends the M3 subset to the GFM built-in syntax matrix.

References:

- `docs/architecture/package-layout.md`
- `docs/engineering/adapter-protocol.md`
- `docs/architecture/compatibility.md`

#### Scenario: Remark parser returns AetherDoc

- **GIVEN** `@aether-md/plugin-remark` is built
- **WHEN** `ParserAdapter.parse` is called with M3 or M4 GFM sample Markdown
- **THEN** the result is a framework-independent `AetherDoc`
- **AND** unrecognized non-GFM syntax is preserved as paragraph or text rather than silently dropped

#### Scenario: Remark serializer produces deterministic Markdown for supported subset

- **GIVEN** an `AetherDoc` containing M3 paragraph/heading blocks or M4 GFM structures
- **WHEN** `SerializerAdapter.serialize` is called
- **THEN** the output is a deterministic Markdown string for the supported test matrix
- **AND** M3 deterministic output shapes remain valid for M3 fixtures

### Requirement: M3 minimal Markdown round-trip is verified

The M3 implementation SHALL verify a minimal Markdown round-trip across remark and prosemirror adapter packages. M4 adds GFM round-trip requirements without removing M3 paragraph and heading coverage.

References:

- `docs/engineering/mvp-implementation-plan.md`
- `docs/engineering/test-strategy.md`
- `docs/engineering/data-flow.md`

#### Scenario: Paragraph round-trip through parse edit serialize

- **GIVEN** M3 and M4 adapter packages are built
- **WHEN** a paragraph Markdown sample is parsed, edited through `EngineAdapter.apply`, and serialized
- **THEN** the pipeline completes without requiring `createEditor` or React Shell
- **AND** the final Markdown reflects the applied edit predictably

#### Scenario: Heading and paragraph round-trip is supported

- **GIVEN** M3 and M4 adapter packages are built
- **WHEN** a Markdown sample containing a heading and paragraph is parsed, edited, and serialized
- **THEN** the round-trip test passes using the heading and paragraph subset
- **AND** M4 GFM tests additionally cover strong, emphasis, list, and link without replacing this scenario
