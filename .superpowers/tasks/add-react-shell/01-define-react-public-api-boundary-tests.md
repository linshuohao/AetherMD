# Task 01: 定义 React Shell 公开 API 与 package-boundary contract 测试

Change:

- `add-react-shell`

Branch:

- `feat/add-react-shell`

Spec Requirement:

- `react-shell` / ADDED `React Shell package is exported as a public adapter package`（Scenario: React package is consumable from workspace — export 前提）
- `react-shell` / ADDED `React Shell exposes Root, Content, and hook public API`（Scenario: Root creates and disposes / Content mounts / useAetherEditor exposes bridged markdown state — 类型与 export 契约）
- `react-shell` / ADDED `React Shell consumes AetherEditor directly without Shell Adapter`（Scenario: React Shell does not add Shell Adapter protocol）

OpenSpec Tasks:

- `openspec/changes/add-react-shell/tasks.md` §1.2（export 名称定稿）、§5.5（boundary 起点）

Source Docs:

- `.superpowers/plans/add-react-shell.md`
- `openspec/changes/add-react-shell/specs/react-shell/spec.md`
- `openspec/changes/add-react-shell/design.md`（Decision #7 公开组件 API 形状）
- `docs/architecture/core-api.md`（Phase 0 #2 #3）
- `docs/engineering/component-library-governance.md`

## 目标

锁定 M5 `@aether-md/react` 公开 export 契约：`AetherEditorRoot`、`AetherEditorContent`、`useAetherEditor` 及 props/result 类型；以 **Red** boundary 测试定义 package 边界；**禁止** re-export `@aether-md/core` 内部类型或 ShellAdapter；确认 `@aether-md/core` 既有 boundary test **仍** forbid React export（本 task **不**改 core 生产代码）。

## 范围

- 新增 `packages/react/src/types.ts`：
  - `AetherEditorRootProps`（`plugins`、`initialValue`、`value`/`markdown`、`onChange`、`readOnly`）
  - `UseAetherEditorResult`（`editor`、`markdown`、`doc`、`ready`、`error`）
  - 类型 **仅** import `@aether-md/core` **公开** API（`AetherEditor`、`AetherDoc`、`ExtensionPlugin` 等）；**不** re-export core 内部模块类型。
- 新增 `packages/react/src/index.ts`：export 上述类型 + 组件/hook **stub**（`throw new Error('not implemented')` 或等价占位）。
- 新增 `packages/react/src/package-boundary.test.ts`：
  - **Red 入口**：assert exports 含 `AetherEditorRoot`、`AetherEditorContent`、`useAetherEditor`。
  - assert **无** `ShellAdapter` export。
  - assert **无** core 内部符号 re-export（如 `bootstrapCore`、`createCommandEventRuntime`、`CoreError` 等 — 以 `Object.keys` / 静态 import 扫描定形）。
  - assert 生产路径 **无** `prosemirror-view` 直接 import（可先仅测 export 面；生产 import guard 在 Task 09 强化）。
- 运行 `packages/core/src/package-boundary.test.ts`（**只读确认**）：`ReactEditor` export **仍为 false**；core dependencies **仍**无 react — 本 change **不**修改 core 文件。
- **不**创建完整 `package.json` / turbo 接入（Task 02）；**不**实现组件行为。

Allowed Files:

- `packages/react/src/types.ts`
- `packages/react/src/index.ts`（stub exports）
- `packages/react/src/package-boundary.test.ts`

Forbidden Files:

- `packages/react/package.json`（Task 02）
- `packages/react/tsconfig*.json`（Task 02）
- `packages/react/src/gate-lock*.ts`（Task 03）
- `packages/react/src/context.tsx`、`use-aether-editor*.ts`（Task 04）
- `packages/react/src/aether-editor-*.tsx`（Task 06）
- `packages/plugins/**`
- `packages/core/**`（生产代码与 boundary test **均不修改**；仅只读跑 test 确认 React forbid 仍成立）
- `docs/**`、`openspec/**`
- `.changeset/**`
- `AGENTS.md` 及其他无关 dirty 文件

## TDD 入口（Red → Green → Refactor）

**Red**

1. 写 `package-boundary.test.ts`：期望 `AetherEditorRoot` / `AetherEditorContent` / `useAetherEditor` 在 exports 中 → 运行测试 → **FAIL**:
   （package scaffold 未完成时可用 `tsc --noEmit` 或临时最小 `package.json` 仅跑 boundary test — 优先等 Task 02 后 `pnpm --filter @aether-md/react test`）。
2. assert **无** `bootstrapCore` / `ShellAdapter` 等 core 内部 re-export → **FAIL** 直至 stub `index.ts` 仅 export Shell 面。
3. 只读跑 `pnpm core:test` 中 boundary 段：确认 `ReactEditor === false` 仍 PASS（core 未被污染）。

**Green**

4. 添加 `types.ts` + stub `index.ts` 满足 export 契约。
5. boundary test **PASS**；无 core 内部类型泄漏。

**Refactor**

6. 整理 `index.ts` export 顺序（types → components → hook）；stub 与类型分离清晰。

TDD Notes:

- 本 task **必须**以 react `package-boundary.test.ts` Red（exports 不存在）为首要 failing signal。
- Core boundary **MUST** remain green：`ReactEditor` forbid 是 regression guard，不是本 task 的修改目标。

Validation:

```bash
# 若 Task 02 已完成：
pnpm --filter @aether-md/react test
pnpm --filter @aether-md/react exec tsc --noEmit

# Core regression（只读，确认未引入 React export）：
pnpm core:test
rg "ReactEditor" packages/core/src/package-boundary.test.ts
node -e "const c=require('./packages/core/dist/index.js'); console.log('ReactEditor' in c, 'createEditor' in c)"
```

预期：react boundary test **PASS**（stub OK）；core boundary **仍** forbid `ReactEditor`；core **仍** export `createEditor`。

Intuitive Verification:

- 检查 `packages/react/src/index.ts` export 列表仅含 Shell 面 + 公开 props 类型，无 `bootstrapCore` 等。

Review Checklist:

- [ ] 仅修改 Allowed Files。
- [ ] `AetherEditorRoot`、`AetherEditorContent`、`useAetherEditor` export 存在。
- [ ] **无** core 内部 API re-export（`bootstrapCore`、`createCommandEventRuntime` 等）。
- [ ] **无** `ShellAdapter` export。
- [ ] **未**修改 `packages/core/**`。
- [ ] Core `package-boundary.test.ts` 仍 assert `ReactEditor === false`。

Rollback Notes:

- 删除 `packages/react/src/types.ts`、`index.ts`、`package-boundary.test.ts`。

Version Impact:

- `@aether-md/react`：**types + stub exports additive**（package 目录可在 Task 02 正式注册）
- `@aether-md/core`：**无变更**

Commit Scope:

- `test(react): define public API boundary and export contract for M5 shell`

Depends On:

- none

Parallel Group:

- wave-1

Barrier:

- false

Status:

- completed

Run Log:

- 2026-07-05: Started Task 01 on `feat/add-react-shell`.
- Red: `package-boundary.test.ts` asserting exports / no core re-export.
- Green: added `types.ts`, stub `index.ts`, boundary tests.
- Validation: deferred full `pnpm test` to Task 02 scaffold.

Deviation:

- none

Rollback:

- 见 Rollback Notes
