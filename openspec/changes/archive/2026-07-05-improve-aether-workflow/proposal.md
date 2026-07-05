## Why

当前 AetherMD workflow skills 同时维护 `.codex/skills/` 与 `.cursor/skills/` 两份镜像，缺少单一权威源和漂移校验，后续修改容易漏改或改错。新特性工作流也只在收尾阶段强调 branch / PR readiness，未把创建或校验工作分支作为 change 生命周期的入口约束，不符合 GitHub Flow 的开发习惯。

## What Changes

- 为 workflow skills 建立单一权威源，并把 `.codex/skills/` 与 `.cursor/skills/` 定义为由该源同步得到的 host-specific mirrors。
- 增加本地同步与校验命令，确保两个 host mirror 与权威源一致，并让 `pnpm check` 或 CI 能发现 skill 漂移。
- 在 AI-native workflow 中新增“准备工作分支”入口约束：非 trivial workflow change 在创建 OpenSpec artifacts 前必须处于符合 `docs/community/git-workflow.md` 的 scoped branch。
- 更新 Aether workflow skills，使 change 创建、计划、任务执行、review、archive 等步骤能记录并校验 branch / change traceability。
- 保持 `docs/`、OpenSpec、Superpowers artifact 的职责边界不变；本 change 只改进 workflow governance 与执行护栏。

## Capabilities

### New Capabilities

- 无。

### Modified Capabilities

- `engineering-workflow`: 增加 workflow skill 单一源、host mirror 同步校验、change 启动分支约束、branch traceability requirements。

## Impact

- 影响 `AI_NATIVE_ENGINEERING_WORKFLOW.md`、`docs/community/git-workflow.md`、`openspec/specs/engineering-workflow/spec.md` 与本地 Aether workflow skills。
- 可能新增 `.skills/` 权威 skill 源目录，以及 `scripts/` 下的同步和校验脚本。
- 可能新增 `package.json` scripts，用于同步、校验 workflow skills，并接入现有 check pipeline。
- 不改变 `@aether-md/core` runtime、Plugin SDK public contract、Manifest / Command / Event 行为。
- 当前工作分支：`docs/improve-aether-workflow`。
- Version impact: 不影响 package SemVer、`manifestVersion`、public exports、lockfile 或 runtime compatibility；影响工程 workflow spec 与 repository governance。
