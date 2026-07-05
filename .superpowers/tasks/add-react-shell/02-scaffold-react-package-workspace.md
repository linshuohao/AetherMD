# Task 02: React package workspace 脚手架

Change:

- `add-react-shell`

Branch:

- `feat/add-react-shell`

Spec Requirement:

- `react-shell` / ADDED `React Shell package is exported as a public adapter package`（Scenario: React package is consumable from workspace）
- `react-shell` / ADDED `React Shell package is exported as a public adapter package`（Scenario: React package participates in check pipeline）

OpenSpec Tasks:

- `openspec/changes/add-react-shell/tasks.md` §1.2–1.3

Source Docs:

- `.superpowers/plans/add-react-shell.md`
- `openspec/changes/add-react-shell/specs/react-shell/spec.md`
- `docs/architecture/package-layout.md`
- `docs/engineering/component-library-governance.md`

## 目标

创建 `@aether-md/react` workspace package 脚手架：`package.json`、`exports`、TypeScript 配置、build/typecheck/test 脚本；接入 turbo / pnpm workspace；添加 Changeset；使 Task 01 的 types/stub 可 **build + typecheck**。

## 范围

- 创建 `packages/react/package.json`：
  - `name: @aether-md/react`
  - `peerDependencies.react`（^18 || ^19）
  - `dependencies`：`@aether-md/core`、`@aether-md/plugin-prosemirror`（Content 生产代码消费 `createProseMirrorView`；**非** Shell Adapter）
  - devDeps：`happy-dom`、`@testing-library/react`（若需）、`@aether-md/preset-gfm`、`@aether-md/plugin-remark`（仅测试 / GFM smoke 路径）
  - `build` / `typecheck` / `test` scripts
- 创建 `tsconfig.json`（JSX `react-jsx`）、`tsconfig.test.json`
- 添加 `.changeset/add-react-shell.md`（新 package + 初始 version）
- 确认 `pnpm-workspace.yaml` `packages/*` 已覆盖（通常无需改）
- **不**实现 GateLock、hook、Root/Content 行为（Tasks 03–06）

Allowed Files:

- `packages/react/package.json`
- `packages/react/tsconfig.json`
- `packages/react/tsconfig.test.json`
- `.changeset/add-react-shell.md`
- `pnpm-lock.yaml`（install 产生）
- `pnpm-workspace.yaml`（仅当需显式条目）

Forbidden Files:

- `packages/react/src/gate-lock*.ts`（Task 03）
- `packages/react/src/context.tsx`、`use-aether-editor*.ts`（Task 04）
- `packages/plugins/plugin-prosemirror/src/view-bridge.ts`（Task 05）
- `packages/react/src/aether-editor-*.tsx`（Task 06）
- `packages/core/**`
- `docs/**`、`openspec/**`

## TDD 入口（Red → Green → Refactor）

**Red**

1. 运行 `pnpm --filter @aether-md/react build` → **FAIL**（package 不存在或未配置）。

**Green**

2. 添加 scaffold 后 `pnpm install` → `pnpm --filter @aether-md/react build` → **PASS**。
3. `pnpm --filter @aether-md/react exec tsc --noEmit` → **PASS**。
4. Task 01 boundary test 可跑：`pnpm --filter @aether-md/react test` → **PASS**（stub exports）。

**Refactor**

5. 确认 `dependencies` 含 `@aether-md/plugin-prosemirror`；**无** `prosemirror-view` / `remark` 直依赖（须在 plugin-prosemirror）。

TDD Notes:

- 以 **build/typecheck FAIL → PASS** 为 contract 入口；非行为测试。

Validation:

```bash
pnpm install
pnpm --filter @aether-md/react build
pnpm --filter @aether-md/react exec tsc --noEmit
pnpm --filter @aether-md/react test
node -e "const p=require('./packages/react/package.json'); const d=Object.keys(p.dependencies||{}); console.log('plugin-prosemirror', d.includes('@aether-md/plugin-prosemirror')); console.log('forbidden', d.filter(x=>/prosemirror-view|remark/.test(x)))"
node -e "const p=require('./packages/core/package.json'); console.log(Object.keys(p.dependencies||{}).filter(x=>/react|prosemirror|remark/.test(x)))"
```

预期：react build/typecheck/test **PASS**；react `dependencies` 含 `@aether-md/plugin-prosemirror`，过滤 `prosemirror-view`/`remark` 输出 `[]`；core **无** react/prosemirror/remark runtime deps。

Intuitive Verification:

- `pnpm --filter @aether-md/react build` 产出 `dist/`；workspace 可 resolve `@aether-md/react`。

Review Checklist:

- [ ] 仅修改 Allowed Files。
- [ ] `peerDependencies.react` 已声明；`dependencies` 含 `@aether-md/core` + `@aether-md/plugin-prosemirror`；**无** `prosemirror-view` 直依赖。
- [ ] Task 01 types/stub 纳入编译图。
- [ ] Changeset 已添加。
- [ ] **未**修改 `packages/core/**`。

Rollback Notes:

- 删除 `packages/react/package.json`、`tsconfig*.json`、`.changeset/add-react-shell.md`；revert lockfile diff。

Version Impact:

- `@aether-md/react`：**新 package**（`0.0.0` private / Changeset `0.1.0`）
- `pnpm-lock.yaml`：**预期变更**（react、happy-dom 等 devDeps）
- `@aether-md/core`：**无变更**

Commit Scope:

- `chore(react): scaffold @aether-md/react workspace package`

Depends On:

- 01

Parallel Group:

- wave-1

Barrier:

- false

Status:

- completed

Run Log:

- 2026-07-05: Scaffolded `@aether-md/react` package.json, tsconfigs, changeset.
- Red: `pnpm --filter @aether-md/react build` before scaffold → FAIL.
- Green: build/typecheck/test PASS after install; boundary tests PASS.

Deviation:

- none

Rollback:

- 见 Rollback Notes
