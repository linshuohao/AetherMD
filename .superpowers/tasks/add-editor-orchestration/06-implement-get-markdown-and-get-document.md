# Task 06: 实现 getDocument 与 getMarkdown（lazy serialize）

Change:

- `add-editor-orchestration`

Branch:

- `feat/add-editor-orchestration`

Spec Requirement:

- `editor-orchestration` / ADDED `AetherEditor exposes host document and lifecycle APIs`（Scenario: getDocument returns core-visible snapshot；Scenario: getMarkdown serializes current document）

OpenSpec Tasks:

- `openspec/changes/add-editor-orchestration/tasks.md` §3.3（getDocument/getMarkdown 部分）

Source Docs:

- `.superpowers/plans/add-editor-orchestration.md`
- `openspec/changes/add-editor-orchestration/design.md`（Decision 6、Open Questions: lazy getMarkdown）
- `docs/architecture/core-api.md`

## 目标

在 `AetherEditor` 实现宿主级 `getDocument(): AetherDoc` 与 `getMarkdown(): Promise<string>`；`getDocument` 返回 orchestration 可见只读快照；`getMarkdown` **lazy** 调用 Serializer（不在每次 `change` eager serialize）。

## 范围

- 修改 `editor/aether-editor.ts`：实现 `getDocument` / `getMarkdown`；更新 `state.doc` 与内部快照同步。
- 扩展 `editor/editor-orchestration.test.ts` 或新增 `editor/aether-editor.test.ts`：
  - running editor → `getDocument()` 匹配 init doc。
  - `getMarkdown()` 调用 Serializer exactly when invoked（spy；change 后不自动 serialize）。
  - 宿主 `getDocument` 语义独立于 `EngineAdapter.getDocument(session)`（注释/测试名区分）。
- **不**实现 `dispatch` rollback（Task 07）。
- **不**添加 integration preset test（Task 08）。

Allowed Files:

- `packages/core/src/editor/aether-editor.ts`
- `packages/core/src/editor/aether-editor.test.ts`（若新建）
- `packages/core/src/editor/editor-orchestration.test.ts`（扩展 getDocument/getMarkdown cases）

Forbidden Files:

- `packages/core/src/editor/engine-dispatch.ts`
- `packages/core/src/editor/create-editor-gfm.integration.test.ts`
- `packages/core/package.json`
- `packages/preset-gfm/**`
- `packages/react/**`
- `packages/core/src/command-event-runtime.ts`
- `docs/**`、`openspec/**`

## TDD 入口（Red → Green → Refactor）

**Red**

1. 写 failing test：`createEditor` + mock adapters → `editor.getDocument()` equals parsed initial doc。
2. 写 failing test：emit mock change **without** calling getMarkdown → Serializer.serialize call count 0；调用 `getMarkdown()` 后 count 1。
3. `pnpm core:test` → **FAIL**。

**Green**

4. 实现 snapshot 持有与 lazy serialize。
5. `pnpm core:test` → **PASS**。

**Refactor**

6. 提取 serialize helper；避免 duplicate doc copy logic。

TDD Notes:

- 依赖 Task 05 的 `createEditor` + mock adapters。
- 建议在 Task 06 完成后再跑 Task 07 dispatch tests。

Validation:

```bash
pnpm core:test
pnpm --filter @aether-md/core exec tsc --noEmit
```

预期：getDocument/getMarkdown tests **PASS**。

Intuitive Verification:

- 阅读 lazy serialize spy test，确认 change 不触发 eager Markdown 生成。

Review Checklist:

- [ ] 仅修改 Allowed Files。
- [ ] getDocument 返回宿主快照。
- [ ] getMarkdown lazy on call。
- [ ] 无 store API。
- [ ] 未改 M2 runtime 公开语义。

Rollback Notes:

- 回滚 aether-editor 中 getDocument/getMarkdown 实现与相关 tests。

Version Impact:

- none（行为完善，export 面已在 Task 01/05）

Commit Scope:

- `feat(core): implement host getDocument and lazy getMarkdown on AetherEditor`

Depends On:

- 05

Parallel Group:

- G3

Barrier:

- false

Status:

- completed

Run Log:

- Red: getDocument + lazy getMarkdown spy tests
- Green: `AetherEditorImpl.getDocument/getMarkdown` + tests PASS
- Validation: `pnpm core:test` PASS

Deviation:

- none

Rollback:

- 见 Rollback Notes
