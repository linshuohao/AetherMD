## MODIFIED Requirements

### Requirement: GFM manifest documents interactiveRenderers reservation

The `gfmManifest` SHALL register `runtime.interactiveRenderers` for GFM `paragraph` and `list` block-level DOM morphing renderers. Inline morphing serialize remains headless in `@aether-md/plugin-remark` / preset helpers.

References:

- `docs/sdk/manifest.md`
- `docs/sdk/custom-block-renderer.md`

#### Scenario: GFM manifest exposes interactive renderers

- **GIVEN** `createGfmPreset()` is called
- **WHEN** a maintainer inspects `manifest.runtime.interactiveRenderers`
- **THEN** `paragraph` and `list` renderer entries are present
- **AND** entries implement mount/unmount for block-level rendered surfaces
