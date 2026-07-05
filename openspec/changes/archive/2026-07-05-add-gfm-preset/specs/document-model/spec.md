## ADDED Requirements

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

## MODIFIED Requirements

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
