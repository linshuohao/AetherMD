# AI-native Engineering Workflow

> 状态：设计草案 + M1 Core Bootstrap。本文是 AetherMD 的顶层工程工作流原则，定义项目使用 Docs、OpenSpec、Superpowers 与 Codex 协作时的执行流程和产物边界。

## 目的

AetherMD 当前处于设计到最小实现过渡阶段，仓库的长期事实来源仍是 `docs/`。引入 OpenSpec、Superpowers 和 Codex 的目的不是替代文档体系，而是让每次变更都能从长期设计约束中抽取可执行规格，再拆成可审查、可回滚的小任务。

本流程服务于四个目标：

- 防止 AI 直接基于大文档自由实现。
- 保持 Docs、Spec、Plan、Task、Code 之间可追踪。
- 让架构边界、SDK 契约和工程策略在实现中持续可审查。
- 在变更完成后保存归档、验证结果和偏差记录。

## 设计理念

本工作流的核心假设是：AI Coding 的主要风险不是写得不够快，而是写得太快、太散、太难追踪。AetherMD 仍以设计约束和 SDK 契约为优先，同时开始用小型实现切片验证这些约束。因此，工作流优先保护长期可维护性，再释放自动化效率。

### 1. Docs 是事实来源，Spec 是执行切片

`docs/` 保存长期事实，OpenSpec 不复制整套文档。每次 OpenSpec change 只抽取当前变更需要遵守的 implementation contract，并引用对应 Docs。

这样可以避免两类腐化：一类是 Docs 和 Spec 互相漂移，另一类是 Codex 在大文档里自行挑选“看起来相关”的片段后自由实现。

### 2. 先约束，再执行

任何影响架构边界、SDK 契约、运行时策略或 MVP 实现的工作，都必须先经过 OpenSpec change，再进入 plan 和 task。

Codex 不直接从需求跳到代码。它只执行已经被拆小、限定文件范围、绑定验收方式的 task。

### 3. 上下文渐进披露

AI 不应该一次性读取整个项目知识库。每一步只加载当前阶段需要的最小上下文：

- Discover 阶段读取相关 Docs。
- Change 阶段读取 source docs 和 OpenSpec artifacts。
- Plan 阶段读取 change artifacts。
- Task 阶段读取单个 task 和显式引用的 Docs。
- Review 阶段读取 diff、spec、task log 和 validation。

这让 Codex 更难 hallucinate，也让人更容易审查它为什么做出某个修改。

### 4. 每一步都有产物

流程中的每一步都必须留下可审查产物。没有产物，就没有可追踪性。

| 阶段 | 防腐作用 |
| --- | --- |
| Docs | 保存长期事实和边界 |
| OpenSpec Change | 记录本次变更意图、范围和验收 |
| Superpowers Plan | 记录实现顺序、风险和验证策略 |
| Superpowers Task | 限定 Codex 的单次执行边界 |
| Validation | 保存测试或文档校验结果 |
| Compliance Review | 检查实现是否偏离 Spec 和架构 |
| Archive | 保存决策、执行、偏差和验证历史 |

### 5. 小步、可审查、可回滚

task 是防腐的最小执行单元。一个 task 应该足够小，能被人工 review；失败时能单独回滚；完成后能清楚说明它满足了哪个 spec requirement。

如果一个 task 需要跨多个架构层、同时改变 public contract 和实现，或没有明确验证方式，就应该继续拆分。

### 6. 偏差显式化

实现与 Spec 不一致并不一定都是错误，但必须被看见。任何偏差都要写入 deviation 记录，并在 compliance review 中判断是更新实现、更新 Spec、更新 Docs，还是新增 ADR。

禁止 silent fallback、隐式绕过、测试弱化和“先这样以后再说”的未记录实现。

### 7. Skill 是流程边界，不是额外官僚层

每一步对应一个 Codex skill，是为了让 Agent 在正确阶段加载正确规则。skill 的职责是减少上下文噪声、固定产物边界和暂停条件，而不是制造新的长期事实来源。

