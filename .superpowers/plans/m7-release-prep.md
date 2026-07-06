# m7-release-prep Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use Superpowers task execution (`aether-workflow-create-task` → `aether-workflow-implement-task` / `aether-workflow-execute-task-loop`) to implement this plan task-by-task. Do not redefine OpenSpec requirements in code.

**Goal:** 从 M6 闭合态推进至 M7 首次 npm canary 发布——先闭合 Playwright E2E Phase 1 WIP 与维护者 sign-off，再交付 consumer smoke、Release CI、去 `private: true` 与 ADR O1/O2 决议。

**Architecture:** 分四轨并行叙事：**Phase 0**（Playwright E2E 非阻塞 CI，Quick Change / 轻量 Spec Change）、**Phase 1**（维护者浏览器 sign-off，文档记录）、**Phase 2**（M7 Full Change：`openspec/changes/m7-first-release`）、**Phase 3**（发布后 backlog，独立 Spec Change）。E2E 覆盖 `examples/block-morphing` 真实浏览器路径；M7 发布沿用 Changesets `linked` 五包 + CI-only publish（ADR 009）。

**Tech Stack:** Playwright、`@playwright/test`、GitHub Actions、Changesets、pnpm pack、Node ESM consumer smoke、Turborepo、Vitest（既有）。

---

## Change

| 字段                  | 值                                                                                                                                                                                              |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| OpenSpec change       | **Phase 0:** `playwright-e2e-phase-1`（待建 Spec Change）· **Phase 2:** `m7-first-release`（待建 Full Change）                                                                                  |
| Branch                | `main`（plan 时）；Phase 0 建议 `feat/playwright-e2e-phase-1`；Phase 2 建议 `feat/m7-first-release`                                                                                             |
| OpenSpec status       | **未开始** — 本 plan 为跨 change 编排；各 phase 合入前须分别 `openspec-propose` / `aether-workflow-create-change`                                                                               |
| Version impact        | Phase 0：**无** semver / public API 变更。Phase 2：**首次** 五包 npm 版本（O1 待决议 `0.x` vs `1.0.0`）；`private: true` 移除；`pnpm-lock.yaml` 变更；**无** `SUPPORTED_MANIFEST_VERSIONS` 变更 |
| Expected commit scope | Phase 0: `test(e2e)`、`ci`、`docs(test-strategy)`。Phase 2: `chore(release)`、`ci`、`docs(community)`                                                                                           |
| Commit strategy       | Phase 0：单 PR 可 squash。Phase 2：**每 task 独立 commit**；Release CI 与 publish 预备分 commit                                                                                                 |

范围边界：

- **Phase 0 包含：** `e2e/playwright/**`、根 `e2e:*` scripts、`.github/workflows/ci.yml` `e2e-playwright` job（`continue-on-error: true`）、`docs/engineering/test-strategy.md`、`README.md`、`examples/block-morphing/README.md`、`.gitignore` playwright artifacts。
- **Phase 0 排除：** 将 E2E 升为阻塞门禁、M7 publish、`private: true` 移除。
- **Phase 2 包含：** consumer smoke、`release.yml`、五包去 private、ADR O1/O2 决议文档、README 安装说明、`docs/community/release-process.md` M7 状态。
- **Phase 2 排除：** History/Selection/Clipboard、compile-layer merge、Vue Shell、Playwright 升阻塞（留 Phase 3）。
- **Phase 3（本 plan 仅列 backlog，不实施）：** 内置底座、ConflictResolver 编排集成、Playwright 阻塞门禁。

## Source Artifacts

长期 source docs / ADRs（已存在）：

- `docs/adr/009-release-governance.md`
- `docs/engineering/mvp-implementation-plan.md`（M7 发布触发条件）
- `docs/engineering/test-strategy.md`
- `docs/architecture/product-experience-spec.md`
- `docs/community/release-process.md`
- `docs/project-status.md`
- `docs/architecture/roadmap.md`
- `docs/architecture/ci-checklist.md`

待建 OpenSpec artifacts：

