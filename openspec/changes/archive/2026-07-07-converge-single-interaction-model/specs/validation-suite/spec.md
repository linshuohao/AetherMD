## ADDED Requirements

### Requirement: Validation topology references one canonical browser showcase
Browser interaction validation SHALL target one canonical showcase topology and SHALL distinguish product interaction (morphing path) from non-product pipeline checks without requiring separate legacy example package identities.

#### Scenario: E2E suites map to canonical showcase modes
- **WHEN** maintainers inspect Playwright configuration and test suites
- **THEN** test suites target canonical showcase modes under one browser demo topology
- **AND** naming/traceability clearly identifies product morphing checks versus pipeline checks

### Requirement: Keyboard interaction matrix is enforced on product path
Validation SHALL include product-path keyboard interaction checks covering insertion, deletion (Backspace/Delete), and source-to-render synchronization for supported markdown block strategies.

#### Scenario: Product path validates typing and deletion fidelity
- **WHEN** keyboard interaction tests run on the morphing shell path
- **THEN** insertion and deletion behavior preserves expected markdown/source-render fidelity
- **AND** no full-editor remount occurs during consecutive edits
