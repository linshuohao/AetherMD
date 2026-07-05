# Task 06: 对齐 bootstrap dispose 幂等 public contract

Change:

- `harden-core-bootstrap-lifecycle`

Branch:

- `fix/harden-core-bootstrap-lifecycle`

Spec Requirement:

- `core-bootstrap` / MODIFIED `Dispose destroys plugins in reverse lifecycle order`
  - 含 normal dispose onDestroy failure fatal abort 要求

Source Docs:

- `.superpowers/plans/harden-core-bootstrap-lifecycle.md`
- `openspec/changes/harden-core-bootstrap-lifecycle/specs/core-bootstrap/spec.md`
- `docs/sdk/lifecycle.md`
- `docs/architecture/core-api.md`

Allowed Files:

- `packages/core/src/bootstrap.ts`
- `packages/core/src/lifecycle.ts`（仅当 Task 05 暴露 gap；预期 minimal）
- `packages/core/src/lifecycle.test.ts`（微调）
- `packages/core/src/bootstrap.test.ts`（微调）

Forbidden Files:

- `packages/core/src/command-event*.ts`
- `packages/core/src/manifest.ts`
- `packages/core/src/errors.ts`
- `packages/plugins/**`
- `docs/**`（Step 8）
- `openspec/**`

Implementation Notes:

- **预期：** `bootstrap.ts` 已有 `disposed` flag + early return；Task 05 tests 应已 PASS。
- 本 task 职责：
  1. 若 Task 05 有 FAIL，做 **最小** production fix 使 repeated dispose no-op / no throw 成立。
  2. 确认 normal `runDestroyLifecycle` 在 onDestroy failure 时 **fatal abort** 且不 continue（与 startup cleanup best-effort 区分）。
  3. 可选：在 `bootstrap.ts` dispose 或 `lifecycle.ts` 加 **一行** 注释指向 delta spec public contract（非必须）。
- **不得** 修改 `createCommandEventRuntime` 或 M2 dispose 行为。
- **不得** 从 `index.ts` 新增 export。

TDD Notes:

- Green Task 05 全部 dispose contract tests。
- 若已全部 PASS，Run Log 记录 “implementation already satisfied; no production diff” 仍属有效完成。

Validation:

```bash
pnpm --filter @aether-md/core exec tsc --noEmit
pnpm --filter @aether-md/core test -- --run --test-name-pattern "dispose|destroy hooks"
pnpm --filter @aether-md/core test -- --run
```

预期：全部 **PASS**。

Intuitive Verification:

- 成功 bootstrap 后连续调用 `dispose()` 三次不 throw，destroy 仅一次。

Review Checklist:

- [ ] Task 05 tests 全绿。
- [ ] normal dispose fatal vs startup cleanup best-effort 行为未混淆。
- [ ] 无 Command/Event 文件 diff。
- [ ] 无 docs 改动。

Rollback Notes:

- 回滚本 task 对 `bootstrap.ts` / `lifecycle.ts` 的任何改动。

Version Impact:

- none（行为文档化为主；代码可能 zero diff）

Commit Scope:

- `fix(core): align bootstrap dispose idempotency contract`（若有 code diff）
- 或 `chore(core): confirm bootstrap dispose contract tests`（若 zero diff）

Status:

- completed

Run Log:

- 2026-07-05: production 已满足 public contract；`bootstrap.ts` disposed flag + `lifecycle.ts` fatal normal dispose 无需改动。
- Task 05 tests 全 PASS；zero production diff for this task。

Deviation:

- none
