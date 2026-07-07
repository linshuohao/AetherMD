## ADDED Requirements

### Requirement: Telemetry service accepts host injection

`EditorContext.telemetry` **MUST** support host-provided `track()` implementations and provide a noop default.

#### Scenario: Host tracks span

- **WHEN** the host provides a telemetry sink via `EditorConfig`
- **AND** a tracked operation occurs
- **THEN** the host sink receives a structured event payload

#### Scenario: Default noop telemetry

- **WHEN** no telemetry sink is configured
- **THEN** tracking calls are no-ops and do not throw
