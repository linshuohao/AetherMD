# Task 02: 定义 `@aether-md/core` public types

Change:

- `add-core-bootstrap`

Spec Requirement:

- `Minimal Core package exists`
- `Workflow documents are written in Chinese`

Source Docs:

- `.superpowers/plans/add-core-bootstrap.md`
- `openspec/changes/add-core-bootstrap/specs/core-bootstrap/spec.md`
- `openspec/changes/add-core-bootstrap/design.md`
- `docs/sdk/manifest.md`
- `docs/sdk/capabilities-and-permissions.md`
- `docs/architecture/compatibility.md`
- `docs/engineering/error-model.md`
- `docs/glossary.md`
- `docs/adr/005-manifest-capabilities-versioning.md`
- `docs/adr/006-layered-manifest-permission-model.md`

Allowed Files:

- `packages/core/src/index.ts`
- `packages/core/src/types.ts`
- `packages/core/src/errors.ts`
- `packages/core/src/manifest.ts`
- `packages/core/src/capabilities.ts`
- `packages/core/src/**/*.test.ts` only if needed for export/type checks

Forbidden Files:

- root workspace/package files, unless Task 01 left an explicitly recorded blocker
- `packages/react/**`
- `packages/preset-gfm/**`
- `packages/plugin-prosemirror/**`
- `packages/plugin-remark/**`
- `packages/plugins/**`
- Runtime implementations for manifest validation, capability resolution, dependency ordering, lifecycle startup, or dispose
- `docs/**`
- `openspec/**`

Implementation Notes:

- 定义 M1 public contract 所需类型：`ExtensionManifest`、`ManifestMetadata`、`RuntimeManifest`、`ExtensionPlugin`、`PluginName`、`CapabilityId`、`SUPPORTED_MANIFEST_VERSIONS`、`CoreError` 或等价 fatal bootstrap error shape。
- 保持类型与 `docs/sdk/manifest.md`、`docs/sdk/capabilities-and-permissions.md` 和 `docs/architecture/compatibility.md` 一致。
- 允许为后续 runtime task 暴露必要的 error code 类型，但不得提前实现校验流程。
- 不定义 Command/Event、Adapter、Editor document model、React shell 相关 public API。

Validation:

- `pnpm --filter @aether-md/core exec tsc --noEmit`
- package export smoke test 或 TypeScript compile check，确认 public types 可从 `@aether-md/core` 入口导入。
- `rg "Command|Event|Adapter|React|ProseMirror|Remark|GFM|Markdown" packages/core/src`，确认没有引入后续里程碑 public API。

Review Checklist:

- [x] public types 与 source docs 命名和层级一致。
- [x] `SUPPORTED_MANIFEST_VERSIONS` 为 `[1] as const`。
- [x] `CapabilityId` 不退化为裸 `string` 的主契约。
- [x] error shape 支持 fatal Core bootstrap error。
- [x] 没有混入 runtime validation 或 lifecycle 实现。

Rollback Notes:

- 删除或回滚本任务新增的 public type/error/capability 文件。
- 保留 Task 01 的 package boundary，除非本任务也修改了边界配置。

Status:

- completed

Run Log:

- 已将 public contract 拆分到 `types.ts`、`manifest.ts`、`capabilities.ts`、`errors.ts`，并由 `index.ts` 统一导出。
- 已定义 `ExtensionManifest`、`ManifestMetadata`、`RuntimeManifest`、`ExtensionPlugin`、`PluginName`、`CapabilityId`、`SUPPORTED_MANIFEST_VERSIONS` 与 fatal `CoreError` shape。
- 已显式定义 `M1_CORE_CAPABILITIES`，但未实现 capability validation runtime。
- 已执行 `pnpm --filter @aether-md/core exec tsc --noEmit`，结果通过。
- 已执行 `rg "Command|Event|Adapter|React|ProseMirror|Remark|GFM|Markdown" packages/core/src`，未匹配到后续里程碑 public API 关键词。
- 验证记录已写入 `.superpowers/runs/add-core-bootstrap/validation.md`。

Deviation:

- 无。
