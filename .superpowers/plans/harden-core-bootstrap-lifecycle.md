# harden-core-bootstrap-lifecycle Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: use `aether-workflow-execute-task-loop`（推荐）或 Superpowers `executing-plans` / `subagent-driven-development` 按 task 逐步执行。每个 Superpowers task 绑定本 plan 的一个 Task；步骤使用 checkbox 跟踪。

**Goal:** 在 `@aether-md/core` M1 bootstrap 路径上关闭三项 deferred lifecycle hardening：duplicate `metadata.name` fatal validation、startup failure reverse cleanup、`bootstrapCore.dispose()` 幂等 public contract。

**Architecture:** 在现有 `loadPluginManifests` → capability/dependency validation → `runStartupLifecycle` → `bootstrapCore` dispose 链路上做最小增量：validation 层新增 duplicate name 检测；lifecycle 层在 startup hook failure 时 best-effort 调用已有 reverse destroy 逻辑；dispose 幂等 largely 已实现，补 contract tests 与 asymmetry 断言。不触碰 Command/Event、Adapter、Shell。

**Tech Stack:** TypeScript、`@aether-md/core`、Node built-in test runner、`pnpm` workspace / Turborepo。

**Branch:** `fix/harden-core-bootstrap-lifecycle`  
**Skills loaded:** `openspec-apply-change`, `writing-plans`, `aether-workflow-create-plan`

---

## Change

| 项 | 值 |
| --- | --- |
| OpenSpec change | `harden-core-bootstrap-lifecycle` |
| Status | 4/4 planning artifacts `done`；`openspec validate` passed |
| Version impact | `@aether-md/core` patch-level；`CoreErrorCode` 新增 `PLUGIN_NAME_DUPLICATE`；`SUPPORTED_MANIFEST_VERSIONS` / export 形状不变 |
| Expected commit scope | `fix(core): harden bootstrap lifecycle validation and cleanup`（实现 tasks）；OpenSpec artifacts 可单独 `spec(core-bootstrap): …` |
| 范围 | 仅 `packages/core` bootstrap/manifest/lifecycle/errors + tests |
| 排除 | M2 Command/Event 代码、M3 Adapter、M4 GFM、M5 Shell、`createEditor`、长期 Docs（Step 8） |

---

## Source Artifacts

OpenSpec：

- `openspec/changes/harden-core-bootstrap-lifecycle/proposal.md`
- `openspec/changes/harden-core-bootstrap-lifecycle/design.md`
- `openspec/changes/harden-core-bootstrap-lifecycle/specs/core-bootstrap/spec.md`
- `openspec/changes/harden-core-bootstrap-lifecycle/tasks.md`

长期 Docs（实现时只读引用，本 plan 不重述 requirements）：

- `docs/sdk/manifest.md`
- `docs/sdk/lifecycle.md`
- `docs/engineering/error-model.md`
- `docs/engineering/manifest-loading.md`
- `docs/engineering/test-strategy.md`
- `docs/architecture/core-api.md`
- `docs/engineering/mvp-implementation-plan.md`
- `openspec/specs/core-bootstrap/spec.md`（main，archive 前 sync）

现有实现入口（allowed files 基准）：

- `packages/core/src/errors.ts`
- `packages/core/src/manifest.ts`
- `packages/core/src/bootstrap.ts`
- `packages/core/src/lifecycle.ts`
- `packages/core/src/dependencies.ts`（仅确认不再 silent overwrite；duplicate 检测不在此文件）
- `packages/core/src/bootstrap.test.ts`
- `packages/core/src/manifest.test.ts`
- `packages/core/src/lifecycle.test.ts`
- `packages/core/src/package-boundary.test.ts`

Forbidden（除非 deviation 并更新 OpenSpec）：

- `packages/core/src/command-event*.ts`
- `packages/plugins/**`
- `docs/**`（本 change implementation phase；Step 8 单独 workflow）
- React / Remark / ProseMirror / GFM 相关路径