长期事实仍在 Docs；变更事实在 OpenSpec；执行事实在 Superpowers；skill 只是让 Codex 按这些边界行动。

### 8. Git 记录必须符合社区规范

所有 workflow 产物进入 Git 历史时，必须遵守 [Git 工作流规范](docs/community/git-workflow.md)。AetherMD 的 Git 规范基于 GitHub Flow 和 Conventional Commits 1.0.0，并在此基础上补充 OpenSpec、Superpowers、Codex 的追踪字段。

这意味着：

- 分支应从 `main` 创建，并通过 PR 合回 `main`。
- Commit message 必须使用 Conventional Commits 格式。
- OpenSpec change、Superpowers task、validation 和 deviation 应在 commit body 或 PR 描述中保留追踪关系。
- Codex 在提交前必须检查 staged 范围，避免提交无关文件或个人配置。
- PR 会通过 GitHub Actions 使用 commitlint 自动校验 PR 标题和 commit message。
- 分支名由 GitHub Rulesets 或 branch protection 约束。

## 当前事实来源

| 内容 | 权威位置 | 说明 |
| --- | --- | --- |
| 长期架构原则与边界 | `docs/architecture/` | 包括架构宪章、Core API、文档模型、兼容策略和 CI 计划 |
| 插件公开契约 | `docs/sdk/` | Manifest、Capability、Permission、Lifecycle、Command/Event 等 |
| 运行时实现策略 | `docs/engineering/` | 数据流、Adapter、错误模型、安全、并发、测试策略 |
| 架构决策 | `docs/adr/` | 长期取舍和决策历史 |
| 协作规则 | `docs/community/`、`CONTRIBUTING.md`、`AGENTS.md` | 治理、审查、贡献和 Agent 规则 |
| 变更规格 | `openspec/` | 当前只保存每次变更需要的规格增量和归档 |
| 执行记录 | `.superpowers/` | 计划、任务、审查和运行记录；当前为建议目录 |

## 职责边界

### Docs

Docs 是长期事实来源，负责维护产品目标、架构边界、SDK 契约、工程策略、ADR、术语和治理规则。

Docs 不负责保存一次性实现步骤、临时任务状态、Agent 运行日志或未审查的实现偏差。

### OpenSpec

OpenSpec 是变更规格层，负责描述一次变更的目的、影响范围、规格增量、验收标准和归档状态。

OpenSpec 不应复制完整 Docs。OpenSpec change 应引用权威 Docs，并抽取本次实现必须遵守的 implementation contract。

### Superpowers

Superpowers 是执行层，负责把 OpenSpec change 转换成 implementation plan，再拆成小 task，并记录 task 执行、验证结果和 spec compliance review。

Superpowers 不重新定义需求，不替代 OpenSpec spec，也不成为长期事实来源。

### Codex

Codex 是编码与文档修改 Agent，只能在明确 task 范围内执行。Codex 必须从当前 task、当前 OpenSpec change 和 task 显式引用的文档片段中获取上下文。

Codex 不应直接消费整个 `docs/` 后开始实现，也不应跨 task 修改无关文件。

## 目录与产物

建议的最小目录：

```text
openspec/
  specs/
    <capability>/spec.md
  changes/
    <change>/
      proposal.md
      design.md
      specs/
        <capability>/spec.md
      tasks.md
    archive/
      YYYY-MM-DD-<change>/

.superpowers/
  plans/
    <change>.md
  tasks/
    <change>/
      01-<task>.md
      02-<task>.md
  reviews/
    <change>.md
  runs/
    <change>/
      validation.md
      deviations.md
      final-report.md
```

其中 `openspec/` 记录规格生命周期，`.superpowers/` 记录执行生命周期。

## 端到端流程

```text
Existing Docs
  -> OpenSpec Change / Spec
  -> Superpowers Plan
  -> Superpowers Task
  -> Task Execution Loop
  -> Spec Compliance Review
  -> Docs / Spec Update
  -> Archive
```