- `openspec/changes/playwright-e2e-phase-1/`（Phase 0）
- `openspec/changes/m7-first-release/`（Phase 2）

## Code-Management

Plan 时 `git status --short`：

```
 M .github/workflows/ci.yml
 M .gitignore
 M README.md
 M docs/engineering/test-strategy.md
 M examples/block-morphing/README.md
 M package.json
 M pnpm-lock.yaml
?? e2e/
```

当前分支：`main`

- **Phase 0 允许修改区：** 上表全部 + `pnpm-lock.yaml`（`@playwright/test`）。
- **Phase 2 允许修改区：** 五包 `package.json`、`.changeset/config.json`、`.github/workflows/release.yml`（新建）、`scripts/consumer-smoke.mjs`（新建）、根 `package.json`、`docs/**`、`README.md`。
- **禁止：** Phase 0 中改五包 `private`；Phase 2 中改 morphing 生产逻辑（除非 consumer smoke 暴露 bug）。

## File Map

| 路径                                          | 职责                                                        | Phase |
| --------------------------------------------- | ----------------------------------------------------------- | ----- |
| `e2e/playwright/playwright.config.ts`         | webServer 拉起 block-morphing dev；port 4173                | 0     |
| `e2e/playwright/fixtures/editor.ts`           | `gotoMorphingDemo`、`block()` helper                        | 0     |
| `e2e/playwright/tests/block-morphing.spec.ts` | smoke、Block Focus、Instant Morphing、GateLock 回归         | 0     |
| `.github/workflows/ci.yml`                    | `e2e-playwright` job，非阻塞，上传 report artifact          | 0     |
| `package.json`（根）                          | `e2e:install`、`e2e:test`、`e2e:test:headed`、`e2e:test:ui` | 0     |
| `.gitignore`                                  | `playwright-report/`、`test-results/`                       | 0     |
| `docs/engineering/test-strategy.md`           | E2E 目录布局与 Phase 1 CI 策略                              | 0     |
| `examples/block-morphing/README.md`           | 本地 E2E 运行说明                                           | 0     |
| `scripts/consumer-smoke.mjs`                  | `pnpm pack` → 临时目录 `import` 五包主入口                  | 2     |
| `.github/workflows/release.yml`               | Changesets version + publish；`NPM_TOKEN`                   | 2     |
| `packages/*/package.json`                     | 移除 `private: true`（五包）                                | 2     |
| `docs/community/release-process.md`           | M7 canary 状态、O1/O2 决议记录                              | 2     |
| `docs/project-status.md`                      | sign-off 日期、M7 进度                                      | 1–2   |

## Implementation Phases

### Phase 0: Playwright E2E Phase 1 闭合（Tasks 01–04, wave-a）

**映射 requirements：**

- `validation-suite` delta（待建）：Playwright 覆盖 block-morphing smoke / Block Focus / Instant Morphing
- ADR 009 P1：Playwright 非阻塞 CI

**产出：** E2E 套件绿、`pnpm check` 绿、CI `e2e-playwright` job 运行（`continue-on-error: true`）。

### Phase 1: 维护者 sign-off（Tasks 05–06, wave-b, 人工）

**映射 requirements：**

- ADR 009 M7 canary 产品 demo 前置（方案 B）
- `product-experience-spec` 验收场景 A/B/C

**产出：** `docs/project-status.md` 或 `examples/*/README.md` 记录 sign-off 日期与检查项勾选。

### Phase 2: M7 发布工程（Tasks 07–12, wave-c → wave-d）

**映射 requirements：**

- ADR 009 G2、G8、G9、G10
- `release-process.md` M7 canary 流程

**产出：** consumer smoke 脚本、Release CI、O1/O2 决议、五包去 `private`、首次 canary publish（维护者触发）。

### Phase 3: 发布后 backlog（独立 change，本 plan 不实施）

- History / Selection / Clipboard
- ConflictResolver 编排层集成
- compile-layer schema merge
- Playwright CI 升阻塞门禁
- Vue Shell、`examples matrix`

