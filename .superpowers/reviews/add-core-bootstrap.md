# add-core-bootstrap Spec Compliance Review

## 结论

Status: passed with follow-up updates

Review date: 2026-07-04

本 review 已对 `add-core-bootstrap` 的 OpenSpec artifacts、Superpowers plan/tasks、validation 记录、当前实现文件和 workflow 支撑文件进行最终 spec compliance 检查。

实现符合 `core-bootstrap` delta spec 的 M1 Core Bootstrap 范围：Manifest shape/version validation、Service Capability validation、`metadata.dependsOn` 确定性排序、startup lifecycle、reverse dispose，以及最小 package/export boundary 均已覆盖。未发现 Command Bus、Event Hub、Adapter、React Shell、Remark、ProseMirror、GFM preset、Markdown parse/serialize 或 DOM/UI concern 泄漏进 Core。

## Changed File Mapping

### OpenSpec 与 Superpowers artifacts

- `openspec/changes/add-core-bootstrap/proposal.md` -> change proposal 与 scope contract。
- `openspec/changes/add-core-bootstrap/design.md` -> M1 Core Bootstrap implementation contract、architecture boundary、public contract、testing strategy。
- `openspec/changes/add-core-bootstrap/specs/core-bootstrap/spec.md` -> 所有 runtime/package/workflow requirements。
- `openspec/changes/add-core-bootstrap/tasks.md` -> high-level OpenSpec tasks。
- `.superpowers/plans/add-core-bootstrap.md` -> implementation phases、validation matrix、review focus。
- `.superpowers/tasks/add-core-bootstrap/*.md` -> Task 01-08 implementation units。
- `.superpowers/runs/add-core-bootstrap/validation.md` -> aggregated validation evidence。
- `.superpowers/reviews/add-core-bootstrap.md` -> 本 review。

### Core implementation

- `packages/core/package.json`, `packages/core/tsconfig.json`, `packages/core/tsconfig.test.json` -> Task 01、Task 08；maps to `Minimal Core package exists` and `M1 excludes later milestone behavior`。
- `packages/core/src/types.ts`, `packages/core/src/errors.ts`, `packages/core/src/index.ts` -> Task 02；maps to `Minimal Core package exists` and fatal Core bootstrap error shape。
- `packages/core/src/manifest.ts`, `packages/core/src/manifest.test.ts` -> Task 03；maps to `Manifest version is validated during bootstrap` and `Manifest shape is validated before lifecycle hooks`。
- `packages/core/src/capabilities.ts`, `packages/core/src/capabilities.test.ts` -> Task 04；maps to `Service Capability requirements are validated` and Adapter-backed capability boundary。
- `packages/core/src/dependencies.ts`, `packages/core/src/dependencies.test.ts` -> Task 05；maps to `Plugin dependsOn order is resolved deterministically`。
- `packages/core/src/bootstrap.ts`, `packages/core/src/bootstrap.test.ts` -> Task 06；maps to lifecycle startup and validation-before-hooks requirements。
- `packages/core/src/lifecycle.ts`, `packages/core/src/lifecycle.test.ts` -> Task 07；maps to `Dispose destroys plugins in reverse lifecycle order`。
- `packages/core/src/package-boundary.test.ts` -> Task 08；maps to package boundary and later milestone exclusion.

### Workspace 与 workflow support

- `package.json`, `pnpm-lock.yaml` -> Task 01、Task 08；minimal workspace validation scripts and dev dependency lock updates。
- `.codex/skills/aether-workflow-create-task/SKILL.md`, `.codex/skills/aether-workflow-implement-task/SKILL.md`, `.codex/skills/aether-workflow-validate-task/SKILL.md`, `.codex/skills/aether-workflow-execute-task-loop/SKILL.md`, `AI_NATIVE_ENGINEERING_WORKFLOW.md` -> workflow execution and validation support used by this change. These files map to `Workflow documents are written in Chinese` and the recorded Step 6.5 task-loop process, not to Core runtime behavior.

## Requirement Coverage

