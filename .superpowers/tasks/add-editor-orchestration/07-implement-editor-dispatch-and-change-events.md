# Task 07: 实现 editor dispatch、rollback 与 lifecycle 事件

Change:

- `add-editor-orchestration`

Branch:

- `feat/add-editor-orchestration`

Spec Requirement:

- `editor-orchestration` / ADDED `Editor dispatch orchestrates engine apply with minimal rollback`
- `editor-orchestration` / ADDED `AetherEditor exposes host document and lifecycle APIs`（Scenario: dispose fails closed）
- `editor-orchestration` / ADDED `Editor lifecycle emits ready and disposed events`（Scenario: disposed event）
- `command-event-runtime` / ADDED `Standalone Command Event runtime remains independent from editor orchestration`
- `command-event-runtime` / ADDED `Editor integrated dispatch extends Command Event semantics`
- `adapter-base` / ADDED `Orchestrated apply failure preserves core-visible snapshot`

OpenSpec Tasks:

- `openspec/changes/add-editor-orchestration/tasks.md` §3.1–3.3

Source Docs:

- `.superpowers/plans/add-editor-orchestration.md`
- `openspec/changes/add-editor-orchestration/design.md`（Decision 5、8）
- `docs/engineering/adapter-protocol.md`
- `docs/sdk/command-event-protocol.md`

## 目标

实现 `AetherEditor.dispatch(): Promise<CommandResult>`；engine-bound command `core:replaceText` 路由至 `EngineAdapter.apply`；成功 emit `change`（`{ doc }`）；失败恢复快照 + emit `transactionFailed` + `{ ok: false }`；plugin command 抛错 → `pluginError`（M2 隔离）；`dispose()` emit `disposed` 且后续 dispatch fail-closed；**不**改变 standalone `createCommandEventRuntime` 行为。

## 范围

- 新增 `editor/engine-dispatch.ts`：快照 save/restore、apply 路由、事件 emit helpers。
- 修改 `editor/aether-editor.ts`：`dispatch`、`dispose` 完整实现。
- 扩展 `editor/editor-orchestration.test.ts`：
  - `core:replaceText` 成功 → `change` + updated `getDocument()`。
  - apply 失败 → 快照恢复 + `transactionFailed` + `{ ok: false }`。
  - plugin handler throw → `pluginError`，无 adapter rollback。
  - `dispose()` → `disposed`；再次 `dispatch` fail-closed。
- 确认 `command-event-runtime.test.ts` **仍 PASS**（M2 无 rollback / 无 transactionFailed auto emit）。
- **冻结** engine-bound command id：`core:replaceText`。

Allowed Files:

- `packages/core/src/editor/engine-dispatch.ts`
- `packages/core/src/editor/aether-editor.ts`
- `packages/core/src/editor/editor-orchestration.test.ts`
- `packages/core/src/command-event-runtime.ts`（**仅**若需 internal helper 提取 — 不改 M2 公开行为；优先不改）

Forbidden Files:

- `packages/core/src/bootstrap.ts`
- `packages/core/src/create-editor-gfm.integration.test.ts`
- `packages/core/package.json`
- `packages/preset-gfm/**`
- `packages/react/**`
- `docs/**`、`openspec/**`

## TDD 入口（Red → Green → Refactor）

**Red**

1. 写 failing test：`dispatch({ id: 'core:replaceText', payload: ... })` 成功 → `change` listener 收到 `{ doc }`。
2. 写 failing test：mock apply 失败 → `getDocument()` 不变 + `transactionFailed`。
3. 写 failing test：`dispose()` 后 `dispatch` → failure。
4. 跑 `pnpm core:test` 中 M2 suite → 确认 baseline；新增 editor tests → **FAIL**。

**Green**

5. 实现 engine-dispatch + aether-editor dispatch/dispose。
6. `pnpm core:test` → editor + M2 **PASS**。

**Refactor**

7. 分离 plugin command path vs engine-bound path；保持 command-event-runtime 独立。

TDD Notes:

- **Depends On Task 06** 的 getDocument 断言能力。
- M2 regression 为 mandatory gate。

Validation:

```bash
pnpm core:test
pnpm --filter @aether-md/core exec tsc --noEmit
rg "transactionFailed" packages/core/src/command-event-runtime.ts
node --test packages/core/dist/command-event-runtime.test.js 2>/dev/null || pnpm core:test
```

预期：orchestration rollback tests **PASS**；raw `createCommandEventRuntime` **无** transactionFailed emit。

Intuitive Verification:

- Trace test：`dispatch` → apply → `change` vs apply fail → snapshot unchanged。

Review Checklist:

- [ ] 仅修改 Allowed Files。
- [ ] `core:replaceText` 为 engine-bound id。
- [ ] rollback 仅在 editor dispatch 层。
- [ ] M2 tests 无 regression。
- [ ] dispose fail-closed。
- [ ] 无 Core store API。

Rollback Notes:

- 删除 engine-dispatch.ts；回滚 aether-editor dispatch/dispose；移除 orchestration rollback tests。

Version Impact:

- none

Commit Scope:

- `feat(core): implement AetherEditor dispatch with orchestrated rollback and events`

Depends On:

- 05, 06

Parallel Group:

- G3

Barrier:

- false

Status:

- completed

Run Log:

- Red: dispatch success/failure/dispose tests
- Green: `engine-dispatch.ts` + `aether-editor` dispatch/dispose; M2 tests unchanged PASS
- Validation: `pnpm core:test` PASS; no `transactionFailed` in command-event-runtime.ts

Deviation:

- Added `EDITOR_DISPOSED` to `errors.ts` (with Task 03 deviation batch)

Rollback:

- 见 Rollback Notes