## Dependency Order

```
Phase 0 (E2E WIP)
    ↓
Phase 1 (sign-off) — 可与 Phase 0 CI 观察期重叠
    ↓
Phase 2 Task 07 (O1/O2 决议) — 阻塞 Release CI 与 publish
    ↓
Phase 2 Tasks 08–09 (consumer smoke + 去 private) — 可并行
    ↓
Phase 2 Task 10 (Release CI)
    ↓
Phase 2 Task 11 (文档同步)
    ↓
Phase 2 Task 12 (首次 canary publish)
```

## Boundary Risks

| 类别               | 风险                                         | 缓解                                                          |
| ------------------ | -------------------------------------------- | ------------------------------------------------------------- |
| Architecture       | E2E 与 Vitest happy-dom 路径重复断言         | E2E 仅覆盖浏览器专属：焦点、blur、DOM 渲染、GateLock rerender |
| Public contracts   | M7 首次 publish 暴露 API                     | `tsd` + consumer smoke 在 publish 前必须通过                  |
| Package/versioning | linked 五包版本不同步                        | Changesets `linked` 组；单次 version bump                     |
| Docs/spec drift    | ADR 009 写「不做 Playwright」与 Phase 0 冲突 | `test-strategy.md` 已标注 Phase 1 非阻塞；无需新 ADR          |
| CI                 | E2E flaky 阻塞合并                           | `continue-on-error: true` 至稳定后升阻塞（Phase 3）           |

## Validation Matrix

| Phase | Requirement       | Validation                        | Intuitive Verification            | Notes                      |
| ----- | ----------------- | --------------------------------- | --------------------------------- | -------------------------- |
| 0     | E2E smoke         | `pnpm e2e:test`                   | 4 tests pass                      | 需 `pnpm e2e:install` 首次 |
| 0     | CI 非阻塞         | PR CI `e2e-playwright` job        | artifact 可下载                   | `continue-on-error: true`  |
| 0     | G4 绿             | `pnpm check`                      | exit 0                            | 含 format                  |
| 1     | L1 sign-off       | 维护者 checklist                  | `react-basic` dev 连续打字        | 非 CI 门禁                 |
| 1     | L2 sign-off       | 维护者 + E2E                      | `block-morphing` dev + `e2e:test` | Slice A 为 M7 最低门槛     |
| 2     | G8 consumer smoke | `node scripts/consumer-smoke.mjs` | 五包 import 无 throw              | publish 前                 |
| 2     | G10 Release CI    | dry-run / canary publish          | npm 可见 `@canary`                | 需 `NPM_TOKEN` secret      |
| 2     | G2 去 private     | `pnpm pack` 各包                  | 非 private tarball                |                            |

## Task Breakdown

