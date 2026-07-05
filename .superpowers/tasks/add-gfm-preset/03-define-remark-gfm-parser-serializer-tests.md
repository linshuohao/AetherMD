# Task 03: 定义 plugin-remark GFM parser/serializer 失败测试

Change:

- `add-gfm-preset`

Branch:

- `feat/add-gfm-preset`

Spec Requirement:

- `adapter-base` / ADDED `Remark adapters support GFM subset parse and serialize`
- `adapter-base` / MODIFIED `Remark plugin package provides Parser and Serializer adapters`

OpenSpec Tasks:

- `openspec/changes/add-gfm-preset/tasks.md` §2.1–2.2、§2.4–2.5（SerializerError 场景留 Task 09）

Source Docs:

- `.superpowers/plans/add-gfm-preset.md`
- `openspec/changes/add-gfm-preset/specs/adapter-base/spec.md`
- `openspec/changes/add-gfm-preset/design.md`（Decision 3：Parser 宽容、Serializer golden strings）
- `docs/engineering/adapter-protocol.md`
- `docs/adr/003-remark-prosemirror-dual-track.md`

## 目标

在 `@aether-md/plugin-remark` 添加 GFM parse/serialize **失败测试**（red phase）：list/link/strong/emphasis 结构化 parse；serializer golden strings；M3 paragraph/heading 兼容；更新 list 测试（不再降级为 paragraph text）。

## 范围

- **仅添加/更新测试**，不实现 GFM parse/serialize 逻辑。
- `parser.test.ts`：
  - `parse("- item\n")` → `ListBlock`（`ordered: false`）。
  - `parse("1. item\n")` → `ListBlock`（`ordered: true`）。
  - `parse("**bold**")` / `parse("*italic*")` → `MarkedInline`（`mark: 'strong' | 'emphasis'`）。
  - `parse("[label](https://example.com)")` → `LinkInline` matching `href`。
  - 更新既有 list 测试：由 paragraph 降级改为 structured `ListBlock`。
  - 保留未知非 GFM 语法降级场景（不静默丢失）。
- `serializer.test.ts`：
  - GFM fixture `AetherDoc` → golden Markdown：`**`、`*`、`-`/`1.`、`[text](href)`。
  - M3 paragraph/heading 输出形状保持。
- **不含** `CustomBlock` 占位符 / `SerializationError` rejection（Task 09）。

Allowed Files:

- `packages/plugins/plugin-remark/src/parser.test.ts`
- `packages/plugins/plugin-remark/src/serializer.test.ts`

Forbidden Files:

- `packages/plugins/plugin-remark/src/parser.ts`
- `packages/plugins/plugin-remark/src/serializer.ts`
- `packages/plugins/plugin-remark/package.json`（`remark-gfm` 依赖在 Task 04）
- `packages/plugins/plugin-prosemirror/**`
- `packages/core/src/**`
- `packages/preset-gfm/**`
- `docs/**`、`openspec/**`
- `AGENTS.md` 及其他无关脏文件

## TDD 入口

1. 添加上述 parser failing tests → `pnpm --filter @aether-md/plugin-remark test` **FAIL**。
2. 添加 serializer golden string failing tests → 同上 **FAIL**。
3. M3 paragraph/heading tests 应仍 **PASS**（regression guard）。

TDD Notes:

- Red-first：本 task 只写测试；Task 04 实现使 tests 变绿。
- Golden strings 对齐 design Decision 3（见 plan Validation Matrix）。

Validation:

```bash
pnpm --filter @aether-md/plugin-remark test
pnpm --filter @aether-md/plugin-remark exec tsc --noEmit
rg "remark|prosemirror" packages/core/package.json packages/core/src
```

预期：新增 GFM tests **FAIL**；M3 baseline tests **PASS**；Core 无 remark 依赖。

Intuitive Verification:

- 阅读 failing test 输出：parse 结果是否为 paragraph text 而非 `ListBlock`（确认 red 有意义）。

Review Checklist:

- [ ] 仅修改 `*.test.ts`。
- [ ] list 测试已从 M3 降级迁移为 structured parse 期望。
- [ ] 未含 SerializationError / CustomBlock 占位符测试。
- [ ] golden string 断言与 plan 表一致。

Rollback Notes:

- 删除/恢复本 task 新增或修改的 test cases。

Version Impact:

- none（仅测试）

Commit Scope:

- `test(plugin-remark): add failing GFM parser and serializer tests`

Status:

- complete

Run Log:

- 2026-07-05: Task started; adding GFM parser/serializer failing tests.
- 2026-07-05: Added 5 parser GFM tests + updated list test; added 6 serializer golden string tests.
- 2026-07-05: Validation — 11 GFM tests FAIL (expected red); 7 M3 baseline PASS; tsc pass.

Deviation:

- none
