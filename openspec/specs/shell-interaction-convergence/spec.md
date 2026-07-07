# shell-interaction-convergence Specification

## Purpose

TBD - created by archiving change converge-single-interaction-model. Update Purpose after archive.

## Requirements

### Requirement: Shell interaction model converges to single north-star path

The workspace SHALL define one product interaction model for browser shells: block-level morphing with Block Focus and source/rendered state transitions. Any non-morphing whole-document editing shell path SHALL be treated as non-product pipeline tooling and SHALL NOT be positioned as a co-equal product interaction surface in public docs, examples, or acceptance validation.

#### Scenario: Product-facing shell defaults to morphing interaction

- **WHEN** a maintainer runs the canonical browser showcase
- **THEN** the default interactive path is the morphing document flow
- **AND** product-facing acceptance checks evaluate the morphing path as the normative interaction contract

### Requirement: Framework shell parity follows the same interaction contract

React and Vue shell packages SHALL expose equivalent north-star interaction surfaces for morphing-based editing, and SHALL maintain parity for primary product APIs used by examples and acceptance tests.

#### Scenario: React and Vue publish equivalent primary shell surface

- **WHEN** a reviewer inspects React and Vue public exports for product shell usage
- **THEN** both frameworks expose a morphing document surface as primary
- **AND** neither framework is documented as permanently L1-only for product interaction
