# Task 01: 定义 GFM document-model contract 测试

Change:

- `add-gfm-preset`

Branch:

- `feat/add-gfm-preset`

Spec Requirement:

- `document-model` / ADDED `GFM built-in types have structured round-trip coverage`（类型前提；round-trip 在 Task 08）
- `document-model` / MODIFIED `Extended document types are exported without M3 round-trip coverage`
- `document-model` / ADDED `CustomBlock remains outside M4 GFM round-trip matrix`

OpenSpec Tasks:

- `openspec/changes/add-gfm-preset/tasks.md` §1 类型前提（implicit via document-model spec）

Source Docs:

- `.superpowers/plans/add-gfm-preset.md`
- `openspec/changes/add-gfm-preset/specs/document-model/spec.md`
- `docs/architecture/document-model.md`
- `docs/engineering/test-strategy.md`

## 目标

在 `@aether-md/core` 添加 GFM 类型 contract tests：确认 `ListBlock`、`LinkInline`、`MarkedInline`（`mark: 'strong' | 'emphasis'`）、`CustomBlock` 已 export；样例 GFM `AetherDoc` JSON 可序列化；`CustomBlock` 与 GFM round-trip matrix 分离。

## 范围

- **仅添加测试**，不修改 `document-model.ts` 生产类型（M4 预期 public shape 不变）。
- 新增/扩展 `document-model.test.ts`：
  - import smoke：`ListBlock`、`LinkInline`、`MarkedInline`、`CustomBlock` 从 package entry 可导入。
  - GFM fixture `AetherDoc`（含 list/link/strong/emphasis）`JSON.stringify` 成功，无 function/DOM。
  - `CustomBlock` 可构造，但 fixture 注释/分离表明 **不** 纳入 GFM six-syntax round-trip matrix。
- **不**实现 adapter parse/serialize；**不**修改 `package-boundary.test.ts`。

Allowed Files:

- `packages/core/src/document-model.test.ts`

Forbidden Files:

- `packages/core/src/document-model.ts`（生产类型）
- `packages/core/src/index.ts`
- `packages/core/src/package-boundary.test.ts`
- `packages/plugins/**`
- `packages/preset-gfm/**`
- `docs/**`、`openspec/**`
- `AGENTS.md` 及其他无关脏文件

## TDD 入口

1. 写失败测试：从 `@aether-md/core` 导入 GFM 扩展 types（若 export 已存在则 shape 断言可能立即 PASS，但 GFM fixture 测试应新增）。
2. 写失败测试：构造含 `ListBlock`（ordered/unordered）、`LinkInline`、`MarkedInline`（strong/emphasis）的 `AetherDoc`，`JSON.stringify` 断言结构纯净。
3. 写测试/注释：`CustomBlock` fixture 存在但与 GFM matrix fixtures 分文件或分 describe。
4. 运行 `pnpm core:test` → 新增 GFM fixture 测试 **FAIL**（若 types 缺失）或 **PASS**（若仅补测试且 types 已就绪）；Task 02 负责确认生产面与测试对齐。

TDD Notes:

- Red-first：本 task 以 contract tests 为入口；若 M3 已 export types，duplicate import test 可 PASS，GFM JSON shape tests 为新增覆盖。
- Task 02 负责任何必要的最小 export/类型对齐（预期无 breaking change）。

Validation:

```bash
pnpm core:test
pnpm --filter @aether-md/core exec tsc --noEmit
rg -i "remark|prosemirror|react|vue|gfm" packages/core/package.json packages/core/src
```

预期：core tests 通过或新增 tests 按 red 预期 FAIL；Core 无 remark/prosemirror/react 依赖。

Intuitive Verification:

- 阅读 GFM fixture JSON：确认无引擎私有字段、无 function 值。

Review Checklist:

- [ ] 仅修改 `document-model.test.ts`。
- [ ] 测试绑定 document-model delta spec 三 requirement。
- [ ] `CustomBlock` 未混入 GFM six-syntax matrix fixtures。
- [ ] 未 touch plugin packages 或 preset。

Rollback Notes:

- 删除本 task 新增的 describe / test cases 即可回滚。

Version Impact:

- none（仅测试；`@aether-md/core` public types 不变）

Commit Scope:

- `test(core): add GFM document-model contract tests`

Status:

- complete

Run Log:

- 2026-07-05: Task started on branch `feat/add-gfm-preset`.
- 2026-07-05: Added GFM export smoke, GFM fixture JSON serialization, and separate CustomBlock describe to `document-model.test.ts`.
- 2026-07-05: Validation — `pnpm core:test` 60/60 pass; `tsc --noEmit` pass; boundary rg clean (test-only gfm mentions).

Deviation:

- TDD: GFM types already exported from M3; new contract tests passed on first run (expected per task TDD Notes). No production code changes required.
