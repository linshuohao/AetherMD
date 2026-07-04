# Task 07: 实现 `dispose` 逆序销毁

Change:

- `add-core-bootstrap`

Spec Requirement:

- `Dispose destroys plugins in reverse lifecycle order`
- `Lifecycle hooks run in dependency order`

Source Docs:

- `.superpowers/plans/add-core-bootstrap.md`
- `openspec/changes/add-core-bootstrap/specs/core-bootstrap/spec.md`
- `openspec/changes/add-core-bootstrap/design.md`
- `docs/sdk/lifecycle.md`
- `docs/architecture/core-api.md`
- `docs/engineering/test-strategy.md`
- `docs/engineering/error-model.md`

Allowed Files:

- `packages/core/src/bootstrap.ts`
- `packages/core/src/lifecycle.ts`
- `packages/core/src/errors.ts`
- `packages/core/src/index.ts`
- `packages/core/src/**/*.test.ts`

Forbidden Files:

- New public API beyond the existing M1 bootstrap surface
- Command Bus、Event Hub、Adapter、React、Remark、ProseMirror、GFM implementation files
- Markdown parse/serialize implementation
- DOM or browser UI runtime code
- `docs/**`
- `openspec/**`

Implementation Notes:

- 使用 Task 06 记录的 successful lifecycle order。
- `dispose()` 按 successful lifecycle order 的逆序调用 `runtime.onDestroy`。
- 缺失 `onDestroy` 时跳过。
- 不在 `onDestroy` 中派发 Command 或 Event。
- 不隐式宣称完整幂等语义；如果实现选择 idempotent 或 safe reject，必须在 Deviation 或后续 spec 中说明。
- `onDestroy` failure 处理需保持 explicit，不得 silent swallow。

Validation:

- `pnpm --filter @aether-md/core test -- --run`
- `pnpm --filter @aether-md/core exec tsc --noEmit`
- 测试场景：
  - 多 plugin 成功启动后，`dispose()` 逆序调用 `onDestroy`。
  - 只销毁 successful lifecycle order 中的 plugins。
  - 缺失 `onDestroy` 不影响其他 destroy hooks。
  - 不要求 Command/Event/Adapter 存在。

Review Checklist:

- [x] `onDestroy` 逆序基于 successful lifecycle order。
- [x] 没有引入 Command/Event/Adapter 或 DOM。
- [x] dispose 行为没有 silent fallback。
- [x] 幂等语义没有被未记录地承诺。
- [x] tests 覆盖 reverse order 和 missing hook。

Rollback Notes:

- 回滚 dispose/destroy implementation 和相关 tests。
- 保留 lifecycle startup implementation。

Status:

- completed

Run Log:

- 已实现 `runDestroyLifecycle`，按 `successfulLifecycleOrder` 逆序调用 `runtime.onDestroy`。
- 已在 `bootstrapCore` 返回的 runtime 上添加 `dispose()`，基于 Task 06 记录的 successful lifecycle order 执行 teardown。
- 已确保缺失 `onDestroy` 时跳过，且不引入 Command/Event/Adapter 或 DOM 行为。
- 已添加 tests 覆盖 reverse order、只销毁 successful lifecycle order、缺失 `onDestroy`、重复 `dispose()` 不重复销毁。
- 已执行 `pnpm --filter @aether-md/core test -- --run`，20 tests passed。
- 已执行 `pnpm --filter @aether-md/core exec tsc --noEmit`，结果通过。
- 验证记录已写入 `.superpowers/runs/add-core-bootstrap/validation.md`。

Deviation:

- `dispose()` 对重复调用采用显式 no-op，避免重复执行 destroy hooks；完整 dispose 幂等语义仍待后续 spec hardening。
