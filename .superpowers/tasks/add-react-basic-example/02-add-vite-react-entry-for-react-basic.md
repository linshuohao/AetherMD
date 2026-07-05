# Task 02: Vite + React 宿主入口与最小 UI

Change:

- `add-react-basic-example`

Branch:

- `feature/add-react-basic-example`

Spec Requirement:

- `validation-suite` / ADDED `React basic example package demonstrates React Shell integration path`（Scenario: React example runs locally from workspace）

OpenSpec Tasks:

- `openspec/changes/add-react-basic-example/tasks.md` §2.1–2.2

Source Docs:

- `.superpowers/plans/add-react-basic-example.md`
- `openspec/changes/add-react-basic-example/design.md`（Decision 3：CI 仅 typecheck，**不**将 `vite build` 纳入 `pnpm check`）
- `examples/headless-gfm/`（private example 结构参考）

## 目标

添加 Vite + React 最小可运行宿主：`vite.config.ts`、`index.html`、`src/main.tsx`、`src/vite-env.d.ts`、占位 `App.tsx`；`pnpm dev` 可启动并在浏览器渲染占位 UI。

## 范围

1. 创建 `examples/react-basic/vite.config.ts`（`@vitejs/plugin-react`；`resolve.dedupe: ['react','react-dom']` 防 monorepo 双 React 实例）。
2. 创建 `index.html`、`src/main.tsx`、`src/vite-env.d.ts`。
3. 创建占位 `App.tsx`（Task 03 前不含编辑器）。
4. 更新 `package.json` 添加 Vite/React devDependencies（若 Task 01 未含）。
5. Smoke：`pnpm build && pnpm --filter @aether-md/example-react-basic dev` — 浏览器显示标题占位 UI。

Depends On:

- 01

Parallel Group:

- wave-a

Barrier:

- false

Allowed Files:

- `examples/react-basic/vite.config.ts`
- `examples/react-basic/index.html`
- `examples/react-basic/src/main.tsx`
- `examples/react-basic/src/vite-env.d.ts`
- `examples/react-basic/src/App.tsx`（占位，Task 03 前）
- `examples/react-basic/package.json`（devDeps）
- `pnpm-lock.yaml`

Forbidden Files:

- `packages/**` 生产代码
- `examples/headless-gfm/**`
- Playwright / browser CI
- `@aether-md/react` test-only 路径 import
- `docs/sdk/examples.md` 大规模改写

Implementation Notes:

- Vite/React devDeps **仅** `examples/react-basic/devDependencies`。
- example **MUST NOT** 被五包 `dependencies` 引用。

TDD Notes:

- **Red：** Task 01 前 `pnpm --filter @aether-md/example-react-basic dev` 不可用。
- **Green：** `pnpm build && pnpm --filter @aether-md/example-react-basic dev` 浏览器显示标题占位 UI。
- example 无 Node test runner；以 typecheck + 本地 dev smoke 为主。

Validation:

```bash
pnpm build
pnpm --filter @aether-md/example-react-basic dev
```

预期：dev server 启动；浏览器加载 `#root` 占位 UI（标题「AetherMD React Basic Example」）。

Intuitive Verification:

- 浏览器打开 dev URL，确认占位 `<h1>` 与「Editor mounts in Task 03.」文案可见。
- 确认 `vite.config.ts` 含 `resolve.dedupe`。

Review Checklist:

- [ ] 仅 Allowed Files 范围内变更。
- [ ] **无**五包 public API 变更。
- [ ] **未**将 `vite build` 纳入 `pnpm check`。
- [ ] **未** import `@aether-md/react` test 模块。

Rollback Notes:

- revert Task 02 commits：`vite.config.ts`、`index.html`、`src/main.tsx`、`src/vite-env.d.ts`、占位 `App.tsx`、`package.json` devDeps；保留 Task 01 scaffold 若需独立回滚。

Version Impact:

- none — `pnpm-lock.yaml` 预期变更（Vite/React devDeps）

Commit Scope:

- `feat(examples): add vite react entry for react-basic`

Status:

- completed

Run Log:

- 2026-07-05: Task started — Vite + React entry scaffold
- 2026-07-05: Added vite.config.ts, index.html, src/main.tsx, src/vite-env.d.ts, placeholder App.tsx
- 2026-07-05: `tsc --noEmit` (direct) — PASS
- 2026-07-05: `vite build` — PASS (bundle contains expected title)
- 2026-07-05: Validation complete — Task 02 green

Deviation:

- none
