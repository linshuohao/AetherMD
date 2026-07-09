---
name: project-git-flow
description: Runs standardized Git branch workflow via project-git-flow.sh for commit, sync main, push, auto PR creation, and optional merge. Use when the user asks to commit, push, sync with main, create a PR, merge, or prepare a branch for release.
---

<!-- Generated from .skills/project-git-flow/SKILL.md. Do not edit directly. Run pnpm skills:sync. -->


# Project Git Flow

Automate Git branch workflow through a single script. **Never run ad-hoc `git` commands** — always invoke `scripts/project-git-flow.sh`.

## 触发场景

- 用户要求提交代码、推送分支
- 用户要求同步 `main`、rebase/merge 主分支
- 用户要求发布前整理分支
- 用户要求完成标准 Git 流程（commit → sync → check → push → PR）

## 输入参数

| 参数 | 说明 |
| --- | --- |
| `-m, --message MSG` | Commit message（提交时必填，须符合 Conventional Commits） |
| `--no-stage` | 不自动 stage |
| `--no-commit` | 跳过 commit |
| `--no-sync` | 跳过与 main 同步 |
| `--no-checks` | 跳过检查（将禁止自动 merge） |
| `--no-push` | 跳过 push |
| `--no-pr` | 跳过自动创建 PR |
| `--pr-title TITLE` | PR 标题（默认：最新 commit subject） |
| `--pr-body BODY` | PR 描述（默认：项目模板 + commit 列表） |
| `--allow-direct-merge` | 允许本地 merge 到 main（默认禁止） |
| `--rebase` / `--merge` | 同步策略（默认 rebase） |

环境变量：`ALLOW_DIRECT_MERGE`, `COMMIT_MESSAGE`, `GIT_FLOW_REMOTE`, `GIT_FLOW_MAIN`, `GIT_FLOW_CHECK_CMD`, `GIT_FLOW_SYNC`, `GIT_FLOW_PR_TITLE`, `GIT_FLOW_PR_BODY`

## 默认行为

1. 从仓库规范文件检测配置（优先于硬编码默认值）：
   - `docs/community/git-workflow.md` — 分支命名、PR 流程、检查命令
   - `.changeset/config.json` — `baseBranch`
   - `package.json` — 包管理器与 scripts
   - `.commitlintrc.cjs` — commit message 校验
2. 在当前 feature 分支上执行标准流程
3. 自动 stage + commit（有改动且提供 message 时）
4. fetch → 更新 main → 切回 feature → rebase/merge main
5. 校验 `package.json#packageManager` 与 `.github/workflows/*` 中 `pnpm/action-setup` 版本不冲突（pnpm 项目）
6. 运行项目检查命令
7. push feature 分支
8. 通过 `gh pr create` 自动创建 PR（已存在则返回 URL；无 `gh` 或未登录则 warning + 跳过）
9. **不**自动 merge 到 main

### 本仓库（AetherMD）已识别规范

| 项 | 值 |
| --- | --- |
| 主分支 | `main` |
| 远端 | `origin` |
| 合并策略 | PR + squash merge（禁止本地直 merge） |
| PR 创建 | 推送后自动 `gh pr create`（需 GitHub CLI 已登录） |
| 检查命令 | `pnpm check` |
| 包管理器 | `pnpm` |
| Commit 格式 | Conventional Commits（commitlint 校验） |
| 分支命名 | `<type>/<kebab-topic>` |

## 安全边界

- 禁止在 `main`/`master` 上提交业务改动
- 禁止 `force push`
- 禁止跳过检查直接 merge 到 main
- 禁止自动解决冲突
- 禁止删除用户分支
- 禁止改写历史（除非用户显式允许且脚本外操作）
- `ALLOW_DIRECT_MERGE=true` 时才允许本地 merge 到 main
- 无法识别检查命令时：warning + 继续 push，但禁止自动 merge

## 执行流程

```
preflight
→ detect project config
→ validate current branch
→ stage changes
→ commit
→ fetch origin
→ checkout main
→ pull latest main
→ checkout feature branch
→ rebase or merge main into feature branch
→ run checks
→ push feature branch
→ create or report pull request (gh)
→ optionally merge feature into main
→ final summary
```

**Agent 操作**：收集必要输入（主要是 commit message），然后执行：

```bash
bash .skills/project-git-flow/scripts/project-git-flow.sh -m "<message>"
```

仅 push 已有提交、跳过 commit：

```bash
bash .skills/project-git-flow/scripts/project-git-flow.sh --no-commit --no-stage
```

## 失败处理

脚本任一步骤失败立即退出。Agent **只转发脚本输出**，不添加解释：

```text
Failed at: <step>
Reason: <reason>
Next: <one-line recovery command or action>
```

常见恢复：

| 步骤 | Next |
| --- | --- |
| rebase conflict | `git rebase --abort`，手动解决后重跑 |
| merge conflict | `git merge --abort`，手动解决后重跑 |
| pnpm version mismatch | 统一 `package.json#packageManager` 与 workflow 中 `pnpm/action-setup` 版本，或移除 workflow 的 `version` 固定值 |
| commitlint | 按 `docs/community/git-workflow.md` 修正 message |
| push rejected | 检查远端状态后重跑脚本 |
| checks failed | 修复后重跑脚本 |
| gh pr create failed | 检查 `gh auth status`，或用 `--pr-title` 修正标题 |
| PR title commitlint | 使用 `--pr-title` 提供符合 Conventional Commits 的标题 |

## 输出格式

成功时 **只输出**：

```text
Done.
branch: <branch>
commit: <hash>
pushed: yes/no
merged: yes/no
pr: created/existing/skipped
pr_url: <url>          # 仅 pr 为 created 或 existing 时输出
checks: passed/skipped
```

失败时 **只输出** 脚本的 `Failed at:` 块。禁止长篇解释。

## 禁止行为

- 禁止 Agent 临场拼接 `git` 或 `gh` 命令
- 禁止 force push
- 禁止无检查直接 merge 到 main
- 禁止在冲突时自动解决冲突
- 禁止删除用户分支
- 禁止在未识别项目规范时假装已匹配
- 禁止为满足"单轮完成"而跳过安全检查
- 禁止在 `--no-checks` 时执行 merge

## 脚本调用方式

```bash
# 标准流程（commit + sync + check + push + PR）
bash .skills/project-git-flow/scripts/project-git-flow.sh \
  -m "feat(core): add feature"

# 仅同步、推送并创建 PR（已有 commit）
bash .skills/project-git-flow/scripts/project-git-flow.sh --no-commit --no-stage

# 自定义 PR 标题（多 commit 分支推荐）
bash .skills/project-git-flow/scripts/project-git-flow.sh \
  --no-commit --no-stage \
  --pr-title "feat(workflow): add project-git-flow skill"

# 跳过 PR 创建
bash .skills/project-git-flow/scripts/project-git-flow.sh --no-pr --no-commit --no-stage

# 显式允许本地 merge（极少使用）
ALLOW_DIRECT_MERGE=true bash .skills/project-git-flow/scripts/project-git-flow.sh \
  -m "chore(repo): release prep" --allow-direct-merge
```

检查命令识别顺序（无项目文档覆盖时）：

1. `GIT_FLOW_CHECK_CMD` 环境变量
2. `docs/community/git-workflow.md` 中声明的命令
3. `package.json` scripts：`check` → `lint` → `test` → `build`
4. 包管理器：`packageManager` 字段 → lockfile 检测

无法识别时输出 warning，继续 push，禁止自动 merge。
