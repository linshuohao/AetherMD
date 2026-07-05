# Task 01: 定义 editor 公开 API 与 package-boundary contract 测试

Change:

- `add-editor-orchestration`

Branch:

- `feat/add-editor-orchestration`

Spec Requirement:

- `editor-orchestration` / ADDED `createEditor public entry is exported from core`（Scenario: createEditor resolves AetherEditor on successful startup — export 前提）
- `editor-orchestration` / ADDED `EditorStateSnapshot is read-only without Core store`（Scenario: state exposes snapshot fields only）
- `editor-orchestration` / ADDED `createEditor accepts async-only entry`（Scenario: no sync lightweight entry）
- `core-bootstrap` / MODIFIED `Minimal Core package exists`（Scenario: MAY expose createEditor / AetherEditor / EditorContext）

OpenSpec Tasks:

- `openspec/changes/add-editor-orchestration/tasks.md` §1.1–1.2

Source Docs:

- `.superpowers/plans/add-editor-orchestration.md`
- `openspec/changes/add-editor-orchestration/specs/editor-orchestration/spec.md`
- `openspec/changes/add-editor-orchestration/specs/core-bootstrap/spec.md`
- `docs/architecture/core-api.md`（Phase 0 冻结决策）

## 目标

翻转 M4 package-boundary：**允许** `createEditor` export；定义 `EditorConfig` / `AetherEditor` / `EditorStateSnapshot` 公开类型；提供最小 stub `createEditor`（可 reject `CoreError('NOT_IMPLEMENTED')`）；**继续禁止** Shell / GFM preset re-export / store API。

## 范围

- 新增 `packages/core/src/editor/types.ts`：`EditorConfig`、`AetherEditor` 接口、`EditorStateSnapshot`（`doc` + `readOnly`）、`EditorSecurityConfig`；**无** `subscribe` / store。
- 更新 `package-boundary.test.ts`：
  - **Red 入口**：将 `createEditor` assert 从 `false` 改为 `true`。
  - 新增 assert：`createEditorSync` / `createEditorLite` **不存在**。
  - 保持 assert：`createGfmPreset`、`ReactEditor`、`EditorContext` class export（若仅 type export 则按实现定形）、preset 不在 exports。
- 更新 `index.ts`：export 类型 + stub `createEditor`（throw 或 reject，implementation 在 Task 05）。
- 可选：`editor/types.test.ts` — `EditorStateSnapshot` shape smoke（无 store 方法）。
- **不**实现完整 orchestration；**不**改 `bootstrap.ts` / `command-event-runtime.ts`。

Allowed Files:

- `packages/core/src/editor/types.ts`
- `packages/core/src/editor/types.test.ts`（可选）
- `packages/core/src/index.ts`
- `packages/core/src/package-boundary.test.ts`

Forbidden Files:

- `packages/core/src/bootstrap.ts`
- `packages/core/src/capabilities.ts`
- `packages/core/src/command-event-runtime.ts`
- `packages/core/src/editor/create-editor.ts`（Task 05）
- `packages/plugins/**`
- `packages/preset-gfm/**`
- `packages/react/**`
- `docs/**`、`openspec/**`
- `AGENTS.md` 及其他无关脏文件

## TDD 入口（Red → Green → Refactor）

**Red**

1. 修改 `package-boundary.test.ts`：`assert.equal(exportedKeys.includes("createEditor"), true)` → 运行 `pnpm core:test` → **FAIL**（export 不存在）。
2. 新增 assert：`createEditorSync` 不在 exports → **FAIL** 直至确认无 export。

**Green**

3. 添加 `editor/types.ts` + `index.ts` stub `export async function createEditor(...) { throw new CoreError(...) }`。
4. 运行 `pnpm core:test` → boundary + types smoke **PASS**。

**Refactor**

5. 整理 export 顺序；确保类型与 stub 分离清晰；无 store API 泄漏。

TDD Notes:

- 本 task **必须**以 package-boundary Red（createEditor 期望存在）为首要 failing signal。
- Stub `createEditor` 仅满足 export contract；行为测试在 Task 05。

Validation:

```bash
pnpm core:test
pnpm --filter @aether-md/core exec tsc --noEmit
node -e "const c=require('./packages/core/dist/index.js'); console.log(typeof c.createEditor)"
rg -i "remark|prosemirror|react|vue|preset-gfm|createGfmPreset" packages/core/package.json packages/core/src --glob '!**/*.test.ts'
```

预期：`pnpm core:test` **PASS**；`createEditor` 为 `function`；Core 生产路径无引擎依赖。

Intuitive Verification:

- `node -e "import('@aether-md/core').then(m=>console.log(Object.keys(m).filter(k=>k.includes('Editor')||k==='createEditor')))"` 列出 editor 相关 exports。

Review Checklist:

- [ ] 仅修改 Allowed Files。
- [ ] `createEditor` export 存在；无 `createEditorSync`。
- [ ] `EditorStateSnapshot` 无 store/subscribe API。
- [ ] 仍 forbid `createGfmPreset` / React / Shell exports。
- [ ] 未 touch bootstrap / M2 runtime 生产语义。

Rollback Notes:

- 删除 `editor/types.ts`；恢复 `package-boundary.test.ts` M4 断言；移除 `index.ts` editor exports。

Version Impact:

- `@aether-md/core`：**minor-level additive**（types + stub `createEditor` export）
- `manifestVersion`：**不变**

Commit Scope:

- `feat(core): add editor public types and boundary contract for createEditor export`

Depends On:

- none

Parallel Group:

- G0

Barrier:

- false

Status:

- completed

Run Log:

- Red: flipped `package-boundary.test.ts` createEditor assert to true → FAIL until exports added
- Green: added `editor/types.ts`, `index.ts` exports (`createEditor`, public types), `types.test.ts`; `pnpm core:test` PASS
- Validation: `pnpm core:test`, `tsc --noEmit` PASS

Deviation:

- none

Rollback:

- 见 Rollback Notes
