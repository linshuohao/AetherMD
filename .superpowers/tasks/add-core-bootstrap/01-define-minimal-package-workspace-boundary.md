# Task 01: 定义最小 package/workspace 边界

Change:

- `add-core-bootstrap`

Spec Requirement:

- `Minimal Core package exists`
- `M1 excludes later milestone behavior`

Source Docs:

- `.superpowers/plans/add-core-bootstrap.md`
- `openspec/changes/add-core-bootstrap/specs/core-bootstrap/spec.md`
- `openspec/changes/add-core-bootstrap/design.md`
- `docs/engineering/mvp-implementation-plan.md`
- `docs/architecture/package-layout.md`
- `docs/architecture/core-api.md`
- `AI_NATIVE_ENGINEERING_WORKFLOW.md`

Allowed Files:

- `packages/core/package.json`
- `packages/core/src/index.ts`
- `packages/core/tsconfig.json`
- `package.json`
- `pnpm-workspace.yaml`
- root TypeScript or test config files only if required for the minimal package boundary

Forbidden Files:

- `packages/react/**`
- `packages/preset-gfm/**`
- `packages/plugin-prosemirror/**`
- `packages/plugin-remark/**`
- `packages/plugins/**`
- Command Bus、Event Hub、Adapter、React、Remark、ProseMirror、GFM implementation files
- `docs/**`
- `openspec/**`
- unrelated `.superpowers/**` files

Implementation Notes:

- 只创建 M1 所需的 `packages/core` 包边界，不实现 runtime bootstrap 行为。
- 保持 `@aether-md/core` 为独立 workspace package。
- 若需要新增 root script，只允许添加用于类型检查或测试 M1 core 的最小脚本。
- 不添加 UI、Adapter、Markdown 或 Command/Event 相关依赖。

Validation:

- `pnpm --filter @aether-md/core exec tsc --noEmit`，如果 Task 01 创建了可运行 TS 配置。
- `pnpm --filter @aether-md/core test`，如果 Task 01 同时创建了测试配置。
- `rg "react|prosemirror|remark|gfm|CommandBus|EventHub|Adapter" packages/core package.json pnpm-workspace.yaml` 用于确认未引入后续里程碑边界。
- 如果当前任务只建立占位边界且尚无可运行 TypeScript 配置，在 Run Log 中记录原因和后续 task 的验证接续点。

Review Checklist:

- [x] `packages/core` 是最小 package boundary。
- [x] workspace 配置只纳入 `packages/core`，没有扩大到未实现包。
- [x] 没有添加 React、Adapter、Remark、ProseMirror、GFM 或 Command/Event 依赖。
- [x] package name、exports 和目录结构支持后续 task 渐进实现。
- [x] 修改可单独 revert，不影响 OpenSpec artifacts。

Rollback Notes:

- 删除本任务新增的 `packages/core` package boundary 文件。
- 回滚 root `package.json` 或 workspace/config 中仅由本任务添加的最小脚本或配置。
- 不触碰 OpenSpec、plan 或其他任务文件。

Status:

- completed

Run Log:

- 已创建 `packages/core` 最小 workspace package boundary，包括 `package.json`、`tsconfig.json`、`tsconfig.test.json` 与 `src/index.ts`。
- 已在 root `package.json` 添加最小 Core 验证脚本，并显式添加 `typescript` dev dependency，使 `pnpm --filter @aether-md/core exec tsc --noEmit` 可运行。
- 已执行 `pnpm install --config.confirmModulesPurge=false` 刷新 workspace install 与 lockfile。
- 已执行 `pnpm --filter @aether-md/core exec tsc --noEmit`，结果通过。
- 已执行 `rg "react|prosemirror|remark|gfm|CommandBus|EventHub|Adapter" packages/core package.json pnpm-workspace.yaml`，未匹配到后续里程碑边界关键词。
- 验证记录已写入 `.superpowers/runs/add-core-bootstrap/validation.md`。

Deviation:

- Task 01 同时加入了 `tsconfig.test.json` 与 package `test` script，用于后续 task 的可重复验证；未添加测试依赖或运行时实现。
