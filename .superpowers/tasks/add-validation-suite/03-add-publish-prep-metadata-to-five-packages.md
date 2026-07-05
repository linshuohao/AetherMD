# Task 03: 五包 publish 预备元数据同步

Change:

- `add-validation-suite`

Branch:

- `feat/add-validation-suite`

Spec Requirement:

- `validation-suite` / ADDED `M6 publish preparation metadata is configured without publishing`（Scenario: Five packages declare MIT license metadata）

OpenSpec Tasks:

- `openspec/changes/add-validation-suite/tasks.md` §2.1

Source Docs:

- `.superpowers/plans/add-validation-suite.md`
- `openspec/changes/add-validation-suite/specs/validation-suite/spec.md`
- `docs/adr/009-release-governance.md`
- `docs/community/release-process.md`

## 目标

为五包（`@aether-md/core`、`@aether-md/plugin-remark`、`@aether-md/plugin-prosemirror`、`@aether-md/preset-gfm`、`@aether-md/react`）添加 MIT `license`、`repository`、`files`、`publishConfig` 元数据；保持 `private: true` 与 semver `0.0.0` 不变。

## 范围

五包统一模板（`directory` 各不同）：

```json
"license": "MIT",
"repository": {
  "type": "git",
  "url": "https://github.com/linshuohao/AetherMD.git",
  "directory": "packages/core"
},
"files": ["dist"],
"publishConfig": { "access": "public" }
```

各包 `directory` 分别为：`packages/core`、`packages/plugins/plugin-remark`、`packages/plugins/plugin-prosemirror`、`packages/preset-gfm`、`packages/react`。

Depends On:

- none

Parallel Group:

- wave-b

Barrier:

- false

Allowed Files:

- `packages/core/package.json`
- `packages/plugins/plugin-remark/package.json`
- `packages/plugins/plugin-prosemirror/package.json`
- `packages/preset-gfm/package.json`
- `packages/react/package.json`

Forbidden Files:

- 五包 `src/**`
- 五包 `version` bump
- 去 `private: true`
- runtime deps 变更
- `.github/workflows/**`（Release workflow）
- `npm publish`、`NPM_TOKEN`
- `examples/react-basic/**`
- 无关 package 运行时语义变更

Implementation Notes:

- **不**执行 npm publish。
- **不**去 `private: true`（M7 deferred）。
- Repository URL 统一：`https://github.com/linshuohao/AetherMD.git`。

TDD Notes:

- **Red：** 元数据补全前，review checklist 或 node 断言：五包缺 `license` 时 exit 1。
- **Green：** 补全后断言五包 `license === 'MIT'` 且 `repository`/`files`/`publishConfig` 存在；`private === true`。

Validation:

```bash
node -e "const pkgs=['core','plugins/plugin-remark','plugins/plugin-prosemirror','preset-gfm','react'].map(p=>require('./packages/'+p+'/package.json')); pkgs.forEach(p=>{if(p.license!=='MIT')throw new Error(p.name); if(!p.repository||!p.files||!p.publishConfig)throw new Error(p.name+' metadata'); if(p.private!==true)throw new Error(p.name+' must stay private');});"
```

预期：**PASS**。

Intuitive Verification:

- 人工抽查任一五包 `package.json`：`license`、`repository.directory`、`files`、`publishConfig` 字段完整。

Review Checklist:

- [ ] 五包均有 MIT `license`、`repository`、`files`、`publishConfig`。
- [ ] 五包仍 `private: true`。
- [ ] semver 未 bump。
- [ ] 未改 `src/**` 或 runtime deps。
- [ ] 未配置 `NPM_TOKEN` 或 Release workflow。

Rollback Notes:

- 回滚五包 `package.json` 至元数据添加前状态。

Version Impact:

- package metadata only；**无** public API breaking change；semver **不变**（`0.0.0` private）。

Commit Scope:

- `chore(release): add publish-prep metadata to five packages`

Status:

- done

Run Log:

- Added MIT `license`, monorepo `repository` (with per-package `directory`), `files: ["dist"]`, and `publishConfig.access: "public"` to all five package manifests.
- Kept `private: true` and `version: "0.0.0"` unchanged in each package.
- Validation: node metadata assertion — **PASS**.

Deviation:

- none
