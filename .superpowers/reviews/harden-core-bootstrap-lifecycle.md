# harden-core-bootstrap-lifecycle Spec Compliance Review

## Summary

- **Status:** passed with follow-up updates
- **OpenSpec change:** `harden-core-bootstrap-lifecycle`
- **Branch:** `fix/harden-core-bootstrap-lifecycle`
- **Review date:** 2026-07-05
- **Skills loaded:** `openspec-apply-change`, `requesting-code-review`
- **Version impact:** `@aether-md/core` patch-level behavior hardening; `CoreErrorCode` union extended with `PLUGIN_NAME_DUPLICATE`; no `manifestVersion`, lockfile, or package export surface change

本 review 对 OpenSpec delta、Superpowers plan/tasks、validation 记录、实现 diff 与 long-lived Docs 进行 spec compliance 与 anticorruption 检查。**未执行 archive**（按用户要求保留 change 开放状态）。

## Artifact Coverage

| Artifact    | Present | Notes                                                                            |
| ----------- | ------- | -------------------------------------------------------------------------------- |
| Proposal    | Yes     | `openspec/changes/harden-core-bootstrap-lifecycle/proposal.md`                   |
| Design      | Yes     | M1 bootstrap hardening scope、non-goals、public contract 意图明确                |
| Delta specs | Yes     | `openspec/changes/harden-core-bootstrap-lifecycle/specs/core-bootstrap/spec.md`  |
| Plan        | Yes     | `.superpowers/plans/harden-core-bootstrap-lifecycle.md`                          |
| Tasks       | Yes     | `.superpowers/tasks/harden-core-bootstrap-lifecycle/01-` … `08-`（均 completed） |
| Validation  | Yes     | `.superpowers/runs/harden-core-bootstrap-lifecycle/validation.md` — Overall PASS |

## Changed-file Mapping

| File                                  | Task  | Requirement / Source Doc                                                               | Status |
| ------------------------------------- | ----- | -------------------------------------------------------------------------------------- | ------ |
| `packages/core/src/errors.ts`         | 01    | ADDED: `PLUGIN_NAME_DUPLICATE`                                                         | OK     |
| `packages/core/src/manifest.ts`       | 02    | ADDED: duplicate `metadata.name` validation                                            | OK     |
| `packages/core/src/bootstrap.ts`      | 02    | ADDED: call `validateUniquePluginNames` before capability/deps/lifecycle               | OK     |
| `packages/core/src/bootstrap.test.ts` | 02    | ADDED scenarios: duplicate abort + unique pass                                         | OK     |
| `packages/core/src/lifecycle.ts`      | 03–04 | MODIFIED: startup failure cleanup; dispose path unchanged except shared destroy helper | OK     |
| `packages/core/src/lifecycle.test.ts` | 03–06 | MODIFIED scenarios: cleanup, no-op dispose, fatal normal dispose                       | OK     |
| `packages/core/src/dependencies.ts`   | 07    | Comment only; duplicate names delegated to manifest validation                         | OK     |

**Unrelated files:** 无。实现 diff 仅 7 个 core 源文件，与 task 08 scope guard 一致。

## Requirement Compliance

| Requirement / Scenario                                     | Evidence                                                                                                                   | Result   | Notes                                                                      |
| ---------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | -------- | -------------------------------------------------------------------------- |
| **ADDED** Duplicate plugin name aborts startup             | `bootstrap.test.ts`: `rejects duplicate metadata.name before lifecycle hooks`                                              | **PASS** | Fatal `CoreError`, code `PLUGIN_NAME_DUPLICATE`; zero lifecycle hook calls |
| **ADDED** Unique plugin names pass validation              | `bootstrap.test.ts`: `allows unique plugin names to bootstrap`                                                             | **PASS** | Continues to capability + dependency + lifecycle                           |
| **MODIFIED** Startup hooks in dependency order             | Existing + regression tests                                                                                                | **PASS** | Unchanged happy path                                                       |
| **MODIFIED** Hook failure aborts startup (no runtime)      | `lifecycle.test.ts`: `does not return a running bootstrap runtime when startup hook fails`                                 | **PASS** |                                                                            |
| **MODIFIED** Startup failure cleans up successful onInit   | `cleans up successful onInit plugins when a later onInit fails`; `cleans up all onInit-success plugins when onReady fails` | **PASS** | Reverse-order `onDestroy`; primary error `LIFECYCLE_HOOK_FAILED`           |
| **MODIFIED** No onInit → no onDestroy on startup failure   | `does not invoke onDestroy when startup fails before any successful onInit`                                                | **PASS** |                                                                            |
| **MODIFIED** Cleanup continues after onDestroy failure     | `continues startup cleanup when onDestroy fails during cleanup`                                                            | **PASS** | Best-effort continue; primary error unchanged                              |
| **MODIFIED** Dispose reverse order                         | Existing `runs onDestroy in reverse successful lifecycle order`                                                            | **PASS** | Regression preserved                                                       |
| **MODIFIED** Repeated dispose no-op public contract        | `does not run destroy hooks more than once for repeated dispose calls` + `doesNotReject`                                   | **PASS** | Matches delta spec                                                         |
| **MODIFIED** Normal dispose onDestroy failure fatal        | `aborts normal dispose when onDestroy fails`                                                                               | **PASS** | Asymmetric vs startup cleanup — intentional per design                     |
| **MODIFIED** Bootstrap dispose separate from Command/Event | Zero diff on `command-event*.ts`; validation rg guard                                                                      | **PASS** | M2 untouched                                                               |

