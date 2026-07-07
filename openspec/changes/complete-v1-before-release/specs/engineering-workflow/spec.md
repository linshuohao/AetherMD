## ADDED Requirements

### Requirement: Worker test job in CI

The engineering workflow **MUST** include a CI job or step that runs worker-runtime integration tests.

#### Scenario: Worker tests in check pipeline

- **WHEN** worker-runtime tests exist
- **THEN** they are included in `pnpm check` or a required CI job
