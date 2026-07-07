## MODIFIED Requirements

### Requirement: Core bootstrap remains syntax-blind and DOM-agnostic

`@aether-md/core` SHALL NOT register `core:parseBlockMarkdown` or construct morphing strategy registries with DOM renderer interfaces during `createEditor`. Morphing command registration and strategy aggregation SHALL be owned by preset or plugin packages.

#### Scenario: Editor startup does not hardcode parse-block handler

- **WHEN** `createEditor` starts with a GFM preset plugin
- **THEN** `core:parseBlockMarkdown` is registered by the preset/plugin layer
- **AND** Core `create-editor.ts` contains no dedicated parse-block registration function
