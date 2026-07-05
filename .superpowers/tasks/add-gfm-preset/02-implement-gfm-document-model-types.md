# Task 02: 确认 GFM document-model types 与 exports

Change:

- `add-gfm-preset`

Branch:

- `feat/add-gfm-preset`

Spec Requirement:

- `document-model` / ADDED `GFM built-in types have structured round-trip coverage`（类型前提）
- `document-model` / MODIFIED `Extended document types are exported without M3 round-trip coverage`
- `document-model` / ADDED `CustomBlock remains outside M4 GFM round-trip matrix`

OpenSpec Tasks:

- `openspec/changes/add-gfm-preset/tasks.md` §1.4（Core 无新引擎依赖，与 types 确认一并验证）

Source Docs:

- `.superpowers/plans/add-gfm-preset.md`
- `openspec/changes/add-gfm-preset/specs/document-model/spec.md`
- `docs/architecture/document-model.md`

## 目标

使 Task 01 GFM document-model contract tests 全绿；确认 `@aether-md/core` 已 export `ListBlock`、`LinkInline`、`MarkedInline`、`CustomBlock` 且 M4 **不**修改 `AetherDoc` public shape（仅必要时最小 export/类型注释对齐）。

## 范围

- 若 Task 01 tests 已绿：确认 `document-model.ts` / `index.ts` exports 完整，**无生产代码变更**（在 Run Log 记录「types pre-exist」）。
- 若 tests FAIL：最小 diff 补 export 或类型字面量（如 `mark: 'strong' | 'emphasis'`），**不**引入 adapter 逻辑。
- **不**修改 adapter packages；**不**扩展 M3 round-trip 要求。

Allowed Files:

- `packages/core/src/document-model.ts`（仅类型面最小对齐）
- `packages/core/src/index.ts`（仅 exports）
- `packages/core/src/document-model.test.ts`（与实现对齐的小修正）

Forbidden Files:

- `packages/core/src/package-boundary.test.ts`
- `packages/core/package.json`（禁止新增 remark/prosemirror/react 依赖）
- `packages/plugins/**`
- `packages/preset-gfm/**`
- `docs/**`、`openspec/**`
- `AGENTS.md` 及其他无关脏文件

## TDD 入口

1. 运行 Task 01 遗留 failing tests。
2. 最小实现/确认 exports → Task 01 全 suite **PASS**。
3. `pnpm core:test` 全绿；M3 既有 document-model tests 不退化。

TDD Notes:

- Green Task 01 tests；预期 M3 已具备 types，本 task 可能为零生产 diff。

Validation:

```bash
pnpm core:test
pnpm --filter @aether-md/core exec tsc --noEmit
rg -i "remark|prosemirror|react|vue|gfm" packages/core/package.json packages/core/src
```

预期：全部 **PASS**；Core 无新 runtime 依赖。

Intuitive Verification:

- 可选：`node -e "import('@aether-md/core').then(m => console.log(Object.keys(m).filter(k=>/List|Link|Marked|Custom/.test(k))))"`

Review Checklist:

- [ ] Task 01 tests 全 PASS。
- [ ] `AetherDoc` public shape 无 breaking change。
- [ ] `CustomBlock` 仍 export 但不在 GFM matrix 测试内。
- [ ] Core `package.json` dependencies 未变。

Rollback Notes:

- 回滚 `document-model.ts` / `index.ts` 本 task 改动。
- Task 01 tests 可保留。

Version Impact:

- `@aether-md/core`：**无 breaking change**；public types additive-only 或不变；`manifestVersion` / lockfile 不变。

Commit Scope:

- `test(core): confirm GFM document-model type exports` 或 `feat(core): align GFM type exports`（若有最小类型 diff）

Status:

- complete

Run Log:

- 2026-07-05: Task started; verifying Task 01 tests and export surface.
- 2026-07-05: Confirmed `document-model.ts` exports `ListBlock`, `LinkInline`, `MarkedInline` (`mark: 'strong' | 'emphasis' | string`), `CustomBlock`; `index.ts` re-exports all four. **Zero production diff** — types pre-exist from M3.
- 2026-07-05: Validation — `pnpm core:test` 60/60 pass; `tsc --noEmit` pass.

Deviation:

- none (zero production diff as expected)
