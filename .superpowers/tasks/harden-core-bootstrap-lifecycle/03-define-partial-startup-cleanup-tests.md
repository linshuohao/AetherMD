# Task 03: 定义 partial startup cleanup 失败测试

Change:

- `harden-core-bootstrap-lifecycle`

Branch:

- `fix/harden-core-bootstrap-lifecycle`

Spec Requirement:

- `core-bootstrap` / MODIFIED `Lifecycle hooks run in dependency order`
  - Scenario: `Startup hook failure cleans up successful onInit plugins`
  - Scenario: `Startup cleanup continues after onDestroy failure`
  - Scenario: `Startup failure before any onInit does not invoke onDestroy`
  - Scenario: `Lifecycle hook failure aborts startup`

Source Docs:

- `.superpowers/plans/harden-core-bootstrap-lifecycle.md`
- `openspec/changes/harden-core-bootstrap-lifecycle/specs/core-bootstrap/spec.md`
- `openspec/changes/harden-core-bootstrap-lifecycle/design.md`
- `docs/sdk/lifecycle.md`
- `docs/engineering/error-model.md`
- `docs/engineering/test-strategy.md`

Allowed Files:

- `packages/core/src/lifecycle.test.ts`
- `packages/core/src/bootstrap.test.ts`

Forbidden Files:

- `packages/core/src/lifecycle.ts`（production）
- `packages/core/src/bootstrap.ts`（production）
- `packages/core/src/manifest.ts`
- `packages/core/src/errors.ts`
- `packages/core/src/command-event*.ts`
- `packages/plugins/**`
- `docs/**`
- `openspec/**`

Implementation Notes:

- 本 task **只添加测试**，不实现 cleanup 逻辑。
- 建议新增 tests（名称可微调，语义须覆盖）：

1. **`cleans up successful onInit plugins when a later onInit fails`**
   - Plugin A：`onInit` 成功，注册 `onDestroy`。
   - Plugin B：`onInit` throw。
   - Assert：A `onDestroy` 被调用；B `onDestroy` 未调用；`bootstrapCore` rejects；primary `code === "LIFECYCLE_HOOK_FAILED"`。

2. **`cleans up all onInit-success plugins when onReady fails`**
   - 两 plugin 均 `onInit` 成功；第二 plugin `onReady` throw。
   - Assert：两者 `onDestroy` reverse order 调用。

3. **`does not invoke onDestroy when startup fails before any successful onInit`**
   - 第一 plugin `onInit` throw。
   - Assert：`onDestroy` calls === 0。

4. **`continues startup cleanup when onDestroy fails during cleanup`**
   - A `onInit` ok，B `onInit` throw；A `onDestroy` throw。
   - Assert：primary error 仍为 B 的 `LIFECYCLE_HOOK_FAILED`（非 A destroy failure）；若有三 plugin，第三个仍 attempt cleanup（可选扩展 fixture）。

5. **`does not return a running bootstrap runtime when startup hook fails`**（若 bootstrap.test 尚无，补一条）
   - `assert.rejects` 且不应获得 resolved runtime。

- 使用 call-order 数组或 counter 跟踪 hook 调用。

TDD Notes:

- Red-first：上述 cleanup tests **预期 FAIL**（当前 `lifecycle.ts` 无 cleanup）。
- 不应让现有 dispose happy-path tests 回归。

Validation:

```bash
pnpm --filter @aether-md/core exec tsc --noEmit
pnpm --filter @aether-md/core test -- --run --test-name-pattern "cleanup|onInit fails|onReady fails|startup fails"
```

预期：新增 cleanup tests **FAIL**；无关 tests **PASS**。

Intuitive Verification:

- 画 hook 调用顺序：failure → reverse onDestroy → throw，与 delta spec 一致。

Review Checklist:

- [ ] 仅 test 文件改动。
- [ ] 覆盖 onInit 失败、onReady 失败、无 onInit、cleanup onDestroy 失败四条路径。
- [ ] primary error 断言指向 failing startup hook。
- [ ] 无 M2/M3 fixture。

Rollback Notes:

- 删除新增 cleanup test cases。

Version Impact:

- none

Commit Scope:

- `test(core): add failing startup failure cleanup tests`

Status:

- completed

Run Log:

- 2026-07-05: 在 `lifecycle.test.ts` 新增 describe `bootstrapCore startup failure cleanup`（5 tests）。
- 验证：cleanup tests **FAIL**（destroyCalls 为空，符合 red 预期）；`does not return a running bootstrap runtime` **PASS**。

Deviation:

- none
