# Task 03: 实现 Manifest 版本校验

Change:

- `add-core-bootstrap`

Spec Requirement:

- `Manifest version is validated during bootstrap`
- `Manifest shape is validated before lifecycle hooks`

Source Docs:

- `.superpowers/plans/add-core-bootstrap.md`
- `openspec/changes/add-core-bootstrap/specs/core-bootstrap/spec.md`
- `openspec/changes/add-core-bootstrap/design.md`
- `docs/sdk/manifest.md`
- `docs/architecture/compatibility.md`
- `docs/engineering/manifest-loading.md`
- `docs/engineering/error-model.md`
- `docs/engineering/test-strategy.md`
- `docs/sdk/lifecycle.md`

Allowed Files:

- `packages/core/src/manifest.ts`
- `packages/core/src/errors.ts`
- `packages/core/src/index.ts`
- `packages/core/src/**/*.test.ts`
- `packages/core/package.json` only for test script wiring if not already present

Forbidden Files:

- Service Capability resolver implementation files, except shared type imports
- Dependency ordering implementation files
- Lifecycle startup or dispose implementation files
- Command Bus、Event Hub、Adapter、React、Remark、ProseMirror、GFM implementation files
- `docs/**`
- `openspec/**`

Implementation Notes:

- 实现 layered `ExtensionManifest` shape validation 的最小逻辑。
- 校验 `metadata.manifestVersion` 是否属于 `SUPPORTED_MANIFEST_VERSIONS`。
- invalid shape 和 unsupported version 都应产生 fatal Core bootstrap error。
- validation failure 必须发生在任何 lifecycle hook 运行前。
- 不实现 Service Capability 校验、`dependsOn` 排序或 lifecycle startup。

Validation:

- `pnpm --filter @aether-md/core test -- --run`，如果项目使用 Vitest 或等价 runner。
- `pnpm --filter @aether-md/core exec tsc --noEmit`
- 测试场景：
  - `manifestVersion: 1` 通过。
  - unsupported `manifestVersion` fatal。
  - 缺失 `manifest.metadata` fatal。
  - invalid Manifest 不调用 `runtime.onInit` 或 `runtime.onReady`。

Review Checklist:

- [x] 校验逻辑只处理 Manifest shape/version，不夹带 capability 或 lifecycle 行为。
- [x] error severity/source 符合 fatal Core bootstrap error 方向。
- [x] unsupported version 使用 `SUPPORTED_MANIFEST_VERSIONS` 作为唯一来源。
- [x] tests 覆盖 success 和 failure paths。
- [x] 没有引入后续里程碑依赖。

Rollback Notes:

- 回滚本任务新增或修改的 Manifest validation 和对应 tests。
- 保留 Task 01/02 的 package boundary 与 public types。

Status:

- completed

Run Log:

- 已实现 `loadPluginManifests` 与 `validateSupportedManifestVersion`，只处理 Manifest shape 与 `metadata.manifestVersion`。
- 已为 invalid shape 与 unsupported version 返回 fatal `CoreError`。
- 已添加 Manifest validation tests，覆盖 `manifestVersion: 1`、unsupported version、缺失 `manifest.metadata`、invalid Manifest 不调用 `runtime.onInit` 或 `runtime.onReady`。
- 已修正 test script 与 `tsconfig.test.json`，确保 Node built-in test runner 实际执行 compiled `.test.js` 文件。
- 已执行 `pnpm install --config.confirmModulesPurge=false`，结果通过。
- 已执行 `pnpm --filter @aether-md/core test -- --run`，4 tests passed。
- 已执行 `pnpm --filter @aether-md/core exec tsc --noEmit`，结果通过。
- 验证记录已写入 `.superpowers/runs/add-core-bootstrap/validation.md`。

Deviation:

- 使用 Node built-in test runner 加 TypeScript 编译输出作为最小测试方案，未引入 Vitest 等额外测试框架。