## Workflow Skills

每一步都有一个项目本地 Codex skill。skills 存放在 `.codex/skills/` 下，用于让 Codex 在对应阶段加载最小必要流程，而不是把整份原则文档反复塞进上下文。

| 步骤 | 使用 skill | 主要产物 |
| --- | --- | --- |
| Step 1 | `aether-workflow-discover-context` | 变更分类、权威 Docs 列表、是否需要 OpenSpec |
| Step 2 | `aether-workflow-create-change` | OpenSpec proposal、design、delta specs、high-level tasks |
| Step 3 | `aether-workflow-create-plan` | `.superpowers/plans/<change>.md` |
| Step 4 | `aether-workflow-create-task` | `.superpowers/tasks/<change>/<NN>-<task>.md` |
| Step 5 | `aether-workflow-implement-task` | 单个 task 的代码或文档修改、task run log |
| Step 6 | `aether-workflow-validate-task` | `.superpowers/runs/<change>/validation.md` |
| Step 6.5 | `aether-workflow-execute-task-loop` | 按顺序执行并验证一个 change 下的所有 task |
| Step 7 | `aether-workflow-review-compliance` | `.superpowers/reviews/<change>.md` |
| Step 8 | `aether-workflow-update-docs-spec` | 更新后的 Docs、OpenSpec main specs、ADR 或 deviation 记录 |
| Step 9 | `aether-workflow-archive-change` | archived change、final report |

使用方式：

1. 人或 Agent 先判断当前处于哪一步。
2. Codex 使用对应 skill 执行该步骤。
3. 每一步只读取该 skill 要求的输入，不跨阶段提前执行后续工作。
4. 当前步骤产物完整后，再进入下一步。

## 底层工具调用规则

Aether workflow skills 是项目约束层，不替代底层 OpenSpec 和 Superpowers 执行层。

- 涉及 OpenSpec change、delta spec、main spec sync 或 archive 的步骤，必须调用已安装的 OpenSpec skill 或 command，例如 `openspec-propose`、`openspec-sync-specs`、`openspec-archive-change` 或对应 `/opsx:*` command。
- 涉及 plan、task、task execution、validation、review、final report 的步骤，必须调用全局安装的 Superpowers command 或 skill。
- `.superpowers/` 和 `openspec/` 下的文件是底层工具选定或生成的 artifact 位置，不是绕过底层工具的理由。
- 如果当前 Codex host 无法调用已安装的 OpenSpec 或 Superpowers 底层能力，必须暂停并报告工具不可见问题。
- 不允许默认退回到手写文件协议；任何手工修补只能发生在底层工具已经建立 artifact 路径和结构之后。

## 版本与代码管理 Hooks

每个 workflow step 都必须显式经过版本管理和代码管理 hooks。hooks 不替代 OpenSpec 或 Superpowers；它们负责在底层工具调用之间保护 Git、版本和公共契约边界。

版本管理 hook 检查：

- 是否影响 package SemVer、`package.json`、lockfile 或 workspace package 边界。
- 是否影响 `SUPPORTED_MANIFEST_VERSIONS`、`manifestVersion`、public exports、SDK 类型或兼容策略。
- 是否需要更新 `docs/architecture/compatibility.md`、`docs/sdk/manifest.md`、`docs/sdk/capabilities-and-permissions.md`、main OpenSpec specs、ADR 或最终报告。
- 是否属于 breaking change，是否需要 Conventional Commits 的 `!` 或 `BREAKING CHANGE:` 说明。

代码管理 hook 检查：

- 每步开始前运行或读取 `git status --short`，识别 unrelated dirty files。
- 每个 task 的 changed files 必须能映射到 task allowed files、OpenSpec requirement 或 docs reference。
- 每步结束前记录 changed-file summary、validation status、deviation 和是否存在未跟踪/未暂存文件。
- staging、commit、push 只能在用户明确要求时执行，并且必须遵守 [Git 工作流规范](docs/community/git-workflow.md)。