- `Minimal Core package exists`: satisfied by `packages/core` package boundary, TypeScript config, package exports, and package-boundary tests.
- `Manifest version is validated during bootstrap`: satisfied by `SUPPORTED_MANIFEST_VERSIONS = [1] as const`, `loadPluginManifests`, and manifest tests.
- `Manifest shape is validated before lifecycle hooks`: satisfied by `readManifest` shape checks and bootstrap validation-failure tests.
- `Service Capability requirements are validated`: satisfied by `M1_CORE_CAPABILITIES`, plugin `metadata.provides` collection, missing capability fatal behavior, and capability tests.
- `Plugin dependsOn order is resolved deterministically`: satisfied by `resolvePluginDependencyOrder`, stable host-order tie-breaker, missing dependency fatal behavior, cycle fatal behavior, and dependency tests.
- `Lifecycle hooks run in dependency order`: satisfied by `bootstrapCore` and `runStartupLifecycle` tests covering `onInit`, `onReady`, async `onInit`, and missing hooks.
- `Dispose destroys plugins in reverse lifecycle order`: satisfied by `dispose()` and `runDestroyLifecycle` tests covering reverse order, successful lifecycle subset, missing hooks, and repeated dispose no-op.
- `M1 excludes later milestone behavior`: satisfied by package-boundary tests and scope guard search showing no later milestone runtime dependencies.
- `Workflow documents are written in Chinese`: satisfied for OpenSpec, plan, task, validation, and this review prose. Code identifiers, API names, package names, paths, and OpenSpec structure keywords remain English.

## Architecture Boundary Review

- Core remains business-blind: no domain/editor-content business logic was introduced.
- UI Shell concerns do not leak into Core: no React, Vue, DOM, component, or Shell runtime code was introduced.
- Third-party engine APIs remain outside Core: no ProseMirror, Remark, parser, serializer, or Adapter implementation was introduced.
- State changes through Command Bus are not applicable in M1: this change intentionally excludes Command Bus and Event Hub.
- Manifest remains the authoritative plugin entry point through `ExtensionPlugin.manifest`.
- Adapter-backed capabilities `core:engine` and `core:parser` remain part of the public capability type because the source SDK docs define them, but M1 does not include them in `M1_CORE_CAPABILITIES` and tests prove they are not silently provided.

## Public Contract Review

The exported surface remains inside the OpenSpec-allowed M1 bootstrap set:

- `CapabilityId`, `CoreCapabilityId`, `PermissionId`, `PluginCapabilityId`, `PluginName`, `VendorCapabilityId`
- `M1_CORE_CAPABILITIES`
- `CoreError`, `CoreErrorCode`, `CoreErrorOptions`
- `bootstrapCore`, `BootstrapCoreOptions`, `CoreBootstrapRuntime`
- `resolvePluginDependencyOrder`
- `SUPPORTED_MANIFEST_VERSIONS`, Manifest and plugin types

No `createEditor`, Command Bus, Event Hub, Adapter, Shell, Markdown parser, Markdown serializer, React, Remark, ProseMirror, or GFM public API was exported.

## Validation Evidence

Commands rerun during this review:

- `pnpm --filter @aether-md/core exec tsc --noEmit`
  - Result: passed.
- `pnpm --filter @aether-md/core test -- --run`
  - Result: passed.
  - Evidence: 22 tests, 6 suites, 22 pass, 0 fail.
- `rg "react|prosemirror|remark|gfm|CommandBus|EventHub|Adapter" packages/core package.json pnpm-workspace.yaml`
  - Result: passed.
  - Notes: command exited with code 1 because there were no matches; that is the expected scope-guard result.

Validation coverage is sufficient for this M1 spec. Tests were added and not weakened.

## Deviations And Follow-ups

Accepted deviations:

- Node built-in test runner plus TypeScript compiled output is used instead of Vitest. This is acceptable for M1 because it keeps test dependencies minimal and validation is repeatable.
- `dispose()` repeats are implemented as explicit no-op after first dispose. This is slightly more defined than the minimum reverse-destroy requirement, but it is recorded in task and validation deviations and does not expand into full lifecycle hardening.
- Workflow skill and workflow guide updates were made to support the Step 6.5 execution loop used by this change. They are not Core runtime changes. They should be reviewed during the next docs/spec sync so the long-lived workflow source remains intentional.

Recommended future hardening, not blockers for this change:

- Define duplicate `metadata.name` behavior in a later Manifest/lifecycle hardening change. Current OpenSpec requirements cover missing dependencies and cycles, but do not explicitly require duplicate plugin-name rejection.
- Decide whether partial startup cleanup after `onInit` or `onReady` failure belongs in a future lifecycle hardening spec.
- Decide whether dispose idempotency should become a documented public contract.

## Blockers

None.

## Required Updates Before Archive

- Run `aether-workflow-update-docs-spec` to decide whether the new workflow Step 6.5 and skill guidance should be retained in long-lived docs/specs as-is.
- Sync the implemented `core-bootstrap` behavior into main OpenSpec specs if this workflow expects main specs to be updated before archive.
- Consider adding a changelog or project-status note for the introduction of the first `@aether-md/core` M1 package if the docs/spec sync step requires it.

## Recommended Next Skill

Use `aether-workflow-update-docs-spec`.
