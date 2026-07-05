## Why

M5 React Shell 已落地并通过 `pnpm check`；按 [ADR 009](docs/adr/009-release-governance.md) 与 [MVP 实施计划](docs/engineering/mvp-implementation-plan.md) M6 行，项目须进入**验证套件**里程碑，在不执行 npm publish 的前提下闭合 G1/G3/G5/G6/G11/G12 门禁预备，并交付 `examples/headless-gfm` 作为 headless GFM 集成路径的可运行证明。

## What Changes

- 新建 `examples/headless-gfm`：workspace **private** package；Node 可运行脚本，演示 `createEditor` + `createGfmPreset()`，无 UI。
- **Publish 预备（不 publish）**：
  - 同步五包 `license: "MIT"` 与 `repository` / `files` / `publishConfig` 元数据（`@aether-md/core`、`@aether-md/plugin-remark`、`@aether-md/plugin-prosemirror`、`@aether-md/preset-gfm`、`@aether-md/react`）。
  - 配置 Changesets `linked` 五包版本组；根 `package.json` 新增 `changeset:publish` 脚本（预留，M7 前不执行）。
  - 完善 [发布流程](docs/community/release-process.md) M6 预备段落。
- **契约 / CI 门禁**：
  - `SUPPORTED_MANIFEST_VERSIONS` 与 [Manifest SDK 文档](docs/sdk/manifest.md) 一致性校验（G11）。
  - `examples/headless-gfm` 或 [SDK examples](docs/sdk/examples.md) 路径可 `tsc --noEmit`（G6）；纳入 `pnpm check`。
  - 契约测试关键路径回归（G5）：既有 M1–M5 测试保持绿；新增 manifest 一致性测试与 example typecheck 任务。
- **行为回归（scope 合理时）**：`createEditor` 启动中止集成测试，覆盖 ci-checklist「Schema 冲突 → fatal `CoreError`」的**当前可测路径**（见 `design.md` Decision 6）；不引入 compile-layer Schema 合并实现。
- **文档同步（G12）**：
  - [项目状态](docs/project-status.md) 反映 M6 进行中 / 已完成项。
  - [CI 校验计划](docs/architecture/ci-checklist.md) 勾选已启用项；[路线图](docs/architecture/roadmap.md) 或 `project-status` 显式标注 v1.0 必须实现与当前实现差距。
- 新增 capability delta spec：`validation-suite`。
- **可选 MODIFIED** `engineering-workflow`：补充 M6 CI 门禁纳入 `pnpm check` 的验收措辞（若实现引入新 check 步骤）。
- **非 BREAKING**：`@aether-md/core` 与 `@aether-md/react` **无**预期 public API 或运行时语义变更（除非测试暴露 bug）。

## Capabilities

### New Capabilities

- `validation-suite`: M6 验证套件验收要求——`examples/headless-gfm`、publish 预备元数据、Changesets linked 五包、契约/CI 门禁（G5/G6/G11）、启动中止行为回归（scope 内）、G12 文档差距标注。

### Modified Capabilities

- `engineering-workflow`: 补充 M6 验证门禁（manifest 一致性、examples `tsc --noEmit`）纳入根 `pnpm check` / Quality gates 的 SHALL 措辞（仅当实现添加对应脚本步骤时）。

## Impact

- **代码**：新建 `examples/headless-gfm`；可能新增 `packages/core` 或根级契约测试脚本；**不**修改 Core/React 运行时语义（除非测试暴露 bug）。
- **包元数据**：五包 `package.json` 增加 `license`、`repository`、`files`、`publishConfig`；`.changeset/config.json` 配置 `linked` 五包。
- **根脚本**：`changeset:publish` 预留；可能新增 `examples:typecheck` 或等价 turbo 任务。
- **API**：**无** breaking change；`manifestVersion` / `SUPPORTED_MANIFEST_VERSIONS` 保持 `[1]`。
- **契约**：archive 后 sync `validation-suite` main spec；可能 MODIFIED `engineering-workflow`。
- **测试 / CI**：manifest 文档一致性测试；examples `tsc --noEmit`；可选 `createEditor` 启动中止集成测试；`pnpm check` 扩展。
- **文档**：`release-process.md`、`project-status.md`、`ci-checklist.md`、`roadmap.md`（G12 差距）。
- **OpenSpec main spec（archive 后 sync）**：新增 `validation-suite`；可能 MODIFIED `engineering-workflow`。

