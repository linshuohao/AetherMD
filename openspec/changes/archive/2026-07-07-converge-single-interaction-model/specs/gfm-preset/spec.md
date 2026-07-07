## ADDED Requirements

### Requirement: GFM preset owns morphing strategy contracts

`@aether-md/preset-gfm` SHALL own and export morphing strategy contracts needed for GFM block/source rendering behavior. Core SHALL consume these through adapter/preset wiring without re-exporting strategy/renderer contracts from kernel public API.

#### Scenario: Preset provides strategy contracts without Core re-export

- **WHEN** maintainers inspect preset and core public exports
- **THEN** morphing strategy contracts are exported by preset-facing modules
- **AND** Core public exports do not mirror those contracts
