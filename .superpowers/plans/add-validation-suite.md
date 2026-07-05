# add-validation-suite Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use Superpowers task execution (`aether-workflow-create-task` → `aether-workflow-implement-task` / `aether-workflow-execute-task-loop`) to implement this plan task-by-task. Do not redefine OpenSpec requirements in code.

**Goal:** 闭合 M6 验证套件里程碑——交付可运行的 `examples/headless-gfm` headless GFM 集成证明、五包 publish 预备元数据与 Changesets linked 配置、G11/G6/G5 契约 CI 门禁、`createEditor` 启动中止行为回归，以及 G12 v1.0 差距文档；**不**执行 npm publish，**不**引入 public API breaking change。

**Architecture:** M6 以 workspace 扩展为主：新建 `examples/headless-gfm` private package 复用 M4.5 headless wiring 模式（`createEditor` + `createGfmPreset()` + 显式 adapter stubs）；publish 预备仅改五包 `package.json` 与 `.changeset/config.json`；G11 manifest 一致性以 `@aether-md/core` 为 code truth、解析 `docs/sdk/manifest.md` 版本表；G6 主路径为 example package `typecheck` 经 turbo 纳入 `pnpm check`；启动中止集成测试覆盖 `createEditor` fatal 路径（unsupported `manifestVersion`、duplicate `metadata.name`），compile-layer schema merge **不在 scope**。

**Tech Stack:** TypeScript、Node built-in test runner、pnpm workspace、Turborepo、Changesets；无 React/DOM、无 Playwright、无 npm publish。

---

## Change

| 字段 | 值 |
| --- | --- |
| OpenSpec change | `add-validation-suite` |
| Branch | `feat/add-validation-suite`（自 `main`；plan 时工作树仅含 OpenSpec artifacts） |
| OpenSpec status | **complete**（4/4 artifacts：`proposal` / `design` / `specs` / `tasks`）；`openspec validate add-validation-suite --strict` 待 implementation 后确认 |
| Apply readiness | `isComplete: true`；OpenSpec high-level tasks 0/8 sections complete |
| Version impact | **package metadata only** — 五包 `license` / `repository` / `files` / `publishConfig`；Changesets `linked` 五包；`examples/headless-gfm` 新 private workspace package；`pnpm-lock.yaml` **预期变更**（example 依赖）；**无** public API breaking change；`SUPPORTED_MANIFEST_VERSIONS` / `manifestVersion` **不变**（`[1]`）；semver **不变**（`0.0.0` private） |
| Expected commit scope | `chore(examples)`、`chore(release)`、`test(core)`、`docs(status)`、`docs(community)`；OpenSpec 产物 `docs(openspec)` |
| Commit strategy | **每 task 可独立 commit**（Conventional Commits）；PR body 须追踪 OpenSpec change id 与 task id；whole-change squash 留 PR merge 时决定 |

范围边界：

- **包含：** `examples/headless-gfm`、五包 publish 预备元数据、Changesets linked + `changeset:publish` 脚本、G11 manifest 一致性校验、G6 examples `tsc --noEmit` CI 门禁、G5 既有测试保持绿、`createEditor` 启动中止集成回归、G12 差距文档、`ci-checklist` / `release-process` 更新。
- **排除：** npm publish、`NPM_TOKEN`、Release workflow、去 `private: true`、`examples/react-basic`、Playwright、Vue Shell、compile-layer Schema 合并、`EditorConfig.conflictResolver` 新 API、`tsd` 快照、`CORE_SERVICE_REGISTRY` 自动比对。
- **文档语言：** 说明性正文中文；API 名称、包名、路径与 OpenSpec 结构关键词 English。

## Source Artifacts

OpenSpec artifacts：

- `openspec/changes/add-validation-suite/proposal.md`
- `openspec/changes/add-validation-suite/design.md`
- `openspec/changes/add-validation-suite/specs/validation-suite/spec.md`
- `openspec/changes/add-validation-suite/specs/engineering-workflow/spec.md`
- `openspec/changes/add-validation-suite/tasks.md`

长期 source docs / ADRs：

- `docs/adr/009-release-governance.md`
- `docs/engineering/mvp-implementation-plan.md`（M6 行）
- `docs/engineering/test-strategy.md`
- `docs/architecture/ci-checklist.md`
- `docs/community/release-process.md`
- `docs/project-status.md`
- `docs/architecture/roadmap.md`
- `docs/sdk/manifest.md`（G11）
- `docs/sdk/examples.md`（G6 次路径参考）
- `docs/sdk/conflict-resolution.md`（Schema 冲突默认 abort）

