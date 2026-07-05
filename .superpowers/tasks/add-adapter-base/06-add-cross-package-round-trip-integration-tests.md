# Task 06: 跨包 round-trip 集成测试（parse → apply → serialize）

Change:

- `add-adapter-base`

Spec Requirement:

- `M3 minimal Markdown round-trip is verified`
- `Paragraph round-trip through parse edit serialize`
- `Heading and paragraph round-trip is supported`

Source Docs:

- `.superpowers/plans/add-adapter-base.md`
- `openspec/changes/add-adapter-base/specs/adapter-base/spec.md`
- `openspec/changes/add-adapter-base/tasks.md`（§5.1–5.3）
- `docs/engineering/mvp-implementation-plan.md`
- `docs/engineering/test-strategy.md`
- `docs/engineering/data-flow.md`

## 目标

在 `@aether-md/plugin-prosemirror` 添加 integration tests，显式 wiring `@aether-md/plugin-remark` parser/serializer 与 `EngineAdapter`：Markdown → parse → apply(edit) → serialize → 可预测 Markdown。覆盖 M3 两样例；**不**使用 `createEditor` / `bootstrapCore` / React。

## 范围

- 在 `plugin-prosemirror` 添加 `devDependency`：`@aether-md/plugin-remark`（仅测试/integration 路径）。
- Integration tests：
  1. `"Hello world\n"` → parse → apply（M3 最小编辑命令，与 Task 05 一致）→ serialize → 断言最终 Markdown。
  2. `"## Title\n\nBody\n"` → 同上。
- 断言测试文件 **不** import `createEditor`、`bootstrapCore` adapter wiring、`react`。
- **不**扩展 GFM 语法矩阵；**不**修改 Core Command Bus。

Allowed Files:

- `packages/plugins/plugin-prosemirror/src/**/*round-trip*.test.ts`（或等价 integration test 路径）
- `packages/plugins/plugin-prosemirror/package.json`（`devDependencies` 增加 `@aether-md/plugin-remark`）
- `pnpm-lock.yaml`

Forbidden Files:

- `packages/core/src/**`
- `packages/plugins/plugin-remark/src/**`（除非修复 serialize/parser bug 且最小 diff；优先在 remark 包单独 task 修复）
- `packages/react/**`、`packages/preset-gfm/**`
- 任何 `createEditor` / `AetherEditor` 实现文件
- `docs/**`、`openspec/**`
- `AGENTS.md` 及其他无关脏文件

## TDD 入口

1. 写失败 integration test：paragraph 样例 full pipeline → 预期 Markdown（含 apply 后的文本变化）。
2. 写失败 integration test：heading + paragraph 样例 full pipeline。
3. 写断言：integration 模块未静态 import `createEditor` / `bootstrapCore` / `react`（可用 boundary-style 字符串 guard 或 import 列表审查记录在 Run Log）。
4. `pnpm --filter @aether-md/plugin-prosemirror test` → FAIL → wiring + 对齐 edit 命令 → PASS。

TDD Notes:

- red-green：integration tests 是 M3 验收核心；先失败 pipeline，再修 remark/prosemirror 对齐。
- remark package **生产依赖方向**仍为 remark → core；prosemirror → core；prosemirror **devDep** remark 仅用于测试。

Implementation Notes:

- Round-trip 编排留在 plugin 测试层，不在 Core 隐藏 helper。
- 最终 Markdown 断言应稳定、可重复（trim/normalize 策略在测试中明示）。
- 若 parser/serializer 需微调以配合 PM doc 形状，最小 diff 并记录在 Deviation。

## 验证命令

```bash
pnpm --filter @aether-md/plugin-prosemirror test
pnpm --filter @aether-md/plugin-remark test
rg "createEditor|bootstrapCore|@aether-md/react|AetherEditor" packages/plugins/plugin-prosemirror/src
```

预期：prosemirror tests 含 integration 全绿；无 editor/shell wiring import。

Intuitive Verification:

- 可选：在 integration test 中 log 最终 Markdown 字符串供 review（不替代断言）。

Review Checklist:

- [ ] 两样例 round-trip 通过。
- [ ] pipeline 不依赖 `createEditor` / React / GFM preset。
- [ ] 未修改 `createCommandEventRuntime` 或 bootstrap Adapter 加载。
- [ ] M3 测试矩阵未扩展到 list/link/mark。
- [ ] Task 03–05 既有 tests 仍绿。

Rollback Notes:

- 删除 integration test 文件与 `devDependency` on `@aether-md/plugin-remark`。
- 回滚因 round-trip 对 remark/prosemirror 的最小 bugfix commits（若有）。

Version Impact:

- none（无新 public API；可能 lockfile devDependency 微调）

Commit Scope:

- `test(plugin-prosemirror): add cross-package markdown round-trip integration`

Status:

- complete

Run Log:

- 2026-07-05: Added round-trip.test.ts + devDep plugin-remark; 3 integration tests PASS (8 total prosemirror).

Deviation:

- Import guard checks import lines only (test description contains forbidden strings).