---

## Implementation Phases

### Phase 1: Duplicate `metadata.name` — failing tests + implementation

在 `loadPluginManifests` 之后、Service Capability 校验之前检测 duplicate name；扩展 `CoreErrorCode`；contract tests 覆盖 fatal / pass / hooks 未调用。

**映射 delta spec：** `Duplicate plugin metadata.name is rejected during bootstrap validation`

### Phase 2: Startup failure reverse cleanup — failing tests + implementation

`runStartupLifecycle` failure 路径对已成功 `onInit` 的插件 reverse `onDestroy`；覆盖 onInit 中途失败、onReady 失败、无 onInit 时不 destroy、cleanup 中 onDestroy 失败仍 best-effort；primary error 保持 `LIFECYCLE_HOOK_FAILED`。

**映射 delta spec：** MODIFIED `Lifecycle hooks run in dependency order`（cleanup scenarios）

### Phase 3: `bootstrapCore.dispose()` 幂等 public contract — tests + alignment

强化 repeated dispose no-op / no throw；显式测试 normal dispose 中 onDestroy failure 仍 fatal abort（与 startup cleanup asymmetry）。

**映射 delta spec：** MODIFIED `Dispose destroys plugins in reverse lifecycle order`

### Phase 4: Package boundary / non-goals guard

确认未改 Command/Event、Adapter、`manifestVersion`；`dependencies.ts` Map 不再承担 duplicate 语义；package-boundary 与 scope guard 仍绿。

**映射 delta spec：** non-goals + 既有 `M1 excludes later milestone behavior`（回归）

### Phase 5: Full validation

`pnpm --filter @aether-md/core test`、`pnpm check`；记录 `.superpowers/runs/harden-core-bootstrap-lifecycle/validation.md`（validate-task 阶段）。

---

## Dependency Order

1. **Phase 1** 先于 Phase 2：duplicate validation 在 lifecycle 前，独立可测；不依赖 cleanup 重构。
2. **Phase 2** 先于 Phase 3：startup cleanup 会触及 `runHook` / destroy 路径；dispose asymmetry 测试依赖 cleanup 行为已稳定。
3. **Phase 3** 可与 Phase 2 末尾并行，但 review 前须完成：dispose 测试不应被 cleanup refactor 破坏。
4. **Phase 4** 在 Phase 1–3 代码完成后：boundary guard 验证整体 diff 未越界。
5. **Phase 5** 最后：全量 check。

跨阶段约束：

- 不扩大 public exports（除 `CoreErrorCode` union 成员）。
- 不在 Phase 2 引入 Command Bus / Event Hub wiring。
- startup cleanup **不得**返回 partial `CoreBootstrapRuntime`。
- 若实现发现需新增 public API，暂停并更新 OpenSpec，不 silent 扩展。

---

## Boundary Risks

| 风险 | 触发点 | 缓解 |
| --- | --- | --- |
| 范围膨胀到 M2/M3 | 修改 `command-event-runtime.ts` 或 Adapter 包 | Forbidden files；Phase 4 checklist |
| duplicate 检测放错位置 | 在 `dependencies.ts` Map 内顺带处理 | Phase 1 明确 `validateUniquePluginNames` + `bootstrapCore` 调用点 |
| startup cleanup 与 normal dispose 语义混淆 | 共用 `runDestroyLifecycle` 未区分 fatal vs best-effort | Phase 2 引入 `continueOnDestroyFailure` 或独立 `runStartupFailureCleanup`；Phase 3 对照测试 |
| primary error 被 cleanup error 覆盖 | cleanup onDestroy throw 后丢失原始 hook failure | delta spec 要求 rethrow primary `LIFECYCLE_HOOK_FAILED`；测试断言 `error.code` |
| dispose 幂等仅实现未契约化 | 缺 no-throw 断言 | Phase 3 显式 `assert.doesNotReject` |
| Docs/spec drift | 实现完成但未 Step 8 | OpenSpec tasks 5.3 / plan 外 workflow；implementation 不改 `docs/` |
| `CoreErrorCode` 扩展影响类型消费者 | 新增 `PLUGIN_NAME_DUPLICATE` | patch-level；boundary test 可选断言 code 存在 |