## Code-Management

创建 plan 时 `git status --short`：

```
?? openspec/changes/add-validation-suite/
```

当前分支：`feat/add-validation-suite`

- **允许修改区：** `examples/headless-gfm/**`、五包 `package.json`、`.changeset/config.json`、根 `package.json` / `pnpm-workspace.yaml` / `turbo.json`、`packages/core/src/**/*.test.ts`（manifest 一致性、启动中止集成）、`docs/project-status.md`、`docs/architecture/roadmap.md`、`docs/architecture/ci-checklist.md`、`docs/community/release-process.md`、可选 `docs/engineering/test-strategy.md`、`pnpm-lock.yaml`。
- **禁止纳入本 change：** 无关 dirty 文件、Core/React **生产** runtime 语义变更（除非测试暴露 bug 并记录 deviation）、`AGENTS.md` / workflow skill mirrors（除非单独 workflow PR）、M7 publish 配置。
- **禁止新建：** `examples/react-basic`、`packages/vue`、compile-layer merge 实现、独立 `@aether-md/sdk` npm 包。

## File Map

| 路径 | 职责 |
| --- | --- |
| `examples/headless-gfm/package.json` | `@aether-md/example-headless-gfm`，`private: true`；`start` / `typecheck` / `build` scripts |
| `examples/headless-gfm/tsconfig.json` | example 编译与 `tsc --noEmit` 配置 |
| `examples/headless-gfm/src/run.ts` | Node 可运行 main：`createEditor` + `createGfmPreset()` + adapter wiring；stdout 输出 round-trip 或成功日志 |
| `pnpm-workspace.yaml` | 新增 `examples/*` glob |
| `packages/core/package.json` | 五包之一；添加 MIT `license`、`repository`、`files`、`publishConfig` |
| `packages/plugins/plugin-remark/package.json` | 同上 |
| `packages/plugins/plugin-prosemirror/package.json` | 同上 |
| `packages/preset-gfm/package.json` | 同上 |
| `packages/react/package.json` | 同上 |
| `.changeset/config.json` | `linked` 五包版本组 |
| `package.json`（根） | `changeset:publish` 脚本；可选 manifest 校验入口 |
| `packages/core/src/manifest-doc-consistency.test.ts`（推荐名） | G11：`SUPPORTED_MANIFEST_VERSIONS` ↔ `docs/sdk/manifest.md`；官方包 `manifestVersion` 校验 |
| `packages/core/src/editor/startup-abort.integration.test.ts`（推荐名） | `createEditor` fatal startup：unsupported version、duplicate name |
| `packages/core/src/editor/conflict-resolver.test.ts` | 已有 schema abort 单元测试 — **确认覆盖，不删** |
| `packages/core/src/editor/create-editor-gfm.integration.test.ts` | 已有 headless GFM 集成 — example **不重复** CI 断言职责 |
| `docs/project-status.md` | G12 主落点：M6 状态 + v1.0 差距小节 |
| `docs/architecture/roadmap.md` | 差距短表或链接至 `project-status.md` |
| `docs/architecture/ci-checklist.md` | 勾选 G11/G6/行为回归已启用项 + M6 scope 注释 |
| `docs/community/release-process.md` | M6 预备完成态、linked 五包、明确 M7 未开始 |

**Repository URL（五包统一）：** `https://github.com/linshuohao/AetherMD.git`，各包 `directory` 分别为 `packages/core`、`packages/plugins/plugin-remark`、`packages/plugins/plugin-prosemirror`、`packages/preset-gfm`、`packages/react`。

## Implementation Phases

每个 Phase 遵循 **TDD / contract-first**（测试或 smoke 脚本先红后绿）；publish 预备元数据（Phase 2）可与 example scaffold（Phase 1）并行。

### Phase 1: Headless GFM example（Task 01–02, wave-a）

**映射 requirements：**

- `Headless GFM example package demonstrates integration path`
- `Examples package passes TypeScript noEmit check in CI`（scaffold 阶段先 local typecheck）

**产出：** `examples/headless-gfm` workspace private package；Node `start` 可运行；smoke 验证 headless GFM round-trip 或成功输出。

