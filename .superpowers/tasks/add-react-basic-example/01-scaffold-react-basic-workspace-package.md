# Task 01: scaffold `examples/react-basic` workspace private package

Change:

- `add-react-basic-example`

Branch:

- `feature/add-react-basic-example`

Spec Requirement:

- `validation-suite` / ADDED `React basic example package demonstrates React Shell integration path`（Scenario: React example is private and not published）
- `openspec/changes/add-react-basic-example/tasks.md` §2.1

Source Docs:

- `.superpowers/plans/add-react-basic-example.md`
- `openspec/changes/add-react-basic-example/proposal.md`
- `openspec/changes/add-react-basic-example/design.md`
- `openspec/changes/add-react-basic-example/specs/validation-suite/spec.md`
- `docs/adr/009-release-governance.md`（§4 Demo 形态）
- `docs/architecture/package-layout.md`
- `examples/headless-gfm/`（workspace private 示例结构参考）

## 目标

创建 `examples/react-basic` 作为 workspace private package（`@aether-md/example-react-basic`），含 `package.json` 与 `tsconfig.json`；`pnpm install` 后 workspace 可解析；typecheck 在无 `src/` 时预期 FAIL。

## 范围

1. 确认 `pnpm-workspace.yaml` 已含 `examples/*`（M6 已添加则 **不**重复改）。
2. 创建 `examples/react-basic/package.json`（`private: true`；workspace 依赖五包；scripts 含 `dev` / `build` / `typecheck` / `check`）。
3. 创建 `examples/react-basic/tsconfig.json`（`jsx: react-jsx`；`noEmit: true`；含 `vite/client` types）。
4. 运行 `pnpm install` 更新 `pnpm-lock.yaml`。
5. 运行 `pnpm --filter @aether-md/example-react-basic typecheck` — 预期 **FAIL**（尚无 `src/`）。

Depends On:

- none

Parallel Group:

- wave-a

Barrier:

- false

Allowed Files:

- `examples/react-basic/package.json`
- `examples/react-basic/tsconfig.json`
- `pnpm-lock.yaml`

Forbidden Files:

- `packages/**` 生产 runtime 语义变更
- `examples/headless-gfm/**`
- `docs/**`
- `openspec/specs/**`
- `AGENTS.md`、workflow skill mirrors
- Playwright CI、`npm publish`、M7 publish config

Implementation Notes:

- 五包 public API / semver **不变**；`manifestVersion` / `SUPPORTED_MANIFEST_VERSIONS` **不变**（`[1]`）。
- Vite/React devDeps 可在 Task 02 添加；本 task 可仅 scaffold 基础 manifest + tsconfig。

TDD Notes:

- **Red：** `pnpm --filter @aether-md/example-react-basic typecheck` 在 scaffold-only 状态预期 FAIL（无 `src/`）。
- **Green：** `pnpm install` 后 workspace 可 resolve `@aether-md/example-react-basic`；`private: true` 可 review 确认。

Validation:

```bash
pnpm install
pnpm --filter @aether-md/example-react-basic typecheck
node -e "const p=require('./examples/react-basic/package.json'); console.log(p.private, p.name)"
```

预期：typecheck **FAIL**（无 src/）；node 输出 `true @aether-md/example-react-basic`。

Intuitive Verification:

- review `examples/react-basic/package.json`：`private: true`；name 为 `@aether-md/example-react-basic`。

Review Checklist:

- [ ] `examples/react-basic/package.json` 含 `private: true`。
- [ ] workspace 依赖五包（`@aether-md/react`、`@aether-md/core`、`@aether-md/preset-gfm`、plugin packages）声明正确。
- [ ] **未**修改五包 `packages/**` public contract。
- [ ] `pnpm-lock.yaml` 变更可独立 review。

Rollback Notes:

- 删除 `examples/react-basic/package.json`、`tsconfig.json`；revert `pnpm-lock.yaml` diff。

Version Impact:

- none — 新 `@aether-md/example-react-basic` workspace **private** package；五包 semver **不变**（`0.0.0` private）；`manifestVersion` / `SUPPORTED_MANIFEST_VERSIONS` **不变**（`[1]`）；`pnpm-lock.yaml` **预期变更**。

Commit Scope:

- `feat(examples): scaffold react-basic workspace package`

Status:

- completed

Run Log:

- 2026-07-05: Task started — scaffold `examples/react-basic` package.json + tsconfig.json
- 2026-07-05: `pnpm install` — PASS (lockfile updated)
- 2026-07-05: `pnpm --filter @aether-md/example-react-basic typecheck` — FAIL as expected (TS18003: no src/)
- 2026-07-05: `node -e "..."` — `true @aether-md/example-react-basic`
- 2026-07-05: Validation complete — Task 01 green

Deviation:

- none
