# Task 06: 实现生命周期启动顺序

Change:

- `add-core-bootstrap`

Spec Requirement:

- `Lifecycle hooks run in dependency order`
- `Manifest shape is validated before lifecycle hooks`
- `Service Capability requirements are validated`
- `Plugin dependsOn order is resolved deterministically`

Source Docs:

- `.superpowers/plans/add-core-bootstrap.md`
- `openspec/changes/add-core-bootstrap/specs/core-bootstrap/spec.md`
- `openspec/changes/add-core-bootstrap/design.md`
- `docs/sdk/lifecycle.md`
- `docs/architecture/core-api.md`
- `docs/engineering/test-strategy.md`
- `docs/engineering/error-model.md`
- `docs/adr/001-microkernel-architecture.md`
- `docs/adr/002-declarative-manifest-merging.md`

Allowed Files:

- `packages/core/src/bootstrap.ts`
- `packages/core/src/lifecycle.ts`
- `packages/core/src/manifest.ts`
- `packages/core/src/capabilities.ts`
- `packages/core/src/dependencies.ts`
- `packages/core/src/errors.ts`
- `packages/core/src/index.ts`
- `packages/core/src/**/*.test.ts`

Forbidden Files:

- Dispose implementation beyond storing successful lifecycle order for a later task
- Command Bus、Event Hub、Adapter、React、Remark、ProseMirror、GFM implementation files
- Markdown parse/serialize implementation
- DOM or browser UI runtime code
- `docs/**`
- `openspec/**`

Implementation Notes:

- 串联前置 validation：Manifest shape/version、Service Capability、`dependsOn` order。
- 只有全部 validation 成功后才允许调用 lifecycle hooks。
- 按 resolved dependency order 调用 `runtime.onInit`。
- successful `onInit` 后，按 resolved dependency order 调用 `runtime.onReady`。
- `runtime.onInit` 可以是 async，必须 await。
- 缺失 hook 时跳过。
- 本任务可记录 successful lifecycle order，但不实现 `dispose()` 的逆序销毁行为。
- `onInit` 或 `onReady` failure 后的 cleanup 若超出 spec，应记录 Deviation 或交给后续明确任务，不得 silent fallback。

Validation:

- `pnpm --filter @aether-md/core test -- --run`
- `pnpm --filter @aether-md/core exec tsc --noEmit`
- 测试场景：
  - validation failure 时 `onInit`/`onReady` 不运行。
  - `onInit` 按 dependency order 调用。
  - `onReady` 在 successful `onInit` 后按 dependency order 调用。
  - async `onInit` 被 await。
  - 缺失 hook 不影响其他 hooks 顺序。

Review Checklist:

- [x] lifecycle hooks 只在全部 validation 通过后运行。
- [x] `onInit` 和 `onReady` 顺序符合 resolved dependency order。
- [x] async `onInit` 被正确 await。
- [x] 未引入 Command/Event/Adapter/DOM。
- [x] partial failure 行为没有 silent fallback。

Rollback Notes:

- 回滚 bootstrap/lifecycle startup implementation 和相关 tests。
- 保留前置 Manifest、Capability、Dependency 校验成果。

Status:

- completed

Run Log:

- 已实现 `bootstrapCore` 串联 Manifest shape/version validation、Service Capability validation、`dependsOn` order 与 startup lifecycle。
- 已实现 `runStartupLifecycle`，按 resolved dependency order 依次 await `runtime.onInit`，再按相同顺序运行 `runtime.onReady`。
- 已记录 `successfulLifecycleOrder` 供后续 dispose task 使用；本任务未实现 dispose 行为。
- 已为 lifecycle hook failure 包装 fatal `CoreError`，避免 silent fallback。
- 已添加 tests 覆盖 validation failure 不运行 hooks、`onInit` dependency order、`onReady` 在 successful `onInit` 后运行、async `onInit` 被 await、缺失 hook 被跳过。
- 已执行 `pnpm --filter @aether-md/core test -- --run`，16 tests passed。
- 已执行 `pnpm --filter @aether-md/core exec tsc --noEmit`，结果通过。
- 验证记录已写入 `.superpowers/runs/add-core-bootstrap/validation.md`。

Deviation:

- lifecycle hook failure 被包装为 fatal `CoreError` 并阻止返回 running runtime；partial startup cleanup 未在本任务中发明，等待后续明确 spec 或 task。