---

## Validation Matrix

| Phase | Delta spec / Requirement | 验证类型 | 核心场景 | 命令 | 预期 |
| --- | --- | --- | --- | --- | --- |
| 1 | Duplicate name aborts startup | contract | 两个 plugin 同名 | `pnpm --filter @aether-md/core test -- --run` | `CoreError` code `PLUGIN_NAME_DUPLICATE`；onInit/onReady/onDestroy = 0 |
| 1 | Unique names pass | contract | distinct names | 同上 | bootstrap 继续 |
| 2 | Startup hook failure cleans up | contract | 第二 plugin onInit throw | lifecycle/bootstrap tests | reverse onDestroy for first plugin；then reject |
| 2 | onReady failure cleans up all onInit-success | contract | 第二 plugin onReady throw | 同上 | 所有 onInit-success plugins destroyed |
| 2 | No onInit → no onDestroy | contract | 第一 plugin onInit throw | 同上 | destroy calls = 0 |
| 2 | Cleanup continues after onDestroy failure | contract | cleanup 中某 onDestroy throw | 同上 | 其余仍 attempt；primary `LIFECYCLE_HOOK_FAILED` |
| 2 | Hook failure aborts startup | contract | any hook failure | bootstrap test | `bootstrapCore` rejects；no runtime |
| 3 | Repeated dispose no-op public contract | contract | dispose ×2 | lifecycle.test.ts | destroyCalls = 1；第二次不 throw |
| 3 | Normal dispose onDestroy failure fatal | contract | onDestroy throw during dispose | lifecycle.test.ts | reject；后续 plugin destroy 不继续 |
| 4 | M1 excludes later milestones | boundary | export / rg guard | package-boundary.test.ts + rg | 无 createEditor/Shell/Adapter 泄漏 |
| 4 | No Command/Event code change | diff review | git diff scope | manual / checklist | command-event 文件无改动 |
| 5 | Full workspace check | integration | all packages | `pnpm check` | green |

---

## Task Breakdown

以下 Task 01–05 对应用户要求的五个小步，将拆成 Superpowers task 文件（`aether-workflow-create-task`）。

### Task 01: Duplicate `metadata.name` — failing tests + implementation

**OpenSpec binding:** ADDED `Duplicate plugin metadata.name is rejected during bootstrap validation`  
**Allowed files:** `errors.ts`, `manifest.ts`, `bootstrap.ts`, `manifest.test.ts`, `bootstrap.test.ts`  
**Forbidden:** `lifecycle.ts`, `command-event*.ts`, `docs/**`

#### Step 1.1 — 扩展 `CoreErrorCode`（红前准备）

- Modify: `packages/core/src/errors.ts`
- 在 `CoreErrorCode` union 增加 `"PLUGIN_NAME_DUPLICATE"`。

#### Step 1.2 — 写 failing test：duplicate name fatal

- Modify: `packages/core/src/bootstrap.test.ts`（或 `manifest.test.ts` 若直接测 validation helper）
- 新增 test：`rejects duplicate metadata.name before lifecycle hooks`
- Arrange：两个 `ExtensionPlugin`，`metadata.name: "dup"`
- Assert：`assert.rejects` + `CoreError` + `code === "PLUGIN_NAME_DUPLICATE"`
- Track：`onInit` / `onReady` call counts === 0

Run:

```bash
pnpm --filter @aether-md/core test -- --run --test-name-pattern "duplicate metadata.name"
```

Expected: **FAIL**（validation 未实现）

#### Step 1.3 — 写 failing test：unique names pass

