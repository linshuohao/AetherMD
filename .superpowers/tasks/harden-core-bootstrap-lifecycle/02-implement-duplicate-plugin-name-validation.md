# Task 02: 实现 duplicate plugin name validation

Change:

- `harden-core-bootstrap-lifecycle`

Branch:

- `fix/harden-core-bootstrap-lifecycle`

Spec Requirement:

- `core-bootstrap` / ADDED `Duplicate plugin metadata.name is rejected during bootstrap validation`

Source Docs:

- `.superpowers/plans/harden-core-bootstrap-lifecycle.md`
- `openspec/changes/harden-core-bootstrap-lifecycle/specs/core-bootstrap/spec.md`
- `openspec/changes/harden-core-bootstrap-lifecycle/design.md`
- `docs/sdk/manifest.md`
- `docs/engineering/manifest-loading.md`
- `docs/engineering/error-model.md`

Allowed Files:

- `packages/core/src/errors.ts`
- `packages/core/src/manifest.ts`
- `packages/core/src/bootstrap.ts`
- `packages/core/src/bootstrap.test.ts`（仅修正 Task 01 测试与实现对齐的小改动）
- `packages/core/src/manifest.test.ts`（可选：直接测 internal helper）

Forbidden Files:

- `packages/core/src/lifecycle.ts`
- `packages/core/src/dependencies.ts`（不在此 task 改 Map 逻辑）
- `packages/core/src/command-event*.ts`
- `packages/core/src/index.ts`（除非必须 re-export，默认不 export `validateUniquePluginNames`）
- `packages/plugins/**`
- `docs/**`
- `openspec/**`

Implementation Notes:

- 在 `CoreErrorCode` union 增加 `"PLUGIN_NAME_DUPLICATE"`。
- 在 `manifest.ts` 实现 **internal** `validateUniquePluginNames(loadedPlugins)`：
  - 扫描 `metadata.name` 出现次数。
  - duplicate 时 throw fatal `CoreError({ code: "PLUGIN_NAME_DUPLICATE", ... })`。
  - **默认不** 从 `index.ts` export（plan Open Questions 裁决）。
- 在 `bootstrap.ts`：`loadPluginManifests` 之后、`validateServiceCapabilities` 之前调用 `validateUniquePluginNames`。
- 不修改 `resolvePluginDependencyOrder` 的 Map 行为；duplicate 在更早阶段拦截。

TDD Notes:

- Green Task 01 的 failing tests。
- 最小实现使 duplicate + unique tests 全 PASS。

Validation:

```bash
pnpm --filter @aether-md/core exec tsc --noEmit
pnpm --filter @aether-md/core test -- --run --test-name-pattern "duplicate metadata.name|unique plugin names"
pnpm --filter @aether-md/core test -- --run
```

预期：全部 **PASS**。

Intuitive Verification:

- 手动 trace：`bootstrapCore` 在 capability 校验前即因 duplicate throw。

Review Checklist:

- [ ] `PLUGIN_NAME_DUPLICATE` 已加入 `CoreErrorCode`。
- [ ] validation 在 lifecycle hooks 之前。
- [ ] 未 export 新 helper（除非 deviation 记录）。
- [ ] 未 touch lifecycle / Command/Event / Adapter。

Rollback Notes:

- 回滚 `errors.ts`、`manifest.ts`、`bootstrap.ts` 本 task 改动。
- Task 01 测试可保留（会再次 FAIL）。

Version Impact:

- `@aether-md/core` patch-level
- public `CoreErrorCode` union 新增 `PLUGIN_NAME_DUPLICATE`
- `SUPPORTED_MANIFEST_VERSIONS` 不变

Commit Scope:

- `fix(core): reject duplicate plugin metadata.name during bootstrap`

Status:

- completed

Run Log:

- 2026-07-05: `errors.ts` 新增 `PLUGIN_NAME_DUPLICATE`。
- `manifest.ts` 新增 `validateUniquePluginNames`（未从 index export）。
- `bootstrap.ts` 在 capability 校验前调用 duplicate validation。
- 验证：duplicate + unique tests PASS；全 suite 51/51 PASS。

Deviation:

- none
