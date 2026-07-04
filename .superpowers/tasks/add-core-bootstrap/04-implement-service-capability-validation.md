# Task 04: 实现 Service Capability 校验

Change:

- `add-core-bootstrap`

Spec Requirement:

- `Service Capability requirements are validated`
- `M1 excludes later milestone behavior`

Source Docs:

- `.superpowers/plans/add-core-bootstrap.md`
- `openspec/changes/add-core-bootstrap/specs/core-bootstrap/spec.md`
- `openspec/changes/add-core-bootstrap/design.md`
- `docs/sdk/capabilities-and-permissions.md`
- `docs/glossary.md`
- `docs/engineering/test-strategy.md`
- `docs/engineering/error-model.md`
- `docs/adr/005-manifest-capabilities-versioning.md`
- `docs/adr/006-layered-manifest-permission-model.md`

Allowed Files:

- `packages/core/src/capabilities.ts`
- `packages/core/src/manifest.ts`
- `packages/core/src/errors.ts`
- `packages/core/src/index.ts`
- `packages/core/src/**/*.test.ts`

Forbidden Files:

- Adapter implementations or packages
- Default `ConflictResolver` implementation unless explicitly required by an updated spec
- Command Bus、Event Hub、React、Remark、ProseMirror、GFM implementation files
- Dependency ordering implementation files, except using already exported plugin metadata types
- Lifecycle startup or dispose implementation files
- `docs/**`
- `openspec/**`

Implementation Notes:

- 显式定义 M1 Core-provided Service Capability set。
- 不得 silent provide Adapter-backed capabilities，例如 `core:engine` 或 `core:parser`，除非 OpenSpec 被更新明确允许。
- 收集 loaded plugins 的 `metadata.provides`。
- 校验每个 plugin 的 `metadata.requires` 都能由 Core 或 loaded plugins 满足。
- 缺失 Service Capability 返回 fatal Core bootstrap error。
- 不处理 duplicate `metadata.provides` 的 ConflictResolver 语义；如必须处理，记录 Deviation 或更新 OpenSpec。

Validation:

- `pnpm --filter @aether-md/core test -- --run`
- `pnpm --filter @aether-md/core exec tsc --noEmit`
- 测试场景：
  - capability 由 M1 Core-provided set 提供时通过。
  - capability 由另一个 loaded plugin 的 `metadata.provides` 提供时通过。
  - missing capability fatal，且 hooks 不运行。
  - Adapter-backed capability 不被 silent provide。

Review Checklist:

- [x] M1 Core-provided capability set 显式且可测试。
- [x] `metadata.requires` 只 against Core + loaded plugin provides 校验。
- [x] 没有引入 Adapter 或 ConflictResolver 实现。
- [x] missing capability 是 fatal startup failure。
- [x] tests 覆盖 Core provider、plugin provider、missing provider、Adapter-backed boundary。

Rollback Notes:

- 回滚 capability validator、M1 capability registry 和相关 tests。
- 保留 Manifest version validation 和 public types。

Status:

- completed

Run Log:

- 已实现 `collectProvidedCapabilities` 与 `validateServiceCapabilities`。
- 已显式保留 M1 Core-provided capability set：`core:history`、`core:selection`、`core:clipboard`、`core:assets`。
- 已确保 `core:engine` 与 `core:parser` 不会在 M1 被 Core silent provide。
- 已添加 tests 覆盖 Core provider、plugin provider、missing provider fatal、Adapter-backed boundary。
- 已执行 `pnpm --filter @aether-md/core test -- --run`，8 tests passed。
- 已执行 `pnpm --filter @aether-md/core exec tsc --noEmit`，结果通过。
- 验证记录已写入 `.superpowers/runs/add-core-bootstrap/validation.md`。

Deviation:

- 无。
