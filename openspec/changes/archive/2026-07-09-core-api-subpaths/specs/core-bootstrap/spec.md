## MODIFIED Requirements

### Requirement: Minimal Core package exists

`@aether-md/core` SHALL provide role-based package subpaths so consumers import only the contract surface matching their role.

References:

- `docs/architecture/core-api.md`
- `docs/sdk/overview.md`
- `docs/architecture/package-layout.md`

#### Scenario: Host imports default entry only

- **GIVEN** a host or Shell application
- **WHEN** the consumer imports from `@aether-md/core`
- **THEN** the package exposes `createEditor`, `AetherEditor`, `EditorConfig`, minimal Command/Event observe types, `ExtensionPlugin`, `AetherDoc`, `CoreError`, and `RenderError`
- **AND** the default entry does **not** export `bootstrapCore`, `createCommandEventRuntime`, service factories, or telemetry noop helpers

#### Scenario: Plugin author imports plugin subpath

- **GIVEN** a plugin or preset package
- **WHEN** the consumer imports from `@aether-md/core/plugin`
- **THEN** the package exposes Manifest, capability, permission, and Command/Event contract types required by the Plugin SDK
- **AND** the subpath does **not** export `createEditor` or Adapter implementation helpers

#### Scenario: Adapter author imports adapter and document subpaths

- **GIVEN** an Adapter implementation package
- **WHEN** the consumer imports from `@aether-md/core/adapter` and `@aether-md/core/document`
- **THEN** the package exposes Adapter protocol types, serialization errors, engine command ids, and document-model types
- **AND** the subpaths do **not** export React Shell, Vue Shell, or GFM preset factories

#### Scenario: Testing utilities are isolated

- **GIVEN** a dev-only consumer such as a contract or bootstrap test
- **WHEN** the consumer imports from `@aether-md/core/testing`
- **THEN** the package exposes `bootstrapCore` and `createCommandEventRuntime`
- **AND** production Shell packages **MUST NOT** import from `@aether-md/core/testing`
