# Task 05: 实现 plugin-prosemirror view-bridge

Change:

- `add-react-shell`

Branch:

- `feat/add-react-shell`

Spec Requirement:

- `react-shell` / ADDED `ProseMirror view mounting uses plugin-prosemirror view bridge`（Scenario: React uses plugin-prosemirror bridge for EditorView；Scenario: view destroy is called on content unmount）

OpenSpec Tasks:

- `openspec/changes/add-react-shell/tasks.md` §2.1–2.3

Source Docs:

- `.superpowers/plans/add-react-shell.md`
- `openspec/changes/add-react-shell/design.md`（**Decision #2** — view-bridge 定稿方案，implementation **MUST** 对齐）
- `openspec/changes/add-react-shell/specs/react-shell/spec.md`
- `docs/adr/003-remark-prosemirror-dual-track.md`
- `docs/engineering/component-library-governance.md`
- `packages/plugins/plugin-prosemirror/src/engine.ts`（`EngineSession` 消费面）

## 目标

在 `@aether-md/plugin-prosemirror` 实现 **additive** view-bridge（design Decision #2 定稿）：

```typescript
createProseMirrorView(options: {
  session: EngineSession;
  dom: HTMLElement;
  dispatchInput?: (request: AdapterCommandRequest) => void;
}): { view: EditorView; destroy: () => void };
```

- 绑定 `EngineSession` + DOM；`apply` 后 view 与 `getDocument()` 一致
- `dispatchInput` 回调 **不** 直接 mutate doc（由调用方经 `AetherEditor.dispatch` 处理）
- `destroy()` 幂等、可重复调用
- **不** export `sessions` Map 或 engine 内部

## 范围

**design.md Decision #2 对齐检查（开工前）：**

| 项 | 定稿 |
| --- | --- |
| 实现位置 | `packages/plugins/plugin-prosemirror/src/view-bridge.ts`（plugin 侧，**非** core、**非** react 直依赖 PM） |
| 公开 API | `createProseMirrorView` additive export |
| React 约束 | `@aether-md/react` **MUST NOT** import `prosemirror-view` |
| 依赖 | `prosemirror-view` 仅加在 `@aether-md/plugin-prosemirror` |

- 更新 `plugin-prosemirror/package.json`：additive `prosemirror-view` dependency
- 新增 `view-bridge.ts` + `view-bridge.test.ts`
- 更新 `plugin-prosemirror/src/index.ts`：export `createProseMirrorView`
- **不** refactor `engine.ts` 非 additive 行为；**不** 暴露 `sessions` Map

Allowed Files:

- `packages/plugins/plugin-prosemirror/src/view-bridge.ts`
- `packages/plugins/plugin-prosemirror/src/view-bridge.test.ts`
- `packages/plugins/plugin-prosemirror/src/index.ts`（additive export）
- `packages/plugins/plugin-prosemirror/package.json`（`prosemirror-view` dependency）
- `pnpm-lock.yaml`（install 产生）

Forbidden Files:

- `packages/react/**`（React 消费 bridge 在 Task 06）
- `packages/core/**`
- `packages/plugins/plugin-prosemirror/src/engine.ts`（除非 additive helper 不可避免 — 优先 view-bridge 内完成）
- `docs/**`、`openspec/**`

## TDD 入口（Red → Green → Refactor）

**Red**

1. 写 failing test：`createProseMirrorView({ session, dom })` 创建 view；DOM 可挂载。
2. 写 failing test：`session.apply` 后 view 文档与 `getDocument()` 一致。
3. 写 failing test：`destroy()` 可重复调用无 throw；无 listener 泄漏（best-effort assert）。
4. 写 failing test：`dispatchInput` 触发时 **不** 直接 mutate session doc（spy 断言调用方 responsibility）。
5. `pnpm --filter @aether-md/plugin-prosemirror test` → **FAIL**。

**Green**

6. 实现 `view-bridge.ts`；export from `index.ts`。
7. plugin tests **PASS**。

**Refactor**

8. 私有 helper 提取；**不** export `sessions` 或 engine internals。

TDD Notes:

- 命名 **MUST** 为 `createProseMirrorView`（design 示例名）；别名须同步 OpenSpec。
- view-bridge 是 React Content（Task 06）的 **唯一** PM DOM 入口。

Validation:

```bash
pnpm --filter @aether-md/plugin-prosemirror test
pnpm --filter @aether-md/plugin-prosemirror exec tsc --noEmit
rg "createProseMirrorView" packages/plugins/plugin-prosemirror/src/index.ts
rg "sessions" packages/plugins/plugin-prosemirror/src/index.ts
node -e "const p=require('./packages/plugins/plugin-prosemirror/package.json'); console.log('prosemirror-view' in (p.dependencies||{}))"
```

预期：view-bridge tests **PASS**；`createProseMirrorView` exported；`sessions` **未** public export；`prosemirror-view` 在 plugin deps。

Intuitive Verification:

- 测试内 mount DOM + apply command → view 刷新与 headless `getDocument()` 一致。

Review Checklist:

- [ ] 对齐 design Decision #2（plugin 侧 bridge，非 react 直依赖 PM）。
- [ ] additive export；**无** `sessions` Map 暴露。
- [ ] `destroy()` 幂等。
- [ ] `dispatchInput` 不 bypass Command Bus。
- [ ] **未**修改 `packages/core/**`。
- [ ] **未**在 `@aether-md/react` 添加 `prosemirror-view`。

Rollback Notes:

- 删除 `view-bridge.ts`、test；revert `index.ts` export 与 `package.json` dep；revert lockfile。

Version Impact:

- `@aether-md/plugin-prosemirror`：**minor additive**（`createProseMirrorView` + `prosemirror-view` dependency）
- `@aether-md/core`：**无变更**

Commit Scope:

- `feat(plugin-prosemirror): add createProseMirrorView additive view bridge`

Depends On:

- 02

Parallel Group:

- wave-3

Barrier:

- false

Status:

- completed

Run Log:

- 2026-07-05: Added `createProseMirrorView`, `refreshProseMirrorViewFromSession`, view-bridge tests.
- Validation: `pnpm --filter @aether-md/plugin-prosemirror test` PASS (20 tests).

Deviation:

- `conversion.ts`: additive `toDOM`/`parseDOM` on `aetherSchema` (required for EditorView DOM rendering).
- `engine.ts`: additive internal `readSessionEditorState` for bridge sync.
- `plugin-prosemirror/package.json`: devDeps `happy-dom` for view-bridge tests.
- Exported `refreshProseMirrorViewFromSession` (additive helper for React Content sync on `change`).

Rollback:

- 见 Rollback Notes
