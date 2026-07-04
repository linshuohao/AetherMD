# Task 05: 实现 `dependsOn` 拓扑排序

Change:

- `add-core-bootstrap`

Spec Requirement:

- `Plugin dependsOn order is resolved deterministically`

Source Docs:

- `.superpowers/plans/add-core-bootstrap.md`
- `openspec/changes/add-core-bootstrap/specs/core-bootstrap/spec.md`
- `openspec/changes/add-core-bootstrap/design.md`
- `docs/sdk/manifest.md`
- `docs/sdk/lifecycle.md`
- `docs/engineering/test-strategy.md`
- `docs/engineering/error-model.md`
- `docs/adr/005-manifest-capabilities-versioning.md`

Allowed Files:

- `packages/core/src/dependencies.ts`
- `packages/core/src/manifest.ts`
- `packages/core/src/errors.ts`
- `packages/core/src/index.ts`
- `packages/core/src/**/*.test.ts`

Forbidden Files:

- Service Capability semantics beyond consuming validated plugin metadata
- Lifecycle startup or dispose implementation files
- Command Bus、Event Hub、Adapter、React、Remark、ProseMirror、GFM implementation files
- Default ConflictResolver implementation
- `docs/**`
- `openspec/**`

Implementation Notes:

- 使用 `metadata.name` 建立 plugin dependency graph。
- `metadata.dependsOn` 中的 dependency 必须先于 dependent plugin。
- missing dependency 返回 fatal Core bootstrap error。
- dependency cycle 返回 fatal Core bootstrap error。
- 对无依赖或同层节点使用宿主传入 plugin 顺序作为稳定 tie-breaker。
- 不实现 lifecycle hook 调用，只返回 resolved order。

Validation:

- `pnpm --filter @aether-md/core test -- --run`
- `pnpm --filter @aether-md/core exec tsc --noEmit`
- 测试场景：
  - `table` depends on `heading` 时 `heading` 排在 `table` 前。
  - 无依赖 plugins 保持宿主输入顺序。
  - missing dependency fatal，hooks 不运行。
  - dependency cycle fatal，hooks 不运行。

Review Checklist:

- [x] 排序结果确定性，不依赖对象枚举偶然顺序。
- [x] missing dependency 和 cycle 均为 fatal Core bootstrap error。
- [x] 没有调用 lifecycle hooks。
- [x] 没有处理 compile layer merge 或 ConflictResolver。
- [x] tests 覆盖 simple order、stable order、missing、cycle。

Rollback Notes:

- 回滚 dependency resolver 和相关 tests。
- 保留 Manifest 与 Service Capability 校验任务成果。

Status:

- completed

Run Log:

- 已实现 `resolvePluginDependencyOrder`，按 `metadata.name` 与 `metadata.dependsOn` 解析确定性 lifecycle order。
- 已按宿主输入顺序处理无依赖或同层节点的稳定 tie-breaker。
- 已对 missing dependency 和 dependency cycle 返回 fatal `CoreError`。
- 已添加 tests 覆盖 dependency-before-dependent、同层稳定顺序、missing dependency fatal、cycle fatal，并确认未调用 lifecycle hooks。
- 已执行 `pnpm --filter @aether-md/core test -- --run`，12 tests passed。
- 已执行 `pnpm --filter @aether-md/core exec tsc --noEmit`，结果通过。
- 验证记录已写入 `.superpowers/runs/add-core-bootstrap/validation.md`。

Deviation:

- 无。
