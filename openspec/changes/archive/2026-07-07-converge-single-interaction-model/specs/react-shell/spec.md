## ADDED Requirements

### Requirement: React shell product surface is morphing-first

`@aether-md/react` SHALL treat morphing document interaction as the primary product shell surface. Legacy whole-document content shell utilities MAY exist for pipeline verification only, and SHALL be isolated from primary product-facing API positioning.

#### Scenario: Product docs and examples use morphing shell as primary

- **WHEN** maintainers review React shell examples and product-facing docs
- **THEN** morphing document flow is presented as the primary interaction path
- **AND** whole-document content shell is not presented as a co-equal product mode

### Requirement: React shell owns no syntax-specific rendering rules

React shell components SHALL consume preset-provided morphing strategies and interactive renderers and SHALL NOT carry standalone GFM syntax rendering logic that duplicates preset behavior.

#### Scenario: Shell code has no dead syntax renderer path

- **WHEN** maintainers inspect React morphing source files
- **THEN** syntax-specific inline rendering logic is sourced from preset strategy contracts
- **AND** duplicate/dead shell-local GFM render helpers are absent