### Phase 2: Publish 预备（Task 03–04, wave-b）

**映射 requirements：**

- `M6 publish preparation metadata is configured without publishing`
- `Release process documents M6 preparation status`（Task 08 文档化）

**产出：** 五包 MIT + publish 元数据；Changesets `linked` 五包；根 `changeset:publish` 脚本；`private: true` 保持。

### Phase 3: 契约与 CI 门禁（Task 05–07, wave-c）

**映射 requirements：**

- `Supported manifest versions stay consistent with SDK documentation`
- `Examples package passes TypeScript noEmit check in CI`
- `M6 validation gates participate in root check pipeline`（engineering-workflow delta）
- `Editor startup abort paths are covered by integration regression tests`
- `Existing M1 through M5 tests remain green`（G5）

**产出：** G11 manifest 一致性测试；example typecheck 纳入 turbo `check`；`createEditor` 启动中止集成测试；`conflict-resolver.test.ts` schema abort 保持绿。

### Phase 4: 文档与 G12（Task 08, wave-d）

**映射 requirements：**

- `v1.0 roadmap gap is explicitly documented for G12`
- `CI checklist reflects enabled M6 gates`
- `Release process documents M6 preparation status`

**产出：** `project-status.md` v1.0 差距；`roadmap.md` 交叉引用；`ci-checklist.md` 勾选/注释；`release-process.md` M6 预备段落。

### Phase 5: 全量验证 Barrier（Task 09）

**映射 requirements：** 全部 validation-suite + engineering-workflow delta scenarios。

**产出：** `pnpm check` 全绿；`openspec validate add-validation-suite --strict` 通过；archive 前 sync 清单就绪。

## Dependency Order

```
wave-a:  Task 01 ──► Task 02
wave-b:  Task 03 ∥ Task 04          （可与 wave-a 并行）
wave-c:  Task 05 ∥ Task 06 ∥ Task 07
           ▲         │ requires 01–02
wave-d:  Task 08 ◄── 03–07 完成态已知
Barrier: Task 09 ◄── 01–08 全部完成
```

跨阶段约束：

- Example **MUST NOT** 依赖 React/DOM；**MUST NOT** 发布 npm。
- Core **MUST NOT** 新增 compile-layer schema merge 或 `EditorConfig.conflictResolver` 公开 API。
- G11 code truth = `packages/core/src/manifest.ts` 的 `SUPPORTED_MANIFEST_VERSIONS`；文档为校验对象，非第二份手写常量。
- ci-checklist Schema 冲突行勾选时 **MUST** 注明 compile-layer merge deferred（design Decision 6）。
- 若 OpenSpec 与 Docs/ADR 冲突，暂停并更新 OpenSpec change，禁止 silent 偏离。

## Boundary Risks

| 风险 | 触发点 | 处理方式 |
| --- | --- | --- |
| Example 与 `create-editor-gfm.integration.test.ts` 职责重叠 | 复制测试逻辑到 example | Example 侧重可运行叙事 + 文档引用；包内测试侧重断言与 CI 回归 |
| G6 双路径重复 CI | 同时 typecheck `docs/sdk/examples.md` 与 example | 主路径 = `examples/headless-gfm`；次路径仅当 headless example 不足 G6 |
| G11 解析 markdown 脆弱 | 手写双份版本列表 | 从 `manifest.ts` 导出为 truth；测试解析 `docs/sdk/manifest.md` 版本表 |
| Schema 冲突 checklist 与 compile-layer 差距 | 期望完整 schema merge 集成 | Decision 6：单元 schema abort + `createEditor` fatal startup；validation 记录注明 deferred |
| Changesets linked 配置错误 | M7 版本 bump 不同步 | Task 04 运行 `pnpm changeset:status`；`release-process.md` 文档化 |
| 元数据变更被误认为 publish ready | 维护者误解 M6 完成度 | 保持 `private: true`；release-process 标明 M7 未开始 |
| 误改 Core/React 生产语义 | 为凑 coverage 改 runtime | 仅测试/元数据/docs；bug 须 deviation 记录 |
| turbo check 未纳入新门禁 | 仅 local 脚本未挂 pipeline | Task 06 显式改 `turbo.json` / package `check` 脚本 |

## Validation Matrix

