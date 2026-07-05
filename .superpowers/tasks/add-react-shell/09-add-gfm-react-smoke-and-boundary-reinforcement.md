# Task 09: GFM React smoke 与 package boundary 强化

Change:

- `add-react-shell`

Branch:

- `feat/add-react-shell`

Spec Requirement:

- `react-shell` / ADDED `GFM preset React smoke verifies createEditor with Shell`（Scenario: paragraph fixture smoke；Scenario: strong and list fixtures smoke pass in React）
- `react-shell` / ADDED `React Shell package is exported as a public adapter package`（Scenario: React package is consumable — boundary 强化）
- `react-shell` / ADDED `ProseMirror view mounting uses plugin-prosemirror view bridge`（Scenario: React uses plugin-prosemirror bridge — react 无 prosemirror-view 直 import guard）
- OpenSpec `tasks.md` §5.5–5.6（boundary + M1–M4.5 regression）

Source Docs:

- `.superpowers/plans/add-react-shell.md`（Package Boundary Guard 表）
- `openspec/changes/add-react-shell/specs/react-shell/spec.md`
- `docs/architecture/ci-checklist.md`
- `docs/engineering/test-strategy.md`
- `openspec/specs/gfm-preset/spec.md`

## 目标

GFM preset React smoke（paragraph、strong、list fixtures）；强化 `package-boundary.test.ts`；运行 Core + React static guard scripts；确认 M1–M4.5 无 regression。**不**跑全量 `pnpm check`（Task 10 Barrier）。

## 范围

- 新增 `packages/react/src/gfm-react-smoke.test.tsx`：
  - `createGfmPreset()` + paragraph / strong / list fixtures
  - 经 React Shell 路径（import `@aether-md/react`）— 与 M4.5 headless 测试 **区分**
- 强化 `packages/react/src/package-boundary.test.ts`：
  - 无 core 内部 re-export
  - 无 `ShellAdapter`
  - 生产路径无 `prosemirror-view` import（rg 级 guard）
- 运行 plan Package Boundary Guard 命令（Core + React）
- 若 Task 07 已建 `test-helpers.ts` → **仅 import**，不编辑 Task 07 integration 文件
- **不**编辑 `react-shell.integration.test.tsx` / `gate-lock.integration.test.tsx`

Allowed Files:

- `packages/react/src/gfm-react-smoke.test.tsx`
- `packages/react/src/package-boundary.test.ts`（强化）

Forbidden Files:

- `packages/react/src/react-shell.integration.test.tsx`（Task 07）
- `packages/react/src/gate-lock.integration.test.tsx`（Task 08）
- `packages/react/src/test-helpers.ts`（Task 07 创建 — 若需改 helper，**Depends On 07** 串行）
- `packages/core/**`（生产代码不改；只读跑 core tests）
- `docs/**`、`openspec/specs/**`

## TDD 入口（Red → Green → Refactor）

**Red**

1. 写 failing GFM smoke tests（paragraph、strong、list）。
2. 补强 boundary asserts（core 内部 symbol、prosemirror-view 生产 import）。
3. 运行 guard `rg` → 若有违规 → 最小 fix 对应 task。
4. `pnpm --filter @aether-md/react test` → **FAIL** 直至 smoke 绿。

**Green**

5. smoke + boundary **PASS**；guard scripts clean。
6. `pnpm core:test` — M1–M4.5 regression 绿。

**Refactor**

6. smoke fixtures 与 headless 测试路径注释区分。

TDD Notes:

- 若需编辑 `test-helpers.ts`，本 task **Depends On 07**（plan wave-4 串行规则）。

Validation:

```bash
pnpm --filter @aether-md/react test
pnpm core:test
pnpm --filter @aether-md/plugin-prosemirror test
pnpm --filter @aether-md/preset-gfm test

# Core package guard（Task 09 / 10 必跑）：
rg -i "from ['\"]react|from ['\"]prosemirror|from ['\"]remark|from ['\"]@aether-md/preset-gfm|from ['\"]@aether-md/plugin-" packages/core/src --glob '!**/*.test.ts' --glob '!**/*.integration.test.ts'

# React package guard：
rg -i "from ['\"]prosemirror-view|ShellAdapter" packages/react/src --glob '!**/*.test.ts' --glob '!**/*.test.tsx'

# React dependencies vs peerDependencies：
node -e "const p=require('./packages/react/package.json'); const d=Object.keys(p.dependencies||{}); console.log('plugin-prosemirror', d.includes('@aether-md/plugin-prosemirror')); console.log('forbidden', d.filter(x=>/prosemirror-view|remark/.test(x)))"

# Core still forbids React export：
rg "ReactEditor" packages/core/src/package-boundary.test.ts
pnpm core:test --test-name-pattern "M4.5 editor orchestration"
```

预期：react smoke + boundary **PASS**；guard 无生产违规；core `ReactEditor === false` 仍成立；M1–M4.5 绿。

Intuitive Verification:

- 人工勾选 plan Package Boundary Guard 表。

Review Checklist:

- [ ] GFM paragraph / strong / list smoke 经 React Shell 路径。
- [ ] 与 M4.5 headless integration **区分**（import `@aether-md/react`）。
- [ ] React 生产无 `prosemirror-view` / `ShellAdapter`。
- [ ] Core 生产无 react/prosemirror/remark import；`ReactEditor` export forbid。
- [ ] **未**跑 `pnpm check`（留 Task 10 Barrier）。
- [ ] 未改 Task 07/08 integration 文件。

Rollback Notes:

- 回滚 `gfm-react-smoke.test.tsx` 与 `package-boundary.test.ts` 本 task 增补。

Version Impact:

- none（tests + guards only）
- `manifestVersion`：**不变**（`[1]`）

Commit Scope:

- `test(react): add GFM smoke and reinforce package boundary guards`

Depends On:

- 06, 07

Parallel Group:

- wave-4

Barrier:

- false

Status:

- completed

Run Log:

- 2026-07-05: Added `gfm-react-smoke.test.tsx`; reinforced `package-boundary.test.ts` production file scan.
- Validation: smoke + boundary PASS; Core/React rg guards PASS; `pnpm core:test` green via check.

Deviation:

- none

Rollback:

- 见 Rollback Notes
