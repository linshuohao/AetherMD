# Task 03: 建立 plugin-remark 包并实现最小 ParserAdapter

Change:

- `add-adapter-base`

Spec Requirement:

- `Remark plugin package provides Parser and Serializer adapters`（本 task 仅 **Parser** 路径）
- `Adapter packages participate in workspace verification`（package scaffold + scripts）

Source Docs:

- `.superpowers/plans/add-adapter-base.md`
- `openspec/changes/add-adapter-base/design.md`
- `openspec/changes/add-adapter-base/specs/adapter-base/spec.md`
- `docs/architecture/package-layout.md`
- `docs/engineering/adapter-protocol.md`
- `docs/adr/003-remark-prosemirror-dual-track.md`

## 目标

建立 `@aether-md/plugin-remark` workspace package，实现最小 `ParserAdapter.parse`，将 M3 样例 Markdown（paragraph、heading+paragraph）转为框架无关 `AetherDoc`；未知语法降级为 paragraph/text，不静默丢失。

## 范围

- 新建 `packages/plugins/plugin-remark/`：`package.json`、`tsconfig`、scripts（`build` / `typecheck` / `test`）。
- 依赖：`@aether-md/core`（workspace）+ Remark 生态（仅本 package）。
- 实现 `ParserAdapter` factory 与 `parse(markdown, schema)`。
- 新增 parser contract tests（paragraph、`## Title\n\nBody\n`、未知语法降级）。
- **不**实现 `SerializerAdapter`（Task 04）。
- **不**修改 `@aether-md/core` 生产依赖（除只读使用 exported types）。

Allowed Files:

- `packages/plugins/plugin-remark/**`
- `pnpm-lock.yaml`（Remark 依赖锁定）
- `pnpm-workspace.yaml`（仅当必须显式注册；通常已含 `packages/plugins/*`）

Forbidden Files:

- `packages/core/src/**`（本 task 不改 Core 实现）
- `packages/plugins/plugin-prosemirror/**`
- `packages/react/**`、`packages/preset-gfm/**`
- `packages/core/package.json`（禁止向 Core 添加 remark 依赖）
- `docs/**`、`openspec/**`
- `AGENTS.md` 及其他无关脏文件

## TDD 入口

1. 建立 package 后，在 `parser.test.ts` 写失败测试：`parse("Hello world\n", { version: 1 })` → `AetherDoc` 含 paragraph + `TextInline`。
2. 失败测试：`parse("## Title\n\nBody\n", schema)` → heading(level 2) + paragraph。
3. 失败测试：含无法识别语法的 Markdown 仍产出 paragraph/text，不返回空 doc。
4. 运行 `pnpm --filter @aether-md/plugin-remark test` → FAIL → 实现 parser → PASS。

TDD Notes:

- red-green：先 parser contract tests，再 Remark 实现。
- `AetherSchema` 使用 `{ version: 1 }` 占位。

Implementation Notes:

- Parser **MUST** 返回纯 JSON 可序列化 `AetherDoc`。
- 本 task 不测 serialize、不测 round-trip、不测 ProseMirror。
- package `exports` / types 入口按 `component-library-governance.md` 建立。

## 验证命令

```bash
pnpm --filter @aether-md/plugin-remark test
pnpm --filter @aether-md/plugin-remark exec tsc --noEmit
rg "remark|prosemirror" packages/core/package.json packages/core/src
```

预期：plugin-remark tests 通过；Core 仍无 remark/prosemirror dependency。

Intuitive Verification:

- 可选：在测试中 `JSON.stringify(parse(...))` 目视确认无 `[object Object]` 引擎泄漏。

Review Checklist:

- [ ] `@aether-md/plugin-remark` 可 build/typecheck/test。
- [ ] `ParserAdapter.parse` 覆盖 M3 paragraph + heading 样例。
- [ ] 未知语法降级，不静默丢弃。
- [ ] Core 未添加 remark 依赖。
- [ ] 未实现 Serializer（留给 Task 04）。

Rollback Notes:

- 删除 `packages/plugins/plugin-remark/` 目录。
- 回滚 `pnpm-lock.yaml` 中本 task 引入的 Remark 依赖变更。

Version Impact:

- 新建 `@aether-md/plugin-remark`（`0.0.0`）；`pnpm-lock.yaml` 变更；Core / `manifestVersion` 不变。

Commit Scope:

- `feat(plugin-remark): add workspace package and minimal ParserAdapter`

Status:

- complete

Run Log:

- 2026-07-05: Scaffolded @aether-md/plugin-remark; parser contract tests red→green; 4 tests PASS.

Deviation:

- Unknown syntax degrades via mdast JSON stringify to paragraph text (M3 acceptable).
