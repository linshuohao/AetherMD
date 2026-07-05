# Task 08: 添加 createEditor GFM headless integration tests

Change:

- `add-editor-orchestration`

Branch:

- `feat/add-editor-orchestration`

Spec Requirement:

- `editor-orchestration` / ADDED `Headless GFM preset integration is verified through createEditor`
- `adapter-base` / ADDED `Adapter round-trip is verifiable through createEditor orchestration`（Scenario: GFM round-trip can run through createEditor）

OpenSpec Tasks:

- `openspec/changes/add-editor-orchestration/tasks.md` §4.3

Source Docs:

- `.superpowers/plans/add-editor-orchestration.md`
- `openspec/changes/add-editor-orchestration/specs/editor-orchestration/spec.md`
- `docs/architecture/package-layout.md`
- `packages/preset-gfm/src/index.ts`

## 目标

新增 headless integration test：`createEditor({ plugins: [toExtensionPlugin(createGfmPreset())], initialValue })` → minimal `core:replaceText` dispatch → `getMarkdown()` / `getDocument()` 断言；至少 3 fixtures：**paragraph**、**strong**、**unordered list**；**无 React/DOM**。

## 范围

- 更新 `packages/core/package.json` **devDependencies**：
  - `@aether-md/preset-gfm`: `workspace:*`
  - `@aether-md/plugin-remark`: `workspace:*`（若 preset  transitive 不足）
  - `@aether-md/plugin-prosemirror`: `workspace:*`
- 新增 `editor/create-editor-gfm.integration.test.ts`：
  - import `createGfmPreset` from devDependency。
  - 使用 Task 03 `toExtensionPluginFromPreset` helper。
  - 3 fixtures round-trip + golden string 断言（strong 用 `**text**`）。
  - assert test 源码 **不**含 `react` / `@aether-md/react`。
- 更新 `tsconfig.test.json`（若需）以编译 integration test。
- 更新 `pnpm-lock.yaml`（devDeps only）。
- **不** re-export preset；**不**改 preset/plugin 生产 API。

Allowed Files:

- `packages/core/src/editor/create-editor-gfm.integration.test.ts`
- `packages/core/package.json`（devDependencies only）
- `packages/core/tsconfig.test.json`（若需）
- `pnpm-lock.yaml`
- `packages/core/src/editor/adapter-wiring.ts`（仅若 helper 需 export — 最小）

Forbidden Files:

- `packages/core/package.json` `dependencies` 段（**禁止**添加 remark/prosemirror/react）
- `packages/preset-gfm/src/**`（除非 additive test fixture export — 默认禁止）
- `packages/plugins/**`
- `packages/react/**`
- `packages/core/src/index.ts`（禁止 re-export createGfmPreset）
- `docs/**`、`openspec/**`

## TDD 入口（Red → Green → Refactor）

**Red**

1. 添加 devDependencies；写 integration test（paragraph fixture）→ `pnpm --filter @aether-md/core test` → **FAIL**（路径/ wiring / 行为）。
2. 添加 strong、list fixtures → **FAIL** until green。

**Green**

3. 修复 wiring/helper/export 直至 3 fixtures **PASS**。
4. 确认 test 文件无 React import。

**Refactor**

5. 提取 shared integration helper（同文件内）；避免 duplicate createEditor boilerplate。

TDD Notes:

- 本 task 为 integration Red-Green；依赖 Task 05–07 完整 editor 行为。
- Core **dependencies** MUST remain engine-free。

Validation:

```bash
pnpm install
pnpm --filter @aether-md/core test
pnpm core:test
node -e "const p=require('./packages/core/package.json'); console.log(Object.keys(p.dependencies||{}).filter(x=>/remark|prosemirror|react|preset/.test(x)))"
rg -i "react|@aether-md/react" packages/core/src/editor/create-editor-gfm.integration.test.ts
rg "createGfmPreset" packages/core/src/index.ts
```

预期：integration tests **PASS**；`dependencies` 无 preset/plugin/react；index 不 re-export preset。

Intuitive Verification:

- 阅读 integration test：路径为 `createEditor` → `dispatch` → `getMarkdown`，非 explicit harness wiring。

Review Checklist:

- [ ] devDependencies only；dependencies 无引擎包。
- [ ] ≥3 GFM fixtures 绿。
- [ ] 无 React/DOM。
- [ ] 无 createGfmPreset core re-export。
- [ ] 经 createEditor 路径（非 M4 harness 复制）。

Rollback Notes:

- 删除 integration test；移除 devDependencies；回滚 lockfile。

Version Impact:

- `pnpm-lock.yaml`：devDependencies workspace links
- `@aether-md/core` production deps：**不变**

Commit Scope:

- `test(core): add headless createEditor GFM integration tests`

Depends On:

- 05, 06, 07

Parallel Group:

- G4

Barrier:

- false

Status:

- completed

Run Log:

- Red: paragraph fixture integration test FAIL until orchestration complete
- Green: 3 fixtures (paragraph, strong, list) PASS; no React imports
- Validation: `pnpm --filter @aether-md/core test` PASS

Deviation:

- **Turbo cycle:** workspace devDependencies on preset/plugins caused cyclic package graph → `pnpm check` FAIL. Used relative import `../../../preset-gfm/dist/index.js` + test script pre-builds siblings instead of devDependencies.
- **dist-test outDir:** `tsconfig.test.json` output moved to `dist-test/` to prevent parallel turbo clobber of production `dist/`.

Rollback:

- 见 Rollback Notes
