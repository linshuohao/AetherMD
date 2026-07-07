# add-core-bootstrap Validation

## Task 01: 定义最小 package/workspace 边界

Status: passed

Commands:

- `pnpm install --config.confirmModulesPurge=false`
  - Result: passed
  - Notes: workspace 新增 `@aether-md/core` 后，pnpm 需要刷新本地 install；使用现有 lockfile/cache，新增 `typescript 6.0.3` 为显式 dev dependency。
- `pnpm --filter @aether-md/core exec tsc --noEmit`
  - Result: passed
- `rg "react|prosemirror|remark|gfm|CommandBus|EventHub|Adapter" packages/core package.json pnpm-workspace.yaml`
  - Result: passed
  - Notes: 命令退出码为 1，表示未匹配到后续里程碑边界关键词。

Deviations:

- Task 01 同时加入了 `tsconfig.test.json` 与 package `test` script，用于后续 task 的可重复验证；未添加测试依赖或运行时实现。

## Task 02: 定义 `@aether-md/core` public types

Status: passed

Commands:

- `pnpm --filter @aether-md/core exec tsc --noEmit`
  - Result: passed
- `rg "Command|Event|Adapter|React|ProseMirror|Remark|GFM|Markdown" packages/core/src`
  - Result: passed
  - Notes: 命令退出码为 1，表示未匹配到后续里程碑 public API 关键词。

Deviations:

- 无。

## Task 03: 实现 Manifest 版本校验

Status: passed

Commands:

- `pnpm install --config.confirmModulesPurge=false`
  - Result: passed
  - Notes: 为 core package 显式加入 `@types/node`，仅用于 Node built-in test runner 的 TypeScript 测试类型。
- `pnpm --filter @aether-md/core test -- --run`
  - Result: passed
  - Notes: 4 tests passed，覆盖 supported version、unsupported version、missing `manifest.metadata`、invalid Manifest 不调用 lifecycle hooks。
- `pnpm --filter @aether-md/core exec tsc --noEmit`
  - Result: passed

Deviations:

- 使用 Node built-in test runner 加 TypeScript 编译输出作为最小测试方案，未引入 Vitest 等额外测试框架。

## Task 04: 实现 Service Capability 校验

Status: passed

Commands:

- `pnpm --filter @aether-md/core test -- --run`
  - Result: passed
  - Notes: 8 tests passed，新增覆盖 M1 Core-provided capability、plugin-provided capability、missing capability fatal、Adapter-backed capability 不被 silent provide。
- `pnpm --filter @aether-md/core exec tsc --noEmit`
  - Result: passed

Deviations:

- 无。

## Task 05: 实现 `dependsOn` 拓扑排序

Status: passed

Commands:

- `pnpm --filter @aether-md/core test -- --run`
  - Result: passed
  - Notes: 12 tests passed，新增覆盖 dependency-before-dependent、同层按宿主输入顺序稳定排序、missing dependency fatal、dependency cycle fatal。
- `pnpm --filter @aether-md/core exec tsc --noEmit`
  - Result: passed

Deviations:

- 无。

## Task 06: 实现生命周期启动顺序

Status: passed

Commands:

- `pnpm --filter @aether-md/core test -- --run`
  - Result: passed
  - Notes: 16 tests passed，新增覆盖 validation failure 不运行 hooks、`onInit` dependency order、`onReady` 在 successful `onInit` 后按顺序运行、async `onInit` 被 await、缺失 hook 被跳过。
- `pnpm --filter @aether-md/core exec tsc --noEmit`
  - Result: passed

Deviations:

- lifecycle hook failure 被包装为 fatal `CoreError` 并阻止返回 running runtime；partial startup cleanup 未在本任务中发明，等待后续明确 spec 或 task。

## Task 07: 实现 `dispose` 逆序销毁

Status: passed

Commands:

- `pnpm --filter @aether-md/core test -- --run`
  - Result: passed
  - Notes: 20 tests passed，新增覆盖 `dispose()` reverse `onDestroy` order、只销毁 successful lifecycle order、缺失 `onDestroy` 跳过、重复 `dispose()` 不重复销毁。
- `pnpm --filter @aether-md/core exec tsc --noEmit`
  - Result: passed

Deviations:

- `dispose()` 对重复调用采用显式 no-op，避免重复执行 destroy hooks；完整 dispose 幂等语义仍待后续 spec hardening。

## Task 08: 添加最小测试与验证脚本

Status: passed

Commands:

- `pnpm --filter @aether-md/core exec tsc --noEmit`
  - Result: passed
- `pnpm --filter @aether-md/core test -- --run`
  - Result: passed
  - Notes: 22 tests passed，覆盖 Manifest version、Manifest shape、Service Capability、`dependsOn` order、lifecycle startup、dispose reverse order、package export boundary。
- `rg "react|prosemirror|remark|gfm|CommandBus|EventHub|Adapter" packages/core package.json pnpm-workspace.yaml`
  - Result: passed
  - Notes: 命令退出码为 1，表示未匹配到后续里程碑边界关键词。
- 手动检查 `.superpowers/tasks/add-core-bootstrap/*.md`、`.superpowers/plans/add-core-bootstrap.md`
  - Result: passed
  - Notes: 说明性正文为中文，代码标识、API 名称、包名、路径和工具结构关键词保持英文。

Deviations:

- 使用 Node built-in test runner 与 TypeScript 编译输出作为最小可重复验证脚本；未引入 Vitest。
- test compile 输出写入已被 root `.gitignore` 忽略的 `packages/core/dist/`。
