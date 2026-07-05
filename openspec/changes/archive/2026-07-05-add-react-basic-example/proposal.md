## Why

M6 已交付 `examples/headless-gfm` 作为 headless GFM 集成证明，但 ADR 009 §4 仍要求第二个 Demo 形态 `examples/react-basic`（最小 Vite + React，演示 `@aether-md/react` 与 GateLock），以闭合 React Shell 宿主集成故事。该示例是 M7 首发前完善 demo 的既定项（见 `docs/project-status.md`「尚未开始」与近期重点 #3），且不涉及 npm publish 或五包 public API 变更。

## What Changes

- 新建 `examples/react-basic`：workspace **private** package；最小 Vite + React 可运行 demo。
- 演示 `AetherEditorRoot` / `AetherEditorContent` / `useAetherEditor` 与 `createGfmPreset()` + 显式 adapter wiring（与 `examples/headless-gfm` 及 `@aether-md/react` 测试 helper 模式一致）。
- 演示 Shell GateLock：受控 `value` + `onChange`；父组件 rerender 时 `prevValue === nextValue` 不重设文档。
- 将 `examples/react-basic` `typecheck`（`tsc --noEmit`）纳入根 `pnpm check` turbo pipeline，扩展 G6 examples 门禁（沿用 M6 `headless-gfm` 模式）。
- 轻量文档同步：`docs/project-status.md`、`docs/community/release-process.md`、`docs/architecture/ci-checklist.md`（将 `react-basic` 标为已交付或进行中）。
- **非 BREAKING**：五包（`@aether-md/core`、`@aether-md/plugin-remark`、`@aether-md/plugin-prosemirror`、`@aether-md/preset-gfm`、`@aether-md/react`）**无** public API 或运行时语义变更。

## Capabilities

### New Capabilities

（无 — 本 change 不引入新 capability 名称；验收要求归入既有 `validation-suite`。）

### Modified Capabilities

- `validation-suite`：新增 `examples/react-basic` React Shell 集成示例要求；扩展 G6 examples `tsc --noEmit` 门禁至 `react-basic`。
- `engineering-workflow`：扩展 M6 examples typecheck 场景，覆盖 `examples/react-basic` 纳入 `pnpm check` 的失败路径。

## Impact

- **代码**：新建 `examples/react-basic`（Vite + React app、`package.json`、`tsconfig.json`、最小 UI）；**不**修改 `packages/*` 运行时语义（除非测试暴露 bug 并记录 deviation）。
- **依赖**：example 包 workspace 依赖 `@aether-md/react`、`@aether-md/core`、`@aether-md/preset-gfm`、`@aether-md/plugin-remark`、`@aether-md/plugin-prosemirror`；devDeps 含 `vite`、`react`、`react-dom`、`@vitejs/plugin-react`、`typescript`。
- **根脚本 / turbo**：`examples/react-basic#typecheck` 参与 `pnpm check`；**不**新增 Playwright 或浏览器 CI job。
- **API**：**无** breaking change；`manifestVersion` / `SUPPORTED_MANIFEST_VERSIONS` 不变。
- **契约**：archive 后 sync `validation-suite` 与 `engineering-workflow` main spec。
- **文档**：`project-status.md`、`release-process.md`、`ci-checklist.md`（G6 注释扩展）。
- **OpenSpec main spec（archive 后 sync）**：MODIFIED `validation-suite`、`engineering-workflow`。

## 非目标

- npm publish、`NPM_TOKEN`、去除五包 `private: true`、Release workflow（M7）。
- Playwright / 浏览器 CI、examples matrix、Vue examples。
- Toolbar、theme、History UI、自定义 Shell 组件库。
- 修改 Core / React Shell public API 或 GateLock 语义。
- `bootstrapCore` silent provide、PermissionGuard、compile-layer schema merge。
- Superpowers plan / task 文件（本 change 仅 OpenSpec 高层 `tasks.md`）。

## Source Docs

- `docs/adr/009-release-governance.md`（§4 Demo 形态、G6）
- `docs/community/release-process.md`（`examples/*` 不发布矩阵）
- `docs/project-status.md`（`react-basic` 待落地项）
- `docs/architecture/package-layout.md`（`examples/react-basic` 规划路径）
- `docs/architecture/ci-checklist.md`（G6、GateLock）
- `docs/engineering/test-strategy.md`（M6 不覆盖 react-basic → 本 change 闭合）
- `docs/engineering/component-library-governance.md`（Example / Playground 包类型）
- `openspec/specs/react-shell/spec.md`（GateLock、Root/Content/hook）
- `openspec/specs/validation-suite/spec.md`（headless example、G6 基线）
- `examples/headless-gfm/`（workspace private 示例结构参考）

## Version Impact

- **五包 linked 组**：**无** public API 变更；semver **不变**（`0.0.0` private）。
- **`examples/react-basic`**：新 workspace private package；**不**发布 npm；**无** Changeset publish 影响。
- **`manifestVersion` / `SUPPORTED_MANIFEST_VERSIONS`**：**不变**（`[1]`）。
- **Lockfiles**：预期变更 — `examples/react-basic` workspace 依赖与 Vite/React devDeps；**无** runtime API 变更。

## Code-Management Status

- **Branch**：`feature/add-react-basic-example`（自 `main`；working tree 干净）。
- **Conventional Commit type**：OpenSpec 产物 `spec(examples)` 或 `docs(openspec)`；实现阶段预期 `feat(examples)`、`docs(community)`。
- **OpenSpec change id**：`add-react-basic-example`。
- **Unrelated dirty files**：无。

## 风险

- `examples/react-basic` 与 `@aether-md/react` happy-dom 集成测试职责重叠 — 须在 `design.md` 区分「可运行宿主 demo」vs「包内契约测试」。
- Vite + React 引入 browser devDeps — 须保持 example `private: true` 且不泄漏到五包 `dependencies`。
- G6 扩展若破坏 `pnpm check` 性能或 turbo 图 — 仅挂 `typecheck`，不引入 `vite build` 进 CI 主路径（除非 design 冻结另有决定）。
- 若将 M7 publish 或 Core API 扩展并入本 change，范围膨胀。

## 验收标准

- `openspec/changes/add-react-basic-example/` 存在 `proposal.md`、`design.md`、`specs/validation-suite/spec.md`、`specs/engineering-workflow/spec.md`、`tasks.md`。
- `openspec validate add-react-basic-example --strict` 通过。
- **Implementation 阶段**：
  - `examples/react-basic` 可 `pnpm dev`（或等价）本地运行，展示受控编辑器与 GateLock 行为。
  - `examples/react-basic` 声明 `private: true`；排除于 npm 发布矩阵。
  - G6：`examples/react-basic` `tsc --noEmit` 绿；纳入根 `pnpm check`。
  - 五包 public API 无变更；`pnpm check` 全绿。
  - 文档将 `react-basic` 标为已交付。
