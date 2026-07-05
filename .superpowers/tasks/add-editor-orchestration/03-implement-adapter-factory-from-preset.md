# Task 03: 实现 preset-shaped adapter wiring

Change:

- `add-editor-orchestration`

Branch:

- `feat/add-editor-orchestration`

Spec Requirement:

- `editor-orchestration` / ADDED `Editor orchestration wires adapters explicitly`（Scenario: adapters are wired without bootstrap silent provide；Scenario: Markdown initialValue uses Parser adapter — wiring 前提）

OpenSpec Tasks:

- `openspec/changes/add-editor-orchestration/tasks.md` §2.2

Source Docs:

- `.superpowers/plans/add-editor-orchestration.md`
- `openspec/changes/add-editor-orchestration/design.md`（Decision 3）
- `docs/engineering/adapter-protocol.md`
- `packages/preset-gfm/src/index.ts`（`GfmPreset` shape 参考）

## 目标

实现从 preset-shaped bundle（`{ manifest, parser, serializer, engine }`）到 wired adapters 的解析；提供 `toExtensionPlugin(preset)` helper；missing adapter → `CoreError`；**不**调用 `bootstrapCore` silent provide。

## 范围

- 新增 `editor/adapter-wiring.ts`：
  - `WiredAdapters` / `ExtensionPluginWithAdapters` 类型（或扩展 `ExtensionPlugin` 的 `adapters?` 字段 — 在本 task 定稿并文档化）。
  - `resolveWiredAdapters(plugins: ExtensionPlugin[]): WiredAdapters`。
  - `toExtensionPluginFromPreset(preset: { manifest, parser, serializer, engine })` helper（名称可微调，tests 固定）。
- 新增 `editor/adapter-wiring.test.ts`：
  - mock preset bundle → 解析出三类 adapter。
  - missing `engine` → throw `CoreError`。
  - 测试使用 inline mock adapters（**不** import `@aether-md/preset-gfm` 生产依赖）。
- **不**实现 `createEditor`；**不**改 `bootstrap.ts` / `capabilities.ts`。

Allowed Files:

- `packages/core/src/editor/adapter-wiring.ts`
- `packages/core/src/editor/adapter-wiring.test.ts`
- `packages/core/src/manifest.ts`（仅当需扩展 `ExtensionPlugin` 类型 — 最小 additive）

Forbidden Files:

- `packages/core/src/bootstrap.ts`
- `packages/core/src/capabilities.ts`
- `packages/core/src/editor/create-editor.ts`
- `packages/core/package.json`（无 devDeps — Task 08）
- `packages/preset-gfm/**`（不修改 preset public API）
- `packages/plugins/**`
- `packages/react/**`
- `docs/**`、`openspec/**`

## TDD 入口（Red → Green → Refactor）

**Red**

1. 写 failing test：给定 mock `{ manifest, parser, serializer, engine }` → `resolveWiredAdapters` 返回三者。
2. 写 failing test：engine 缺失 → `CoreError`。
3. `pnpm core:test` → **FAIL**。

**Green**

4. 实现 resolve + helper；mock adapters 为最小 `{ name, parse/create/serialize/apply/getDocument/dispose }` stubs。
5. `pnpm core:test` → **PASS**。

**Refactor**

6. 明确 `ExtensionPlugin` 扩展形状；添加 JSDoc 说明 preset 消费约定。

TDD Notes:

- 测试 **MUST** 使用 inline mocks，避免 Task 03 引入 preset devDependency。

Validation:

```bash
pnpm core:test
pnpm --filter @aether-md/core exec tsc --noEmit
rg "silent provide|core:engine|core:parser" packages/core/src/editor/adapter-wiring.ts
rg "bootstrapCore" packages/core/src/editor/adapter-wiring.ts
```

预期：adapter-wiring tests **PASS**；wiring 模块不 import/bootstrap silent provide。

Intuitive Verification:

- 阅读 `toExtensionPluginFromPreset` 输出 shape，确认 manifest + adapters 可审查。

Review Checklist:

- [ ] 仅修改 Allowed Files。
- [ ] 三类 adapter 均可 resolve。
- [ ] missing adapter fail-fast `CoreError`。
- [ ] 未改 bootstrap silent provide。
- [ ] 未添加 remark/prosemirror runtime deps。

Rollback Notes:

- 删除 `adapter-wiring.ts`、test；回滚 `manifest.ts` 若扩展了 `ExtensionPlugin`。

Version Impact:

- none（internal wiring；`ExtensionPlugin` 若 additive 字段则为 minor internal）

Commit Scope:

- `feat(core): add explicit adapter wiring from preset-shaped plugins`

Depends On:

- 01

Parallel Group:

- G1

Barrier:

- false

Status:

- completed

Run Log:

- Red: adapter wiring tests (missing engine → CoreError)
- Green: `adapter-wiring.ts` + tests PASS
- Validation: `pnpm core:test` PASS

Deviation:

- Added `EDITOR_ADAPTER_MISSING` to `packages/core/src/errors.ts` (required for wiring error surface; outside Task 03 Allowed Files)

Rollback:

- 见 Rollback Notes