### Hardening focus areas (user checklist)

| Focus                     | Covered | Test evidence                                                                                              |
| ------------------------- | ------- | ---------------------------------------------------------------------------------------------------------- |
| Duplicate `metadata.name` | Yes     | 2 tests in `bootstrap.test.ts`                                                                             |
| Partial startup cleanup   | Yes     | 5 tests in `lifecycle.test.ts` (onInit fail, onReady fail, no onInit, cleanup continue, no runtime return) |
| Dispose idempotency       | Yes     | Repeated dispose no-op + no second hooks; normal dispose fatal preserved                                   |

## Docs / SDK Drift Review

实现行为与 **delta spec** 一致，但与 **long-lived Docs** 存在预期内 drift（implementation phase 刻意未改 Docs）：

| Doc                               | Delta references             | Current long-lived doc state                                                                                                             | Drift               |
| --------------------------------- | ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | ------------------- |
| `docs/sdk/manifest.md`            | ADDED requirement            | M1 小节未列出 duplicate `metadata.name` fatal validation                                                                                 | **Drift** — 需 sync |
| `docs/sdk/lifecycle.md`           | MODIFIED lifecycle + dispose | 仅提及「重复 dispose 不重复执行 destroy hooks」；**未**描述 startup failure reverse cleanup；**未**完整定义 dispose 公开契约（no throw） | **Drift** — 需 sync |
| `docs/engineering/error-model.md` | Both requirements            | M1 baseline 未含 `PLUGIN_NAME_DUPLICATE`；未区分 startup cleanup（best-effort destroy）vs normal dispose（fatal abort）                  | **Drift** — 需 sync |
| `docs/architecture/core-api.md`   | Dispose requirement          | L55 仍写明 Command/Event dispose 幂等「不定义 `bootstrapCore` dispose 公开契约」——与 delta / 实现意图相反                                | **Drift** — 需 sync |

**结论：** 实现未偏离 delta spec 所引用的 Docs **意图**；long-lived Docs 尚未更新，不构成 implementation blocker，但 **archive 前必须通过 `aether-workflow-update-docs-spec` 消除 drift**。

## Public Contract Review

| Item                                               | Change                                                          | OpenSpec coverage                      | Compliant |
| -------------------------------------------------- | --------------------------------------------------------------- | -------------------------------------- | --------- |
| `packages/core/src/index.ts` exports               | **无新增**                                                      | design non-goals                       | Yes       |
| `CoreErrorCode` union                              | **+`PLUGIN_NAME_DUPLICATE`**                                    | ADDED requirement + scenario           | Yes       |
| `SUPPORTED_MANIFEST_VERSIONS`                      | **不变** `[1] as const`                                         | design non-goals                       | Yes       |
| `validateUniquePluginNames`                        | 新增于 `manifest.ts` 模块 export，**未**从 `index.ts` re-export | internal validation helper             | Yes       |
| `bootstrapCore` / `CoreBootstrapRuntime` API shape | 无签名变更                                                      | MODIFIED dispose contract (behavioral) | Yes       |
| `package.json` / lockfile                          | 无变更                                                          | —                                      | Yes       |