| Phase | OpenSpec Requirement | Validation 入口 | Intuitive Verification | Notes |
| --- | --- | --- | --- | --- |
| 1 | Headless GFM example package demonstrates integration path | `pnpm --filter @aether-md/example-headless-gfm start` | stdout 成功；无 React/DOM | 需先 `pnpm build` |
| 1 | Headless example is private and not published | review `examples/headless-gfm/package.json` | `private: true` | 排除 publish 矩阵 |
| 2 | Five packages declare MIT license metadata | review 五包 `package.json` | `license`/`repository`/`files`/`publishConfig` | semver 不变 |
| 2 | Changesets linked group covers five packages | review `.changeset/config.json` | linked 含五包 | 不执行 publish |
| 2 | Publish script exists but M6 does not publish | review 根 `package.json` | `changeset:publish` 存在；无 `NPM_TOKEN` | M7 deferred |
| 3 | Manifest version constant matches SDK docs | `pnpm --filter @aether-md/core test` | G11 test PASS | 故意 drift 应 FAIL |
| 3 | Official packages use supported manifest versions | 同上 | 五官方包 manifestVersion ∈ `[1]` | |
| 3 | Headless example typechecks in check pipeline | `pnpm check` | turbo 执行 example typecheck | G6 主路径 |
| 3 | Existing M1 through M5 tests remain green | `pnpm check` | 全 workspace 绿 | G5 |
| 3 | Unsupported manifest version aborts createEditor | `pnpm --filter @aether-md/core test` | startup-abort integration | 已有 orchestration test 可合并 |
| 3 | Duplicate plugin name aborts createEditor | 同上 | `PLUGIN_NAME_DUPLICATE` | bootstrap 已有；createEditor 路径补充 |
| 3 | Default resolver aborts schema conflicts at unit level | `pnpm --filter @aether-md/core test` | `conflict-resolver.test.ts` | 已有，保持绿 |
| 3 | M6 validation gates participate in root check pipeline | `pnpm check` | manifest/examples 失败导致 check 红 | engineering-workflow delta |
| 4 | Project status lists v1.0 gaps | review `docs/project-status.md` | 差距小节 + roadmap 链接 | G12 主落点 |
| 4 | CI checklist reflects enabled M6 gates | review `docs/architecture/ci-checklist.md` | G11/G6/行为项勾选或注释 | compile-layer 注释 |
| 4 | Release process shows M6 prep without publish | review `docs/community/release-process.md` | M6 预备完成；M7 未开始 | |
| 5 | 全量 gate | `pnpm check && openspec validate add-validation-suite --strict` | 全绿 | Task 09 Barrier |

**汇总命令映射：**

| 命令 | 覆盖 |
| --- | --- |
| `pnpm --filter @aether-md/example-headless-gfm typecheck` | Task 01–02 local；Task 06 CI |
| `pnpm --filter @aether-md/example-headless-gfm start` | Task 02 smoke |
| `pnpm --filter @aether-md/core test` | Task 05 G11；Task 07 startup abort |
| `pnpm changeset:status` | Task 04 linked 验证 |
| `pnpm check` | Task 06–09 全 workspace gate |
| `openspec validate add-validation-suite --strict` | Task 09 OpenSpec gate |

## Task Breakdown

