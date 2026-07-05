# v1.0 CI 校验计划

> 状态：设计草案 + M1–M5 基线 CI 门禁已部分启用（`pnpm check` 覆盖 5 个 workspace package）。本页作为对应主题的维护入口。

## CI 校验计划

实现阶段在 CI 中逐项启用，防止文档与代码漂移：

### 契约一致性

- [x] 最小 CI 在 PR 和 push 到 `main` 时运行 `pnpm install --frozen-lockfile`、`pnpm check` 和 `pnpm build`，且不包含 npm publish、canary、release token 或 release 自动化（publish 时间表见 [ADR 009](../adr/009-release-governance.md)）
- [ ] `packages/core/src/types/` 导出与 [Manifest](../sdk/manifest.md)、[能力与权限](../sdk/capabilities-and-permissions.md) 中的类型定义自动比对（`tsd` 或快照测试）
- [ ] `SUPPORTED_MANIFEST_VERSIONS` 与 [Manifest 版本](../sdk/manifest.md) 表格一致
- [ ] `CORE_SERVICE_REGISTRY` 与 [内置 Service Capability 注册表](../sdk/capabilities-and-permissions.md) 一致
- [ ] [插件示例](../sdk/examples.md) 可对 `@aether-md/core` 通过 `tsc --noEmit`

### Manifest 规范

- [ ] 官方插件（`packages/plugins/*`）全部使用分层 Manifest（`metadata` / `compile` / `runtime` / `security`）
- [ ] 官方插件 `metadata.provides` / `requires` 使用 `CapabilityId` 命名空间（禁止裸字符串）
- [ ] 官方插件 `manifestVersion` 在 `SUPPORTED_MANIFEST_VERSIONS` 内

### 文档完整性

- [ ] 三套文档交叉引用链接可解析（markdown-link-check）
- [ ] 所有 ADR 包含 `Status` + `Date` 字段
- [ ] [核心词汇表](../glossary.md)、[能力与权限](../sdk/capabilities-and-permissions.md)、[安全模型](../engineering/security.md) 表述一致

### Git 工作流

- [x] PR 标题和 Commit message 按 [Git 工作流规范](../community/git-workflow.md) 使用 commitlint 自动校验（`CI / Validate PR title and commits`）
- [x] PR 分支名由 `CI / Validate branch name` 校验为 `<type>/<kebab-topic>`（接受 `feature/` 与 `feat/`）
- [x] GitHub Ruleset 声明式配置位于 `.github/rulesets/main.json`，由 `node scripts/apply-github-ruleset.mjs` 应用；要求 PR 合入、`main` 禁止 force push、required checks 通过后再 merge
- [x] PR 合入前 required checks：`Quality gates`、`Validate branch name`、`Validate PR title and commits`；`main` push 仅重跑 `Quality gates`（已移除 flaky post-merge PR 关联审计）
- [ ] PR 描述包含 OpenSpec、Superpowers task、Docs / ADR 和 Validation 追踪信息（政策要求；尚未自动化校验）

### 行为回归

- [ ] ConflictResolver 默认策略与 [默认策略表](../sdk/conflict-resolution.md) 一致（单元测试）
- [ ] Schema 冲突触发 `CoreError` + 启动中止（集成测试）
- [x] React Shell GateLock：`prevValue === nextValue` 时不重设文档（集成测试 — `@aether-md/react` `gate-lock.integration.test.tsx`，happy-dom，无 Playwright）

---
