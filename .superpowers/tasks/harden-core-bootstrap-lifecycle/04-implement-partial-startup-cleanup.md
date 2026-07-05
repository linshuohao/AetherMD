# Task 04: 实现 partial startup cleanup

Change:

- `harden-core-bootstrap-lifecycle`

Branch:

- `fix/harden-core-bootstrap-lifecycle`

Spec Requirement:

- `core-bootstrap` / MODIFIED `Lifecycle hooks run in dependency order`（全部 cleanup scenarios）

Source Docs:

- `.superpowers/plans/harden-core-bootstrap-lifecycle.md`
- `openspec/changes/harden-core-bootstrap-lifecycle/specs/core-bootstrap/spec.md`
- `openspec/changes/harden-core-bootstrap-lifecycle/design.md`
- `docs/sdk/lifecycle.md`
- `docs/engineering/error-model.md`

Allowed Files:

- `packages/core/src/lifecycle.ts`
- `packages/core/src/bootstrap.ts`（仅当 startup 路径需透传 error；预期 minimal 或 zero change）
- `packages/core/src/lifecycle.test.ts`（微调断言）
- `packages/core/src/bootstrap.test.ts`（微调断言）

Forbidden Files:

- `packages/core/src/command-event*.ts`
- `packages/core/src/manifest.ts`
- `packages/core/src/errors.ts`（除非必须，默认不改）
- `packages/core/src/capabilities.ts`
- `packages/core/src/dependencies.ts`
- `packages/plugins/**`
- `docs/**`
- `openspec/**`

Implementation Notes:

- 重构 `runStartupLifecycle`：
  - 维护 `initialized: LoadedPlugin[]`（successful onInit order）。
  - `onInit` / `onReady` loop 捕获 failure。
  - failure 时：对 `initialized` reverse-order 调用 destroy cleanup，再 rethrow **原始** startup `CoreError`（`LIFECYCLE_HOOK_FAILED`）。
- Cleanup 实现策略（选最小 diff）：
  - **推荐：** `runDestroyLifecycle(..., { continueOnDestroyFailure: true })` 或独立 `runStartupFailureCleanup`，best-effort per plugin。
  - cleanup 中 destroy failure **MAY** attach 到 primary error `cause`；primary code 仍为 failing hook 的 `LIFECYCLE_HOOK_FAILED`。
- **保持** 正常 `runDestroyLifecycle`（`bootstrapCore.dispose` 路径）**fatal abort**，不在此 task 改为 best-effort。
- `bootstrapCore` 仍 reject，不返回 partial runtime。

TDD Notes:

- Green Task 03 全部 cleanup tests。
- 确认现有 dispose order tests 仍 PASS。

Validation:

```bash
pnpm --filter @aether-md/core exec tsc --noEmit
pnpm --filter @aether-md/core test -- --run --test-name-pattern "cleanup|onInit fails|onReady fails|startup fails"
pnpm --filter @aether-md/core test -- --run
```

预期：全部 **PASS**。

Intuitive Verification:

- startup failure 后无 returned runtime；已成功 onInit 的 plugin 收到 onDestroy。

Review Checklist:

- [ ] cleanup 仅针对 successful onInit 集合。
- [ ] primary error 未被 cleanup error 替换（测试可证）。
- [ ] normal dispose 路径行为未改为 best-effort。
- [ ] 未引入 Command/Event / Adapter 代码。

Rollback Notes:

- 回滚 `lifecycle.ts`（及 bootstrap 若有改动）。
- Task 03 tests 将再次 FAIL。

Version Impact:

- `@aether-md/core` patch-level behavior change（startup failure 新增 reverse cleanup）
- 无新 public export

Commit Scope:

- `fix(core): reverse cleanup on bootstrap startup hook failure`

Status:

- completed

Run Log:

- 2026-07-05: `lifecycle.ts` 实现 startup failure cleanup（`runStartupFailureCleanup` + `continueOnDestroyFailure`）。
- normal `runDestroyLifecycle` 保持 fatal abort。
- 验证：startup failure cleanup 5/5 PASS；全 suite 56/56 PASS。

Deviation:

- none