| ID | 任务 | Parallel Group | Barrier | Depends On | Allowed Files | Forbidden Files | TDD Entry Point | Validation Command |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| **01** | `examples/headless-gfm` 脚手架（package.json、workspace、tsconfig） | wave-a | false | — | `examples/headless-gfm/package.json`、`examples/headless-gfm/tsconfig.json`、`pnpm-workspace.yaml`、`pnpm-lock.yaml` | `packages/core/src/**`（生产）、`packages/react/**`、`.github/**`、OpenSpec artifacts（已存在） | 先添加 failing workspace 探测：根脚本或临时 test 断言 `examples/headless-gfm/package.json` 存在且 `private: true`；`pnpm install` 后 `pnpm --filter @aether-md/example-headless-gfm typecheck` 预期 FAIL（无 `src/`） | `pnpm install && pnpm --filter @aether-md/example-headless-gfm typecheck`（预期 FAIL → scaffold 后至少能解析 tsconfig） |
| **02** | headless-gfm 可运行脚本 + smoke/集成验证 | wave-a | false | 01 | `examples/headless-gfm/src/run.ts`、`examples/headless-gfm/package.json`（scripts：`build`/`start`/`typecheck`/`check`）、`examples/headless-gfm/tsconfig.json` | `packages/core/src/**`（生产）、React/DOM 依赖、`examples/react-basic/**` | 参照 `packages/core/src/editor/create-editor-gfm.integration.test.ts` wiring 模式，先写 `examples/headless-gfm` smoke script（内置 fixture `**bold**\n` 或 CLI arg）；运行 `pnpm build && pnpm --filter @aether-md/example-headless-gfm start` 预期 FAIL（无实现）→ 实现 `run.ts` → PASS | `pnpm build && pnpm --filter @aether-md/example-headless-gfm start && pnpm --filter @aether-md/example-headless-gfm typecheck` |
| **03** | 五包 license/repository/files/publishConfig 元数据同步 | wave-b | false | — | `packages/core/package.json`、`packages/plugins/plugin-remark/package.json`、`packages/plugins/plugin-prosemirror/package.json`、`packages/preset-gfm/package.json`、`packages/react/package.json` | 五包 `src/**`、`version` bump、去 `private: true`、runtime deps 变更 | 先写 review checklist 或 optional `scripts/check-package-metadata.mjs` failing test：断言五包缺 `license` 时 exit 1；补元数据后 exit 0 | `node -e "const pkgs=['core','plugins/plugin-remark','plugins/plugin-prosemirror','preset-gfm','react'].map(p=>require('./packages/'+p+'/package.json')); pkgs.forEach(p=>{if(p.license!=='MIT')throw new Error(p.name); if(!p.repository||!p.files||!p.publishConfig)throw new Error(p.name+' metadata'); if(p.private!==true)throw new Error(p.name+' must stay private');});"` |
| **04** | Changesets linked/fixed + changeset:publish 根脚本 | wave-b | false | —（可与 03 同 PR，逻辑独立） | `.changeset/config.json`、根 `package.json` | `.github/workflows/**`（Release workflow）、`.npmrc` with token、执行 `changeset publish` | 先断言 `.changeset/config.json` 的 `linked` 为空数组 → 配置五包 linked 组 + 根 `"changeset:publish": "changeset publish"` → `pnpm changeset:status` 无配置错误 | `pnpm changeset:status && node -e "const c=require('./.changeset/config.json'); const g=c.linked?.[0]||[]; const want=['@aether-md/core','@aether-md/plugin-remark','@aether-md/plugin-prosemirror','@aether-md/preset-gfm','@aether-md/react']; if(want.some(x=>!g.includes(x))) throw new Error('linked group incomplete');"` |
| **05** | `SUPPORTED_MANIFEST_VERSIONS` 一致性校验（脚本或测试） | wave-c | false | — | `packages/core/src/manifest-doc-consistency.test.ts`（或等价名）、可选 `packages/core/tsconfig.test.json`、`packages/core/package.json`（test script 若需） | `packages/core/src/manifest.ts`（除非 docs/code 真 drift）、`docs/sdk/manifest.md`（除非对齐修复） | 先写 failing test：解析 `docs/sdk/manifest.md` Stable 行与 `SUPPORTED_MANIFEST_VERSIONS` 比较；再扫描官方包 Manifest `manifestVersion`；故意改 docs 表格应 FAIL | `pnpm --filter @aether-md/core test -- --test-name-pattern="manifest"`（或运行完整 core test suite） |
| **06** | SDK examples 或 examples `tsc --noEmit` CI 门禁 | wave-c | false | 01, 02 | `examples/headless-gfm/package.json`（`typecheck`/`check`）、`turbo.json`、根 `package.json`（若需）、`pnpm-workspace.yaml`（若 Task 01 未合） | `docs/sdk/examples.md` 大改（非必须）、`packages/core/src/**` 生产代码 | 先确认 `pnpm check` **不**执行 example typecheck（基线）→ 为 example 添加 `check`/`typecheck` 并让 turbo `check` dependsOn 包含 example → 引入故意 TS 错误应 FAIL | `pnpm check`（或 `turbo run check --filter=@aether-md/example-headless-gfm` 作局部预检） |
| **07** | Schema 冲突 → CoreError 启动中止集成测试 | wave-c | false | — | `packages/core/src/editor/startup-abort.integration.test.ts`（或整合进 `editor-orchestration.test.ts`）、确认 `packages/core/src/editor/conflict-resolver.test.ts` 不变 | `packages/core/src/editor/conflict-resolver.ts`（生产语义）、compile-layer merge 新模块、`EditorConfig` 新公开字段 | **单元（已有）：** `conflict-resolver.test.ts` schema → `abort` 保持绿。**集成（新增）：** 先写 failing test — `createEditor` + duplicate `metadata.name` 两 plugin → `CoreError` / `PLUGIN_NAME_DUPLICATE`；unsupported `manifestVersion` 可合并至新文件（`editor-orchestration.test.ts` 已有 1 case，补 duplicate name via `createEditor` 若缺失） | `pnpm --filter @aether-md/core test -- --test-name-pattern="startup-abort|createEditor orchestration|createDefaultConflictResolver"` |
| **08** | G12 差距文档 + ci-checklist/release-process 更新 | wave-d | false | 03, 04, 05, 06, 07 | `docs/project-status.md`、`docs/architecture/roadmap.md`、`docs/architecture/ci-checklist.md`、`docs/community/release-process.md`、可选 `docs/engineering/test-strategy.md` | `openspec/specs/**`（main spec sync 留 archive 后）、无关 docs 大改 | 文档验收清单：打开 `project-status.md` 应**尚无**完整 v1.0 差距小节 → 撰写差距列表（compile-layer merge、ConflictResolver 全套、History/Selection/Clipboard、PermissionGuard 等）→ 更新 ci-checklist 勾选 G11/G6/行为回归并加 M6 scope 脚注 | `openspec validate add-validation-suite --strict`（docs 不跑 tsc；人工 review + link check 可选 `rg "v1.0 差距" docs/project-status.md`） |
| **09** | 全量验证 `pnpm check` + openspec validate（Barrier） | — | **true** | 01–08 | 全 change 允许区（只读验证为主） | 本 task **不**新增功能代码 | 基线：任一前置 task 未完成则 `pnpm check` 或 validate 应 FAIL → 全部完成后应 PASS | `pnpm check && openspec validate add-validation-suite --strict` |

