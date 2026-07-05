# Core Bootstrap Delta Spec

## ADDED Requirements

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

## MODIFIED Requirements

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
