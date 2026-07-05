# Task 06: 实现 AetherEditorRoot 与 AetherEditorContent

Change:

- `add-react-shell`

Branch:

- `feat/add-react-shell`

Spec Requirement:

- `react-shell` / ADDED `React Shell exposes Root, Content, and hook public API`（Scenario: Root creates and disposes；Scenario: Content mounts editable view）
- `react-shell` / ADDED `DOM input is bridged through editor dispatch`（Scenario: typing emits change through dispatch path；Scenario: onChange callback receives updated markdown）
- `react-shell` / ADDED `Shell GateLock prevents redundant document resets`（Root 接线 GateLock — 单元在 Task 03，行为在 Task 06）
- `react-shell` / ADDED `React Shell consumes AetherEditor directly without Shell Adapter`

OpenSpec Tasks:

- `openspec/changes/add-react-shell/tasks.md` §3.1–3.2、§4.1–4.2

Source Docs:

- `.superpowers/plans/add-react-shell.md`
- `openspec/changes/add-react-shell/design.md`（Decision #6 输入桥接、Decision #7 组件 API）
- `docs/architecture/core-api.md`
- `docs/engineering/data-flow.md`
- `docs/engineering/adapter-protocol.md`

## 目标

实现可挂载的最小 React Shell：`AetherEditorRoot` 管理 `createEditor` 生命周期、context、受控 props + Task 03 GateLock；`AetherEditorContent` 经 Task 05 `createProseMirrorView` 挂载 view；`dispatchInput` → `editor.dispatch({ command: 'core:replaceText', ... })`；移除 Task 01 stub throw，导出真实实现。

## 范围

- 新增 `packages/react/src/aether-editor-root.tsx`：
  - async `createEditor` on mount；`ready` 后填充 hook state
  - unmount → `dispose()`（幂等）
  - 受控 `value`/`markdown` + `onChange`；GateLock via `shouldApplyControlledValue`
  - Provider 填充 `AetherEditorContext`
- 新增 `packages/react/src/aether-editor-content.tsx`：
  - DOM ref + `createProseMirrorView` mount/destroy
  - `dispatchInput` → `core:replaceText` dispatch（M5 最小路径）
- 更新 `packages/react/src/index.ts`：实装 export（移除 stub throw）
- 可选轻量组件 smoke test（完整集成在 Task 07）
- **不**写 integration test 文件（Tasks 07–08 独占）

Allowed Files:

- `packages/react/src/aether-editor-root.tsx`
- `packages/react/src/aether-editor-content.tsx`
- `packages/react/src/index.ts`（实装 exports）
- `packages/react/src/aether-editor-root.test.tsx`（可选轻量 smoke）

Forbidden Files:

- `packages/react/src/react-shell.integration.test.tsx`（Task 07）
- `packages/react/src/gate-lock.integration.test.tsx`（Task 08）
- `packages/react/src/test-setup.ts`（Task 07）
- `packages/core/**`
- `packages/plugins/plugin-prosemirror/src/view-bridge.ts`（Task 05 — 仅 import bridge API）

## TDD 入口（Red → Green → Refactor）

**Red**

1. 写 failing test（可选 smoke）：Root+Content render with mock plugins → context 可用。
2. 写 failing test：`dispatchInput` spy → `editor.dispatch` called with `core:replaceText`（可 mock bridge）。
3. 写 failing test：受控 equal value → GateLock skip（unit-level mock effect 或留给 Task 08）。
4. `pnpm --filter @aether-md/react test` → **FAIL**。

**Green**

5. 实现 Root + Content；接线 Tasks 03–05 模块。
6. 更新 `index.ts` 实装 exports。
7. 测试 **PASS**。

**Refactor**

8. effect cleanup 清晰；dispose 幂等；Strict Mode 双 mount 安全。

TDD Notes:

- 用户输入 **MUST NOT** 直写 PM `EditorState` / `tr`。
- preset 消费：`toExtensionPlugin(createGfmPreset())` 或 plan 约定 helper — 集成测试在 Task 07。

Validation:

```bash
pnpm --filter @aether-md/react test
pnpm --filter @aether-md/react build
pnpm --filter @aether-md/react exec tsc --noEmit
rg -i "prosemirror-view|ShellAdapter" packages/react/src --glob '!**/*.test.ts' --glob '!**/*.test.tsx'
rg "createProse\MirrorView" packages/react/src/aether-editor-content.tsx
```

预期：react tests **PASS**；Content 使用 `createProseMirrorView`；生产无 `prosemirror-view` 直 import。

Intuitive Verification:

- Root mount → `createEditor` → Content mount → view attached trace。

Review Checklist:

- [ ] `createEditor` + `dispose` 生命周期正确。
- [ ] GateLock 接线 Task 03 纯函数。
- [ ] `dispatchInput` → `AetherEditor.dispatch` only。
- [ ] 无 ShellAdapter；直接消费 `AetherEditor` API。
- [ ] 无 `prosemirror-view` 在 react 生产代码。
- [ ] index.ts 移除 stub throw。

Rollback Notes:

- 删除 root/content components；恢复 index.ts stubs。

Version Impact:

- `@aether-md/react`：**public API behavior**（M5 components 实装）

Commit Scope:

- `feat(react): implement AetherEditorRoot and AetherEditorContent with dispatch bridge`

Depends On:

- 03, 04, 05

Parallel Group:

- wave-3

Barrier:

- false

Status:

- completed

Run Log:

- 2026-07-05: Implemented `AetherEditorRoot`, `AetherEditorContent`, real `index.ts` exports.
- GateLock wired; `dispatchInput` → `core:replaceText`; `pluginsKey` stabilizes mount effect.
- Validation: react tests PASS; production rg guard clean.

Deviation:

- Root mount effect uses `pluginsKey` (manifest names) instead of raw `plugins` reference to prevent spurious remount on parent rerender.

Rollback:

- 见 Rollback Notes
