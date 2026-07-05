# Core Bootstrap Spec

## Requirements

### Requirement: Minimal Core package exists

`@aether-md/core` SHALL provide the minimal package surface required for M1 Core Bootstrap.

References:

- `docs/engineering/mvp-implementation-plan.md`
- `docs/architecture/package-layout.md`
- `docs/architecture/core-api.md`

#### Scenario: Core package exposes M1 bootstrap surface

- **GIVEN** a consumer imports from `@aether-md/core`
- **WHEN** the package is built
- **THEN** the package exposes Manifest, plugin, capability, supported Manifest version, bootstrap runtime, and bootstrap error types required by this spec
- **AND** the package MAY expose Command Bus and Event Hub APIs defined by the `command-event-runtime` capability
- **AND** the package MAY expose document-model and adapter-base types defined by the M3 capabilities
- **AND** the package does not expose `createEditor`, `AetherEditor`, `EditorContext`, React Shell, Vue Shell, or GFM preset APIs

### Requirement: Manifest version is validated during bootstrap

Core SHALL use `SUPPORTED_MANIFEST_VERSIONS` to validate each plugin Manifest `metadata.manifestVersion`.

References:

- `docs/sdk/manifest.md`
- `docs/architecture/compatibility.md`
- `docs/engineering/test-strategy.md`
- `docs/engineering/error-model.md`

#### Scenario: Supported manifest version starts successfully

- **GIVEN** a plugin Manifest has `metadata.manifestVersion: 1`
- **WHEN** Core bootstraps the plugin
- **THEN** Manifest version validation succeeds

#### Scenario: Unsupported manifest version aborts startup

- **GIVEN** a plugin Manifest has `metadata.manifestVersion` outside `SUPPORTED_MANIFEST_VERSIONS`
- **WHEN** Core bootstraps the plugin
- **THEN** startup fails with a fatal Core bootstrap error
- **AND** lifecycle hooks for that plugin set do not run

### Requirement: Manifest shape is validated before lifecycle hooks

Core SHALL reject plugin entries that do not provide a valid layered `ExtensionManifest` before running runtime lifecycle hooks.

References:

- `docs/sdk/manifest.md`
- `docs/engineering/manifest-loading.md`
- `docs/sdk/lifecycle.md`

#### Scenario: Invalid Manifest shape aborts startup

- **GIVEN** a plugin entry does not include a valid `manifest.metadata` object
- **WHEN** Core loads plugin manifests
- **THEN** startup fails with a fatal Core bootstrap error
- **AND** no `runtime.onInit` or `runtime.onReady` hook is called

### Requirement: Service Capability requirements are validated

Core SHALL validate each `metadata.requires` Service Capability against capabilities provided by Core and loaded plugin `metadata.provides` values.

References:

- `docs/sdk/capabilities-and-permissions.md`
- `docs/glossary.md`
- `docs/adr/005-manifest-capabilities-versioning.md`
- `docs/adr/006-layered-manifest-permission-model.md`
- `docs/engineering/test-strategy.md`

#### Scenario: Required capability is provided

- **GIVEN** a plugin requires a Service Capability
- **AND** that capability is provided by Core or another loaded plugin
- **WHEN** Core validates Service Capabilities
- **THEN** bootstrap continues

#### Scenario: Required capability is missing

- **GIVEN** a plugin requires a Service Capability that no loaded provider supplies
- **WHEN** Core validates Service Capabilities
- **THEN** startup fails with a fatal Core bootstrap error
- **AND** lifecycle hooks for that plugin set do not run

#### Scenario: Adapter-backed capabilities are not silently provided in M1

- **GIVEN** a plugin requires an Adapter-backed capability such as `core:engine` or `core:parser`
- **AND** no loaded plugin provides that capability
- **WHEN** Core validates Service Capabilities during M1 bootstrap
- **THEN** startup fails with a fatal Core bootstrap error

### Requirement: Plugin dependsOn order is resolved deterministically

Core SHALL resolve `metadata.dependsOn` into a deterministic topological lifecycle order before lifecycle startup.

References:

- `docs/sdk/manifest.md`
- `docs/sdk/lifecycle.md`
- `docs/engineering/test-strategy.md`
- `docs/adr/005-manifest-capabilities-versioning.md`

