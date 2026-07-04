# ADR 008: 采用轻量统一仓库工具底座

| Field | Value |
| --- | --- |
| **Status** | Accepted |
| **Date** | 2026-07-04 |
| **Supersedes** | — |

**Context**
AetherMD 已进入 M1 Core Bootstrap 阶段，当前仓库已经包含 `@aether-md/core` 的最小实现、根级 pnpm workspace、基础验证脚本和 Git 规范检查。项目后续会演进为 NPM 包型 Monorepo，但 React、Vue、preset、plugin、example 等未来包尚未具备最小可验证职责。

如果继续只依赖单包脚本，后续新增 package 时容易出现入口不一致、CI 规则分散、Codex 验证路径漂移和贡献者本地命令不统一等问题。相反，如果在 M1 过早启用完整发布流水线、canary release 或业务空包，也会制造尚未被架构和 OpenSpec 约束覆盖的维护面。

因此，仓库需要先建立轻量、可替换、以根命令为中心的工具底座，用于保护 M1 边界并为未来多包扩展保留一致入口。

**Decision**
1. 从 M1 开始建立稳定根命令：`pnpm build`、`pnpm typecheck`、`pnpm test`、`pnpm check`。
2. 引入 task orchestration 工具统一多包脚本入口。具体工具选择属于实现细节，可以在不改变本 ADR 治理契约的前提下替换。
3. 引入版本影响记录工具底座，用于记录 public API、package metadata、workspace package 边界和 SemVer 影响；但不启用正式 npm publish。
4. 引入最小 CI 质量门禁，优先覆盖安装、根命令、Git 规范和 M1 Core Bootstrap 的可重复验证。
5. 不为了 monorepo 形态创建 React、Vue、plugin、preset 或 example 空包。新增 package 必须先具备真实职责、明确 public API 判断、依赖方向、OpenSpec 影响和验证方式。
6. 工具选择是仓库实现细节，不进入产品 spec、SDK spec 或 Core public API。

**Trade-offs**
* *优点*：CI、Codex 和贡献者共享同一组根命令；未来新增 package 可以接入统一入口；工具可替换而不改变治理契约；避免过早发布和空包带来的维护成本。
* *代价*：M1 阶段需要维护少量仓库级配置；部分长期门禁仍需后续增量启用；版本影响记录在正式发布前仍以治理记录为主，而不是 npm 发布事实。
* *放弃的方案*：暂不引入完整 release automation、canary release、examples matrix，也不把未来业务包提前落成空目录或空 package。

**Consequences**
后续新增 package 必须提供同名 `build`、`typecheck`、`test` 脚本，或在对应文档中说明为什么该 package 暂不适用某个根命令。

CI、Codex、维护者和贡献者应统一使用根命令作为验证入口，避免直接依赖某个子包的临时脚本作为仓库级约束。

后续可以替换 task orchestration、版本影响记录或 CI 辅助工具，但替换不得改变本 ADR 规定的治理契约：根命令稳定、版本影响可记录、正式发布不在 M1 轻量工具底座中启用、未来包不以空包形式提前创建。

本 ADR 不启用 npm publish，不配置 canary release，不添加 release token，不建立 examples matrix，不创建未来业务包，也不改变 `@aether-md/core` public API。

关联文档：

- [组件库治理规范](../engineering/component-library-governance.md)
- [规范目录结构](../architecture/package-layout.md)
- [CI 校验计划](../architecture/ci-checklist.md)
- [项目状态](../project-status.md)

---