必须暂停的情况：

- version impact 无法分类。
- public/versioned contract 变化没有 OpenSpec 或 docs 覆盖。
- changed files 无法映射到当前 task 或当前 workflow step。
- unrelated dirty files 会被混入当前变更。

## Step 1: 从 Docs 确认变更上下文

使用 skill：`aether-workflow-discover-context`

输入：

- 用户需求或维护者提出的问题。
- `docs/architecture/`、`docs/sdk/`、`docs/engineering/`、`docs/adr/` 中的相关页面。
- `docs/glossary.md` 中的术语。

执行：

1. 确认变更属于架构、SDK、工程策略、文档治理还是实现任务。
2. 查找相关权威文档，不跨分区重复定义事实。
3. 识别是否影响公开契约、ADR、测试策略或 CI 门禁。

输出：

- 相关 Docs 链接列表。
- 变更类型判断。
- 是否需要 OpenSpec change 的结论。
- 推荐下一步 skill。

人工确认：

- 影响架构边界、SDK 契约或实现策略的变更，必须由维护者确认进入 OpenSpec。

## Step 2: 创建 OpenSpec Change

使用 skill：`aether-workflow-create-change`

输入：

- Step 1 的 Docs 引用。
- 用户需求。
- 变更范围。

执行：

1. 使用 kebab-case 命名 change，例如 `add-core-bootstrap`、`clarify-adapter-rollback-semantics`。
2. 调用已安装的 OpenSpec skill 或 command 创建或继续该 change。
3. 由 OpenSpec 底层能力创建 `openspec/changes/<change>/proposal.md`。
4. 由 OpenSpec 底层能力创建 `openspec/changes/<change>/design.md`。
5. 由 OpenSpec 底层能力创建 `openspec/changes/<change>/specs/<capability>/spec.md` 作为 delta spec。
6. 由 OpenSpec 底层能力创建 `openspec/changes/<change>/tasks.md` 作为高层任务清单。
7. 运行版本管理 hook，记录 version impact。
8. 运行代码管理 hook，记录 git 状态和预期 commit scope。

输出：

- `proposal.md`：说明 why、what、non-goals、source docs、risk。
- `design.md`：说明实现合同、边界检查、测试策略、开放问题。
- delta spec：记录本次新增、修改或删除的能力要求。
- `tasks.md`：记录可进入计划层的高层任务。
- 推荐下一步 skill。

AI 自动化：

- 可以由 AI 起草。
- AI 必须引用实际 Docs 路径，不能编造不存在的文档或契约。

人工确认：

- proposal、design、delta spec 必须在实现前确认。
- public contract 变化必须由维护者确认。

## Step 3: 生成 Superpowers Plan

使用 skill：`aether-workflow-create-plan`

输入：

- 当前 OpenSpec change 的 proposal、design、delta spec、tasks。
- 相关 Docs 引用。

执行：

1. 调用全局 Superpowers command 或 skill 生成 `.superpowers/plans/<change>.md`。
2. 把变更拆成实现阶段、依赖顺序、验证策略和风险。
3. 标出哪些任务可能影响 public contract、架构边界或 ADR。
4. 运行版本管理 hook，确认 plan 覆盖所有 versioned contract 影响。
5. 运行代码管理 hook，确认 plan 可以按 task 边界审查和提交。

输出：

- implementation plan。
- task 拆分建议。
- validation matrix。
- review focus。
- 推荐下一步 skill。

AI 自动化：

- 可以由 AI 生成。

人工确认：

- 对首次实现某个核心能力、修改 SDK 契约、改变架构边界的 plan，必须人工确认。

## Step 4: 拆分 Superpowers Task

使用 skill：`aether-workflow-create-task`

输入：

- `.superpowers/plans/<change>.md`。
- OpenSpec change artifacts。

执行：

