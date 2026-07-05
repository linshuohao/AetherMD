# Task 06: headless-gfm typecheck 纳入根 `pnpm check` pipeline

Change:

- `add-validation-suite`

Branch:

- `feat/add-validation-suite`

Spec Requirement:

- `validation-suite` / ADDED `Examples package passes TypeScript noEmit check in CI`（Scenario: Headless example typechecks in check pipeline；Scenario: Existing M1 through M5 tests remain green）
- `engineering-workflow` / ADDED `M6 validation gates participate in root check pipeline`（Scenario: Examples typecheck gate fails check pipeline）

OpenSpec Tasks:

- `openspec/changes/add-validation-suite/tasks.md` §3.3、§4.3、§4.4

Source Docs:

- `.superpowers/plans/add-validation-suite.md`
- `openspec/changes/add-validation-suite/specs/validation-suite/spec.md`
- `openspec/changes/add-validation-suite/specs/engineering-workflow/spec.md`
- `docs/architecture/ci-checklist.md`
- `docs/engineering/test-strategy.md`

## 目标

将 `examples/headless-gfm` 的 `typecheck`（`tsc --noEmit`）纳入根 `pnpm check` → turbo `check` pipeline；example 有 TS 错误时 `pnpm check` 应 FAIL；M1–M5 既有测试保持绿。

## 范围

1. `examples/headless-gfm/package.json` 添加 `"check": "pnpm typecheck"`（或与其它 package 一致）。
2. 确认 turbo：`check` task 能遍历到 example package。
3. 若 turbo 未自动发现 example，显式调整 `turbo.json` 或 example `check` script。
4. 验证：example typecheck 失败时 `pnpm check` 红；修复后绿。

Depends On:

- 01, 02

Parallel Group:

- wave-c

Barrier:

- false

Allowed Files:

- `examples/headless-gfm/package.json`（`typecheck`/`check`）
- `turbo.json`
- `package.json`（根，若需）
- `pnpm-workspace.yaml`（若 Task 01 未合）

Forbidden Files:

- `docs/sdk/examples.md` 大改（非必须）
- `packages/core/src/**` 生产代码
- `examples/react-basic/**`
- `npm publish`、`NPM_TOKEN`、`.github/workflows/**` release job
- 无关 package 运行时语义变更

Implementation Notes:

- G6 主路径 = `examples/headless-gfm` typecheck；**不**重复 typecheck `docs/sdk/examples.md`（除非 headless example 不足 G6）。
- example 无 test 时 `check` 可仅 `typecheck`。

TDD Notes:

- **Red：** 确认基线 `pnpm check` **不**执行 example typecheck（Task 06 前）。
- **Red：** 接入后引入故意 TS 错误 → `pnpm check` 应 FAIL。
- **Green：** 修复 TS 错误后 `pnpm check` PASS；M1–M5 包仍绿。

Validation:

```bash
pnpm check
```

局部预检：

```bash
turbo run check --filter=@aether-md/example-headless-gfm
pnpm --filter @aether-md/example-headless-gfm typecheck
```

预期：`pnpm check` **PASS**（含 example typecheck）；故意 TS 错误时 **FAIL**。

Intuitive Verification:

- 运行 `pnpm check`，观察 turbo 输出含 `@aether-md/example-headless-gfm` check/typecheck 任务。

Review Checklist:

- [ ] example `check` script 存在且调用 typecheck。
- [ ] 根 `pnpm check` 遍历 example。
- [ ] example TS 错误导致 check 红。
- [ ] M1–M5 workspace tests 仍绿。
- [ ] 未改 Core 生产代码。

Rollback Notes:

- 回滚 `turbo.json`、example `package.json` check script；移除 example 从 check pipeline。

Version Impact:

- none（CI pipeline wiring only）

Commit Scope:

- `chore(examples): wire headless-gfm typecheck into check pipeline`

Status:

- done

Run Log:

- 2026-07-05: Set `examples/headless-gfm/package.json` `check` script to `pnpm typecheck` (was `pnpm run build && pnpm run typecheck`). No `turbo.json` / root `package.json` / `pnpm-workspace.yaml` changes required — example already in workspace scope and turbo `check` pipeline via explicit `check` script + `dependsOn: ["typecheck", "test"]` (missing `test` script is skipped).
- Red verify: temporary TS2322 in `src/run.ts` → `turbo run check --filter=@aether-md/example-headless-gfm --force` exited 2 (`@aether-md/example-headless-gfm#typecheck` failed); probe reverted.
- Green verify: `pnpm check` PASS — 6 packages in scope including `@aether-md/example-headless-gfm`; turbo ran `typecheck` + `check` (`pnpm typecheck`); M1–M5 tests green (85 core + 21 remark + 20 prosemirror + 12 preset-gfm + 15 react).

Deviation:

- none
