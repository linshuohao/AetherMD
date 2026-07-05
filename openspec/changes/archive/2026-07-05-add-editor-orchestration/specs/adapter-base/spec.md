## ADDED Requirements

### Requirement: Adapter round-trip is verifiable through createEditor orchestration

M4.5 SHALL allow GFM and M3 Markdown round-trip scenarios to be verified through `createEditor` orchestration in addition to explicit adapter harness wiring. Orchestrated tests SHALL validate Parser, Engine, and Serializer integration without React Shell or Command Bus changes to standalone M2 runtime.

References:

- `docs/engineering/adapter-protocol.md`
- `docs/engineering/test-strategy.md`
- `docs/engineering/data-flow.md`
- `openspec/specs/gfm-preset/spec.md`

#### Scenario: GFM round-trip can run through createEditor

- **GIVEN** M4 adapter packages and `@aether-md/preset-gfm` are built
- **WHEN** an integration test creates an editor through `createEditor` with the GFM preset and GFM Markdown `initialValue`
- **THEN** the test can dispatch a minimal edit and verify serialized Markdown through orchestrated Serializer wiring
- **AND** the test does not require React Shell or DOM APIs

#### Scenario: Explicit harness round-trip remains valid

- **GIVEN** M4 adapter-base requirements are implemented
- **WHEN** adapter plugin integration tests run with explicit Parser / Engine / Serializer wiring
- **THEN** existing M3 and M4 round-trip tests continue to pass
- **AND** editor orchestration tests supplement rather than replace adapter contract tests

### Requirement: Orchestrated apply failure preserves core-visible snapshot

When editor orchestration routes a command to `EngineAdapter.apply`, a failed apply SHALL leave the orchestration-visible document snapshot unchanged relative to the pre-apply snapshot. This requirement applies to the editor orchestration layer and SHALL NOT require `createCommandEventRuntime.dispatch` to invoke Adapter rollback automatically.

References:

- `docs/engineering/adapter-protocol.md`
- `openspec/specs/command-event-runtime/spec.md`
- `openspec/changes/add-editor-orchestration/design.md`

#### Scenario: failed orchestrated apply does not corrupt editor document

- **GIVEN** a running `AetherEditor` created through `createEditor`
- **WHEN** an engine-bound `dispatch` fails at `EngineAdapter.apply`
- **THEN** `AetherEditor.getDocument()` matches the pre-dispatch orchestration-visible snapshot
- **AND** standalone M2 Command/Event tests remain independent of adapter packages

## MODIFIED Requirements

### Requirement: GFM Markdown round-trip is verified across adapter packages

M4 SHALL verify GFM Markdown round-trip across remark and prosemirror adapter packages for the six-syntax matrix defined by `docs/engineering/test-strategy.md`. M4.5 MAY additionally verify a subset of the same matrix through `createEditor` orchestration with `@aether-md/preset-gfm`.

References:

- `docs/engineering/test-strategy.md`
- `docs/engineering/mvp-implementation-plan.md`
- `docs/engineering/data-flow.md`

#### Scenario: Paragraph and heading GFM round-trip remains supported

- **GIVEN** M4 adapter packages are built
- **WHEN** M3 paragraph and heading Markdown samples are parsed, edited, and serialized
- **THEN** the pipeline completes successfully
- **AND** final Markdown reflects the applied edit predictably

#### Scenario: Full GFM six-syntax round-trip is supported

- **GIVEN** M4 adapter packages are built
- **WHEN** Markdown samples for paragraph, heading, strong, emphasis, list, and link are parsed, edited through `EngineAdapter.apply`, and serialized
- **THEN** each round-trip test passes
- **AND** explicit harness tests do not require `createEditor`, React Shell, or Command Bus automatic rollback

#### Scenario: createEditor orchestration smoke test supplements adapter verification

- **GIVEN** M4.5 editor orchestration is implemented
- **WHEN** at least one GFM fixture is verified through `createEditor` with `@aether-md/preset-gfm`
- **THEN** the orchestrated round-trip passes without UI
- **AND** failure does not remove existing explicit adapter harness coverage

### Requirement: M3 does not integrate Command Bus automatic rollback

M3 SHALL NOT require `createCommandEventRuntime.dispatch` to invoke Adapter rollback or emit `transactionFailed` automatically. M4.5 editor orchestration MAY implement rollback and `transactionFailed` emission at the `AetherEditor.dispatch` layer without changing this standalone M2 requirement.

References:

- `openspec/specs/command-event-runtime/spec.md`
- `docs/engineering/adapter-protocol.md`
- `docs/sdk/command-event-protocol.md`

#### Scenario: Command Event runtime remains independent

- **GIVEN** M3 implementation is complete
- **WHEN** only `@aether-md/core` Command/Event tests run
- **THEN** they do not require Adapter packages or document snapshots beyond existing M2 behavior
- **AND** Adapter rollback semantics for standalone runtime remain validated through Adapter contract tests rather than Command Bus integration

#### Scenario: editor orchestration owns rollback without changing M2 dispatch

- **GIVEN** M4.5 editor orchestration is implemented
- **WHEN** standalone `createCommandEventRuntime` tests run
- **THEN** raw `dispatch` does not invoke Adapter rollback or emit `transactionFailed`
- **AND** orchestrated rollback is validated through `AetherEditor.dispatch` tests instead