## 非目标

- npm publish、`NPM_TOKEN`、Release workflow、去除 `private: true`（M7）。
- `examples/react-basic`、Playwright 浏览器 CI、Vue Shell。
- PermissionGuard、Worker Thread、History / Selection / Clipboard 完整实现。
- 独立 `@aether-md/sdk` npm 包。
- compile-layer Schema 合并、宿主自定义 `ConflictResolver` 注入（MVP 非目标）。
- Superpowers plan / task 文件（本 change 仅 OpenSpec 高层 `tasks.md`）。

## Source Docs

- `docs/adr/009-release-governance.md`
- `docs/engineering/mvp-implementation-plan.md`（M6 行）
- `docs/engineering/test-strategy.md`
- `docs/architecture/ci-checklist.md`
- `docs/community/release-process.md`
- `docs/project-status.md`
- `docs/architecture/roadmap.md`（G12）
- `docs/sdk/manifest.md`（G11）
- `docs/sdk/examples.md`（G6）
- `docs/sdk/conflict-resolution.md`（Schema 冲突默认 `abort`）

## Version Impact

- **五包 linked 组**（`@aether-md/core`、`@aether-md/plugin-remark`、`@aether-md/plugin-prosemirror`、`@aether-md/preset-gfm`、`@aether-md/react`）：**无** public API 变更；M6 仅元数据与 Changesets `linked` 配置；semver **不变**（`0.0.0` private）。
- **`examples/headless-gfm`**：新 workspace private package；**不**发布 npm；**无** Changeset publish 影响。
- **`manifestVersion` / `SUPPORTED_MANIFEST_VERSIONS`**：**不变**（`[1]`）。
- **Lockfiles**：预期变更 — `examples/headless-gfm` workspace 依赖、可能根脚本 devDeps；**无** runtime API 变更。

## Code-Management Status

- **Branch**：`feat/add-validation-suite`（自 `main`；working tree 干净）。
- **Conventional Commit type**：OpenSpec 产物 `docs(openspec)`；实现阶段预期 `feat(examples)`、`chore(release)`、`test(core)`、`docs(community)`。
- **OpenSpec change id**：`add-validation-suite`。
- **Unrelated dirty files**：无。

## 风险

- `examples/headless-gfm` 与既有 headless integration tests 职责重叠 — 须在 `design.md` 区分「可运行示例」vs「包内契约测试」。
- G6 双路径（`docs/sdk/examples.md` vs `examples/*`）— 须在 design 冻结主路径，避免 CI 重复。
- ci-checklist「Schema 冲突」集成测试在 compile-layer 未接线时 scope 不足 — 须冻结「可测路径」或记录 deviation（见 design Decision 6）。
- Changesets `linked` 配置错误可能导致 M7 版本 bump 不同步 — 须在 implementation 验证 `changeset status`。
- 若将 M7 publish、react-basic 或 Core API 扩展并入本 change，范围膨胀。

## 验收标准

- `openspec/changes/add-validation-suite/` 存在 `proposal.md`、`design.md`、`specs/validation-suite/spec.md`、可选 `specs/engineering-workflow/spec.md`、`tasks.md`。
- `openspec validate add-validation-suite --strict` 通过。
- **Implementation 阶段**：
  - `examples/headless-gfm` 可 Node 运行并演示 GFM headless 路径。
  - 五包 `license` / publish 预备元数据与 Changesets `linked` 配置就绪；根 `changeset:publish` 脚本存在但未执行 publish。
  - G11 manifest 一致性测试绿；G6 examples `tsc --noEmit` 绿；`pnpm check` 全绿。
  - G12 文档差距显式标注；`ci-checklist` 已启用项勾选。
  - Schema 冲突 / 启动中止：scope 内集成测试或 documented deviation。
