# Task 08: G12 差距文档与 ci-checklist / release-process 更新

Change:

- `add-validation-suite`

Branch:

- `feat/add-validation-suite`

Spec Requirement:

- `validation-suite` / ADDED `v1.0 roadmap gap is explicitly documented for G12`（Scenario: Project status lists v1.0 gaps；Scenario: CI checklist reflects enabled M6 gates）
- `validation-suite` / ADDED `Release process documents M6 preparation status`（Scenario: Release process shows M6 prep without publish）

OpenSpec Tasks:

- `openspec/changes/add-validation-suite/tasks.md` §2.4、§6.1–§6.4

Source Docs:

- `.superpowers/plans/add-validation-suite.md`
- `openspec/changes/add-validation-suite/specs/validation-suite/spec.md`
- `docs/project-status.md`
- `docs/architecture/roadmap.md`
- `docs/architecture/ci-checklist.md`
- `docs/community/release-process.md`
- `docs/adr/009-release-governance.md`
- `docs/engineering/test-strategy.md`（可选）

## 目标

更新项目文档：M6 验证套件状态、v1.0 差距小节、ci-checklist M6 门禁勾选/注释、release-process M6 预备完成态（linked 五包、元数据、`changeset:publish`；M7 未开始）。

## 范围

1. `docs/project-status.md`：阶段更新为 M6；新增「v1.0 差距」小节（compile-layer schema merge、完整 ConflictResolver、History/Selection/Clipboard、PermissionGuard、Worker Thread、npm publish 等）。
2. `docs/architecture/roadmap.md`：顶部短表或链接至 `project-status.md` 差距节。
3. `docs/architecture/ci-checklist.md`：勾选 G11、G6（examples typecheck）、ConflictResolver 单元、Schema 冲突（附 M6 deferred compile-layer 注释）、manifestVersion 官方包检查。
4. `docs/community/release-process.md`：M6 预备行改 ✅；列出 linked 五包、元数据、`changeset:publish`；M7 仍「未开始」。
5. 可选：`docs/engineering/test-strategy.md` M6 基线（若受影响）。

Depends On:

- 03, 04, 05, 06, 07

Parallel Group:

- wave-d

Barrier:

- false

Allowed Files:

- `docs/project-status.md`
- `docs/architecture/roadmap.md`
- `docs/architecture/ci-checklist.md`
- `docs/community/release-process.md`
- `docs/engineering/test-strategy.md`（可选）

Forbidden Files:

- `openspec/specs/**`（main spec sync 留 archive 后）
- 无关 docs 大改
- `packages/**` 生产代码
- `examples/react-basic/**`
- `npm publish`、`NPM_TOKEN`、`.github/workflows/**` release job
- 无关 package 运行时语义变更

Implementation Notes:

- 说明性正文中文；API 名称、包名、路径 English。
- ci-checklist Schema 冲突行勾选时 **MUST** 注明 compile-layer merge deferred（design Decision 6）。
- 保持 `private: true`；release-process 标明 M7 未开始。

TDD Notes:

- **Design-stage assertion Red：** 打开 `project-status.md` 应**尚无**完整 v1.0 差距小节。
- **Green：** 撰写差距列表并更新 ci-checklist / release-process 后，文档验收清单满足。
- 验证：`rg "v1.0 差距" docs/project-status.md` 有命中；roadmap 有交叉引用。

Validation:

```bash
openspec validate add-validation-suite --strict
rg "v1.0 差距" docs/project-status.md
rg "M7" docs/community/release-process.md
rg "compile-layer" docs/architecture/ci-checklist.md
```

预期：OpenSpec validate **PASS**（docs 不跑 tsc）；rg 命中预期章节。

Intuitive Verification:

- 人工阅读 `docs/project-status.md` v1.0 差距小节：含 compile-layer merge、ConflictResolver、History/Selection/Clipboard、PermissionGuard 等 deferred 项。
- 阅读 `docs/community/release-process.md`：M6 预备 ✅，M7 未开始。

Review Checklist:

- [ ] `project-status.md` 有 v1.0 差距小节 + roadmap 链接。
- [ ] `ci-checklist.md` G11/G6/行为回归已勾选或注释。
- [ ] Schema 冲突项含 compile-layer deferred 注释。
- [ ] `release-process.md` M6 预备完成；M7 未开始；linked 五包已文档化。
- [ ] 说明性正文中文；标识 English。
- [ ] 未 sync `openspec/specs/**`（留 archive）。

Rollback Notes:

- 回滚四个 docs 文件至 Task 08 前状态。

Version Impact:

- none（文档 only）

Commit Scope:

- `docs(status): document M6 validation suite and v1.0 gaps`

Status:

- done

Run Log:

- 2026-07-05: Updated `docs/project-status.md` — M6 stage in 当前阶段 table; added **v1.0 差距** section (compile-layer merge, ConflictResolver integration, History/Selection/Clipboard, PermissionGuard, Worker Thread, Command Bus Pipeline, bootstrapCore, layered Manifest, npm publish); moved `examples/headless-gfm` to 已有内容; refreshed 近期重点 for M7.
- 2026-07-05: Updated `docs/architecture/roadmap.md` — M6 snapshot gap table with cross-ref to `project-status.md#v10-差距`; M6 milestone marked 已实现.
- 2026-07-05: Updated `docs/architecture/ci-checklist.md` — M6 scope footnote (compile-layer deferred); checked G11, G6, manifestVersion scan, ConflictResolver unit, schema abort + deferred note, startup-abort integration.
- 2026-07-05: Updated `docs/community/release-process.md` — M6 预备 ✅; M6 预备完成项 table (linked 五包, metadata, `changeset:publish`); M7 未开始.
- 2026-07-05: Optional `docs/engineering/test-strategy.md` — added M6 验证套件基线 section.
- Validation: `openspec validate add-validation-suite --strict` PASS; `rg "v1.0 差距" docs/project-status.md` hit; `rg "M7" docs/community/release-process.md` hit; `rg "compile-layer" docs/architecture/ci-checklist.md` hit.

Deviation:

- none
