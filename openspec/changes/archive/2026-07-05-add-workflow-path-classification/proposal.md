## Why

当前 Aether workflow 在 Discover 阶段允许少量请求跳过 OpenSpec，但 [`AI_NATIVE_ENGINEERING_WORKFLOW.md`](../../AI_NATIVE_ENGINEERING_WORKFLOW.md) 与 [`engineering-workflow` spec](../../openspec/specs/engineering-workflow/spec.md) 只为 Full Change 定义了成体系的后续步骤与产物。对非 trivial 但又明显不值得走完整变更栈的小改动，仓库缺少一条被规范承认、可审查、可升级的中间路径。

## What Changes

- 在 Discover 阶段引入显式 **Workflow Path Classification**：Maintenance、Quick Change、Spec Change、Full Change。
- 将「是否需要 OpenSpec」与「执行路径的产物厚度」分离；每条 path 定义入口条件、禁止条件、最小审查产物与升级触发器。
- 新增 workflow skills：`aether-workflow-quick-change`、`aether-workflow-create-spec-change`、`aether-workflow-execute-spec-change`。
- 扩展 `aether-workflow-discover-context`、`aether-workflow-review-compliance`、`aether-workflow-archive-change` 以支持新路径。
- 更新长期文档、Git workflow traceability 字段、可选 PR traceability 校验脚本。
- Full Change 路径（OpenSpec 四件套 + Superpowers plan + 多 task + loop + archive）保持不变。

## Capabilities

### New Capabilities

- 无。

### Modified Capabilities

- `engineering-workflow`: 增加 path classification、Maintenance / Quick Change / Spec Change 路径 contract、升级 ladder、轻量 OpenSpec 产物约定。

## Impact

- 影响 `AI_NATIVE_ENGINEERING_WORKFLOW.md`、`docs/community/git-workflow.md`、`AGENTS.md`、`CONTRIBUTING.md`、`openspec/specs/engineering-workflow/spec.md` 与 `.skills/aether-workflow/` 权威 skill 源。
- 新增 `scripts/check-workflow-pr-traceability.mjs` 与 `package.json` script。
- 不改变 `@aether-md/core` runtime、Plugin SDK public contract、Manifest / Command / Event 行为。
- 当前工作分支：`docs/add-workflow-path-classification`。
- Version impact: 不影响 package SemVer、`manifestVersion`、public exports、lockfile 或 runtime compatibility；影响工程 workflow spec 与 repository governance。

## Acceptance Criteria

- Discover 对四条 path 输出完整 8 项字段（含 classification、escalation triggers、recommended skill）。
- Quick Change 与 Spec Change 各有专用 skill；Full Change 步骤无 regression。
- Delta spec 六条 requirement 均可通过 scenario 审查。
- `pnpm skills:check` 与 `pnpm check` 通过。
