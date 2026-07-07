## MODIFIED Requirements

### Requirement: GFM preset owns parse-block command and morphing registry

`createGfmPreset()` SHALL register `core:parseBlockMarkdown` and expose `morphingStrategies` plus `createMorphingStrategyRegistry` from the morphing contracts package. Deprecated APIs (`renderParagraphFromBlock`, `GfmMorphingBlockStrategy`) SHALL be removed.

#### Scenario: Preset registers parse-block without Core builtin

- **WHEN** editor loads GFM preset plugin entry
- **THEN** `core:parseBlockMarkdown` is available via command bus
- **AND** `renderParagraphFromBlock` is not part of the public preset API

### Requirement: GFM morphing renderers registered via plugin runtime fields

GFM block-level DOM morphing renderers for `paragraph` and `list` SHALL be registered on the wired preset plugin via `morphingStrategies` and `morphingRegistry`, not via `manifest.runtime.interactiveRenderers`. The `gfmManifest` SHALL NOT include `interactiveRenderers`. Inline morphing serialize remains headless in `@aether-md/plugin-remark` / preset helpers.

References:

- `docs/sdk/manifest.md`
- `docs/sdk/custom-block-renderer.md`

#### Scenario: Morphing resolved from plugin fields at bootstrap

- **GIVEN** `createGfmPreset()` is called
- **WHEN** editor bootstrap resolves morphing registry
- **THEN** `plugin.morphingRegistry` and `plugin.morphingStrategies` supply paragraph and list handlers
- **AND** `manifest.runtime.interactiveRenderers` is absent
