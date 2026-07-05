# Task 05: 实现 createEditor 编排流水线

Change:

- `add-editor-orchestration`

Branch:

- `feat/add-editor-orchestration`

Spec Requirement:

- `editor-orchestration` / ADDED `createEditor public entry is exported from core`（Scenario: createEditor resolves / rejects CoreError）
- `editor-orchestration` / ADDED `Editor lifecycle emits ready and disposed events`（Scenario: ready event fires after startup — ready 部分）
- `editor-orchestration` / ADDED `Markdown initialValue uses Parser adapter`（Scenario: Markdown initialValue uses Parser adapter）

OpenSpec Tasks:

- `openspec/changes/add-editor-orchestration/tasks.md` §2.1–2.5

Source Docs:

- `.superpowers/plans/add-editor-orchestration.md`
- `openspec/changes/add-editor-orchestration/design.md`（Decision 2）
- `docs/architecture/core-api.md`
- `docs/sdk/lifecycle.md`

## 目标

实现 `createEditor(config): Promise<AetherEditor>` 编排：validate → adapter resolve → conflict merge（command only）→ `bootstrapCore` → editor runtime → engine session → emit `ready`；startup 失败 reject `CoreError`；`AetherEditor` skeleton（`dispatch`/`getMarkdown` 可 stub 至 Task 06–07）。

## 范围

- 新增 `editor/create-editor.ts`：`createEditor` 主流程。
- 新增/扩展 `editor/aether-editor.ts`：`AetherEditorImpl` skeleton（`context`、`state`、`on`、`dispose` 最小；`dispatch`/`getMarkdown` stub）。
- 新增 `editor/editor-orchestration.test.ts`（部分场景，完整 rollback 在 Task 07）：
  - mock plugin + mock adapters → `createEditor` resolve + `ready` event。
  - unsupported manifest version → reject `CoreError`。
  - `initialValue: string` 调用 Parser（spy/mock）。
  - `initialValue: AetherDoc` 跳过 Parser。
- 更新 `index.ts`：export `createEditor` 真实实现（替换 Task 01 stub）。
- 集成 Task 02–04 模块；**不**改 `bootstrap.ts` silent provide。

Allowed Files:

- `packages/core/src/editor/create-editor.ts`
- `packages/core/src/editor/aether-editor.ts`
- `packages/core/src/editor/editor-orchestration.test.ts`
- `packages/core/src/index.ts`

Forbidden Files:

- `packages/core/src/bootstrap.ts`（仅调用，不改 silent provide）
- `packages/core/src/capabilities.ts`
- `packages/core/src/command-event-runtime.ts`（可 internal reuse，不改公开语义）
- `packages/core/src/editor/engine-dispatch.ts`（Task 07）
- `packages/core/package.json`（Task 08 devDeps）
- `packages/preset-gfm/**`
- `packages/react/**`
- `docs/**`、`openspec/**`

## TDD 入口（Red → Green → Refactor）

**Red**

1. 写 failing test：mock adapters + minimal manifest → `await createEditor({ plugins })` resolves；listener 收到 `ready`。
2. 写 failing test：`manifestVersion: 99` → reject `CoreError`。
3. 写 failing test：`initialValue: '# Hi\n'` → Parser.parse called。
4. `pnpm core:test` → **FAIL**。

**Green**

5. 实现 createEditor 流水线；AetherEditor skeleton。
6. `pnpm core:test` → orchestration startup tests **PASS**。

**Refactor**

7. 拆分 private helpers（validate / bootstrap / initSession）；保持 create-editor.ts 可读。

TDD Notes:

- 使用 **inline mock adapters**，不 import `@aether-md/preset-gfm`。
- `dispatch` / rollback tests 留给 Task 07。

Validation:

```bash
pnpm core:test
pnpm --filter @aether-md/core exec tsc --noEmit
rg "core:engine|core:parser" packages/core/src/bootstrap.ts packages/core/src/capabilities.ts
```

预期：orchestration startup tests **PASS**；bootstrap 无新增 silent provide。

Intuitive Verification:

- 在 test 中 trace：`createEditor` → `bootstrapCore` → `ready` 事件顺序。

Review Checklist:

- [ ] 仅修改 Allowed Files。
- [ ] async-only `createEditor`；无 sync 入口。
- [ ] startup 失败 reject `CoreError`。
- [ ] explicit adapter wiring（Task 03）。
- [ ] ConflictResolver 仅 command 注册（Task 02）。
- [ ] M2 standalone tests 仍绿。

Rollback Notes:

- 删除 create-editor / aether-editor / orchestration.test；恢复 index stub。

Version Impact:

- `@aether-md/core`：**minor additive**（`createEditor` 行为 export）

Commit Scope:

- `feat(core): implement createEditor orchestration pipeline`

Depends On:

- 01, 02, 03, 04

Parallel Group:

- G2

Barrier:

- false

Status:

- completed

Run Log:

- Red: orchestration startup tests (ready, manifest reject, parser spy)
- Green: `create-editor.ts`, `aether-editor.ts`, conflict-wrapped runtime; `editor-orchestration.test.ts` startup cases PASS
- Validation: `pnpm core:test` PASS; bootstrap/capabilities rg clean

Deviation:

- none

Rollback:

- 见 Rollback Notes
