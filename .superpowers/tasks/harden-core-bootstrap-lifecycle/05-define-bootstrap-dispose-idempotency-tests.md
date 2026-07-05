# Task 05: 定义 bootstrap dispose 幂等 contract 测试

Change:

- `harden-core-bootstrap-lifecycle`

Branch:

- `fix/harden-core-bootstrap-lifecycle`

Spec Requirement:

- `core-bootstrap` / MODIFIED `Dispose destroys plugins in reverse lifecycle order`
  - Scenario: `Repeated dispose does not repeat destroy hooks`
  - Scenario: `Repeated dispose is a no-op public contract`
  - Scenario: `Dispose invokes onDestroy in reverse order`（回归）

Source Docs:

- `.superpowers/plans/harden-core-bootstrap-lifecycle.md`
- `openspec/changes/harden-core-bootstrap-lifecycle/specs/core-bootstrap/spec.md`
- `docs/sdk/lifecycle.md`
- `docs/architecture/core-api.md`

Allowed Files:

- `packages/core/src/lifecycle.test.ts`
- `packages/core/src/bootstrap.test.ts`

Forbidden Files:

- `packages/core/src/lifecycle.ts`（production）
- `packages/core/src/bootstrap.ts`（production）
- `packages/core/src/command-event*.ts`
- `docs/**`
- `openspec/**`

Implementation Notes:

- 本 task **只添加或强化测试**，不修改 dispose 实现（实现已基本存在）。
- 强化现有 `does not run destroy hooks more than once for repeated dispose calls`：
  - 第二次（及可选第三次）`await assert.doesNotReject(() => runtime.dispose())`。
  - 保持 `destroyCalls === 1`。
- 新增 **`repeated dispose completes without throwing`**（若与上合并则确保 no-throw 断言 explicit）。
- 新增 **`aborts normal dispose when onDestroy fails`**（asymmetry 对照，为 Task 06 准备）：
  - 两 plugin 成功 startup；第一个 `onDestroy` throw。
  - Assert：`runtime.dispose()` rejects。
  - Assert：第二个 plugin `onDestroy` **未**调用。
- 此 asymmetry test 在 Task 04 完成后运行；若当前实现已 fatal abort，可能 **PASS**；若缺断言则仍属本 task 范围。

TDD Notes:

- repeated dispose no-throw：对现有实现可能已 **PASS**，仍须 explicit 断言以满足 public contract 测试覆盖。
- normal dispose fatal test：记录 PASS/FAIL baseline；Task 06 仅在有 gap 时改 production。

Validation:

```bash
pnpm --filter @aether-md/core exec tsc --noEmit
pnpm --filter @aether-md/core test -- --run --test-name-pattern "dispose|destroy hooks"
```

预期：新增/强化断言 **PASS**（implementation 已 mostly 满足）；normal dispose fatal 应 **PASS** 若现有行为正确。

Intuitive Verification:

- 对比 `command-event-runtime.test.ts` repeated dispose：bootstrap dispose 独立契约，不混测 M2。

Review Checklist:

- [ ] 仅 test 文件改动。
- [ ] repeated dispose 含 no-throw 断言。
- [ ] normal dispose fatal asymmetry test 存在。
- [ ] 未 import 或修改 Command/Event runtime。

Rollback Notes:

- 回滚 test 增强即可。

Version Impact:

- none

Commit Scope:

- `test(core): strengthen bootstrap dispose idempotency contract tests`

Status:

- completed

Run Log:

- 2026-07-05: 强化 `does not run destroy hooks more than once`：两次 `assert.doesNotReject` on repeat dispose。
- 新增 `aborts normal dispose when onDestroy fails`（table destroy fail，heading 未调用）。
- 验证：dispose 相关 tests **PASS**（57 tests total in run）。

Deviation:

- none
