# Task 08: GateLock 集成测试（ci-checklist #41）

Change:

- `add-react-shell`

Branch:

- `feat/add-react-shell`

Spec Requirement:

- `react-shell` / ADDED `Shell GateLock prevents redundant document resets`（Scenario: equal controlled value does not reset document；Scenario: GateLock integration test is present）

OpenSpec Tasks:

- `openspec/changes/add-react-shell/tasks.md` §5.3

Source Docs:

- `.superpowers/plans/add-react-shell.md`
- `openspec/changes/add-react-shell/design.md`（Decision #5）
- `docs/architecture/ci-checklist.md`（**#41** GateLock 集成测试）
- `docs/engineering/data-flow.md`

## 目标

实现 GateLock **集成**测试：受控 `value`/`markdown` 相同 string re-render 时 **不** reinitialize `createEditor`、文档内容不变；满足 `ci-checklist.md` #41；随 `pnpm check` 执行。

## 范围

- 新增 `packages/react/src/gate-lock.integration.test.tsx`：
  - mount 受控 Root；simulate edit → parent 回传 **相同** markdown
  - assert `createEditor` 调用次数不增加（spy/mock）和/或 `getMarkdown()` 不变
  - React Strict Mode 下 equal value 不触发二次 parse
- 复用 Task 07 `test-setup.ts`（**不**编辑 07 的 integration 文件）
- **独占** `gate-lock.integration.test.tsx`

Allowed Files:

- `packages/react/src/gate-lock.integration.test.tsx`

Forbidden Files:

- `packages/react/src/react-shell.integration.test.tsx`（Task 07）
- `packages/react/src/gfm-react-smoke.test.tsx`（Task 09）
- `packages/react/src/aether-editor-root.tsx`（除非 integration 暴露 bug — 最小 fix 可回溯 Task 06）
- `packages/core/**`

## TDD 入口（Red → Green → Refactor）

**Red**

1. 写 failing test：controlled `value` 相同 re-render → document unchanged；`createEditor` call count stable。
2. `pnpm --filter @aether-md/react test` → **FAIL**。

**Green**

3. 确认 Task 06 Root GateLock 接线正确；integration **PASS**。

**Refactor**

4. 测试名称引用 ci-checklist #41；与 Task 07 文件分离。

TDD Notes:

- 比较基准：**Markdown string** equality。
- 本 test 是 ci-checklist #41 的 **executable evidence**。

Validation:

```bash
pnpm --filter @aether-md/react test
pnpm --filter @aether-md/react exec node --test dist/gate-lock.integration.test.js
```

预期：`gate-lock.integration.test.tsx` **PASS**；equal controlled value 不 reset document。

Intuitive Verification:

- spy `createEditor`：edit + same value re-render → count 仍为 1。

Review Checklist:

- [ ] ci-checklist #41 场景覆盖。
- [ ] 相同 Markdown string → 无 reinitialize。
- [ ] 与 Task 07 文件 disjoint；**Depends On 07**（复用 `test-setup.ts`）。
- [ ] 无 Playwright。

Rollback Notes:

- 删除 `gate-lock.integration.test.tsx`。

Version Impact:

- none

Commit Scope:

- `test(react): add GateLock integration test for equal controlled value`

Depends On:

- 06, 07

Parallel Group:

- wave-4（**串行于 07 之后** — 复用 `test-setup.ts` happy-dom 注册）

Barrier:

- false

Status:

- completed

Run Log:

- 2026-07-05: Added `gate-lock.integration.test.tsx` (ci-checklist #41).
- Validation: equal controlled value parent rerender does not reset edited markdown.

Deviation:

- none

Rollback:

- 见 Rollback Notes
