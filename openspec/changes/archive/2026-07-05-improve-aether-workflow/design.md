## Context

AetherMD 的 workflow skills 当前同时存在于 `.codex/skills/` 与 `.cursor/skills/`，并在 skill 文本中声明两者内容应保持一致。这个约定依赖人工记忆，没有本地命令或 CI gate 能发现漂移。

Git 工作流已经要求从 `main` 创建短生命周期分支，并让分支名表达变更类别；但 AI-native workflow 的实际 step 只在 code-management hook 中记录 Git 状态和预期 commit scope。创建 OpenSpec change、plan 和 task 时并没有把 scoped branch 作为入口不变量。

## Goals / Non-Goals

**Goals:**

- 建立 workflow skill 的单一权威源，减少 Codex / Cursor 双目录维护成本。
- 保留 `.codex/skills/` 与 `.cursor/skills/` 作为 host-specific mirrors，避免破坏现有 host skill discovery。
- 新增同步与校验命令，让本地检查和 CI 能发现 skill mirror 漂移。
- 把 scoped branch 准备步骤前移到 OpenSpec change 创建前，并在后续 workflow steps 中持续校验 branch traceability。
- 更新长期 workflow docs、engineering workflow spec 和 Aether workflow skills，使新规则成为可执行约束。

**Non-Goals:**

- 不改变 OpenSpec 或 Superpowers 底层工具协议。
- 不改变 `@aether-md/core` runtime 行为。
- 不引入新的 package release 或 SDK public contract。
- 不强制 agent 自动 stage、commit、push 或创建 PR；这些动作仍需用户明确要求。

## Decisions

### Decision 1: 使用 `.skills/aether-workflow/` 作为权威源

将 AetherMD 自有 workflow skills 维护在 `.skills/aether-workflow/<skill-name>/`。`.codex/skills/<skill-name>/` 与 `.cursor/skills/<skill-name>/` 作为生成 mirror，通过同步脚本从权威源复制。

备选方案是继续把 `.codex/skills/` 作为事实来源，再同步到 `.cursor/skills/`。这个方案对 Codex 友好，但会让 Cursor 看起来像二等目标，也会把 host-specific 路径误认为长期设计源。`.skills/` 更清楚地表达“host-agnostic source”。

### Decision 2: 同步脚本只管理项目 Aether workflow skills

同步和校验命令只覆盖 `aether-workflow-*` 项目 skills 及其 assets、references、agents 等 bundled resources。`openspec-*` project skills 暂时不纳入本 change，因为它们代表外部 OpenSpec helper 层，生命周期不同。

如果未来要统一所有 project-local skills，可以通过后续 change 扩展脚本的 managed list。

### Decision 3: mirror 文件包含 generated notice

由同步脚本写入 `.codex/skills/` 与 `.cursor/skills/` 的托管文件应包含 generated notice，提示维护者不要直接编辑 mirror，而应修改 `.skills/aether-workflow/` 并运行同步命令。

校验脚本应比较权威源渲染后的内容与 mirror 内容，而不是简单目录 diff，从而允许 generated notice 存在。

### Decision 4: 在 Step 1 与 Step 2 之间加入 Prepare Branch

AI-native workflow 增加 Prepare Branch 入口约束：

1. 读取 `git status --short` 和当前 branch。
2. 如果当前 change 会创建 OpenSpec artifacts 或实现任务，确认当前 branch 不是 `main`。
3. 如果仍在 `main` 且工作树可安全切换，根据 change type 和 topic 创建符合 `docs/community/git-workflow.md` 的分支。
4. 如果存在 unrelated dirty files 或无法安全切换，暂停并报告。
5. 将 branch name 写入 OpenSpec proposal/design 或 workflow output 的 traceability section。

这个步骤可以先作为 `aether-workflow-create-change` 的 precondition 实现；如果后续复杂度增加，再拆成独立 `aether-workflow-prepare-branch` skill。

### Decision 5: branch traceability 是校验项，不是提交动作

workflow steps 应校验当前 branch 与 OpenSpec change 的一致性，但不自动 stage、commit、push 或创建 PR。提交和 PR 仍遵守 `docs/community/git-workflow.md` 中“用户明确要求才执行”的规则。

## Risks / Trade-offs

- 权威源迁移会一次性触碰多个 skill mirror 目录 -> 通过脚本生成和 `skills:check` 降低人工 review 成本。
- generated notice 会让 mirror 文件与源文件不再字节级相同 -> 校验脚本必须实现“渲染后比较”，并在 docs 中说明。
- Step 1.5 可能让纯探索对话显得更重 -> 规则仅约束会创建 OpenSpec artifacts、Superpowers artifacts 或实现任务的非 trivial changes；纯 review、brainstorming、typo fix 可跳过。
- 自动创建 branch 可能与用户已有本地工作冲突 -> 当存在 unrelated dirty files、当前 branch 已有不匹配 change、或 branch 名无法确定时暂停，让维护者决定。

## Migration Plan

1. 新增 `.skills/aether-workflow/` 并从现有 `.codex/skills/aether-workflow-*` 初始化权威源。
2. 新增 `scripts/sync-aether-workflow-skills.mjs` 和 `scripts/check-aether-workflow-skills.mjs`。
3. 更新 `package.json` scripts，并将 skill check 接入 `pnpm check` 或 CI。
4. 运行同步脚本，重写 `.codex/skills/aether-workflow-*` 与 `.cursor/skills/aether-workflow-*` mirrors。
5. 更新 workflow docs、main spec、Aether workflow skills 中的 source / mirror / branch 规则。

Rollback 策略：如果脚本或 mirror 迁移出现问题，可以删除 `.skills/` 与新增 scripts，并保留现有 `.codex/skills/` / `.cursor/skills/` 人工镜像模式；OpenSpec change 不归档，直到校验通过。

## Open Questions

- `pnpm check` 是否应默认包含 `skills:check`，还是先只放入 CI / 单独命令，避免每次 package check 都扫描 workflow assets？
- Prepare Branch 最终是否需要拆成独立 skill，还是长期作为 `aether-workflow-create-change` 的 precondition？
