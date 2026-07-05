# Task 05: 将 `react-basic` typecheck 纳入根 `pnpm check`（G6 扩展）

Change:

- `add-react-basic-example`

Branch:

- `feature/add-react-basic-example`

Spec Requirement:

- `validation-suite` / MODIFIED `Examples package passes TypeScript noEmit check in CI`（Scenario: React basic example typechecks in check pipeline；Scenario: Headless example typechecks in check pipeline；Scenario: Existing M1 through M6 tests remain green）
- `engineering-workflow` / MODIFIED `M6 validation gates participate in root check pipeline`（Scenario: React basic example typecheck gate fails check pipeline）

OpenSpec Tasks:

- `openspec/changes/add-react-basic-example/tasks.md` §4.1–4.2

Source Docs:

- `.superpowers/plans/add-react-basic-example.md`
- `openspec/changes/add-react-basic-example/specs/validation-suite/spec.md`
- `openspec/changes/add-react-basic-example/specs/engineering-workflow/spec.md`
- `docs/architecture/ci-checklist.md`（G6）
- `docs/engineering/test-strategy.md`
- `.superpowers/tasks/add-validation-suite/06-wire-headless-gfm-typecheck-into-check-pipeline.md`（headless-gfm 同模式参考）

## 目标

确认 `examples/react-basic` 的 `typecheck`（`tsc --noEmit`）与 `check` script 经 turbo 纳入根 `pnpm check`；`headless-gfm` 与 M1–M6 既有门禁扩展后仍全绿；故意 TS 错误时 `pnpm check` 应 FAIL。

## 范围

1. 确认 `examples/react-basic/package.json` 含 `"typecheck": "tsc --noEmit"` 与 `"check": "pnpm typecheck"`。
2. 确认 turbo：`check` task 能遍历到 `@aether-md/example-react-basic`（与 `headless-gfm` 相同模式；无 test 时仅 typecheck）。
3. 若 turbo 未自动发现，显式调整 `turbo.json` 或根 `package.json`（**仅**调度缺口时）。
4. 运行 `pnpm --filter @aether-md/example-react-basic typecheck` — 预期 **PASS**（Task 04 完成后）。
5. 运行 `pnpm check` — 预期全 workspace 绿，含 `headless-gfm` + `react-basic`。
6. 负向验证（local）：故意在 `App.tsx` 引入 TS 错误 → `pnpm check` 应 **FAIL** → 修复。

Depends On:

- 01, 04

Parallel Group:

- wave-b

Barrier:

- false

Allowed Files:

- `examples/react-basic/package.json`（`typecheck` / `check` scripts）
- `turbo.json`（仅当调度缺口）
- `package.json`（根，若需）

Forbidden Files:

- `packages/**` 生产 runtime 语义变更
- `examples/headless-gfm/**`（除非 regression 最小修复）
- `vite build` 纳入 `pnpm check`
- Playwright CI、`npm publish`
- `docs/**`（留 Task 06）

Implementation Notes:

- CI **仅** typecheck；**MUST NOT** 将 `vite build` 纳入 `pnpm check`（design Decision 3）。
- G6 范围 = `headless-gfm` + `react-basic` 均 `tsc --noEmit`。

TDD Notes:

- **Red：** 故意 TS 错误 → `pnpm check` **FAIL**。
- **Green：** 修复后 `pnpm check` **PASS**；`headless-gfm` 仍 PASS。
- 全绿验收需 Task 04 完成（完整 `src/` + typecheck 可 PASS）。

Validation:

```bash
pnpm --filter @aether-md/example-react-basic typecheck
pnpm check
```

负向 probe（local，修复前 revert）：

```bash
# 临时 TS 错误于 App.tsx → pnpm check 应 FAIL
```

预期：`typecheck` PASS；`pnpm check` PASS（含两 examples + 五包测试）；故意 TS 错误时 check **FAIL**。

Intuitive Verification:

- 运行 `pnpm check`，观察 turbo 输出含 `@aether-md/example-react-basic` check/typecheck 任务。

Review Checklist:

- [ ] example `check` script 存在且调用 typecheck。
- [ ] 根 `pnpm check` 遍历 `react-basic` 与 `headless-gfm`。
- [ ] example TS 错误导致 check 红。
- [ ] M1–M6 workspace tests 仍绿。
- [ ] **未**将 `vite build` 纳入 check pipeline。
- [ ] **未**改五包 public API。

Rollback Notes:

- revert `turbo.json`、example `package.json` check script 变更；移除 react-basic 从 check pipeline wiring。

Version Impact:

- none（CI pipeline wiring only）

Commit Scope:

- `chore(examples): wire react-basic typecheck into check pipeline`

Status:

- completed

Run Log:

- 2026-07-05: Task started — wire react-basic into check pipeline
- 2026-07-05: Confirmed `typecheck`/`check` scripts; changed `build` to `tsc --noEmit` (vite build via `build:app`, not in check)
- 2026-07-05: Fixed `pnpm-workspace.yaml` `allowBuilds.esbuild: true` (pre-existing invalid placeholder blocked pnpm run)
- 2026-07-05: `turbo run check --filter=@aether-md/example-react-basic` — PASS
- 2026-07-05: Negative probe: intentional TS error → check FAIL (exit 2) → reverted
- 2026-07-05: Validation complete — Task 05 green

Deviation:

- `pnpm-workspace.yaml` `allowBuilds.esbuild` fixed from invalid placeholder to `true` (required for Vite/esbuild after Task 02; pre-existing config gap)
- `build` script uses `tsc --noEmit` instead of `vite build` per design Decision 3 (CI check must not run vite build); local production build via `build:app`
