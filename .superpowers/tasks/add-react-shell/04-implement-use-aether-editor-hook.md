# Task 04: 实现 useAetherEditor hook 与 context

Change:

- `add-react-shell`

Branch:

- `feat/add-react-shell`

Spec Requirement:

- `react-shell` / ADDED `React Shell exposes Root, Content, and hook public API`（Scenario: useAetherEditor exposes bridged markdown state）
- `editor-orchestration` / MODIFIED `EditorStateSnapshot is read-only without Core store`（Scenario: React Shell bridges change without Core store；Scenario: React Shell does not introduce Shell Adapter in core orchestration）

OpenSpec Tasks:

- `openspec/changes/add-react-shell/tasks.md` §3.3

Source Docs:

- `.superpowers/plans/add-react-shell.md`
- `openspec/changes/add-react-shell/specs/react-shell/spec.md`
- `openspec/changes/add-react-shell/specs/editor-orchestration/spec.md`
- `openspec/changes/add-react-shell/design.md`（Decision #4 `useAetherEditor` 暴露面）
- `docs/architecture/core-api.md`（Phase 0 #2 #3）

## 目标

实现 `AetherEditorContext` + `useAetherEditor()`：订阅 `AetherEditor` `change` 事件，桥接 React-local `markdown` / `doc` state；missing Provider **throw**；**不**引入 Core store 或 Shell Adapter；**不**接线 Root 生命周期（Task 06）。

## 范围

- 新增 `packages/react/src/context.tsx`：`AetherEditorContext` + Provider 类型（供 Root 填充 value）。
- 新增 `packages/react/src/use-aether-editor.ts`：
  - 返回 `{ editor, markdown, doc, ready, error }`（design Decision #4）
  - `on('change')` → 更新 `markdown`/`doc`（从 `getMarkdown()` / `getDocument()`）
  - 无 Provider → **throw** Error
- 新增 `packages/react/src/use-aether-editor.test.ts`：
  - mock context + mock `AetherEditor` → simulate `change` → state 更新
  - 无 Provider → assert throw
  - assert **不**调用 Core `subscribe` API（Core 无此 API — 静态审查 / mock 断言）
- **MUST NOT** 编辑 `gate-lock.ts` / `aether-editor-root.tsx`（wave-2 disjoint + Root 在 Task 06）

Allowed Files:

- `packages/react/src/context.tsx`
- `packages/react/src/use-aether-editor.ts`
- `packages/react/src/use-aether-editor.test.ts`

Forbidden Files:

- `packages/react/src/gate-lock.ts`、`gate-lock.test.ts`（Task 03 — wave-2 disjoint）
- `packages/react/src/aether-editor-root.tsx`、`aether-editor-content.tsx`（Task 06）
- `packages/core/**`
- `packages/plugins/**`

## TDD 入口（Red → Green → Refactor）

**Red**

1. 写 failing test：Provider 内 mock editor emit `change` → hook `markdown`/`doc` 更新。
2. 写 failing test：无 Provider render hook → **throw**。
3. `pnpm --filter @aether-md/react test` → **FAIL**。

**Green**

4. 实现 context + hook；cleanup `off` on unmount。
5. 测试 **PASS**。

**Refactor**

6. 提取 event subscription helper（若需）；保持 hook 可读；无 Core store 泄漏。

TDD Notes:

- design 冻结 missing Provider → **throw**（非 null）。
- 使用 mock `AetherEditor`，**不** import `@aether-md/preset-gfm` 于生产代码。

Validation:

```bash
pnpm --filter @aether-md/react test
pnpm --filter @aether-md/react exec tsc --noEmit
rg "subscribe" packages/react/src/use-aether-editor.ts packages/core/src/index.ts
```

预期：hook tests **PASS**；react 生产代码无 Core store/subscribe 依赖。

Intuitive Verification:

- `@testing-library/react` `renderHook` + wrapper Provider trace `change` → state 更新。

Review Checklist:

- [ ] 仅修改 Allowed Files（wave-2 与 Task 03 disjoint）。
- [ ] `change` 事件桥接 `markdown`/`doc`；无 Core store。
- [ ] missing Provider **throw**。
- [ ] **未**编辑 `gate-lock*` / `aether-editor-root.tsx`。
- [ ] Phase 0 #2 #3 无 deviation。

Rollback Notes:

- 删除 `context.tsx`、`use-aether-editor.ts`、`use-aether-editor.test.ts`。

Version Impact:

- none（内部模块；public export 已在 Task 01 stub）

Commit Scope:

- `feat(react): implement useAetherEditor change bridge without Core store`

Depends On:

- 02

Parallel Group:

- wave-2

Barrier:

- false

Status:

- completed

Run Log:

- 2026-07-05: Implemented `context.tsx`, `use-aether-editor.ts`, tests with `@testing-library/react`.
- Validation: hook tests PASS; no Core subscribe API used.

Deviation:

- none

Rollback:

- 见 Rollback Notes
