# Task 04: 实现 plugin-remark GFM parser/serializer

Change:

- `add-gfm-preset`

Branch:

- `feat/add-gfm-preset`

Spec Requirement:

- `adapter-base` / ADDED `Remark adapters support GFM subset parse and serialize`
- `adapter-base` / MODIFIED `Remark plugin package provides Parser and Serializer adapters`

OpenSpec Tasks:

- `openspec/changes/add-gfm-preset/tasks.md` §2.1–2.2、§2.4

Source Docs:

- `.superpowers/plans/add-gfm-preset.md`
- `openspec/changes/add-gfm-preset/specs/adapter-base/spec.md`
- `openspec/changes/add-gfm-preset/design.md`
- `docs/engineering/adapter-protocol.md`
- `docs/adr/003-remark-prosemirror-dual-track.md`

## 目标

实现 `@aether-md/plugin-remark` GFM parse/serialize，使 Task 03 全部 tests 变绿；引入 `remark-gfm`（或等价）；Parser 宽容、Serializer 固定 golden strings。

## 范围

- `package.json`：添加 `remark-gfm` runtime dependency。
- `parser.ts`：映射 list/link/strong/emphasis → structured `AetherDoc`；未知非 GFM 语法仍降级 paragraph/text。
- `serializer.ts`：GFM 六类 + M3 paragraph/heading 确定性输出。
- 微调 `parser.test.ts` / `serializer.test.ts` 与实现对齐（最小 diff）。
- **不**实现 `SerializationError` / `CustomBlock` 占位符（Task 09）。

Allowed Files:

- `packages/plugins/plugin-remark/src/parser.ts`
- `packages/plugins/plugin-remark/src/serializer.ts`
- `packages/plugins/plugin-remark/src/parser.test.ts`（对齐小改）
- `packages/plugins/plugin-remark/src/serializer.test.ts`（对齐小改）
- `packages/plugins/plugin-remark/package.json`
- `pnpm-lock.yaml`

Forbidden Files:

- `packages/plugins/plugin-prosemirror/**`
- `packages/core/src/**`、`packages/core/package.json`
- `packages/preset-gfm/**`
- `docs/**`、`openspec/**`
- `AGENTS.md` 及其他无关脏文件

## TDD 入口

1. 运行 Task 03 failing tests → 确认 **FAIL**。
2. 引入 `remark-gfm` + 实现 parser/serializer 最小路径。
3. `pnpm --filter @aether-md/plugin-remark test` → **PASS**（含 M3 regression）。

TDD Notes:

- Green Task 03 tests；Parser 接受 `*`/`_` 变体，Serializer 断言固定 golden。

Validation:

```bash
pnpm --filter @aether-md/plugin-remark test
pnpm --filter @aether-md/plugin-remark exec tsc --noEmit
rg "remark|prosemirror" packages/core/package.json packages/core/src
```

预期：plugin-remark 全 tests **PASS**；Core 无 remark 依赖。

Intuitive Verification:

- 可选：对 GFM fixture 运行 `JSON.stringify(parse(...))` 确认 structured nodes。

Review Checklist:

- [ ] Task 03 GFM tests 全 PASS。
- [ ] M3 paragraph/heading parse/serialize 不退化。
- [ ] list 不再静默降级为 plain paragraph（GFM fixtures）。
- [ ] Core 未添加 remark 依赖。
- [ ] 未实现 SerializationError 分支。

Rollback Notes:

- 回滚 `parser.ts`、`serializer.ts`、`package.json`、`pnpm-lock.yaml` 本 task 改动。
- Task 03 tests 将再次 FAIL。

Version Impact:

- `@aether-md/plugin-remark`：**minor-level behavior extension**（GFM 子集）
- `pnpm-lock.yaml`：预期变更（`remark-gfm`）
- `manifestVersion` / Core：**不变**

Commit Scope:

- `feat(plugin-remark): add GFM subset parse and serialize`

Status:

- complete

Run Log:

- 2026-07-05: Task started; implementing GFM parse/serialize with remark-gfm.
- 2026-07-05: Added `remark-gfm`; implemented list/link/strong/emphasis in parser and golden strings in serializer.
- 2026-07-05: Validation — `pnpm --filter @aether-md/plugin-remark test` 18/18 pass.

Deviation:

- none
