# v1.0 CI 校验计划

> 本页记录 v1.0 CI 门禁计划；`pnpm check` 已覆盖 workspace packages 与 examples。

## CI 校验计划

实现阶段在 CI 中逐项启用，防止文档与代码漂移：

### 验证套件范围说明

验证套件已自动化以下门禁（G11、G6、部分行为回归）。**compile-layer schema merge 不在当前验证范围**（design Decision 6）：Schema 冲突以 `createDefaultConflictResolver` 单元 abort + `createEditor` fatal startup 回归覆盖，完整 compile-layer 集成 deferred。

### 契约一致性

- [x] 最小 CI 在 PR 和 push 到 `main` 时运行 `pnpm install --frozen-lockfile`、`pnpm check` 和 `pnpm build`，且不包含 npm publish、canary、release token 或 release 自动化（publish 时间表见 [ADR 009](../adr/009-release-governance.md)）
- [x] **G11** `SUPPORTED_MANIFEST_VERSIONS` 与 [Manifest 版本](../sdk/manifest.md) Stable 版本表一致（`packages/core/src/manifest-doc-consistency.test.ts`；code truth = `manifest.ts`）
- [x] **G6** 三个 workspace example（`headless-gfm`、`react`、`vue`）通过 `tsc --noEmit` / smoke test，并纳入根 `pnpm check` turbo pipeline（主路径；见 [Examples Matrix](../examples/matrix.md)）
- [x] 五包 public API `tsd` 导出快照（`packages/*/test-d/`；根 `pnpm types:check`）
- [ ] `CORE_SERVICE_REGISTRY` 与 [内置 Service Capability 注册表](../sdk/capabilities-and-permissions.md) 一致
- [ ] [插件示例](../sdk/examples.md) 可对 `@aether-md/core` 通过 `tsc --noEmit`（G6 次路径；主路径为 headless example）

### Manifest 规范

- [ ] 官方插件（`packages/plugins/*`）全部使用分层 Manifest（`metadata` / `compile` / `runtime` / `security`）
- [ ] 官方插件 `metadata.provides` / `requires` 使用 `CapabilityId` 命名空间（禁止裸字符串）
- [x] 官方 plugin / preset / react 包 `manifestVersion` 在 `SUPPORTED_MANIFEST_VERSIONS` 内（G11 `manifest-doc-consistency.test.ts` 扫描）

### 文档完整性

- [ ] 三套文档交叉引用链接可解析（markdown-link-check）
- [ ] 所有 ADR 包含 `Status` + `Date` 字段
- [ ] [核心词汇表](../glossary.md)、[能力与权限](../sdk/capabilities-and-permissions.md)、[安全模型](../engineering/security.md) 表述一致

### Git 工作流

- [x] PR 标题和 Commit message 按 [Git 工作流规范](../community/git-workflow.md) 使用 commitlint 自动校验（`CI / Validate PR title and commits`）
- [x] PR 分支名由 `CI / Validate branch name` 校验为 `<type>/<kebab-topic>`（接受 `feature/` 与 `feat/`）
- [x] GitHub Ruleset 声明式配置位于 `.github/rulesets/main.json`，由 `node scripts/apply-github-ruleset.mjs` 应用；要求 PR 合入、`main` 禁止 force push、required checks 通过后再 merge
- [x] PR 合入前 required checks：`Quality gates`、`Playwright E2E`、`Validate branch name`、`Validate PR title and commits`；`main` push 重跑 `Quality gates` 与 `Playwright E2E`
- [ ] PR 描述包含 OpenSpec、Superpowers task、Docs / ADR 和 Validation 追踪信息（政策要求；尚未自动化校验）

### 行为回归

- [x] ConflictResolver 默认策略与 [默认策略表](../sdk/conflict-resolution.md) 一致（单元测试 — `packages/core/src/editor/conflict-resolver.test.ts`）
- [x] Schema 冲突 `createDefaultConflictResolver` 对 `type: "schema"` 返回 `abort`（单元测试）；**compile-layer merge deferred** — 不要求 compile-layer schema 合并集成测试
- [x] `createEditor` fatal startup：`metadata.manifestVersion` unsupported、`metadata.name` duplicate → `CoreError` 启动中止（集成测试 — `startup-abort.integration.test.ts`、`editor-orchestration.test.ts`）
- [x] React Shell GateLock：`prevValue === nextValue` 时不重设文档（集成测试 — `@aether-md/react` `gate-lock.integration.test.tsx`，happy-dom，无 Playwright）

---