### Task 01 详细步骤（脚手架）

1. 在 `pnpm-workspace.yaml` 添加 `examples/*`。
2. 创建 `examples/headless-gfm/package.json`：
   - `name`: `@aether-md/example-headless-gfm`
   - `private`: `true`
   - `type`: `module`
   - `scripts`: `build`（`tsc`）、`typecheck`（`tsc --noEmit`）、占位 `start`
   - `dependencies`: `@aether-md/core`、`@aether-md/preset-gfm`、`@aether-md/plugin-remark`、`@aether-md/plugin-prosemirror`（`workspace:*`）
3. 创建 `examples/headless-gfm/tsconfig.json`（`extends` 模式参照 `packages/preset-gfm`；`outDir`: `dist`；`include`: `src/**/*`）。
4. 运行 `pnpm install` 更新 lockfile。
5. **Commit:** `chore(examples): scaffold headless-gfm workspace package`

### Task 02 详细步骤（可运行脚本）

1. 创建 `examples/headless-gfm/src/run.ts`：
   - 复用 `create-editor-gfm.integration.test.ts` 的 plugin stub 模式（bootstrap stub、remark/prosemirror name stubs、`createGfmPreset()` + `toExtensionPluginFromPreset`）。
   - `createEditor({ plugins, initialValue })` → `dispatch` replaceText 或 `getMarkdown()` → stdout 打印结果。
   - `main()` 用 fixture Markdown（如 `**bold**\n`）；进程 exit 0。
2. 更新 `package.json` scripts：`build`: `tsc -p tsconfig.json`；`start`: `node dist/run.js`（先 `pnpm build`）。
3. Smoke：`pnpm build && pnpm --filter @aether-md/example-headless-gfm start`。
4. **Commit:** `chore(examples): add headless-gfm runnable demo script`

### Task 03 详细步骤（五包元数据）

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

**Commit:** `chore(release): add publish-prep metadata to five packages`

### Task 04 详细步骤（Changesets）

1. `.changeset/config.json` → `linked`: `[["@aether-md/core","@aether-md/plugin-remark","@aether-md/plugin-prosemirror","@aether-md/preset-gfm","@aether-md/react"]]`
2. 根 `package.json` → `"changeset:publish": "changeset publish"`
3. 确认无 `NPM_TOKEN` / Release workflow 新增。
4. **Commit:** `chore(release): configure changesets linked group and publish script`