1. 调用全局 Superpowers command 或 skill 为每个小任务创建 `.superpowers/tasks/<change>/<NN>-<task>.md`。
2. 每个 task 只能覆盖一个清晰目标。
3. 每个 task 必须声明 allowed files、forbidden files、spec 绑定和验证方式。
4. 每个 task 必须声明 TDD entry point，或记录为什么无法从失败测试、contract check 或 design assertion 开始。
5. 有助于人工审查时，可以单独声明 intuitive verification，但不能替代自动化或设计阶段验证。
6. 为每个 task 补充 `Version Impact` 和 `Commit Scope`。
7. 运行代码管理 hook，确认每个 task 的 allowed files、forbidden files 和 rollback notes 足够精确。

Task 模板：

```md
# Task <NN>: <title>

Change: <openspec change>
Spec Requirement: <capability / requirement>
Source Docs:
Allowed Files:
Forbidden Files:
Implementation Notes:
TDD Notes:
Validation:
Intuitive Verification:
Review Checklist:
Rollback Notes:
Status:
Run Log:
Deviation:
```

输出：

- 小粒度 task 文件。
- 每个 task 的可审查边界。
- 推荐下一步 skill。

AI 自动化：

- 可以由 AI 拆分。

人工确认：

- 任务范围过大、跨层或不可回滚时，必须重新拆分。

## Step 5: Codex 执行单个 Task

使用 skill：`aether-workflow-implement-task`

输入：

- 一个 Superpowers task。
- 当前 OpenSpec change。
- task 显式引用的 Docs。
- 与 task 直接相关的本地文件。

执行：

1. Codex 通过全局 Superpowers command 或 skill 选择并开始当前 task。
2. Codex 读取当前 task。
3. Codex 读取当前 OpenSpec change artifacts。
4. Codex 只读取 task 引用或实现必需的局部文档。
5. Codex 在 allowed files 内修改。
6. Codex 在实现前识别 TDD entry point。
7. Codex 优先按 red-green-refactor 执行：先创建或确认失败检查，再做最小实现，最后清理结构。
8. Codex 运行 task 声明的 validation。
9. 如果 task 定义了 intuitive verification，Codex 单独运行或记录，不把它当作自动验证替代。
10. Codex 通过全局 Superpowers command 或 skill 更新 task 的 Status、Run Log、Deviation。
11. 运行版本管理 hook，记录本 task 的 versioned contract 影响。
12. 运行代码管理 hook，确认 changed files 全部属于当前 task。

输出：

- 最小范围代码或文档修改。
- task 执行记录。
- 验证结果。
- 偏差记录。
- 推荐下一步 skill。

AI 自动化：

- 可以自动执行。

必须暂停的情况：

- task 不清楚。
- 需要修改 forbidden files。
- 需要改变 public contract 但 spec 未说明。
- 实现发现新的架构取舍。
- 测试失败且无法在 task 范围内解释。
- 找不到有意义的 TDD entry point，且没有记录 deviation。

## Step 6: Test / Validation

使用 skill：`aether-workflow-validate-task`

输入：

- 当前 task 修改。
- task 中声明的 validation。
- `docs/engineering/test-strategy.md` 和 `docs/architecture/ci-checklist.md` 中相关策略。

执行：

1. 确认 task 的 TDD entry point 已被执行，或 deviation 已说明为什么无法执行。
2. 运行可用检查。
3. 如果 task 定义了 intuitive verification，单独运行或记录。
4. 通过全局 Superpowers command 或 skill 将命令、结果、失败和偏差写入 `.superpowers/runs/<change>/validation.md`。
5. 更新 task `Run Log`。
6. 运行版本管理 hook，确认 versioned contract 变化有对应验证。
7. 运行代码管理 hook，确认 changed files 与 task 边界一致。

设计阶段：

- 使用 `rg` 检查术语、RFC 关键词和相关文档一致性。
- 检查链接和文档归属。
- 检查是否需要 ADR。

实现阶段：

- 运行 TypeScript 类型检查。
- 运行 unit tests。
- 运行 contract tests。
- 运行 integration tests。
- 运行文档链接检查。
- 运行包边界检查。

