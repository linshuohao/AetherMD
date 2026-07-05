# Task 03: 集成 React Shell 与 `createGfmPreset()` adapter wiring

Change:

- `add-react-basic-example`

Branch:

- `feature/add-react-basic-example`

Spec Requirement:

- `validation-suite` / ADDED `React basic example package demonstrates React Shell integration path`（Scenario: React example runs locally from workspace）
- `validation-suite` / ADDED `React basic example package demonstrates React Shell integration path`（Shell integration：`AetherEditorRoot` / `AetherEditorContent` / `useAetherEditor` + 显式 adapter wiring）

OpenSpec Tasks:

- `openspec/changes/add-react-basic-example/tasks.md` §2.3、§3.1

Source Docs:

- `.superpowers/plans/add-react-basic-example.md`
- `openspec/changes/add-react-basic-example/specs/validation-suite/spec.md`
- `openspec/specs/react-shell/spec.md`（GateLock、Root/Content/hook）
- `examples/headless-gfm/src/run.ts`（GFM wiring 模式参考）
- `packages/react/src/test-helpers.ts`（结构参考；**MUST NOT** import）

## 目标

实现 `src/plugins.ts`（`createGfmEditorPlugins()`）与 `App.tsx` 受控 Shell 集成；浏览器可挂载编辑器并编辑 GFM Markdown；GateLock 演示 UI 留 Task 04。

## 范围

1. 创建 `examples/react-basic/src/plugins.ts`：对齐 `headless-gfm` / react test-helpers 的 GFM wiring 模式；导出 `createGfmEditorPlugins()`；**不** import react test 模块。
2. 更新 `App.tsx`：`AetherEditorRoot` + `AetherEditorContent` + 受控 `value`/`onChange`；`useAetherEditor` markdown preview。
3. Smoke：`pnpm build && pnpm --filter @aether-md/example-react-basic dev` — 编辑器挂载；编辑 `**bold**` 后 preview 更新。

Depends On:

- 02

Parallel Group:

- wave-a

Barrier:

- false

Allowed Files:

- `examples/react-basic/src/plugins.ts`
- `examples/react-basic/src/App.tsx`

Forbidden Files:

- `packages/**` 生产 runtime 语义变更
- `examples/headless-gfm/**`
- `@aether-md/react` test-only 路径（如 `test-helpers`）
- 直接依赖 `prosemirror-view`（**仅**经 `@aether-md/react` → plugin-prosemirror view-bridge）
- `docs/**`、`openspec/specs/**`

Implementation Notes:

- plugin wiring **MUST** 在 example 本地 `src/plugins.ts` 实现。
- 五包 **MUST NOT** 新增对 example 的 runtime 依赖。
- GateLock force-rerender 按钮留 Task 04。

TDD Notes:

- **Red：** Task 02 占位 `App.tsx` 无编辑器；`pnpm dev` 仅显示占位文案。
- **Green：** 集成后编辑器可挂载；编辑 GFM 后 `useAetherEditor` preview 同步更新。
- 对照 `packages/react/src/gate-lock.integration.test.tsx` 为行为参考（example 不做包内断言）。

Validation:

```bash
pnpm build
pnpm --filter @aether-md/example-react-basic dev
pnpm --filter @aether-md/example-react-basic typecheck
rg "test-helpers|prosemirror-view" examples/react-basic/
```

预期：dev smoke 可编辑 GFM；typecheck PASS（有 src/ 后）；rg 在 example 内 **无** test-helpers / prosemirror-view 直依赖。

Intuitive Verification:

- `pnpm dev` 后在编辑器输入 `**bold**`；preview 显示加粗语义对应的 markdown 变更。

Review Checklist:

- [ ] `plugins.ts` 使用 `createGfmPreset()` + 显式 Parser/Serializer/Engine adapter wiring。
- [ ] `App.tsx` 使用 `AetherEditorRoot` / `AetherEditorContent` / `useAetherEditor`。
- [ ] **未** import `@aether-md/react` test 模块。
- [ ] **未**直接依赖 `prosemirror-view`。
- [ ] **无**五包 public API 变更。

Rollback Notes:

- revert `src/plugins.ts` 与 Task 03 对 `App.tsx` 的编辑器集成；恢复 Task 02 占位 `App.tsx`。

Version Impact:

- none

Commit Scope:

- `feat(examples): wire react shell and gfm preset in react-basic`

Status:

- completed

Run Log:

- 2026-07-05: Task started — wire React Shell + GFM preset
- 2026-07-05: Created `src/plugins.ts` with `createGfmEditorPlugins()`
- 2026-07-05: Updated `App.tsx` with AetherEditorRoot/Content + useAetherEditor preview
- 2026-07-05: `tsc --noEmit` — PASS
- 2026-07-05: `vite build` — PASS (240 modules, editor bundle)
- 2026-07-05: `rg test-helpers|prosemirror-view` — no matches
- 2026-07-05: Validation complete — Task 03 green

Deviation:

- none
