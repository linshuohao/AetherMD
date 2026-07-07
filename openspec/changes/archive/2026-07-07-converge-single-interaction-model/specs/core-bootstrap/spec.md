## ADDED Requirements

### Requirement: Core public API remains morphing-agnostic and DOM-agnostic

`@aether-md/core` SHALL NOT export morphing strategy contracts, DOM renderer interfaces, or block-type interaction rendering APIs. Morphing strategy and renderer contracts SHALL be owned by preset/plugin or shell-facing packages outside Core.

#### Scenario: Core exports exclude morphing renderer contracts

- **WHEN** a maintainer inspects `@aether-md/core` public exports
- **THEN** morphing strategy and custom DOM renderer types are absent
- **AND** Core exports remain focused on lifecycle, command/event, document, adapter, and editor orchestration contracts