- 同文件：两个 distinct names bootstrap 成功（可复用现有 happy-path 模式）

Expected: PASS（不应回归）

#### Step 1.4 — 实现 `validateUniquePluginNames`

- Modify: `packages/core/src/manifest.ts`
- 导出 `validateUniquePluginNames(loadedPlugins: readonly LoadedPlugin[]): void`
- 扫描 name 出现次数 > 1 → throw `CoreError({ code: "PLUGIN_NAME_DUPLICATE", message: …, severity: "fatal" })`

#### Step 1.5 — 接入 `bootstrapCore`

- Modify: `packages/core/src/bootstrap.ts`
- 在 `loadPluginManifests` 之后、`validateServiceCapabilities` 之前调用 `validateUniquePluginNames(loadedPlugins)`

#### Step 1.6 — 验证全绿

```bash
pnpm --filter @aether-md/core exec tsc --noEmit
pnpm --filter @aether-md/core test -- --run
```

**Outcome:** duplicate name fatal；Map silent overwrite 不再作为有效策略。

---

### Task 02: Startup failure reverse cleanup — failing tests + implementation

**OpenSpec binding:** MODIFIED `Lifecycle hooks run in dependency order`（cleanup scenarios）  
**Allowed files:** `lifecycle.ts`, `bootstrap.ts`, `lifecycle.test.ts`, `bootstrap.test.ts`  
**Forbidden:** `command-event*.ts`, `capabilities.ts`（除非 type import）, `docs/**`

#### Step 2.1 — 写 failing test：onInit 中途失败触发 reverse cleanup

- Modify: `packages/core/src/lifecycle.test.ts` 或 `bootstrap.test.ts`
- Test：`cleans up successful onInit plugins when a later onInit fails`
- Plugin A onInit 成功并设置 flag；Plugin B onInit throw
- Assert：A 的 `onDestroy` 被调用；B 的 `onDestroy` 未调用（B 未 successful onInit）；`bootstrapCore` rejects；`error.code === "LIFECYCLE_HOOK_FAILED"`

Run targeted test → **FAIL**

#### Step 2.2 — 写 failing test：onReady 失败 cleanup 全部 onInit-success

- Test：`cleans up all onInit-success plugins when onReady fails`
- 两 plugin 均 onInit 成功；第二 plugin onReady throw
- Assert：两者 onDestroy 按 reverse order 调用

#### Step 2.3 — 写 failing test：无 successful onInit 时不 destroy

- Test：`does not invoke onDestroy when startup fails before any successful onInit`
- 第一 plugin onInit throw → destroyCalls === 0

#### Step 2.4 — 写 failing test：cleanup 中 onDestroy 失败仍继续

- Test：`continues startup cleanup when onDestroy fails during cleanup`
- Plugin A onInit ok；B onInit throw 触发 cleanup；A onDestroy throw
- Assert：仍 attempt 其余（若有多 plugin）；最终 reject；primary `LIFECYCLE_HOOK_FAILED` 来自 **B onInit**（非 A onDestroy）

#### Step 2.5 — 实现 startup failure cleanup

- Modify: `packages/core/src/lifecycle.ts`
- 重构 `runStartupLifecycle`：
  - 保留 `initialized: LoadedPlugin[]`
  - onInit / onReady loop 用 try/catch 捕获 `CoreError`
  - on failure：调用 cleanup（reverse `initialized`）再 rethrow **原始** startup error
- 新增 cleanup 辅助（二选一，implementation 时选最小 diff）：
  - **A:** `runDestroyLifecycle(..., { continueOnFailure: true })` best-effort
  - **B:** `runStartupFailureCleanup` 内部 swallow per-plugin destroy errors，最后 rethrow primary
- 正常 `runDestroyLifecycle`（dispose 路径）保持 **fatal abort** 行为不变

#### Step 2.6 — 确认 `bootstrapCore` 仍 reject、不返回 runtime

