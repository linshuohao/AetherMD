## ADDED Requirements

### Requirement: Vue L2 morphing matches React interaction acceptance

`@aether-md/vue` SHALL provide interaction-matrix coverage equivalent to React Slice A–C for morphing surfaces, including autofocus on source morph and await of in-flight edits on blur.

#### Scenario: Vue morphing source receives focus on block focus

- **WHEN** user focuses a rendered block in `AetherMorphingDocument`
- **THEN** the source textarea receives focus
- **AND** only one block is in source state

### Requirement: Vue showcase L2 mode has no preview panel

`examples/vue` morphing mode SHALL NOT render a separate Markdown preview panel. L1 content mode MAY retain preview for pipeline verification only.

#### Scenario: Vue morphing demo has no markdown-preview

- **WHEN** showcase is in morphing mode
- **THEN** no `markdown-preview` test id is present in the DOM
