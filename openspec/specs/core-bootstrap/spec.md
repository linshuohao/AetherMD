# Core Bootstrap Spec

## Purpose

Define the M1 Core Bootstrap contract for the minimal `@aether-md/core` package surface, Manifest validation, Service Capability validation, dependency ordering, lifecycle startup, cleanup, dispose behavior, and package boundary guarantees.

## Requirements

### Requirement: Minimal Core package exists

`@aether-md/core` SHALL provide the minimal package surface required for M1 Core Bootstrap and accepted later capabilities including M4.5 editor orchestration.

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
- **AND** the package MAY expose `createEditor`, `AetherEditor`, and related editor-orchestration types defined by the `editor-orchestration` capability
- **AND** the package does not expose React Shell, Vue Shell, or GFM preset factory implementations

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

### Requirement: Duplicate plugin metadata.name is rejected during bootstrap validation

Core SHALL reject loaded plugin sets that contain more than one plugin with the same `metadata.name` during bootstrap validation, before running runtime lifecycle hooks.

References:

- `docs/sdk/manifest.md`
- `docs/architecture/core-api.md`
- `docs/engineering/manifest-loading.md`
- `docs/engineering/error-model.md`
- `docs/engineering/mvp-implementation-plan.md`

#### Scenario: Duplicate plugin name aborts startup

- **GIVEN** two or more loaded plugins declare the same `metadata.name`
- **WHEN** Core validates plugin manifests during bootstrap
- **THEN** startup fails with a fatal Core bootstrap error
- **AND** the error code is `PLUGIN_NAME_DUPLICATE`
- **AND** no `runtime.onInit`, `runtime.onReady`, or `runtime.onDestroy` hook is called for that startup attempt

#### Scenario: Unique plugin names pass validation

- **GIVEN** every loaded plugin declares a distinct `metadata.name`
- **WHEN** Core validates plugin manifests during bootstrap
- **THEN** duplicate-name validation succeeds
- **AND** bootstrap continues to Service Capability and dependency validation

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

After Manifest, Service Capability, and plugin dependency validation succeed, Core SHALL run `runtime.onInit` and `runtime.onReady` in resolved dependency order. If a startup lifecycle hook fails, Core SHALL perform reverse-order cleanup for plugins that successfully completed `runtime.onInit` before rethrowing a fatal Core bootstrap error.

References:

- `docs/sdk/lifecycle.md`
- `docs/architecture/core-api.md`
- `docs/engineering/test-strategy.md`
- `docs/engineering/error-model.md`

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

#### Scenario: Startup hook failure cleans up successful onInit plugins

- **GIVEN** one or more plugins successfully completed `runtime.onInit`
- **AND** a later startup lifecycle hook fails during `runtime.onInit` or `runtime.onReady`
- **WHEN** Core handles the startup failure
- **THEN** Core calls `runtime.onDestroy` in reverse order of the plugins that successfully completed `runtime.onInit`
- **AND** startup then fails with a fatal Core bootstrap error
- **AND** the primary error code is `LIFECYCLE_HOOK_FAILED` from the original failing startup hook
- **AND** Core does not return a running bootstrap runtime

#### Scenario: Startup cleanup continues after onDestroy failure

- **GIVEN** startup lifecycle cleanup is running reverse-order `runtime.onDestroy` for plugins that successfully completed `runtime.onInit`
- **AND** one plugin `runtime.onDestroy` fails during that cleanup
- **WHEN** Core handles the cleanup failure
- **THEN** Core continues attempting cleanup for remaining eligible plugins
- **AND** startup ultimately fails with a fatal Core bootstrap error
- **AND** the primary error code remains `LIFECYCLE_HOOK_FAILED` from the original failing startup hook
- **AND** cleanup destroy failures MAY be attached in the primary error `cause` chain

#### Scenario: Startup failure before any onInit does not invoke onDestroy

- **GIVEN** no plugin successfully completed `runtime.onInit`
- **AND** startup fails during validation or the first failing startup hook
- **WHEN** Core handles the startup failure
- **THEN** Core does not call any `runtime.onDestroy` hook
- **AND** startup fails with a fatal Core bootstrap error

### Requirement: Dispose destroys plugins in reverse lifecycle order

Core SHALL expose a dispose path on the bootstrap runtime returned by `bootstrapCore` and call `runtime.onDestroy` in reverse successful lifecycle order. For a successfully started bootstrap runtime, successful lifecycle order is the dependency order of plugins that completed startup (`runtime.onInit` and `runtime.onReady`). Repeated calls to `CoreBootstrapRuntime.dispose()` SHALL be an idempotent public contract: later calls MUST be no-op, MUST NOT invoke destroy hooks again, and MUST NOT throw. If `runtime.onDestroy` fails during normal dispose, Core MUST fail fatally and MUST NOT continue destroy hooks for remaining plugins.

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

#### Scenario: Repeated dispose is a no-op public contract

