# Task 04: Changesets linked 组与 changeset:publish 根脚本

Change:

- `add-validation-suite`

Branch:

- `feat/add-validation-suite`

Spec Requirement:

- `validation-suite` / ADDED `M6 publish preparation metadata is configured without publishing`（Scenario: Changesets linked group covers five packages；Scenario: Publish script exists but M6 does not publish）

OpenSpec Tasks:

- `openspec/changes/add-validation-suite/tasks.md` §2.2、§2.3

Source Docs:

- `.superpowers/plans/add-validation-suite.md`
- `openspec/changes/add-validation-suite/specs/validation-suite/spec.md`
- `docs/adr/009-release-governance.md`
- `docs/community/release-process.md`

## 目标

配置 `.changeset/config.json` 的 `linked` 五包版本组；根 `package.json` 添加 `changeset:publish` 脚本；确认无 `NPM_TOKEN`、无 Release workflow 新增、**不**执行 `changeset publish`。

## 范围

1. `.changeset/config.json` → `linked`: `[["@aether-md/core","@aether-md/plugin-remark","@aether-md/plugin-prosemirror","@aether-md/preset-gfm","@aether-md/react"]]`
2. 根 `package.json` → `"changeset:publish": "changeset publish"`
3. 确认无 `NPM_TOKEN` / Release workflow 新增。

Depends On:

- none（可与 Task 03 同 PR，逻辑独立）

Parallel Group:

- wave-b

Barrier:

- false

Allowed Files:

- `.changeset/config.json`
- `package.json`（根）

Forbidden Files:

- `.github/workflows/**`（Release workflow）
- `.npmrc`（含 token）
- 执行 `changeset publish`
- `npm publish`、`NPM_TOKEN`
- 五包 `src/**`
- `examples/react-basic/**`
- 无关 package 运行时语义变更

Implementation Notes:

- M6 **仅**配置 Changesets；M7 才执行 publish。
- `pnpm changeset:status` 用于验证 linked 配置无错误。

TDD Notes:

- **Red：** 配置前断言 `.changeset/config.json` 的 `linked` 为空或不完整 → 应 FAIL。
- **Green：** 配置五包 linked 组 + 根 `changeset:publish` 后 `pnpm changeset:status` 无配置错误。

Validation:

```bash
pnpm changeset:status
node -e "const c=require('./.changeset/config.json'); const g=c.linked?.[0]||[]; const want=['@aether-md/core','@aether-md/plugin-remark','@aether-md/plugin-prosemirror','@aether-md/preset-gfm','@aether-md/react']; if(want.some(x=>!g.includes(x))) throw new Error('linked group incomplete');"
node -e "const p=require('./package.json'); if(!p.scripts['changeset:publish']) throw new Error('missing changeset:publish');"
```

预期：三项均 **PASS**。

Intuitive Verification:

- 阅读 `.changeset/config.json`：`linked` 数组含五包名。
- 阅读根 `package.json`：`changeset:publish` 存在；无 `NPM_TOKEN` 环境变量引用。

Review Checklist:

- [ ] `linked` 组覆盖五包。
- [ ] 根 `changeset:publish` 脚本存在。
- [ ] 未新增 Release workflow 或 `.npmrc` token。
- [ ] 未执行 `changeset publish`。
- [ ] 五包仍 `private: true`。

Rollback Notes:

- 回滚 `.changeset/config.json` 与根 `package.json` 至变更前。

Version Impact:

- Changesets `linked` 配置；**无** semver bump；**无** npm publish。

Commit Scope:

- `chore(release): configure changesets linked group and publish script`

Status:

- done

Run Log:

- Updated `.changeset/config.json` `linked` to a single group covering all five `@aether-md/*` packages.
- Added root `changeset:publish` script (`changeset publish`).
- Confirmed no `NPM_TOKEN` references and no Release workflow changes (forbidden files untouched).
- Validation: `pnpm changeset:status` FAIL (exit 1) — `changeset status --since main` reports missing changesets for package.json changes from sibling tasks 01–03 on branch; not a linked-config error. `changeset status` (no `--since`) runs cleanly with linked group. Node linked-group assertion PASS; `changeset:publish` script assertion PASS.

Deviation:

- `pnpm changeset:status` fails on current branch because Tasks 01–03 modified five package `package.json` files without changeset entries; resolves when those tasks add changesets or at M7 publish barrier. Linked config itself is valid.
