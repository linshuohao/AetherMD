# Task 01: 定义 duplicate plugin name 失败测试

Change:

- `harden-core-bootstrap-lifecycle`

Branch:

- `fix/harden-core-bootstrap-lifecycle`

Spec Requirement:

- `core-bootstrap` / ADDED `Duplicate plugin metadata.name is rejected during bootstrap validation`
  - Scenario: `Duplicate plugin name aborts startup`
  - Scenario: `Unique plugin names pass validation`

Source Docs:

- `.superpowers/plans/harden-core-bootstrap-lifecycle.md`
- `openspec/changes/harden-core-bootstrap-lifecycle/specs/core-bootstrap/spec.md`
- `openspec/changes/harden-core-bootstrap-lifecycle/design.md`
- `docs/sdk/manifest.md`
- `docs/engineering/error-model.md`
- `docs/engineering/test-strategy.md`

Allowed Files:

- `packages/core/src/bootstrap.test.ts`
- `packages/core/src/manifest.test.ts`

Forbidden Files:

- `packages/core/src/errors.ts`
- `packages/core/src/manifest.ts`（production 逻辑）
- `packages/core/src/bootstrap.ts`
- `packages/core/src/lifecycle.ts`
- `packages/core/src/dependencies.ts`
- `packages/core/src/command-event*.ts`
- `packages/plugins/**`
- `docs/**`
- `openspec/**`

Implementation Notes:

- 本 task **只添加测试**，不实现 validation。
- 新增 describe 块或 it cases，覆盖 duplicate name fatal 与 unique names pass。
- Duplicate fatal test 要点：
  - 两个 plugin 均为 `metadata.name: "dup"`（或等价同名）。
  - `assert.rejects` 包装 `bootstrapCore([...])`。
  - 断言 rejection 为 `CoreError`，`code === "PLUGIN_NAME_DUPLICATE"`（实现前可能因 code 未定义而 FAIL，可先用 type guard + message 辅助，Task 02 补齐 code）。
  - 跟踪 `onInit` / `onReady` / `onDestroy` call counts，期望均为 0。
- Unique names test 要点：
  - 两个 distinct `metadata.name` bootstrap 成功（不 throw）。
- 可复用 `bootstrap.test.ts` 现有 manifest fixture 风格。

TDD Notes:

- Red-first：先写测试，**预期 duplicate fatal test FAIL**（validation 尚未存在）。
- Unique names test 应 PASS，避免破坏现有 happy path。
- Task 02 负责绿 duplicate fatal test。

Validation:

```bash
pnpm --filter @aether-md/core exec tsc --noEmit
pnpm --filter @aether-md/core test -- --run --test-name-pattern "duplicate metadata.name|unique plugin names"
```

预期：

- duplicate name test：**FAIL**（validation 未实现）或 FAIL on wrong error code。
- unique names test：**PASS**。

Intuitive Verification:

- 阅读测试 arrange：同名 plugin 是否在 lifecycle 之前即应失败；确认未引入 Command/Event 或 Adapter fixture。

Review Checklist:

- [ ] 仅修改 `*.test.ts`，未改 production source。
- [ ] 测试绑定 delta spec duplicate scenarios。
- [ ] 未调用 M2/M3 API 或 import adapter 包。
- [ ] hooks 零调用断言存在。

Rollback Notes:

- 删除本 task 新增的 test cases / describe 块即可回滚。

Version Impact:

- none（仅测试）

Commit Scope:

- `test(core): add failing duplicate plugin name bootstrap tests`

Status:

- completed

Run Log:

- 2026-07-05: 在 `bootstrap.test.ts` 新增 describe `bootstrapCore duplicate metadata.name validation`。
- 新增 `rejects duplicate metadata.name before lifecycle hooks`：断言 `PLUGIN_NAME_DUPLICATE`、hooks 零调用。
- 新增 `allows unique plugin names to bootstrap`。
- `pnpm --filter @aether-md/core exec tsc --noEmit`：PASS。
- `pnpm --filter @aether-md/core test -- --run --test-name-pattern "duplicate metadata.name|unique plugin names"`：duplicate test **FAIL**（Missing expected rejection，符合 red 预期）；unique test **PASS**。

Deviation:

- none
