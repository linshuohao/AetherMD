# Task 03: 实现 GateLock 纯函数

Change:

- `add-react-shell`

Branch:

- `feat/add-react-shell`

Spec Requirement:

- `react-shell` / ADDED `Shell GateLock prevents redundant document resets`（Scenario: equal controlled value does not reset document — 单元级 GateLock 逻辑）

OpenSpec Tasks:

- `openspec/changes/add-react-shell/tasks.md` §3.4

Source Docs:

- `.superpowers/plans/add-react-shell.md`
- `openspec/changes/add-react-shell/design.md`（Decision #5 GateLock 语义）
- `docs/engineering/data-flow.md`
- `docs/architecture/ci-checklist.md`（#41 — 集成覆盖在 Task 08）

## 目标

实现 Shell 层 GateLock 纯函数 `shouldApplyControlledValue(prev, next)`：当受控 Markdown string `prevValue === nextValue` 时返回 `false`（跳过重设）；不等或首次 apply 时返回 `true`。Root 接线在 Task 06；集成测试在 Task 08。

## 范围

- 新增 `packages/react/src/gate-lock.ts`：`shouldApplyControlledValue(prev: string | undefined, next: string | undefined): boolean`
- 新增 `packages/react/src/gate-lock.test.ts`：
  - `'a','a'` → `false`
  - `'a','b'` → `true`
  - `undefined` 初始 → 允许首次 apply
- **仅** 上述两个文件；**不**编辑 `aether-editor-root.tsx`（Task 06）

Allowed Files:

- `packages/react/src/gate-lock.ts`
- `packages/react/src/gate-lock.test.ts`

Forbidden Files:

- `packages/react/src/aether-editor-root.tsx`（Task 06 接线）
- `packages/react/src/context.tsx`、`use-aether-editor*.ts`（Task 04 — wave-2 disjoint）
- `packages/plugins/**`
- `packages/core/**`

## TDD 入口（Red → Green → Refactor）

**Red**

1. 写 failing test：`shouldApplyControlledValue('hello','hello')` → `false`。
2. 写 failing test：`shouldApplyControlledValue('a','b')` → `true`。
3. 写 failing test：`undefined` + 首次 value → `true`。
4. `pnpm --filter @aether-md/react test` → **FAIL**（函数不存在）。

**Green**

5. 实现 `gate-lock.ts` 最小逻辑（Markdown **string** 相等比较）。
6. 测试 **PASS**。

**Refactor**

7. 确保纯函数无副作用；边界 case（空 string、相同内容）由 test 名称表达即可。

TDD Notes:

- GateLock 比较基准为 **Markdown string**（design Decision #5），非 object reference。
- 本 task 是单元级；**createEditor 不被二次调用** 的断言在 Task 08 集成测试。

Validation:

```bash
pnpm --filter @aether-md/react test
pnpm --filter @aether-md/react exec tsc --noEmit
```

预期：`gate-lock.test.ts` **PASS**；GateLock 纯函数行为符合 design：`prevValue === nextValue` → skip apply。

Intuitive Verification:

- 纯函数 table：`('a','a')→false`、`('a','b')→true`、`(undefined,'x')→true`。

Review Checklist:

- [ ] 仅修改 Allowed Files（**不** touch `context.tsx` / `use-aether-editor*`）。
- [ ] 比较基准为 Markdown string。
- [ ] 无副作用、无 React import。
- [ ] wave-2 与 Task 04 文件 disjoint。

Rollback Notes:

- 删除 `gate-lock.ts`、`gate-lock.test.ts`。

Version Impact:

- none

Commit Scope:

- `feat(react): add GateLock shouldApplyControlledValue utility`

Depends On:

- 02

Parallel Group:

- wave-2

Barrier:

- false

Status:

- completed

Run Log:

- 2026-07-05: TDD red → green for `shouldApplyControlledValue`.
- Validation: `pnpm --filter @aether-md/react test` PASS (gate-lock unit).

Deviation:

- none

Rollback:

- 见 Rollback Notes