`CoreErrorCode` 扩展属于已有公开 error taxonomy 的向后兼容增补（新 fatal code），无需 bump manifestVersion 或 major version。

## Boundary Review

- **Core boundary:** 仅 M1 bootstrap validation + lifecycle 行为硬化；Core 仍 business-blind。
- **Plugin contract:** 通过现有 `ExtensionPlugin.manifest` + lifecycle hooks；无新 manifest 字段。
- **Adapter boundary:** 无 Adapter / parser / serializer 代码或依赖变更；`packages/plugins/` diff 为空。
- **Shell boundary:** 无 React/Vue/DOM/Shell 引用。
- **Command/event flow:** M2 `command-event*.ts` zero diff；状态变更仍不经由本 change 引入 Command Bus 路径。
- **M2/M3/M4/M5 scope:** **未误入**
  - M2 Command/Event：未修改
  - M3 Adapter plugins：未修改；workspace plugin tests 仍 PASS
  - M4 Shell / `createEditor`：explicit non-goal；boundary test 仍拒绝 export
  - M5 GFM / 扩展 preset：无引用

## Validation Review

- **Automated checks:** `pnpm core:test` (57), `pnpm typecheck`, `pnpm test` (72), `pnpm check`, `openspec validate harden-core-bootstrap-lifecycle` — 全部 PASS（见 validation.md）。
- **Scope guards:** non-goals rg、command-event diff、plugins diff、docs diff — PASS。
- **Tests weakened:** 否；新增 6+ hardening tests，未删除或 skip 既有断言。

### Accepted deviations

| Item                                  | Rationale                                                                                                                         | Blocker?                         |
| ------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | -------------------------------- |
| Cleanup destroy failure `cause` chain | Delta MAY attach cleanup failures in primary error `cause`; 实现 best-effort continue 且 primary 仍为原始 `LIFECYCLE_HOOK_FAILED` | No — 记录为 optional enhancement |
| Task 07 boundary test path            | `test --run src/package-boundary.test.ts` 路径无效；full suite 已覆盖                                                             | No                               |

## ADR / Deviation Record Assessment

| Question                  | Answer                                                                                                                            |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| 是否需要新 ADR？          | **否**。行为硬化在 M1 bootstrap 边界内；startup cleanup vs normal dispose 不对称已在 OpenSpec design/delta 中说明，非新架构分叉。 |
| 是否需要 deviation 记录？ | **已记录**于 validation.md（cause chain、test path）。本 review 接受上述 deviation。                                              |
| 是否需要 Docs 更新？      | **是** — `manifest.md`、`lifecycle.md`、`error-model.md`、`core-api.md`（archive 前 Step 8）。                                    |
| 是否需要 main spec sync？ | **是** — `openspec/specs/core-bootstrap/spec.md` 尚未合并 delta（typical archive 路径）。                                         |
| 是否需要 glossary 更新？  | **否** — 无新术语；`PLUGIN_NAME_DUPLICATE` 属现有 error taxonomy 扩展。                                                           |

## Blockers

**None** for marking implementation spec-compliant.

**Pre-archive blockers** (workflow, not implementation):

1. Long-lived Docs drift（见上表）
2. Main OpenSpec spec 未 sync

## Required Updates (Before Archive)

- **Docs:** `docs/sdk/manifest.md`（duplicate name fatal）、`docs/sdk/lifecycle.md`（startup cleanup + dispose public contract）、`docs/engineering/error-model.md`（`PLUGIN_NAME_DUPLICATE` + cleanup/dispose 不对称）、`docs/architecture/core-api.md`（bootstrap dispose 公开契约）
- **Specs:** merge delta → `openspec/specs/core-bootstrap/spec.md`
- **ADR:** 不需要
- **Glossary:** 不需要

## Commit Readiness

- **Recommended grouping:** 单 commit 或按 task 02 / 03–04 / 05–06 逻辑分组均可；当前 7 文件均属同一 change scope。
- **PR metadata:** 应引用 OpenSpec change `harden-core-bootstrap-lifecycle`、validation PASS、accepted deviations、Docs sync 为 follow-up。

## Recommendation

- **Compliance verdict:** **PASS with follow-up updates**
- **Archive:** **Do not archive**（用户明确要求）
- **Next skill:** `aether-workflow-update-docs-spec` — sync long-lived Docs 与 main OpenSpec spec，消除 drift 后再考虑 `aether-workflow-archive-change`