#### Scenario: Dependent plugin starts after dependency

- **GIVEN** plugin `table` declares `metadata.dependsOn: ["heading"]`
- **AND** plugin `heading` is loaded
- **WHEN** Core resolves lifecycle order
- **THEN** `heading` appears before `table`

#### Scenario: Same-level plugins keep host order

- **GIVEN** multiple loaded plugins have no dependency relationship
- **WHEN** Core resolves lifecycle order
- **THEN** their relative order follows the host-provided plugin order

#### Scenario: Missing plugin dependency aborts startup

- **GIVEN** a plugin declares a dependency on an unloaded plugin name
- **WHEN** Core resolves lifecycle order
- **THEN** startup fails with a fatal Core bootstrap error
- **AND** lifecycle hooks for that plugin set do not run

#### Scenario: Dependency cycle aborts startup

- **GIVEN** loaded plugins contain a `metadata.dependsOn` cycle
- **WHEN** Core resolves lifecycle order
- **THEN** startup fails with a fatal Core bootstrap error
- **AND** lifecycle hooks for that plugin set do not run

### Requirement: Lifecycle hooks run in dependency order

After Manifest, Service Capability, and plugin dependency validation succeed, Core SHALL run `runtime.onInit` and `runtime.onReady` in resolved dependency order.

References:

- `docs/sdk/lifecycle.md`
- `docs/architecture/core-api.md`
- `docs/engineering/test-strategy.md`

#### Scenario: Startup invokes lifecycle hooks in order

- **GIVEN** plugins have valid Manifests and resolved dependencies
- **WHEN** Core starts
- **THEN** `runtime.onInit` runs in dependency order
- **AND** after successful `onInit`, `runtime.onReady` runs in dependency order

#### Scenario: Lifecycle hook failure aborts startup

- **GIVEN** a plugin lifecycle hook fails during startup
- **WHEN** Core runs startup lifecycle
- **THEN** startup fails with a fatal Core bootstrap error
- **AND** Core does not return a running bootstrap runtime

### Requirement: Dispose destroys plugins in reverse lifecycle order

Core SHALL expose a dispose path and call `runtime.onDestroy` in reverse successful lifecycle order.

References:

- `docs/sdk/lifecycle.md`
- `docs/architecture/core-api.md`
- `docs/engineering/test-strategy.md`

#### Scenario: Dispose invokes onDestroy in reverse order

- **GIVEN** plugins have started successfully in dependency order
- **WHEN** the bootstrap runtime is disposed
- **THEN** `runtime.onDestroy` runs in reverse successful lifecycle order

#### Scenario: Repeated dispose does not repeat destroy hooks

- **GIVEN** a bootstrap runtime has already completed dispose
- **WHEN** dispose is called again
- **THEN** destroy hooks are not called a second time

### Requirement: M1 excludes later milestone behavior

Core Bootstrap implementation SHALL NOT implement later milestone behavior beyond the M1 bootstrap contract, except where a later accepted capability explicitly adds package surface.

References:

- `docs/engineering/mvp-implementation-plan.md`
- `docs/architecture/core-api.md`
- `docs/sdk/lifecycle.md`

#### Scenario: Later milestone APIs are not required for M1 tests

- **GIVEN** M1 Core Bootstrap tests run
- **WHEN** tests validate Manifest loading, dependency validation, lifecycle startup, and dispose
- **THEN** tests do not require Markdown round-trip integration, React Shell, or GFM preset packages unless they intentionally exercise M3 adapter-base scenarios
- **AND** M1 bootstrap tests do not require Command Bus or Event Hub behavior unless they intentionally exercise the `command-event-runtime` capability
- **AND** M1 bootstrap tests do not require Adapter plugin packages unless they intentionally exercise the `adapter-base` capability

#### Scenario: Core package boundary excludes editor and shell entrypoints

- **GIVEN** M3 package-boundary tests run for `@aether-md/core`
- **WHEN** tests inspect public exports
- **THEN** exports include document-model and adapter-base protocol types allowed by M3
- **AND** exports do not include `createEditor`, `AetherEditor`, React Shell components, or GFM preset implementations
- **AND** `@aether-md/core` does not declare runtime dependencies on Remark, ProseMirror, React, or Vue packages