- 现有 `bootstrap.test.ts` startup failure tests 应仍 pass；必要时补 assert runtime 未 resolve

#### Step 2.7 — 验证

```bash
pnpm --filter @aether-md/core test -- --run --test-name-pattern "cleanup|onInit fails|onReady fails"
pnpm --filter @aether-md/core test -- --run
```

**Outcome:** startup hook failure 前 successful onInit 插件 reverse destroy；不返回 running runtime。

---

### Task 03: `bootstrapCore.dispose()` 幂等 public contract — tests + alignment

**OpenSpec binding:** MODIFIED `Dispose destroys plugins in reverse lifecycle order`  
**Allowed files:** `bootstrap.ts`, `lifecycle.ts`, `lifecycle.test.ts`, `bootstrap.test.ts`  
**Forbidden:** `command-event*.ts`, `docs/**`

#### Step 3.1 — 强化 repeated dispose no-throw

- Modify: `packages/core/src/lifecycle.test.ts`
- 现有 test `does not run destroy hooks more than once for repeated dispose calls` 补充：
  - `await assert.doesNotReject(async () => runtime.dispose())` 第二次
  - 第三次 optional

#### Step 3.2 — 写 test：normal dispose onDestroy failure fatal abort

- Test：`aborts normal dispose when onDestroy fails`
- 两 plugin；第一个 onDestroy throw
- Assert：`runtime.dispose()` rejects；第二个 onDestroy **未**调用（asymmetry vs startup cleanup）

Run → 若现有实现已满足，应 PASS；否则实现保持 fatal abort

#### Step 3.3 — 代码对齐（若需）

- Review: `packages/core/src/bootstrap.ts` `disposed` flag — 已实现 no-op
- 仅加简短注释指向 delta spec public contract（可选，不扩大 scope）

#### Step 3.4 — 验证

```bash
pnpm --filter @aether-md/core test -- --run --test-name-pattern "dispose"
```

**Outcome:** 幂等 public contract 有可执行 tests；normal vs startup cleanup asymmetry 可审查。

---

### Task 04: Package boundary / non-goals guard

**OpenSpec binding:** proposal 非目标 + main spec `M1 excludes later milestone behavior`（回归）  
**Allowed files:** `package-boundary.test.ts`（仅必要时补 assertion）；只读 review 其余  
**Forbidden:** 新功能代码

#### Step 4.1 — diff scope 检查

```bash
git diff --name-only
```

确认仅 `packages/core/src/{errors,manifest,bootstrap,lifecycle}*.ts` 与对应 tests。

#### Step 4.2 — scope guard

```bash
rg "react|prosemirror|remark|gfm|createEditor|Adapter" packages/core/src --glob '!*.test.ts'
```

Expected: 无新增匹配（或仅既有 comment/type）

#### Step 4.3 — package boundary tests

```bash
pnpm --filter @aether-md/core test -- --run src/package-boundary.test.ts
```

确认：`createEditor` 未 export；`bootstrapCore` 仍存在；Command/Event exports 未被动

#### Step 4.4 — 确认 `dependencies.ts`

- `resolvePluginDependencyOrder` 仍用 Map，但 duplicate 已在 Phase 1 拦截；加 comment 或 test 文档化「duplicate 由 validateUniquePluginNames 处理」

#### Step 4.5 — checklist（写入 task Run Log）

- [ ] 未修改 `command-event-runtime.ts` / `command-event-types.ts` 行为
- [ ] 未修改 `SUPPORTED_MANIFEST_VERSIONS`
- [ ] 未实现 Adapter loading / silent capability
- [ ] 未 touch `packages/plugins/**`

**Outcome:** 边界审查记录完整，无 M2/M3/M4/M5 泄漏。

---

### Task 05: Full validation

**OpenSpec binding:** OpenSpec `tasks.md` §4 + §5 workflow 前置  
**Allowed files:** `.superpowers/runs/harden-core-bootstrap-lifecycle/validation.md`（validate-task 阶段创建）