| Task                                | Outcome                                                           | Allowed Area                                                              | Validation                          | Version Impact        | Depends On | Parallel Group | Barrier |
| ----------------------------------- | ----------------------------------------------------------------- | ------------------------------------------------------------------------- | ----------------------------------- | --------------------- | ---------- | -------------- | ------- |
| **01** `format-and-check-green`     | Prettier 修复；`pnpm check` 绿                                    | `e2e/**`、`docs/engineering/test-strategy.md`                             | `pnpm check`                        | none                  | —          | wave-a         | no      |
| **02** `verify-e2e-local`           | 本地 E2E 四轮通过                                                 | `e2e/**`                                                                  | `pnpm e2e:install && pnpm e2e:test` | none                  | 01         | wave-a         | no      |
| **03** `openspec-playwright-change` | 建 `playwright-e2e-phase-1` Spec Change；delta `validation-suite` | `openspec/changes/playwright-e2e-phase-1/**`                              | `openspec validate`                 | none                  | —          | wave-a         | yes     |
| **04** `commit-e2e-phase-1`         | PR 合入 E2E + CI                                                  | 见 Phase 0 File Map                                                       | CI 绿 + e2e job 运行                | none                  | 01, 02, 03 | wave-a         | yes     |
| **05** `l1-browser-sign-off`        | L1 维护者走查记录                                                 | `examples/react-basic/README.md` 或 `docs/project-status.md`              | checklist 勾选                      | none                  | 04         | wave-b         | no      |
| **06** `l2-browser-sign-off`        | L2 维护者走查记录                                                 | `examples/block-morphing/README.md` 或 `docs/project-status.md`           | checklist + `e2e:test`              | none                  | 04         | wave-b         | yes     |
| **07** `resolve-o1-o2`              | ADR O1/O2 决议写入 `release-process.md`                           | `docs/community/release-process.md`、`docs/adr/009-release-governance.md` | 维护者确认                          | 决议版本号策略        | 06         | wave-c         | yes     |
| **08** `consumer-smoke-script`      | `scripts/consumer-smoke.mjs`                                      | `scripts/`、根 `package.json` script                                      | `node scripts/consumer-smoke.mjs`   | none                  | 07         | wave-c         | no      |
| **09** `remove-private-flags`       | 五包去 `private: true`                                            | `packages/*/package.json`                                                 | `pnpm pack` 各包                    | **首次** publish 预备 | 07         | wave-c         | no      |
| **10** `release-ci-workflow`        | `.github/workflows/release.yml`                                   | `.github/workflows/`                                                      | workflow dry-run                    | none                  | 08, 09     | wave-d         | yes     |
| **11** `sync-m7-docs`               | README 安装说明、project-status                                   | `README.md`、`docs/**`                                                    | `pnpm docs:check-links`             | none                  | 10         | wave-d         | no      |
| **12** `first-canary-publish`       | `changeset pre enter canary` + CI publish                         | Changesets、npm                                                           | `npm view @aether-md/core@canary`   | **semver bump**       | 10, 11     | wave-d         | yes     |

## Task Details

### Task 01: format-and-check-green

**Files:**

- Modify: `e2e/playwright/tests/block-morphing.spec.ts`
- Modify: `docs/engineering/test-strategy.md`

- [ ] **Step 1: 运行 Prettier**

```bash
pnpm format
```

- [ ] **Step 2: 验证 check 绿**

```bash
pnpm check
```

Expected: exit 0

---

### Task 02: verify-e2e-local

**Files:** `e2e/playwright/**`

- [ ] **Step 1: 安装浏览器**

```bash
pnpm e2e:install
```

- [ ] **Step 2: 运行 E2E**

```bash
pnpm e2e:test
```

Expected: 4 passed（smoke、block focus、instant morphing、GateLock regression）

---

### Task 03: openspec-playwright-change

使用 `aether-workflow-create-spec-change`：

- change id: `playwright-e2e-phase-1`
- delta: `openspec/specs/validation-suite/spec.md` — Playwright Phase 1 非阻塞 CI
- change-brief: E2E 目录布局、block-morphing 四轮场景、CI `continue-on-error`

Validation: `openspec validate playwright-e2e-phase-1 --strict`

---

### Task 04: commit-e2e-phase-1

分支 `feat/playwright-e2e-phase-1`；Conventional Commit 示例：

```
test(e2e): add Playwright Phase 1 for block-morphing demo
```

PR 须含 Workflow Traceability（Spec Change id）。

---

### Task 05: l1-browser-sign-off

维护者执行：

```bash
pnpm --filter @aether-md/example-react-basic dev
```

检查项（来自 `product-experience-spec` 零延迟打字）：

- 连续打字无整页 remount
- GateLock「Force parent rerender」保留编辑内容
- preview 与编辑同步

记录：在 `docs/project-status.md`「近期重点」追加 sign-off 日期。

---

### Task 06: l2-browser-sign-off

维护者执行：

```bash
pnpm --filter @aether-md/example-block-morphing dev
pnpm e2e:test
```

检查项：

- 场景 A/B/C（聚焦源码、失焦渲染、单块源码态）
- Slice D 列表 morphing
- E2E 四轮 CI 绿

---

### Task 07: resolve-o1-o2

维护者决议并写入 `docs/community/release-process.md`：

