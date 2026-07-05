# Task 08: 定义 cross-package GFM round-trip 失败测试

Change:

- `add-gfm-preset`

Branch:

- `feat/add-gfm-preset`

Spec Requirement:

- `gfm-preset` / ADDED `GFM preset owns GFM round-trip integration test matrix`
- `adapter-base` / ADDED `GFM Markdown round-trip is verified across adapter packages`
- `adapter-base` / MODIFIED `M3 minimal Markdown round-trip is verified`
- `document-model` / ADDED `GFM built-in types have structured round-trip coverage`（integration 验收）

OpenSpec Tasks:

- `openspec/changes/add-gfm-preset/tasks.md` §4.1–4.4

Source Docs:

- `.superpowers/plans/add-gfm-preset.md`
- `openspec/changes/add-gfm-preset/specs/gfm-preset/spec.md`
- `openspec/changes/add-gfm-preset/specs/adapter-base/spec.md`
- `docs/engineering/test-strategy.md`
- `docs/engineering/data-flow.md`
- `docs/adr/003-remark-prosemirror-dual-track.md`

## 目标

在 `@aether-md/preset-gfm` 添加六类 GFM round-trip **失败 integration tests**：parse → `EngineAdapter.apply`（`replaceText`）→ serialize → golden Markdown；确认 M3 paragraph/heading regression；断言无 `createEditor` / `bootstrapCore` / React import。

## 范围

- **仅添加测试**（及 preset 内最小 test helpers/wiring stubs）；不修复 adapter 缺口（若 FAIL 由 Task 04/06/07 未绿导致，先完成前置 tasks）。
- `packages/preset-gfm/src/round-trip.test.ts`（或等价）：
  - 六类语法 matrix：paragraph、heading、strong、emphasis、unordered list、ordered list、link。
  - 每样例 full pipeline + golden string 断言（design Decision 3）。
  - Ordered list 建议至少 2 items single-level。
- Import guard：测试文件不静态 import `createEditor`、`bootstrapCore`、`@aether-md/react`。
- 确认 `packages/plugins/plugin-prosemirror/src/round-trip.test.ts` M3 tests 仍 **PASS**（只读 regression，本 task 不改其生产路径）。
- **不含** `CustomBlock` structured round-trip（Task 09 占位符）；**不含** SerializationError rejection tests。

Allowed Files:

- `packages/preset-gfm/src/round-trip.test.ts`
- `packages/preset-gfm/src/**/*test*.ts`（helpers/fixtures）
- `packages/preset-gfm/src/index.ts`、`packages/preset-gfm/src/manifest.ts`（**仅** green phase 最小 factory wiring，使 integration tests PASS）
- `packages/preset-gfm/package.json`（test devDeps 若需）

Forbidden Files:

- `packages/plugins/plugin-remark/src/**`（除非 integration 暴露 bug 且需最小 fix——优先单独 task）
- `packages/plugins/plugin-prosemirror/src/**`（同上）
- `packages/core/src/**`
- `docs/**`、`openspec/**`
- 任何 `createEditor` 实现
- `AGENTS.md` 及其他无关脏文件

## TDD 入口

1. 写六类 GFM integration failing tests → `pnpm --filter @aether-md/preset-gfm test` **FAIL**（若 adapters 已绿则可能部分 PASS，以 matrix 全覆盖为准）。
2. 写 import guard 断言。
3. `pnpm --filter @aether-md/plugin-prosemirror test` → M3 `round-trip.test.ts` **PASS**。

TDD Notes:

- Red-first integration matrix；实现 wiring 使 tests 变绿可在本 task 末尾或视为 green phase（若 tests 添加后立即修复 preset factory wiring 使 PASS，记录于 Run Log）。
- 若 Task 04/06/07 已完成，本 task 可能 red→green 同窗完成；仍保持「先写 failing assertions」顺序。

Validation:

```bash
pnpm --filter @aether-md/preset-gfm test
pnpm --filter @aether-md/plugin-prosemirror test
pnpm test
rg "createEditor|bootstrapCore|@aether-md/react|AetherEditor" packages/preset-gfm/src packages/plugins/plugin-prosemirror/src
```

预期：preset integration tests **FAIL** 或逐步 **PASS**；M3 round-trip **PASS**；无 editor/shell import。

Intuitive Verification:

- 可选：log 每样例最终 Markdown 供 golden string review。

Review Checklist:

- [ ] 六类 GFM matrix tests 存在。
- [ ] pipeline 不依赖 `createEditor` / React。
- [ ] `CustomBlock` 未纳入 matrix。
- [ ] M3 paragraph/heading regression 仍绿。

Rollback Notes:

- 删除 `round-trip.test.ts` 及 helpers。

Version Impact:

- none（测试 + preset 内 wiring；无新 public API beyond Task 07 factory）

Commit Scope:

- `test(preset-gfm): add GFM cross-package round-trip integration tests`

Status:

- complete

Run Log:

- 2026-07-05: Task started; adding GFM cross-package round-trip integration tests.
- 2026-07-05: Added round-trip.test.ts with 7 matrix cases + import guard.
- 2026-07-05: Validation — preset 12/12 pass; prosemirror M3 round-trip pass. Adapters pre-green from Task 04/06/07.

Deviation:

- Integration tests passed on first run (prerequisites complete); matrix assertions written before verification per TDD Notes.
