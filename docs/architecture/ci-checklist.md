# v1.0 CI 校验计划

> 状态：设计草案。实现开始前，本页作为对应主题的维护入口。

## CI 校验计划

实现阶段在 CI 中逐项启用，防止文档与代码漂移：

### 契约一致性

- [x] 最小 CI 在 PR 和 push 到 `main` 时运行 `pnpm install --frozen-lockfile`、`pnpm check` 和 `pnpm build`，且不包含 npm publish、canary、release token 或 release 自动化
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

- [x] PR 标题和 Commit message 按 [Git 工作流规范](../community/git-workflow.md) 使用 commitlint 自动校验
- [ ] GitHub Rulesets 限制分支名符合 `<type>/<kebab-topic>`
- [ ] PR 描述包含 OpenSpec、Superpowers task、Docs / ADR 和 Validation 追踪信息

### 行为回归

- [ ] ConflictResolver 默认策略与 [默认策略表](../sdk/conflict-resolution.md) 一致（单元测试）
- [ ] Schema 冲突触发 `CoreError` + 启动中止（集成测试）
- [ ] React Shell GateLock：`prevValue === nextValue` 时不重设文档（集成测试）

---