| ID  | 推荐默认              | 理由                                |
| --- | --------------------- | ----------------------------------- |
| O1  | `0.1.0` 或 `0.x` 系列 | v1.0 差距项仍多（History 等未实现） |
| O2  | `canary`              | ADR 009 默认措辞                    |

---

### Task 08: consumer-smoke-script

**Files:**

- Create: `scripts/consumer-smoke.mjs`
- Modify: `package.json` — `"consumer:smoke": "node scripts/consumer-smoke.mjs"`

脚本逻辑：

1. `pnpm build`
2. 对五包分别 `pnpm pack` 到临时目录
3. 空 `package.json` + `"type": "module"` 中 `import` 各包 `dist/index.js` 主入口
4. exit 0 或 throw

```bash
pnpm consumer:smoke
```

---

### Task 09: remove-private-flags

从以下文件移除 `"private": true`：

- `packages/core/package.json`
- `packages/plugins/plugin-remark/package.json`
- `packages/plugins/plugin-prosemirror/package.json`
- `packages/preset-gfm/package.json`
- `packages/react/package.json`

Validation:

```bash
pnpm --filter @aether-md/core pack --pack-destination /tmp/aether-pack-test
```

---

### Task 10: release-ci-workflow

**Files:** Create `.github/workflows/release.yml`

参考 Changesets 官方 GitHub Action 模式：

- trigger: `push` to `main`
- `changesets/action` with `publish: pnpm changeset:publish`
- secrets: `NPM_TOKEN`
- 前置：`changeset pre enter canary`（维护者一次性或 workflow 内）

---

### Task 11: sync-m7-docs

更新：

- `README.md` — npm 安装说明（canary）
- `docs/project-status.md` — M7 进行中 / 已发布
- `docs/community/release-process.md` — 阶段表 M7 canary ✅

---

### Task 12: first-canary-publish

维护者流程：

1. 创建 changeset 描述首次发布
2. 合入 main
3. Release CI bump + publish
4. 验证：`npm view @aether-md/core@canary version`

## Review Focus

- Phase 0：E2E 不断言 Vitest 已覆盖的 dispatch 路径；仅浏览器专属行为
- Phase 0：CI job **必须**保持 `continue-on-error: true` 直至 Phase 3 决策
- Phase 2：`NPM_TOKEN` 仅在 Release workflow 配置；禁止本地 `npm publish`
- Phase 2：linked 五包同版本 bump
- 所有 task 文件映射到 OpenSpec delta 或 ADR 009 门禁行

## Open Questions

| ID  | 问题                                     | 负责   | 阻塞       |
| --- | ---------------------------------------- | ------ | ---------- |
| Q1  | O1 首次版本号                            | 维护者 | Task 10–12 |
| Q2  | O2 dist-tag 名称                         | 维护者 | Task 10–12 |
| Q3  | E2E 何时升阻塞门禁                       | 维护者 | Phase 3    |
| Q4  | Phase 0 用 Quick Change 还是 Spec Change | 维护者 | Task 03    |

## Recommended Next Workflow Skills

| 当前步骤           | Skill                                                 |
| ------------------ | ----------------------------------------------------- |
| Task 01–02（立即） | 直接执行 / `aether-workflow-implement-task`           |
| Task 03            | `aether-workflow-create-spec-change`                  |
| Task 04            | `aether-workflow-execute-spec-change` 或 PR           |
| Task 05–06         | 维护者手动 + `aether-workflow-validate-task`          |
| Phase 2 启动       | `aether-workflow-create-change`（`m7-first-release`） |
| Phase 2 执行       | `aether-workflow-execute-task-loop`                   |
| 归档               | `aether-workflow-archive-change`                      |

---

**Plan path:** `.superpowers/plans/m7-release-prep.md`  
**Branch:** `main`  
**Skills loaded:** `writing-plans`, `aether-workflow-create-plan`（template）  
**Version impact:** Phase 0 none；Phase 2 首次 semver + 去 private  
**Next action:** Task 01 `pnpm format && pnpm check`
