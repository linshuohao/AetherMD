# Task 02: 实现 createDefaultConflictResolver（runtime command 子集）

Change:

- `add-editor-orchestration`

Branch:

- `feat/add-editor-orchestration`

Spec Requirement:

- `editor-orchestration` / ADDED `Runtime command conflicts use default ConflictResolver only`（Scenario: duplicate runtime command registration is resolved by default strategy；Scenario: compile-layer merge remains out of scope）

OpenSpec Tasks:

- `openspec/changes/add-editor-orchestration/tasks.md` §2.4

Source Docs:

- `.superpowers/plans/add-editor-orchestration.md`
- `openspec/changes/add-editor-orchestration/design.md`（Decision 4）
- `docs/engineering/conflict-resolver.md`

## 目标

在 `@aether-md/core` 实现 `createDefaultConflictResolver()`，默认策略对齐 `docs/engineering/conflict-resolver.md`；**仅**供 runtime command 注册冲突使用；**不在**本 task 接入 `createEditor`。

## 范围

- 新增 `editor/conflict-resolver.ts`：`ConflictContext`、`ConflictResolver`、`createDefaultConflictResolver(overrides?)`。
- 默认策略：`command: last-wins`、`keymap: first-wins`、`schema: abort`、`capability: first-wins`。
- 新增 `editor/conflict-resolver.test.ts`：
  - duplicate `command` → `last-wins` winner。
  - `schema` type → `abort` + `warn: true`（证明 resolver 存在，但 createEditor 不调用 compile merge）。
- **不** export 到 `index.ts`（除非 Task 05 需要；本 task 可 internal export）。
- **不**修改 `bootstrap.ts`。

Allowed Files:

- `packages/core/src/editor/conflict-resolver.ts`
- `packages/core/src/editor/conflict-resolver.test.ts`

Forbidden Files:

- `packages/core/src/editor/create-editor.ts`
- `packages/core/src/bootstrap.ts`
- `packages/core/src/index.ts`（除非仅 type re-export — 优先 Task 05 统一 export）
- `packages/plugins/**`
- `packages/preset-gfm/**`
- `packages/react/**`
- `docs/**`、`openspec/**`

## TDD 入口（Red → Green → Refactor）

**Red**

1. 写 failing test：`createDefaultConflictResolver().resolve({ type: 'command', existing, incoming })` → winner 为 incoming。
2. 写 failing test：`type: 'schema'` → `{ strategy: 'abort', warn: true }`。
3. `pnpm core:test` → **FAIL**（模块不存在）。

**Green**

4. 实现最小 resolver 逻辑（对齐 conflict-resolver.md 参考实现）。
5. `pnpm core:test` → **PASS**。

**Refactor**

6. 提取 `DEFAULT_STRATEGIES` 常量；保持文件单一职责。

TDD Notes:

- 纯 unit test 驱动；无 integration。

Validation:

```bash
pnpm core:test
pnpm --filter @aether-md/core exec tsc --noEmit
```

预期：conflict-resolver tests **PASS**；M1–M4 regression 仍绿。

Intuitive Verification:

- 阅读 test 中 `last-wins` / `abort` 断言，确认与 design Decision 4 一致。

Review Checklist:

- [ ] 仅修改 Allowed Files。
- [ ] command 冲突 `last-wins` 有测试。
- [ ] 未在 createEditor 路径调用 compile-layer merge。
- [ ] 未改 bootstrap / M2 runtime。

Rollback Notes:

- 删除 `conflict-resolver.ts` 与 `conflict-resolver.test.ts`。

Version Impact:

- none（internal module，公开 export 可选延后）

Commit Scope:

- `feat(core): add default ConflictResolver for runtime command registration`

Depends On:

- 01

Parallel Group:

- G1

Barrier:

- false

Status:

- completed

Run Log:

- Red: failing tests for last-wins + schema abort
- Green: `createDefaultConflictResolver()` in `conflict-resolver.ts` + unit tests PASS
- Validation: `pnpm core:test` PASS

Deviation:

- none

Rollback:

- 见 Rollback Notes
