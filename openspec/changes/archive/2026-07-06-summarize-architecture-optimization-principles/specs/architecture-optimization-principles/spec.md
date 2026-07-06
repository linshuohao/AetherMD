## ADDED Requirements

### Requirement: Architecture optimization guidance document

The repository SHALL include a long-lived architecture document that summarizes bridge-layer optimization principles, syntax ownership rules, approved design patterns, and future refactoring direction for AetherMD.

#### Scenario: Guidance document exists

- **WHEN** a maintainer reviews `docs/architecture/`
- **THEN** the architecture optimization guidance document is present under `docs/architecture/`
- **AND** it explains the relationship between `AetherDoc`, Remark, ProseMirror, Preset packages, and React Shell morphing surfaces

#### Scenario: Guidance document defines project-specific principles

- **WHEN** a maintainer reads the guidance document
- **THEN** it defines AetherMD-specific architecture principles for syntax ownership, dependency burial, block-first interaction, command-only mutation, progressive fidelity, and avoiding accidental parsers

#### Scenario: Guidance document defines approved patterns

- **WHEN** a maintainer reads the guidance document
- **THEN** it names approved patterns relevant to AetherMD including Adapter, Anti-Corruption Layer, Strategy, Registry, State Machine, Snapshot, and Pipeline
- **AND** each pattern is tied to a concrete AetherMD boundary or usage

#### Scenario: Guidance document states non-goals and migration direction

- **WHEN** a maintainer reads the guidance document
- **THEN** it states that the document does not itself refactor runtime code or change public contracts
- **AND** it identifies future migration phases for serializer consolidation, preset-owned source/rendering strategies, block source preservation, and adapter protocol refinement

### Requirement: Architecture guidance is discoverable

Architecture entry points SHALL link to the optimization guidance document so future architecture and implementation work can discover it before changing bridge-layer, adapter, preset, or morphing responsibilities.

#### Scenario: Architecture index links guidance

- **WHEN** a reader opens `docs/architecture/README.md`
- **THEN** the page list includes a link to the architecture optimization guidance document

#### Scenario: Design document map links guidance

- **WHEN** a reader opens `docs/architecture/design-doc-map.md`
- **THEN** the overview-design mapping includes the architecture optimization guidance document where architecture patterns and boundary guidance are relevant