### Task 05 详细步骤（G11 manifest 一致性）

推荐实现 `packages/core/src/manifest-doc-consistency.test.ts`：

```typescript
// 伪代码结构 — implementation 定稿时补全
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { SUPPORTED_MANIFEST_VERSIONS } from "./manifest.js";

describe("manifest documentation consistency", () => {
  it("matches Stable versions in docs/sdk/manifest.md", () => {
    const md = readFileSync(new URL("../../../../docs/sdk/manifest.md", import.meta.url), "utf8");
    // 解析 | `1` | **Stable** | 行 → [1]
    const docVersions = parseStableManifestVersions(md);
    assert.deepEqual([...SUPPORTED_MANIFEST_VERSIONS], docVersions);
  });

  it("official packages use supported manifestVersion", () => {
    // 读取 packages/plugins/*, preset-gfm, react manifest 或 package 内 manifest.ts
    for (const version of collectOfficialManifestVersions()) {
      assert.ok(SUPPORTED_MANIFEST_VERSIONS.includes(version));
    }
  });
});
```

挂入现有 `packages/core` test pipeline（`tsconfig.test.json` include 已覆盖 `src/**/*.ts`）。

**Commit:** `test(core): enforce manifest version doc consistency`

### Task 06 详细步骤（G6 CI 门禁）

1. `examples/headless-gfm/package.json` 添加 `"check": "pnpm typecheck"`（或与其它 package 一致的 `check` = typecheck + 可选 smoke）。
2. 确认 turbo：`check` task `dependsOn: ["typecheck", "test"]` — example 无 test 时可仅 `typecheck` 或空 test；**必须**让根 `pnpm check` → `turbo run check` 遍历到 example。
3. 若 turbo 未自动发现 example，在 example `package.json` 显式定义 `check` script。
4. 验证：example typecheck 失败时 `pnpm check` 红。
5. **Commit:** `chore(examples): wire headless-gfm typecheck into check pipeline`

### Task 07 详细步骤（启动中止集成）

**已有覆盖（保持，不删）：**

- `conflict-resolver.test.ts`：`type: "schema"` → `strategy: "abort"`
- `editor-orchestration.test.ts`：`createEditor` + `manifestVersion: 99` → `MANIFEST_VERSION_UNSUPPORTED`
- `bootstrap.test.ts`：`bootstrapCore` duplicate name → `PLUGIN_NAME_DUPLICATE`

**新增/整合（M6 交付物）：**

`packages/core/src/editor/startup-abort.integration.test.ts`：

```typescript
describe("createEditor startup abort", () => {
  it("rejects duplicate metadata.name with CoreError", async () => {
    const pluginA = { manifest: { metadata: { manifestVersion: 1, name: "dup" } } };
    const pluginB = { manifest: { metadata: { manifestVersion: 1, name: "dup" } } };
    await assert.rejects(
      () => createEditor({ plugins: [pluginA, pluginB] }),
      (e: unknown) => e instanceof CoreError && e.code === "PLUGIN_NAME_DUPLICATE",
    );
  });
});
```

若 `editor-orchestration.test.ts` 已含等价 case，合并至单一 `startup-abort.integration.test.ts` 并在 plan validation 记录注明，**不得** silent 删除要求。

**Commit:** `test(core): add createEditor startup abort integration tests`

### Task 08 详细步骤（G12 文档）

1. `docs/project-status.md`：阶段更新为 M6 进行中/完成项；新增「v1.0 差距」小节（compile-layer schema merge、完整 ConflictResolver、History/Selection/Clipboard、PermissionGuard、Worker Thread、npm publish 等）。
2. `docs/architecture/roadmap.md`：顶部短表或链接至 project-status 差距节。
3. `docs/architecture/ci-checklist.md`：勾选 G11、G6（examples typecheck）、ConflictResolver 单元、Schema 冲突（附 M6 deferred compile-layer 注释）、manifestVersion 官方包检查。
4. `docs/community/release-process.md`：M6 预备行改 ✅；列出 linked 五包、元数据、`changeset:publish`；M7 仍「未开始」。
5. **Commit:** `docs(status): document M6 validation suite and v1.0 gaps`

### Task 09 详细步骤（Barrier）