输出：

- `.superpowers/runs/<change>/validation.md`。
- 每个 task 的 validation 结果。
- 推荐下一步 skill。

人工确认：

- 失败结果不能静默忽略。
- 如果接受失败或偏差，必须写入 deviation。
- intuitive verification 不能替代必需的自动化或设计阶段验证。

## Step 6.5: Task Execution Loop

使用 skill：`aether-workflow-execute-task-loop`

输入：

- 一个已完成 task 拆分的 OpenSpec change。
- `.superpowers/tasks/<change>/` 下的 task 文件。
- 当前 OpenSpec change artifacts。
- task 引用的 Docs。

执行：

1. 通过全局 Superpowers command 或 skill 读取 task loop 状态，并按 task 文件名顺序执行。
2. 每次只选择一个 task。
3. 对当前 task 应用 Step 5 的实现规则。
4. 当前 task 实现后立即应用 Step 6 的验证规则。
5. 更新当前 task 的 Status、Run Log、Deviation。
6. 通过全局 Superpowers command 或 skill 将验证命令、结果、失败和偏差追加到 `.superpowers/runs/<change>/validation.md`。
7. 当前 task 通过或偏差已记录后，才进入下一个 task。
8. 所有 task 完成后停止，进入 Step 7 的 spec compliance review。
9. 每个 task 结束后运行版本管理 hook 和代码管理 hook。

输出：

- 已逐个完成的 task 文件。
- 聚合 validation 记录。
- deviation 记录。
- 是否可以进入 spec compliance review 的结论。
- 推荐下一步 skill。

AI 自动化：

- 对于 scope 足够小、plan 和 task 已经人工确认的 change，Codex 可以自动执行整个 task loop。
- task loop 不替代单 task 边界；它只是把 Step 5 和 Step 6 编排为可重复执行的循环。

必须暂停的情况：

- 任一 task 不清楚。
- 任一 task 需要修改 forbidden files。
- 任一 task 需要扩大 OpenSpec scope。
- 任一 task 需要改变 public contract 但 spec 未说明。
- 实现发现新的架构取舍或 ADR 需求。
- 验证失败且无法在当前 task 范围内修复或记录为 deviation。
- 当前 change 的 task 范围过大，导致 Codex 需要跨架构层连续推理。

## Step 7: Spec Compliance Review

使用 skill：`aether-workflow-review-compliance`

输入：

- 当前 diff。
- OpenSpec proposal、design、delta spec、tasks。
- Superpowers task run logs。
- validation 结果。

执行：

1. 通过全局 Superpowers command 或 skill 创建或更新 `.superpowers/reviews/<change>.md`。
2. 检查实现是否满足 acceptance criteria。
3. 检查是否有 unintended changes。
4. 检查是否保持架构边界和依赖方向。
5. 检查 Docs、Spec、ADR 是否需要更新。
6. 运行版本管理 hook，检查 package、Manifest、public API、compatibility 和 main specs。
7. 运行代码管理 hook，检查每个 changed file 到 task 的映射。

输出：

- spec compliance review。
- blocker 列表。
- 可归档或不可归档结论。
- 推荐下一步 skill。

AI 自动化：

- 可以由 AI 初审。

人工确认：

- 最终结论必须由维护者确认，尤其是 public contract 和 ADR 相关变更。

## Step 8: Docs / Spec Update

使用 skill：`aether-workflow-update-docs-spec`

输入：

- 已完成实现。
- spec compliance review。
- deviation 记录。

执行：

1. 如果变更改变长期事实，更新对应 Docs。
2. 如果变更改变能力要求，调用已安装的 OpenSpec sync skill 或 command，将 OpenSpec delta spec 同步到 `openspec/specs/<capability>/spec.md`。
3. 如果出现新的架构取舍，新增或更新 ADR。
4. 如果实现与 spec 存在偏差，记录偏差和后续处理。
5. 运行版本管理 hook，确认 docs/spec 已覆盖 versioned contract 变化。
6. 运行代码管理 hook，确认 docs/spec sync 未混入无关代码变更。

