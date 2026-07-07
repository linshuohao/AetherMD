## ADDED Requirements

### Requirement: v1 complete validation matrix

The validation suite **MUST** include automated tests for builtin services, permission guard, worker runtime, and vue shell integration paths.

#### Scenario: Check pipeline includes new gates

- **WHEN** `pnpm check` runs on main
- **THEN** builtin-services, permission, worker, and vue shell tests execute and pass

### Requirement: Playwright E2E blocking gate

Playwright E2E **MUST** run as a blocking CI job before merge to main after Wave 10.

#### Scenario: E2E failure blocks merge

- **WHEN** any Playwright test fails in CI
- **THEN** the CI check fails

### Requirement: Consumer smoke covers v1 exports

Consumer smoke **MUST** verify `1.0.0` package exports for all five publishable packages after Wave 10.

#### Scenario: Pack and import succeeds

- **WHEN** `pnpm consumer:smoke` runs after pack
- **THEN** all main entry points import without error