1. 运行 `pnpm check` — 预期全绿（skills:check + workflow:pr-check + turbo check 含 example + core tests）。
2. 运行 `openspec validate add-validation-suite --strict`。
3. 确认 non-goals：无 publish、无 Core 生产语义变更、无 compile-layer merge。
4. 记录 validation evidence 路径供 `aether-workflow-validate-task` / archive 使用：`.superpowers/runs/add-validation-suite/validation.md`（implementation 阶段创建）。
5. **Commit（可选）：** 仅 validation record 时 `docs(superpowers): add M6 validation evidence`

## Review Focus

- 每个改动文件映射到 Task 01–09。
- 每个 Task 映射到 OpenSpec `validation-suite` / `engineering-workflow` requirement 或 `tasks.md` 条目。
- **无** public API breaking change；五包 semver 保持 `0.0.0` private。
- `SUPPORTED_MANIFEST_VERSIONS` / `manifestVersion` 仍为 `[1]`。
- Example **不**依赖 React；**不**发布 npm。
- G11 失败必须使 `pnpm check` 失败。
- ci-checklist Schema 冲突项勾选时含 compile-layer deferred 注释。
- `create-editor-gfm.integration.test.ts` 与 example 职责分离清晰。
- 无关 dirty 文件未纳入 commit。
- 说明性正文中文；代码标识 English。

## Open Questions

| 问题 | Plan 阶段处理 | 阻塞？ |
| --- | --- | --- |
| Example 运行方式 `tsc`+`node` vs `tsx` | Task 02 遵循仓库惯例（preset/core 均为 `tsc` + `node`） | 否 |
| G11 解析 manifest.md 策略 | Task 05 解析 Stable 表格行；避免维护第二份常量文件 | 否 |
| Task 07 新文件 vs 合并 orchestration test | 优先独立 `startup-abort.integration.test.ts`；合并须 validation 记录 | 否 |
| Example 是否纳入 turbo `build` dependsOn | Task 06 确保 check 前 example 可 typecheck；start smoke 需 workspace build | 否 |
| `docs/engineering/test-strategy.md` 是否更新 | Task 08 可选，若 M6 基线措辞受影响则更新 | 否 |

实现中若需偏离 OpenSpec design 决定，**MUST** 先更新 OpenSpec change，再改代码。

## Version Impact / Branch / Commit 策略

**Version impact（来自 proposal）：**

- 五包 linked 组：**无** public API 变更；M6 仅元数据与 Changesets `linked`；semver **不变**（`0.0.0` private）。
- `examples/headless-gfm`：新 workspace private package；**不**发布 npm。
- `manifestVersion` / `SUPPORTED_MANIFEST_VERSIONS`：**不变**（`[1]`）。
- `pnpm-lock.yaml`：预期变更（example workspace 依赖）。

**Branch：**

- 当前：`feat/add-validation-suite`
- 自 `main` 创建；implementation 全程保持单 change scope。

**Commit 策略：**

| Task | 推荐 commit message |
| --- | --- |
| 01 | `chore(examples): scaffold headless-gfm workspace package` |
| 02 | `chore(examples): add headless-gfm runnable demo script` |
| 03 | `chore(release): add publish-prep metadata to five packages` |
| 04 | `chore(release): configure changesets linked group and publish script` |
| 05 | `test(core): enforce manifest version doc consistency` |
| 06 | `chore(examples): wire headless-gfm typecheck into check pipeline` |
| 07 | `test(core): add createEditor startup abort integration tests` |
| 08 | `docs(status): document M6 validation suite and v1.0 gaps` |
| 09 | validation record only（若有）：`docs(superpowers): add M6 validation evidence` |

- 推荐 **一 task 一 commit**；PR 描述链接 OpenSpec change id 与各 task id。
- Archive 前使用 `aether-workflow-update-docs-spec` sync main specs（`validation-suite`、可选 MODIFIED `engineering-workflow`）。

## Recommended Next Skill

`aether-workflow-create-task` — 将本 plan 拆成 `.superpowers/tasks/add-validation-suite/01-*.md` … `09-*.md`（中文说明 + English 标识；每 task 含 Depends On / Allowed Files / Forbidden Files / TDD 步骤 / Validation 命令与 OpenSpec requirement 引用）。

**注意：** 本 session 按用户要求**仅**生成 plan，**未**创建 task 文件。