- **GIVEN** a bootstrap runtime returned by successful `bootstrapCore` startup
- **AND** dispose has already completed successfully once
- **WHEN** the consumer calls `dispose()` again
- **THEN** the call completes without throwing
- **AND** no additional `runtime.onDestroy` hooks run

#### Scenario: Bootstrap dispose idempotency is separate from Command Event runtime

- **GIVEN** M2 Command/Event runtime dispose idempotency is defined by the `command-event-runtime` capability
- **WHEN** reviewing bootstrap dispose requirements
- **THEN** `CoreBootstrapRuntime.dispose()` idempotency is defined by this capability
- **AND** Command/Event runtime dispose behavior does not replace or override bootstrap dispose public contract requirements

### Requirement: Workspace includes GFM preset package without core re-export

The workspace SHALL include `@aether-md/preset-gfm` at `packages/preset-gfm` while `@aether-md/core` continues to exclude GFM preset implementations from its public export surface.

References:

- `docs/architecture/package-layout.md`
- `docs/engineering/mvp-implementation-plan.md`
- `openspec/specs/adapter-base/spec.md`

#### Scenario: Core package boundary excludes GFM preset implementations

- **GIVEN** M4.5 package-boundary tests run for `@aether-md/core`
- **WHEN** tests inspect public exports
- **THEN** exports MAY include `createEditor` and `AetherEditor`
- **AND** exports do not include React Shell components or GFM preset factory implementations
- **AND** `@aether-md/core` does not declare runtime dependencies on Remark, ProseMirror, React, or Vue packages

### Requirement: Core public exports remain morphing-agnostic and DOM-agnostic

`@aether-md/core` SHALL NOT publicly export morphing strategy contracts, DOM renderer interfaces, or parse-block markdown command payload contracts used by shell/preset morphing surfaces. These contracts SHALL be owned by preset or shell-facing packages.

References:

- `docs/architecture/principles.md`
- `docs/architecture/architecture-optimization-principles.md`
- `openspec/specs/gfm-preset/spec.md`

#### Scenario: Core export surface excludes morphing contracts

- **GIVEN** maintainers inspect `@aether-md/core` public exports
- **WHEN** package boundary checks run
- **THEN** morphing strategy and custom DOM renderer contract symbols are absent from the public API
- **AND** core exports remain focused on lifecycle, command/event runtime, document model, adapters, and editor orchestration

#### Scenario: GFM preset package is allowed in workspace verification

- **GIVEN** `@aether-md/preset-gfm` exists at `packages/preset-gfm`
- **WHEN** root workspace verification runs
- **THEN** the preset package is included in the workspace package graph
- **AND** `@aether-md/core` boundary tests do not require the preset package to be absent from the monorepo

### Requirement: M1 excludes later milestone behavior

Core Bootstrap implementation SHALL NOT implement later milestone behavior beyond the M1 bootstrap contract, except where a later accepted capability explicitly adds package surface. M4 adds `@aether-md/preset-gfm` as a workspace package without adding Shell APIs to `@aether-md/core`. M4.5 adds editor orchestration APIs to `@aether-md/core` without adding React or Vue Shell APIs.

References:

- `docs/engineering/mvp-implementation-plan.md`
- `docs/architecture/core-api.md`
- `docs/sdk/lifecycle.md`

#### Scenario: Later milestone APIs are not required for M1 tests

- **GIVEN** M1 Core Bootstrap tests run
- **WHEN** tests validate Manifest loading, dependency validation, lifecycle startup, and dispose
- **THEN** tests do not require Markdown round-trip integration, React Shell, or GFM preset packages unless they intentionally exercise adapter-base, gfm-preset, or editor-orchestration scenarios
- **AND** M1 bootstrap tests do not require Command Bus or Event Hub behavior unless they intentionally exercise the `command-event-runtime` capability
- **AND** M1 bootstrap tests do not require Adapter plugin packages unless they intentionally exercise the `adapter-base` capability

#### Scenario: Core package boundary excludes shell and preset implementation entrypoints

- **GIVEN** M4.5 package-boundary tests run for `@aether-md/core`
- **WHEN** tests inspect public exports
- **THEN** exports include document-model, adapter-base, and editor-orchestration surfaces allowed by M3, M4, and M4.5
- **AND** exports do not include React Shell components or GFM preset factory implementations
- **AND** `@aether-md/core` does not declare runtime dependencies on Remark, ProseMirror, React, or Vue packages

### Requirement: Core public API remains morphing-agnostic and DOM-agnostic

`@aether-md/core` SHALL NOT export morphing strategy contracts, DOM renderer interfaces, or block-type interaction rendering APIs. Morphing strategy and renderer contracts SHALL be owned by preset/plugin or shell-facing packages outside Core.

#### Scenario: Core exports exclude morphing renderer contracts

- **WHEN** a maintainer inspects `@aether-md/core` public exports
- **THEN** morphing strategy and custom DOM renderer types are absent
- **AND** Core exports remain focused on lifecycle, command/event, document, adapter, and editor orchestration contracts
