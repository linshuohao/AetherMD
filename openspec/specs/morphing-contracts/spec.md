# Morphing Contracts Spec

## Purpose

Dedicated `@aether-md/morphing-contracts` package as the single public source for morphing strategy types, registries, and parse-block command contracts used by preset and shell packages.

## Requirements

### Requirement: Morphing contracts live in a dedicated package

The workspace SHALL provide `@aether-md/morphing-contracts` (or equivalent preset-owned successor) as the single public source for `MorphingBlockStrategy`, `CustomBlockRenderer`, `MorphingStrategyRegistry`, `createMorphingStrategyRegistry`, `PARSE_BLOCK_MARKDOWN_COMMAND`, and `ParseBlockMarkdownPayload`. `@aether-md/core` SHALL NOT export these symbols.

#### Scenario: Shell imports morphing types from contracts package

- **WHEN** a shell package needs morphing strategy types
- **THEN** it imports from `@aether-md/morphing-contracts`
- **AND** package-boundary tests forbid duplicate local contract copies in production `src/`