#### Step 5.1 — Core 全量测试

```bash
pnpm --filter @aether-md/core exec tsc --noEmit
pnpm --filter @aether-md/core test -- --run
```

#### Step 5.2 — Workspace check

```bash
pnpm check
```

#### Step 5.3 — OpenSpec validate（仍 green）

```bash
openspec validate harden-core-bootstrap-lifecycle
```

#### Step 5.4 — 记录 validation

- 命令、exit code、测试计数写入 `.superpowers/runs/harden-core-bootstrap-lifecycle/validation.md`（`aether-workflow-validate-task`）

**Outcome:** 实现 phase 验证完成，可进入 compliance review。

---

### Task Breakdown Summary Table

| Task | Outcome | Allowed Area | Validation | Version Impact |
| --- | --- | --- | --- | --- |
| 01 Duplicate name | `PLUGIN_NAME_DUPLICATE` + validation | errors, manifest, bootstrap, tests | bootstrap/manifest contract tests | `CoreErrorCode` +1 |
| 02 Startup cleanup | reverse onDestroy on failure | lifecycle, bootstrap, tests | lifecycle/bootstrap cleanup tests | behavior only |
| 03 Dispose idempotency | contract tests + asymmetry | bootstrap, lifecycle, tests | dispose tests | docs contract（代码已基本具备） |
| 04 Boundary guard | non-goals checklist | package-boundary, review | rg + boundary test | none |
| 05 Full validation | `pnpm check` green | validation.md | tsc + test + check | none |

---

## Review Focus

- 每个 changed file 映射到 Task 01–05 之一。
- 每个 task 映射到 delta spec scenario（见 Validation Matrix）。
- **Public contract：** `PLUGIN_NAME_DUPLICATE`、startup cleanup、dispose 幂等 MUST 有测试断言；不得仅注释。
- **Asymmetry：** startup cleanup best-effort vs normal dispose fatal — review 必须看见对照测试。
- **Primary error：** startup failure 测试 assert `LIFECYCLE_HOOK_FAILED` 来自 failing hook，非 cleanup destroy。
- **Non-goals：** diff 不含 Command/Event 实现、Adapter、Docs、Shell。
- **Deviation：** 若 `runDestroyLifecycle` API 签名变化，记录于 task Deviation，不 silent 改 public helper 语义。
- **Docs：** 本 implementation 阶段不改 `docs/`；Step 8 同步清单见 OpenSpec `tasks.md` 5.3。

---

## Open Questions

（OpenSpec design 已裁决；implementation 按下列执行，无需重开 requirements）

| # |  topic | 裁决 | Plan 落地 |
| --- | --- | --- | --- |
| 1 | Duplicate error code | `PLUGIN_NAME_DUPLICATE` | Task 01 Step 1.1 |
| 2 | Cleanup onDestroy failure | best-effort + primary startup error | Task 02 Step 2.4–2.5 |
| 3 | Normal dispose onDestroy failure | fatal abort，不 continue | Task 03 Step 3.2 |
| 4 | `createEditor` cleanup | out of scope | 不添加代码 |
| 5 | Docs sync | Step 8 only | Task 05 不修改 docs |

无阻塞 open questions。若 implementation 发现必须新增 exported helper（例如 public `validateUniquePluginNames`），默认 **不 export**；仅 internal module 使用，除非 review 要求公开。

---

## Recommended Next Workflow Skill

**`aether-workflow-create-task`** — 将 Task 01–05 写入 `.superpowers/tasks/harden-core-bootstrap-lifecycle/01-….md` … `05-….md`，含 allowed/forbidden files、TDD notes、spec binding、validation commands。

Implementation 完成后依次：`aether-workflow-execute-task-loop` → `aether-workflow-validate-task` → `aether-workflow-review-compliance` → `aether-workflow-update-docs-spec` → `aether-workflow-archive-change`.