输出：

- 更新后的 Docs。
- 更新后的 OpenSpec main specs。
- 必要的 ADR。
- deviation 记录。
- 推荐下一步 skill。

人工确认：

- Docs 状态、ADR 状态、public contract 更新必须人工确认。

## Step 9: Archive

使用 skill：`aether-workflow-archive-change`

输入：

- 已完成的 OpenSpec change。
- 已完成的 Superpowers tasks。
- validation 记录。
- spec compliance review。
- Docs / Spec / ADR 更新结果。

执行：

1. 检查 OpenSpec artifacts 是否完整。
2. 检查所有 task 是否完成。
3. 检查 validation 是否记录。
4. 检查 deviation 是否处理。
5. 检查 Docs、Spec、ADR 是否同步。
6. 调用已安装的 OpenSpec archive skill 或 command，将 change 移动到 `openspec/changes/archive/YYYY-MM-DD-<change>/`。
7. 通过全局 Superpowers command 或 skill 写入 `.superpowers/runs/<change>/final-report.md`。
8. 运行最终版本管理 hook，记录 version impact。
9. 运行最终代码管理 hook，记录 changed-file summary、task mapping、validation summary 和剩余未暂存/未跟踪文件。

输出：

- archived OpenSpec change。
- final report。
- validation summary。
- deviation summary。

归档失败：

- 不移动 change。
- 生成 blocker 列表。
- 修复 blocker 后重新归档。

## Codex 执行规则

Codex 必须遵守：

- 不允许直接基于完整 `docs/` 编码。
- 只能基于当前 OpenSpec change、当前 Superpowers task 和 task 引用的 Docs 执行。
- 每次只处理一个 task。
- 不允许跨越 task 范围修改无关文件。
- 不允许修改 public contract，除非 spec 明确要求。
- 不允许绕过架构边界。
- 不允许删除或弱化测试。
- 不允许引入未记录的架构决策。
- 不允许 silent fallback。
- 所有行为必须能追溯到 Spec / Task。

## Anticorruption Review Checklist

PR 或归档前应检查：

- [ ] PR 或变更链接到一个 OpenSpec change。
- [ ] 每个修改文件能映射到一个 Superpowers task。
- [ ] 每个 task 能映射到 spec requirement 或 Docs 引用。
- [ ] Core 保持业务盲区。
- [ ] UI Shell 关注点没有泄漏到 Core。
- [ ] ProseMirror、Remark 等第三方 API 被限制在 Adapter 边界内。
- [ ] 状态变化经过 Command Bus。
- [ ] 没有未记录的新抽象。
- [ ] 依赖方向符合 Shell -> Core -> Plugin Contract -> Adapter。
- [ ] Public SDK / Core API / Manifest / Command / Event 变化已被 spec 明确说明。
- [ ] CapabilityId / PermissionId 语义保持一致。
- [ ] 实现满足 acceptance criteria。
- [ ] 偏差已记录并被接受。
- [ ] 没有 silent fallback 或未记录行为。
- [ ] 测试没有被删除、弱化或跳过。
- [ ] Docs、Spec、ADR 已按需更新。
- [ ] OpenSpec change 已准备归档。
- [ ] Superpowers run log 已保存。
- [ ] 没有无关文件修改。

## 何时可以跳过 OpenSpec

以下变更可以不创建 OpenSpec change：

- 拼写、标点、格式修复。
- 明显坏链接修复。
- 不改变语义的文档排版。
- Agent 说明中的小型澄清。

以下变更必须创建 OpenSpec change：

- 新增或改变架构边界。
- 新增或改变 SDK 公开契约。
- 新增或改变 Core API、Manifest、Command/Event、Capability、Permission。
- 开始实现 MVP 包或运行时行为。
- 修改测试策略或 CI 门禁。
- 废弃、替代或反转 ADR。
