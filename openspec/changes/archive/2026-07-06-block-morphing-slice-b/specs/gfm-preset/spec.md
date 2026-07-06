## ADDED Requirements

### Requirement: GFM preset provides headless inline morphing serialize contract

The `@aether-md/preset-gfm` package SHALL export a headless module for serializing paragraph inline nodes to GFM Markdown source suitable for morphing source surfaces. The module SHALL depend only on `@aether-md/core` types (`ParagraphBlock`, `AetherInline`) and MUST NOT depend on React or DOM APIs. `serializeParagraphInlines(block)` SHALL round-trip with the remark parser for strong, emphasis, and link marks within a single paragraph.

References:

- `openspec/changes/block-morphing-slice-b/design.md`
- `docs/sdk/manifest.md`

#### Scenario: Serialize paragraph inlines to GFM source

- **GIVEN** a `ParagraphBlock` with strong, emphasis, and link children
- **WHEN** `serializeParagraphInlines(block)` is called
- **THEN** the result contains `**`, `*`, and `[](url)` syntax matching the inline tree

#### Scenario: Headless module has no React dependency

- **GIVEN** the preset-gfm package manifest
- **WHEN** the inline morphing module is imported
- **THEN** no React peer or dependency is required

### Requirement: GFM manifest documents interactiveRenderers reservation

The `gfmManifest` SHALL document that `interactiveRenderers` is reserved for future Slice D block-level DOM render registration. Full renderer registration MAY be deferred; a manifest-level stub or comment SHALL cross-link to `docs/sdk/manifest.md`.

#### Scenario: Manifest references interactive renderers extension point

- **GIVEN** `gfmManifest` in `@aether-md/preset-gfm`
- **WHEN** a plugin author reads manifest metadata
- **THEN** they find documentation pointing to `interactiveRenderers` for future block morphing renderers
