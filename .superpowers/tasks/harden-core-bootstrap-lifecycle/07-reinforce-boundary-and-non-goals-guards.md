# Task 07: 强化 boundary 与 non-goals guard

Change:

- `harden-core-bootstrap-lifecycle`

Branch:

- `fix/harden-core-bootstrap-lifecycle`

Spec Requirement:

- OpenSpec proposal 非目标
- main spec `M1 excludes later milestone behavior`（回归）

Source Docs:

- `.superpowers/plans/harden-core-bootstrap-lifecycle.md`
- `openspec/changes/harden-core-bootstrap-lifecycle/proposal.md`
- `openspec/specs/core-bootstrap/spec.md`

Allowed Files:

- `packages/core/src/package-boundary.test.ts`（仅必要时补 assertion，例如文档化 `PLUGIN_NAME_DUPLICATE` 在 `CoreErrorCode` 类型中——optional）
- `packages/core/src/dependencies.ts`（**仅注释**：duplicate 由 `validateUniquePluginNames` 处理，Map 不负责 uniqueness）

Forbidden Files:

- `packages/core/src/command-event*.ts`
- `packages/plugins/**`
- `docs/**`
- `openspec/**`
- 任何 M2/M3/M4/M5 新功能实现

Implementation Notes:

- 本 task 以 **review + 最小 guard** 为主，不添加业务功能。
- 执行 checklist 并写入 Run Log：

```text
[ ] git diff 不含 packages/core/src/command-event-runtime.ts
[ ] git diff 不含 packages/core/src/command-event-types.ts（除无关 import 外应 zero）
[ ] git diff 不含 packages/plugins/**
[ ] SUPPORTED_MANIFEST_VERSIONS 未改
[ ] 无 createEditor / Shell / GFM / Adapter loading 代码
[ ] dependencies.ts Map 不再作为 duplicate 策略（duplicate 在 bootstrap validation 拦截）
```

- 运行 scope guard：

```bash
rg "react|prosemirror|remark|gfm|createEditor" packages/core/src --glob '!*.test.ts'
```

- 运行 package boundary test：

```bash
pnpm --filter @aether-md/core test -- --run src/package-boundary.test.ts
```

- 可选：在 `dependencies.ts` 加一行 comment 说明 duplicate names rejected before dependency resolution。

TDD Notes:

- Contract check：`package-boundary.test.ts` 为 automated guard。
- `rg` + git diff 为 design-stage scope assertion。

Validation:

```bash
git diff --name-only
rg "react|prosemirror|remark|gfm|createEditor" packages/core/src --glob '!*.test.ts'
pnpm --filter @aether-md/core test -- --run src/package-boundary.test.ts
```

预期：boundary test **PASS**；rg 无新增违规（或仅既有 type 引用）。

Intuitive Verification:

- 人工浏览 `git diff --stat`，确认变更集中在 bootstrap/manifest/lifecycle/errors/tests。

Review Checklist:

- [ ] M2 Command/Event 行为未改。
- [ ] M3 Adapter 包未 touch。
- [ ] 无 manifestVersion 变更。
- [ ] checklist 已写入 Run Log。

Rollback Notes:

- 回滚 optional comment / boundary test assertion。

Version Impact:

- none

Commit Scope:

- `test(core): reinforce bootstrap hardening boundary guards`（若有 test/comment diff）
- 或 `chore(core): record bootstrap hardening scope guard`（若仅 Run Log）

Status:

- completed

Run Log:

- 2026-07-05: `dependencies.ts` 增加 comment：duplicate 由 `validateUniquePluginNames` 处理。
- `git diff --name-only`：仅 core bootstrap/manifest/lifecycle/errors/tests + dependencies comment。
- `rg react|prosemirror|remark|gfm|createEditor`（非 test）：无匹配（exit 1，预期）。
- checklist：未修改 command-event 文件；未 touch plugins/docs。
- `pnpm --filter @aether-md/core test -- --run`：57/57 PASS（含 package-boundary）。

Deviation:

- `test --run src/package-boundary.test.ts` 路径不正确（应跑全 suite 或 dist）；全 suite 已覆盖 boundary tests。
