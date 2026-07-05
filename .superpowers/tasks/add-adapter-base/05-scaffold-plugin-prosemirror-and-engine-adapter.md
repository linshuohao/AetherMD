# Task 05: 建立 plugin-prosemirror 包并实现 EngineAdapter session/apply

Change:

- `add-adapter-base`

Spec Requirement:

- `ProseMirror plugin package provides Engine adapter`
- `Engine adapter creates editable session`
- `Successful apply returns updated document snapshot`
- `Failed apply does not corrupt visible document snapshot`
- `Engine session can be disposed safely`
- `Adapter failure uses AdapterError shape`

Source Docs:

- `.superpowers/plans/add-adapter-base.md`
- `openspec/changes/add-adapter-base/design.md`
- `openspec/changes/add-adapter-base/specs/adapter-base/spec.md`
- `docs/engineering/adapter-protocol.md`
- `docs/engineering/error-model.md`
- `docs/adr/003-remark-prosemirror-dual-track.md`

## 目标

建立 `@aether-md/plugin-prosemirror`，实现 `EngineAdapter` 的 `create` / `getDocument` / `apply` / `dispose`；至少一种 M3 最小编辑 `AdapterCommandRequest`（如 `replaceText`）；失败 `apply` 返回 `AdapterError` 且不污染 apply 前快照。

## 范围

- 新建 `packages/plugins/plugin-prosemirror/`：package scaffold + ProseMirror 依赖（仅本 package）。
- 实现 `EngineAdapter` factory。
- Contract tests：
  - `create(initialDoc)` → session；`getDocument` 等价初始快照（M3 fixtures）。
  - 成功 `apply` → `{ ok: true, doc }` 反映编辑。
  - 失败 `apply` → `{ ok: false, error: AdapterError }`；`getDocument` 仍为 apply 前快照。
  - `dispose` + 重复 dispose 可测行为。
  - Adapter 内部 throw → 转换为 `AdapterError`，不向 harness 抛出。
- **不**添加 cross-package round-trip（Task 06）。
- **不**修改 Command Bus / `bootstrapCore`。

Allowed Files:

- `packages/plugins/plugin-prosemirror/**`
- `pnpm-lock.yaml`（ProseMirror 依赖）

Forbidden Files:

- `packages/core/src/**`（不改 Core 实现）
- `packages/plugins/plugin-remark/**`（本 task 不 devDep remark；round-trip 在 Task 06）
- `packages/react/**`、`packages/preset-gfm/**`
- `packages/core/package.json`
- `docs/**`、`openspec/**`
- `AGENTS.md` 及其他无关脏文件

## TDD 入口

1. 建立 package 后，写失败测试：`EngineAdapter.create(paragraphDoc)` → session + `getDocument` 等价输入。
2. 失败测试：成功 `apply({ type: 'replaceText', ... })` → `ok: true` 且 text 变化。
3. 失败测试：故意失败 `apply` → `ok: false` + `AdapterError`；`getDocument` 不变。
4. 失败测试：`dispose` 后重复 dispose 不抛或未捕获异常。
5. `pnpm --filter @aether-md/plugin-prosemirror test` → FAIL → 实现 → PASS。

TDD Notes:

- red-green：engine contract tests 使用 hand-built `AetherDoc`（来自 `@aether-md/core` types）。
- M3 固定一种 edit 命令 vocabulary；不在本 task 扩展完整 command 集。

Implementation Notes:

- `EngineSession` 为 opaque handle；测试不读取 PM 内部 state。
- ProseMirror ↔ `AetherDoc` 转换逻辑封装在本 package 内。
- 不 emit `transactionFailed`；不集成 `createCommandEventRuntime`。

## 验证命令

```bash
pnpm --filter @aether-md/plugin-prosemirror test
pnpm --filter @aether-md/plugin-prosemirror exec tsc --noEmit
pnpm --filter @aether-md/plugin-prosemirror build
rg "prosemirror|remark" packages/core/package.json packages/core/src
```

预期：plugin-prosemirror tests 通过；Core 无 prosemirror/remark dependency。

Intuitive Verification:

- 无（contract tests 覆盖 snapshot 与 error 形状）。

Review Checklist:

- [ ] `EngineAdapter` create/apply/getDocument/dispose 契约满足 OpenSpec scenarios。
- [ ] 失败 apply 不污染可见快照。
- [ ] `AdapterError` 形状正确；无 uncaught throw。
- [ ] 未添加 round-trip integration test。
- [ ] Core 未依赖 ProseMirror。

Rollback Notes:

- 删除 `packages/plugins/plugin-prosemirror/` 目录。
- 回滚 lockfile 中 PM 相关条目。

Version Impact:

- 新建 `@aether-md/plugin-prosemirror`（`0.0.0`）；lockfile 变更；Core / `manifestVersion` 不变。

Commit Scope:

- `feat(plugin-prosemirror): add EngineAdapter with apply and failure snapshots`

Status:

- complete

Run Log:

- 2026-07-05: Scaffolded @aether-md/plugin-prosemirror; engine contract tests 5/5 PASS.

Deviation:

- Session state stored in internal Map keyed by session.id (EngineSession remains opaque).
