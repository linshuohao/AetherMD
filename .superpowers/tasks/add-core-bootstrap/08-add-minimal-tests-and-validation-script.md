# Task 08: 添加最小测试与验证脚本

Change:

- `add-core-bootstrap`

Spec Requirement:

- `M1 excludes later milestone behavior`
- `Workflow documents are written in Chinese`
- 覆盖 `core-bootstrap` delta spec 中所有 M1 runtime requirements 的最终验证矩阵。

Source Docs:

- `.superpowers/plans/add-core-bootstrap.md`
- `openspec/changes/add-core-bootstrap/specs/core-bootstrap/spec.md`
- `openspec/changes/add-core-bootstrap/tasks.md`
- `docs/engineering/test-strategy.md`
- `docs/architecture/ci-checklist.md`
- `docs/maintenance.md`
- `AI_NATIVE_ENGINEERING_WORKFLOW.md`

Allowed Files:

- `package.json`
- `packages/core/package.json`
- `packages/core/tsconfig.json`
- `packages/core/vitest.config.*`
- `packages/core/src/**/*.test.ts`
- `packages/core/test/**`
- `scripts/**` only for minimal local validation helpers if package scripts are insufficient
- `.superpowers/runs/add-core-bootstrap/validation.md` only if this task records a local validation draft

Forbidden Files:

- Runtime source changes unrelated to making tests runnable
- `packages/react/**`
- `packages/preset-gfm/**`
- `packages/plugin-prosemirror/**`
- `packages/plugin-remark/**`
- `packages/plugins/**`
- Command Bus、Event Hub、Adapter、React、Remark、ProseMirror、GFM implementation files
- `docs/**`
- `openspec/**`

Implementation Notes:

- 补齐最小 test runner 和 validation scripts，使 M1 Core Bootstrap 可重复验证。
- 测试应覆盖 Manifest version、Manifest shape、Service Capability、`dependsOn` order、lifecycle startup、dispose reverse order、scope guard。
- 不为后续里程碑添加测试夹具或依赖。
- 检查 Superpowers workflow artifacts 的说明性正文保持中文。
- 如果需要新增 dev dependency，应保持最小，并在 Run Log 中记录原因。

Validation:

- `pnpm --filter @aether-md/core exec tsc --noEmit`
- `pnpm --filter @aether-md/core test -- --run`
- `rg "react|prosemirror|remark|gfm|CommandBus|EventHub|Adapter" packages/core package.json pnpm-workspace.yaml`
- 手动检查 `.superpowers/tasks/add-core-bootstrap/*.md`、`.superpowers/plans/add-core-bootstrap.md` 的说明性正文为中文。

Review Checklist:

- [x] 所有 M1 spec requirements 都有对应测试或明确验证记录。
- [x] validation scripts 可在本地重复运行。
- [x] 测试不依赖后续里程碑包或 API。
- [x] 没有为了测试扩大 runtime scope。
- [x] Superpowers workflow artifacts 使用中文说明性正文。

Rollback Notes:

- 回滚本任务新增的测试配置、测试文件和 validation script。
- 如新增 dev dependency，只回滚本任务添加的依赖和 lockfile 变化。
- 不回滚前 7 个任务的 runtime 实现。

Status:

- completed

Run Log:

- 已添加 package-boundary test，覆盖 M1 bootstrap runtime surface，并检查未暴露 later milestone runtime API。
- 已将 core package test script 固定为 `tsc -p tsconfig.test.json && node --test dist/**/*.test.js`，使用 Node built-in test runner。
- 已确认 test compile 输出写入 root `.gitignore` 已忽略的 `packages/core/dist/`。
- 已执行 `pnpm --filter @aether-md/core exec tsc --noEmit`，结果通过。
- 已执行 `pnpm --filter @aether-md/core test -- --run`，22 tests passed。
- 已执行 `rg "react|prosemirror|remark|gfm|CommandBus|EventHub|Adapter" packages/core package.json pnpm-workspace.yaml`，未匹配到后续里程碑边界关键词。
- 已手动检查 `.superpowers/tasks/add-core-bootstrap/*.md`、`.superpowers/plans/add-core-bootstrap.md`，说明性正文为中文，代码标识、API 名称、包名、路径和工具结构关键词保持英文。
- 验证记录已写入 `.superpowers/runs/add-core-bootstrap/validation.md`。

Deviation:

- 使用 Node built-in test runner 与 TypeScript 编译输出作为最小可重复验证脚本；未引入 Vitest。
- test compile 输出写入已被 root `.gitignore` 忽略的 `packages/core/dist/`。
