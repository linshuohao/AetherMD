# Task 01: 脚手架 `examples/headless-gfm` workspace package

Change:

- `add-validation-suite`

Branch:

- `feat/add-validation-suite`

Spec Requirement:

- `validation-suite` / ADDED `Headless GFM example package demonstrates integration path`（Scenario: Headless example is private and not published）
- `validation-suite` / ADDED `Examples package passes TypeScript noEmit check in CI`（scaffold 阶段：local typecheck 可解析）

OpenSpec Tasks:

- `openspec/changes/add-validation-suite/tasks.md` §3.1

Source Docs:

- `.superpowers/plans/add-validation-suite.md`
- `openspec/changes/add-validation-suite/specs/validation-suite/spec.md`
- `openspec/changes/add-validation-suite/design.md`
- `docs/engineering/mvp-implementation-plan.md`
- `docs/sdk/examples.md`（G6 次路径参考）

## 目标

创建 `examples/headless-gfm` private workspace package 脚手架：`package.json`、`tsconfig.json`，并在 `pnpm-workspace.yaml` 纳入 `examples/*` glob。本 task **不**实现 `src/run.ts`（留 Task 02）。

## 范围

1. 在 `pnpm-workspace.yaml` 添加 `examples/*`。
2. 创建 `examples/headless-gfm/package.json`：
   - `name`: `@aether-md/example-headless-gfm`
   - `private`: `true`
   - `type`: `module`
   - `scripts`: `build`（`tsc`）、`typecheck`（`tsc --noEmit`）、占位 `start`
   - `dependencies`: `@aether-md/core`、`@aether-md/preset-gfm`、`@aether-md/plugin-remark`、`@aether-md/plugin-prosemirror`（`workspace:*`）
3. 创建 `examples/headless-gfm/tsconfig.json`（`extends` 模式参照 `packages/preset-gfm`；`outDir`: `dist`；`include`: `src/**/*`）。
4. 运行 `pnpm install` 更新 `pnpm-lock.yaml`。

Depends On:

- none

Parallel Group:

- wave-a

Barrier:

- false

Allowed Files:

- `examples/headless-gfm/package.json`
- `examples/headless-gfm/tsconfig.json`
- `pnpm-workspace.yaml`
- `pnpm-lock.yaml`

Forbidden Files:

- `examples/headless-gfm/src/**`（留 Task 02）
- `packages/core/src/**`（生产代码）
- `packages/react/**`
- `examples/react-basic/**`
- `.github/workflows/**`（Release workflow）
- `openspec/**`（已存在 artifacts）
- `AGENTS.md`、workflow skill mirrors
- 无关 package 运行时语义变更

Implementation Notes:

- Example **MUST NOT** 依赖 React/DOM。
- Example **MUST NOT** 发布 npm；保持 `private: true`。
- `start` script 可为占位；Task 02 补全可运行实现。

TDD Notes:

- **Red：** 脚手架前，`pnpm --filter @aether-md/example-headless-gfm typecheck` 预期 FAIL（package 不存在或 workspace 未解析）。
- **Red：** scaffold 后、无 `src/` 时，`typecheck` 预期 FAIL（无输入文件或 tsconfig include 空）。
- **Green：** `package.json` 存在且 `private: true`；`pnpm install` 后 workspace 可解析；tsconfig 可加载。
- 可选：根脚本或临时断言 `examples/headless-gfm/package.json` 存在且 `private: true`。

Validation:

```bash
pnpm install
pnpm --filter @aether-md/example-headless-gfm typecheck
node -e "const p=require('./examples/headless-gfm/package.json'); if(p.private!==true) throw new Error('must be private'); if(p.name!=='@aether-md/example-headless-gfm') throw new Error('name');"
```

预期：workspace 解析成功；`typecheck` 在无 `src/` 时可 FAIL（符合 scaffold 阶段）；`private: true` 断言 PASS。

Intuitive Verification:

- 阅读 `examples/headless-gfm/package.json`：确认 `private: true`、workspace 依赖、无 React/DOM 依赖。

Review Checklist:

- [ ] `pnpm-workspace.yaml` 含 `examples/*`。
- [ ] `@aether-md/example-headless-gfm` 为 `private: true`。
- [ ] 无 React/DOM 依赖。
- [ ] 未 touch Core/React 生产代码。
- [ ] 未配置 `NPM_TOKEN` 或 Release workflow。
- [ ] `pnpm-lock.yaml` 仅反映 example workspace 依赖。

Rollback Notes:

- 删除 `examples/headless-gfm/` 目录；回滚 `pnpm-workspace.yaml` 与 `pnpm-lock.yaml` 变更。

Version Impact:

- 新 private workspace package `@aether-md/example-headless-gfm`；**不**发布 npm；`pnpm-lock.yaml` 预期变更。

Commit Scope:

- `chore(examples): scaffold headless-gfm workspace package`

Status:

- completed

Run Log:

- **TDD Red (pre-scaffold):** `pnpm --filter @aether-md/example-headless-gfm typecheck` → no workspace match (`No projects matched the filters`); `node -e` package.json assertion would fail (file absent).
- **Implementation:** Added `examples/*` to `pnpm-workspace.yaml`; created `examples/headless-gfm/package.json` (`@aether-md/example-headless-gfm`, `private: true`, workspace deps on core/preset-gfm/plugin-remark/plugin-prosemirror); created `examples/headless-gfm/tsconfig.json` (NodeNext, `outDir: dist`, `include: src/**/*`).
- **TDD Red (post-scaffold, no src/):** `pnpm --filter @aether-md/example-headless-gfm typecheck` → exit 2, `TS18003: No inputs were found` (expected for scaffold).
- **TDD Green:** `pnpm install` → exit 0, lockfile updated (7 workspace projects); `node -e` package.json assertions → PASS (`private: true`, correct name); workspace resolves `@aether-md/example-headless-gfm`.

Validation commands:

```text
pnpm install → exit 0 (7 workspace projects, lockfile updated)
pnpm --filter @aether-md/example-headless-gfm typecheck → exit 2 (TS18003 no src/ — expected scaffold)
node -e package.json assertions → PASS
```

Deviation:

- none
