# Git 工作流规范

> 状态：设计草案。本文定义 AetherMD 的分支、提交信息、PR 与合并规则。

## 目的

AetherMD 的 Git 规范基于社区通行实践：

- 分支与 PR 流程采用 [GitHub Flow](https://docs.github.com/en/get-started/using-github/github-flow)。
- 提交信息采用 [Conventional Commits 1.0.0](https://www.conventionalcommits.org/en/v1.0.0/)。

本仓库只在这两套规范之上补充 AetherMD 特有的 Docs、OpenSpec、Superpowers 和 Codex 追踪要求。

Git 历史应帮助维护者回答三个问题：

- 这次变更来自哪个设计或规格上下文？
- 这次提交改变了什么边界或契约？
- 这次变更是否经过验证和审查？

本文成为项目约束后，规则适用于新的分支、PR 和提交。采用本规范之前的既有提交不要求回写或改写历史。

## 基本原则

1. `main` 始终表示当前可审查的项目基线。
2. 遵循 GitHub Flow：从 `main` 创建短生命周期分支，提交后推送分支，通过 PR 审查并合并回 `main`。
3. 重要变更通过分支和 PR 合入，不在 `main` 上直接堆叠大改动。
4. 一个分支聚焦一个主题，优先对应一个 OpenSpec change。
5. Commit message 必须符合 Conventional Commits 格式。
6. Commit message 应说明变更类型、范围和意图。
7. PR 描述必须能追溯到 Docs、OpenSpec change、Superpowers task 或 ADR。
8. 不把无关格式化、个人配置、实验文件混入同一提交。

## 分支模型

### 受保护基线

- `main`：默认主分支，保存已审查或可审查的项目状态。

### 工作分支命名

GitHub Flow 鼓励使用短而描述性的分支名。AetherMD 在此基础上使用 `<type>/<topic>`，让分支能表达变更类别：

| 类型       | 用途                                                                    | 示例                               |
| ---------- | ----------------------------------------------------------------------- | ---------------------------------- |
| `docs/`    | 文档、治理、工作流、ADR                                                 | `docs/git-workflow`                |
| `spec/`    | OpenSpec specs 或 change artifacts                                      | `spec/core-bootstrap`              |
| `feature/` | 新能力实现                                                              | `feature/core-bootstrap`           |
| `feat/`    | `feature/` 的 Conventional Commits 别名（CI 接受，优先仍用 `feature/`） | `feat/core-bootstrap`              |
| `fix/`     | 缺陷修复                                                                | `fix/manifest-version-check`       |
| `test/`    | 测试或验证基础设施                                                      | `test/adapter-contracts`           |
| `chore/`   | 构建、工具、仓库维护                                                    | `chore/package-manager`            |
| `codex/`   | Codex 生成或维护的临时工作分支                                          | `codex/create-core-bootstrap-plan` |

`<topic>` 使用 kebab-case。若存在 OpenSpec change，topic 应尽量与 change 名称一致。

### OpenSpec Change 分支准备

AI-native workflow 的非 trivial 变更必须先准备 scoped branch，再创建 OpenSpec 或 Superpowers artifacts。也就是说，`aether-workflow-create-change` 在写入 `openspec/changes/<change>/` 前应检查当前 branch。

推荐映射：

| Change 类型              | 分支前缀   | 示例                                |
| ------------------------ | ---------- | ----------------------------------- |
| 工作流、治理、长期文档   | `docs/`    | `docs/improve-aether-workflow`      |
| 纯 OpenSpec 规格调整     | `spec/`    | `spec/clarify-manifest-versioning`  |
| 新 runtime 能力          | `feature/` | `feature/add-command-event-runtime` |
| 行为缺陷修复             | `fix/`     | `fix/manifest-version-check`        |
| 测试或验证基础设施       | `test/`    | `test/core-boundary-checks`         |
| 工具、同步脚本、仓库维护 | `chore/`   | `chore/workflow-skill-sync`         |

Codex 可以在满足以下条件时创建分支：

- 当前 branch 是 `main`。
- `git status --short` 没有 unrelated dirty files。
- 用户请求已经足够明确，可以推导出 change name 和分支前缀。
- 分支名符合 `<type>/<kebab-topic>`，且 topic 优先与 OpenSpec change 名一致。

Codex 必须暂停而不是创建分支的情况：

- 工作树存在 unrelated dirty files。
- 当前 branch 已经是另一个 active change。
- 目标分支已存在但语义冲突。
- change 类型不清楚，无法安全选择分支前缀。

## Commit Message

提交信息必须遵守 Conventional Commits 1.0.0：

```text
<type>(<scope>): <summary>
```

示例：

```text
docs(workflow): add ai-native engineering workflow
spec(core): define bootstrap change contract
feat(core): add manifest version check
test(adapter): cover parse rollback behavior
chore(repo): add markdown link check
```

### Type

Conventional Commits 规定 `feat` 表示新功能，`fix` 表示修复，并通过 `!` 或 `BREAKING CHANGE:` 标记破坏性变更。AetherMD 允许以下常见社区类型：

| Type       | 用途                                    |
| ---------- | --------------------------------------- |
| `docs`     | 文档、ADR、治理、工作流                 |
| `spec`     | OpenSpec specs、proposal、design、tasks |
| `feat`     | 新功能或新能力                          |
| `fix`      | 行为修复                                |
| `perf`     | 性能优化                                |
| `test`     | 测试新增或测试基础设施                  |
| `refactor` | 不改变行为的结构调整                    |
| `style`    | 不改变语义的格式、空白、排版            |
| `chore`    | 工具、配置、仓库维护                    |
| `ci`       | CI 配置                                 |
| `build`    | 构建系统、包管理                        |
| `revert`   | 回滚提交                                |

`spec` 是 AetherMD 扩展类型，用于 OpenSpec artifacts。除 `spec` 外，应优先使用 Conventional Commits 社区常见类型。

### Tooling

本仓库使用社区工具约束 Git 规范：

- `commitlint`：校验 commit message 和 PR title 是否符合 Conventional Commits。
- `@commitlint/config-conventional`：提供 Conventional Commits 默认规则。
- `.commitlintrc.cjs`：维护 AetherMD 允许的 type 和 scope。
- `.github/workflows/ci.yml`：在 PR 上运行 quality、governance、conventions 三类检查；`main` push 仅重跑 quality。
- `.github/rulesets/main.json`：GitHub Ruleset 声明式配置；由 `node scripts/apply-github-ruleset.mjs` 应用到仓库。
- `pnpm`：管理 monorepo 工具依赖和 CI 安装。
- `pnpm-workspace.yaml`：声明未来 monorepo 包边界。
- GitHub Rulesets 或 Branch protection：约束分支名、必需检查和合并要求。

当前 commitlint 严格门禁仍覆盖 `type`、`scope`、`header`、`subject-case`；`body-max-line-length` 仅作为 warning 提示，不再阻塞 CI。

本地可手动运行：

```bash
pnpm install
pnpm exec commitlint --config .commitlintrc.cjs --edit .git/COMMIT_EDITMSG
pnpm exec commitlint --config .commitlintrc.cjs --from origin/main --to HEAD
printf '%s\n' "docs(workflow): add git workflow checks" | pnpm exec commitlint --config .commitlintrc.cjs
```

本仓库最终会作为 monorepo 前端组件库维护，因此使用 pnpm 固化工具依赖和 lockfile。当前 `package.json` 只承载仓库级工具，不代表已经开始实现源码包。

### Scope

Scope 使用项目内的稳定领域名：

- `workflow`
- `docs`
- `architecture`
- `sdk`
- `engineering`
- `adr`
- `core`
- `manifest`
- `command`
- `adapter`
- `react`
- `repo`

如果没有清晰 scope，可以省略括号，但应优先选择一个稳定 scope。

### Summary

Summary 使用英文祈使句或简洁动宾结构：

- 使用小写开头。
- 不以句号结尾。
- 描述“做了什么”，不要写“尝试”“更新一些东西”。

### Body

默认使用 **squash merge**，`main` 上的最终 commit message 来自 **PR title**。因此：

- **PR title** 必须符合 Conventional Commits，并通过 CI `Validate PR title and commits` 校验。
- **Traceability（OpenSpec / Superpowers / Validation / Docs）应写在 PR description**，而不是依赖会随 squash 丢失或过长的 commit body。
- PR commit messages 仍会被 lint，但 exploration commits 允许较短的 body；不要在 body 中塞入超长的单行追踪字段。

当 PR description 需要记录 workflow 上下文时，使用 PR 模板的 `## Traceability` 段：

```md
## Traceability

- OpenSpec: <change-name or none>
- Superpowers tasks: <task ids or none>
- Docs / ADR: <paths or none>

## Validation

- <command or review performed>
```

仅在非 squash、且 commit 会原样进入 `main` 时，才需要在 commit body 中重复上述追踪信息。

### Breaking Changes

破坏性变更必须使用 Conventional Commits 形式标记：

```text
feat(sdk)!: change manifest capability model

BREAKING CHANGE: manifest capability identifiers now require namespace prefixes.
```

只要变更影响 public SDK contract、Core API、Manifest、Command/Event、Capability 或 Permission，就必须在 OpenSpec change 和 PR 描述中说明是否属于 breaking change。

## 提交粒度

一个 commit 应表达一个可审查意图。

推荐：

- 一个 docs 主题一个 commit。
- 一个 OpenSpec artifact 组一个 commit。
- 一个 Superpowers task 一个或多个小 commit。
- 测试与实现可以同 commit，前提是它们服务同一 task。

避免：

- 同一 commit 同时修改无关文档和实现。
- 同一 commit 混入格式化全仓文件。
- 同一 commit 同时引入 public contract 变更和未说明的实现。

## PR 规范

PR 标题使用 commit message 风格：

```text
docs(workflow): add git workflow standard
```

PR 遵循 GitHub Flow：创建分支、提交并推送、打开 PR、讨论和验证、合并回 `main`。PR 描述应包含：

```md
## Summary

## Traceability

- OpenSpec:
- Superpowers tasks:
- Docs / ADR:

## Validation

## Anticorruption Review

- [ ] Architecture boundaries preserved
- [ ] Public contracts explicitly documented
- [ ] Tests or docs validation recorded
- [ ] No unrelated files changed
- [ ] Deviations recorded
```

设计阶段的纯文档 PR 也应说明它改变的是架构、SDK、工程策略、治理还是工作流。

## 合并策略

默认使用 squash merge，保持 `main` 历史清晰。

- 多个探索性 commit 可以在合并前 squash。
- **PR title 即 squash 后的 commit message**；合并前确保 title 通过 commitlint。
- Traceability 信息保留在 PR description，避免 squash 后丢失上下文。
- 合并前确保 PR 的三个 required checks 全部通过（见下方「约束工具」）。

## AI / Codex 提交规则

Codex 提交必须遵守：

1. 只提交当前 task 或当前文档变更相关文件。
2. 不提交未确认的个人工具配置。
3. 不提交未被 request 明确要求的生成产物。
4. 提交前运行 `git diff --cached --name-only` 检查 staged 范围。
5. Commit message 必须符合 Conventional Commits。
6. 推送前说明是否仍有未跟踪文件留在本地。

如果当前变更属于 AI-native workflow 的某一步，PR description 的 Traceability 段应引用对应 skill 或 task；commit body 仅作可选补充。

## Workflow Code-management Hooks

AI-native workflow steps must run code-management hooks before reporting completion:

- Read `git status --short` before editing or before summarizing a step.
- Keep unrelated dirty files out of the current task, commit, and PR.
- Map every changed file to an OpenSpec change, Superpowers task, docs reference, or accepted workflow artifact.
- Before staging, run `git diff --name-status` and `git diff --cached --name-only` after staging.
- Stage, commit, push, or open a PR only when the user explicitly asks.
- Include OpenSpec, Superpowers tasks, validation, deviations, and version impact in commit body or PR description when the change belongs to the AI-native workflow.

## 约束工具

CI 采用 **平台 prevent + PR gate verify** 两层模型：

| 层      | 机制                                           | 作用                                                                     |
| ------- | ---------------------------------------------- | ------------------------------------------------------------------------ |
| Layer 0 | GitHub Ruleset（`.github/rulesets/main.json`） | 阻止无 PR 的直推、force push、未通过 required checks 的 merge            |
| Layer 1 | `.github/workflows/ci.yml`（PR）               | `Quality gates`、`Validate branch name`、`Validate PR title and commits` |
| Layer 2 | `.github/workflows/ci.yml`（`main` push）      | 仅 `Quality gates`，验证 merge 后产物；不再做 post-merge PR 关联审计     |

当前启用的自动约束：

- PR title 与 commit messages：由 `CI / Validate PR title and commits` 使用 commitlint 校验（conventions job 仅安装 commitlint，不安装 monorepo 全量依赖）。
- PR branch name：由 `CI / Validate branch name` 校验 `<type>/<kebab-topic>`（接受 `feature/` 与 `feat/`）。
- Build/test：由 `CI / Quality gates` 运行 `pnpm check` 与 `pnpm build`（PR 与 `main` push）。

GitHub Ruleset 必须在仓库启用后，才能在服务端真正阻止绕过 PR 的直接 push。应用方式：

```bash
node scripts/apply-github-ruleset.mjs
```

Ruleset 要求 `main` 通过 PR 合入，且 required checks 至少包含：

- `Quality gates`
- `Validate branch name`
- `Validate PR title and commits`

Bypass list 仅限仓库管理员或维护者的紧急修复流程，并且必须在后续 PR 或 commit message 中记录原因。

**不再使用** post-merge `direct-push-audit`：该检查依赖 GitHub「commit 关联 PR」API，在 squash merge 后存在索引延迟，会产生误报；PR 合入门禁改由 Ruleset 在 merge 前 enforce。

当前未启用但后续可以补充：

- `commit-msg` 本地 Git hook：在本地提交时运行 commitlint。

CI quality job 使用 `pnpm install --frozen-lockfile` 安装 workspace 依赖；conventions job 仅安装 commitlint 包。

## 例外

启用 GitHub Ruleset 后，`main` 默认禁止直推。以下情况应通过 **Ruleset bypass**（仅限管理员）或正常 PR 处理：

- 拼写修复。
- 坏链接修复。
- 不改变语义的格式修复。
- 维护者确认的轻量文档澄清。

使用 bypass 直推时，必须在后续 PR 或 commit message 中记录原因。日常变更仍应走 PR + squash merge。

## Workflow Path Traceability

AI-native workflow 在 Discover 阶段分类为 Maintenance、Quick Change、Spec Change 或 Full Change。PR 描述应保留与路径匹配的最小 traceability 字段。

### Maintenance

```markdown
## Workflow Traceability

- Path: Maintenance
- Classification: typo | link | format
- Changed files: ...
- Validation: N/A | `<command>` → pass/fail
```

### Quick Change

维护者确认的轻量文档澄清应使用 **Quick Change**，不是 Maintenance。

```markdown
## Workflow Traceability

- Path: Quick Change
- Classification: fix | docs | chore | refactor
- Source docs: `<paths>` or none
- Allowed scope: ...
- Changed files: ...
- Escalation checked: yes/no + notes
- Validation: `<command>` → pass/fail
- Version impact: none | ...
- Suggested commit scope: `<type>(<scope>): ...`
```

Quick Change 仍需 scoped branch 与 PR，遵守 GitHub Flow。

### Spec Change / Full Change

PR 描述应引用 OpenSpec change name、相关 spec requirement 或 Superpowers task。Spec Change 分支 topic 应与 change name 一致。

本地可选校验：

```bash
pnpm workflow:pr-check -- path/to/pr-body.md
```
