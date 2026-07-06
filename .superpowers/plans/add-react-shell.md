# add-react-shell Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use Superpowers task execution (`aether-workflow-create-task` → `aether-workflow-implement-task` / `aether-workflow-execute-task-loop`) to implement this plan task-by-task. Do not redefine OpenSpec requirements in code.

**Goal:** 新建 `@aether-md/react` Public Adapter package，提供 `AetherEditorRoot` / `AetherEditorContent` / `useAetherEditor`，直接消费 M4.5 `createEditor` / `AetherEditor` 公开面；经 `@aether-md/plugin-prosemirror` additive view-bridge 挂载 ProseMirror DOM；实现 Shell GateLock 与 happy-dom 集成测试，闭合 M5 MVP 假设，**不**改变 `@aether-md/core` 运行时语义或依赖。

**Architecture:** React Shell 位于 `packages/react/src/**`：Root 负责 async `createEditor` 生命周期与 React context；Content 经 plugin-prosemirror `createProseMirrorView` 绑定 DOM；`useAetherEditor` 将 `change` 事件桥接为 React-local `markdown` / `doc` state（Phase 0 #2）；GateLock 在受控 prop effect 入口比较 Markdown string，`prevValue === nextValue` 时跳过重设。用户输入 **MUST** 经 `AetherEditor.dispatch`（M5 最小：`core:replaceText`）到达 `EngineAdapter.apply`，**MUST NOT** Shell 直写 PM state。view-bridge 实现落在 `packages/plugins/plugin-prosemirror/src/view-bridge.ts`，不暴露 `sessions` Map。

**Tech Stack:** TypeScript、React 18/19（peer）、happy-dom（dev）、Node built-in test runner + `@testing-library/react`（若需）、pnpm workspace、Turborepo `pnpm check`；`@aether-md/react` 依赖 `@aether-md/core`、`@aether-md/plugin-prosemirror`（runtime view-bridge）；dev/integration 引用 `@aether-md/preset-gfm`、`@aether-md/plugin-remark`；Core **零** react/prosemirror/remark runtime 依赖。

---

## Change

| 字段                  | 值                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| OpenSpec change       | `add-react-shell`                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| Branch                | `feat/add-react-shell`                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| OpenSpec status       | **complete**（4/4 artifacts）；`openspec validate add-react-shell --strict` **pass**（plan 创建时）                                                                                                                                                                                                                                                                                                                                                     |
| Apply readiness       | `isComplete: true`；OpenSpec high-level tasks 0/7 sections complete                                                                                                                                                                                                                                                                                                                                                                                     |
| Version impact        | **`@aether-md/react`** 新 package（初始 `0.0.0` private / Changeset `0.1.0`）；**`@aether-md/core`** **无** API 或 runtime deps 变更；**`@aether-md/plugin-prosemirror`** 可能 **minor additive**（`createProseMirrorView` + `prosemirror-view` dependency）；`@aether-md/preset-gfm` export **不变**；`manifestVersion` / `SUPPORTED_MANIFEST_VERSIONS` **不变**（`[1]`）；`pnpm-lock.yaml` **预期变更**（react package、happy-dom、prosemirror-view） |
| Expected commit scope | `feat(react)`、`test(react)`、`feat(plugin-prosemirror)`（view-bridge only）；OpenSpec 产物 `docs(openspec)`                                                                                                                                                                                                                                                                                                                                            |
| Commit strategy       | 每个 Superpowers task 可单独 commit；PR body 须追踪 OpenSpec change id 与 task id                                                                                                                                                                                                                                                                                                                                                                       |

范围边界：

- **包含：** `@aether-md/react` scaffold + public exports；`AetherEditorRoot` / `AetherEditorContent` / `useAetherEditor`；GateLock；plugin-prosemirror additive `createProseMirrorView`；输入→`dispatch` 桥接；happy-dom mount/type/change/dispose 集成测试；GateLock 集成测试（`ci-checklist.md` #41）；GFM React smoke（paragraph、strong、list）；package-boundary 强化。
- **排除：** Vue Shell、toolbar、主题、History UI、Core Guard 链、Permission enforce、Core store、Shell Adapter、`bootstrapCore` silent provide 变更、Playwright / 浏览器 CI、`examples/react-basic`、Core 编排行为修改、`plugin-prosemirror` 非 additive 重构。
- **Phase 0 硬约束：** Core 无 subscribe/store；React 直接消费 `AetherEditor`（#3）；`change` 事件 + hook 本地 state（#2）。

## Source Artifacts

OpenSpec artifacts：

- `openspec/changes/add-react-shell/proposal.md`
- `openspec/changes/add-react-shell/design.md`
- `openspec/changes/add-react-shell/specs/react-shell/spec.md`
- `openspec/changes/add-react-shell/specs/editor-orchestration/spec.md`
- `openspec/changes/add-react-shell/tasks.md`

长期 source docs / ADRs：

- `docs/architecture/core-api.md`（Phase 0 Decision #2 #3）
- `docs/architecture/package-layout.md`
- `docs/architecture/roadmap.md`
- `docs/architecture/ci-checklist.md`（GateLock #41）
- `docs/architecture/principles.md`
- `docs/architecture/compatibility.md`
- `docs/engineering/mvp-implementation-plan.md`（M5）
- `docs/engineering/data-flow.md`（GateLock）
- `docs/engineering/test-strategy.md`
- `docs/engineering/component-library-governance.md`
- `docs/engineering/adapter-protocol.md`
- `docs/adr/003-remark-prosemirror-dual-track.md`
- `packages/core/src/editor/**`（M4.5 已实现 API）
- `packages/plugins/plugin-prosemirror/src/engine.ts`

## Code-Management

创建 plan 时 `git status --short`：

```
?? openspec/changes/add-react-shell/
```

当前分支：`feat/add-react-shell`

- **允许修改区：** `packages/react/**`（新建）、`packages/plugins/plugin-prosemirror/**`（additive view-bridge only）、`.changeset/*`（新 package）、`pnpm-lock.yaml`、`pnpm-workspace.yaml`（若需显式条目，当前 `packages/*` 已覆盖）、本 change 的 OpenSpec / Superpowers 产物。
- **禁止纳入本 change：** 无关 dirty 文件、`packages/core/**` 生产代码或 runtime dependencies 变更、`packages/vue`、workflow skill mirrors、长期 Docs 大改（archive 阶段由 `aether-workflow-update-docs-spec` 处理）。
- **禁止新建：** Vue Shell、Shell Adapter、Core store、`bootstrapCore` Adapter 自动加载、Playwright CI job。
- **Core 依赖 guard：** `packages/core/package.json` **dependencies** **MUST NOT** 新增 `react`、`prosemirror*`、`remark`；本 change **不**修改 core 生产代码。

## File Map

| 路径                                                          | 职责                                                                                                                                                                       |
| ------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/react/package.json`                                 | `@aether-md/react`：`peerDependencies.react`；`dependencies.@aether-md/core` + `@aether-md/plugin-prosemirror`；devDeps preset-gfm/plugin-remark/happy-dom/testing-library |
| `packages/react/tsconfig.json`                                | 生产编译（JSX `react-jsx`）                                                                                                                                                |
| `packages/react/tsconfig.test.json`                           | 测试编译含 `*.test.ts(x)`                                                                                                                                                  |
| `packages/react/src/types.ts`                                 | 公开 props 类型：`AetherEditorRootProps`、`UseAetherEditorResult` 等                                                                                                       |
| `packages/react/src/index.ts`                                 | public exports：`AetherEditorRoot`、`AetherEditorContent`、`useAetherEditor`、types                                                                                        |
| `packages/react/src/package-boundary.test.ts`                 | boundary：export 存在；**无** `prosemirror-view` 直接 import；**无** ShellAdapter                                                                                          |
| `packages/react/src/gate-lock.ts`                             | `shouldApplyControlledValue(prev, next)` — Markdown string GateLock 纯函数                                                                                                 |
| `packages/react/src/gate-lock.test.ts`                        | GateLock 单元测试：`prevValue === nextValue` → skip                                                                                                                        |
| `packages/react/src/context.tsx`                              | `AetherEditorContext` + Provider 类型（hook 消费面）                                                                                                                       |
| `packages/react/src/use-aether-editor.ts`                     | `useAetherEditor()`：`editor`/`markdown`/`doc`/`ready`/`error`；订阅 `change`；missing Provider **throw**                                                                  |
| `packages/react/src/use-aether-editor.test.ts`                | hook 单元测试（可用 `@testing-library/react` renderHook 或轻量 wrapper）                                                                                                   |
| `packages/react/src/aether-editor-root.tsx`                   | `createEditor` 生命周期、受控 `value`/`markdown` + GateLock、`onChange`、dispose on unmount                                                                                |
| `packages/react/src/aether-editor-content.tsx`                | DOM ref + `createProseMirrorView` mount/destroy + `dispatchInput`→`dispatch`                                                                                               |
| `packages/react/src/test-setup.ts`                            | happy-dom 全局注册（`GlobalRegistrator` 或等价）                                                                                                                           |
| `packages/react/src/react-shell.integration.test.tsx`         | mount → type → `onChange` → dispose（Task 07 独占）                                                                                                                        |
| `packages/react/src/gate-lock.integration.test.tsx`           | 受控 `value` 相同 re-render 不重设文档（Task 08 独占；ci-checklist #41）                                                                                                   |
| `packages/react/src/gfm-react-smoke.test.tsx`                 | GFM paragraph / strong / list fixtures（Task 09）                                                                                                                          |
| `packages/plugins/plugin-prosemirror/src/view-bridge.ts`      | `createProseMirrorView({ session, dom, dispatchInput })` → `{ view, destroy }`                                                                                             |
| `packages/plugins/plugin-prosemirror/src/view-bridge.test.ts` | view 与 `getDocument()` / session 快照一致；destroy 无泄漏                                                                                                                 |
| `packages/plugins/plugin-prosemirror/src/index.ts`            | additive export `createProseMirrorView`                                                                                                                                    |
| `packages/plugins/plugin-prosemirror/package.json`            | additive `prosemirror-view` dependency（**不**新增到 core）                                                                                                                |
| `.changeset/add-react-shell.md`                               | 新 package + 可能 plugin-prosemirror minor                                                                                                                                 |

**不修改（除非 regression）：** `packages/core/src/**` 生产代码、`packages/core/package.json` dependencies、M4.5 headless integration tests 语义。

**Preset 消费约定：** 与 M4.5 一致，测试使用 `toExtensionPlugin(createGfmPreset())` 或等价 helper（可放在 `packages/react/src/test-helpers.ts`，由 Task 07/09 共享 — 若 helper 与 07 同文件则 09 仅 import，不重复编辑 07 测试文件）。

不得出现在 `@aether-md/react` **生产**代码：`prosemirror-view` 直接 import、`sessions` Map 访问、ShellAdapter export。

不得出现在 `@aether-md/core` **生产**代码：`react`、`prosemirror*`、`remark` import（本 change 不触碰 core 生产面）。

## Package Boundary Guard（全程强制）

每个 Phase / Task 结束前，实现者 **MUST** 确认：

| 禁止项                                         | Guard                                                                          |
| ---------------------------------------------- | ------------------------------------------------------------------------------ |
| Core → React / ProseMirror / Remark（runtime） | `packages/core/package.json` `dependencies` 与生产 `src/**` 无相关 import      |
| React → prosemirror-view 直接                  | `@aether-md/react` 生产代码 **MUST** 经 `@aether-md/plugin-prosemirror` bridge |
| React → engine sessions 内部                   | 无 `sessions` Map import；仅公开 `EngineSession` + bridge API                  |
| Shell Adapter                                  | 无 `ShellAdapter` export 或第二宿主边界协议                                    |
| Core store                                     | React hook 本地 state only；Core 无 `subscribe` export                         |
| Command Bus 绕过                               | 无 Shell 直写 PM `EditorState` / `tr`                                          |
| bootstrap silent provide                       | 不修改 `bootstrap.ts` / `capabilities.ts`                                      |
| Playwright / 浏览器 CI                         | 测试仅 happy-dom + Node `pnpm test`                                            |

**Core package guard（Task 09 / 10 必跑）：**

```bash
rg -i "from ['\"]react|from ['\"]prosemirror|from ['\"]remark|from ['\"]@aether-md/preset-gfm|from ['\"]@aether-md/plugin-" packages/core/src --glob '!**/*.test.ts' --glob '!**/*.integration.test.ts'
```

预期：生产 `.ts` 无新增命中（与 M4.5 基线一致）。

**React package guard（Task 09 / 10 必跑）：**

```bash
rg -i "from ['\"]prosemirror-view|ShellAdapter" packages/react/src --glob '!**/*.test.ts' --glob '!**/*.test.tsx'
```

预期：生产代码无 `prosemirror-view` 直接 import；无 ShellAdapter。

**React dependencies vs peerDependencies：**

```bash
node -e "const p=require('./packages/react/package.json'); const d=Object.keys(p.dependencies||{}); console.log('plugin-prosemirror', d.includes('@aether-md/plugin-prosemirror')); console.log('forbidden', d.filter(x=>/prosemirror-view|remark/.test(x)))"
```

预期：空数组 forbidden；`plugin-prosemirror true`（`prosemirror-view` 仅在 `@aether-md/plugin-prosemirror`）。

## Implementation Phases

每个 Phase 遵循 **TDD / contract-first**：先写失败测试 → 最小实现 → 测试通过 → 再进入下一阶段。

### Phase 1: Public API boundary + types（Task 01）

**映射 OpenSpec（引用，不重新定义）：**

- `react-shell` → `React Shell package is exported as a public adapter package`
- `react-shell` → `React Shell exposes Root, Content, and hook public API`

**TDD / contract 入口：**

1. 新增 `packages/react/src/types.ts`：`AetherEditorRootProps`（`plugins`、`initialValue`、`value`/`markdown`、`onChange`、`readOnly`）、`UseAetherEditorResult`（`editor`、`markdown`、`doc`、`ready`、`error`）。
2. 新增 `package-boundary.test.ts`：**失败测试**期望 `@aether-md/react` export `AetherEditorRoot`、`AetherEditorContent`、`useAetherEditor`；assert **无** `prosemirror-view` 生产 import（可先 stub `index.ts` throw）。
3. `index.ts` 导出类型与组件/hook stub（`throw new Error('not implemented')` 或占位）。
4. 运行 `pnpm --filter @aether-md/react test`（scaffold 后）→ boundary 相关 FAIL/PASS 按 stub 程度。

**产出：** 公开类型与 boundary 测试定义 M5 export 契约（package 目录可在 Task 02 补齐，但 types 文件路径在 Task 01 锁定）。

### Phase 2: Package scaffold（Task 02）

**映射：**

- `react-shell` → `React package is consumable from workspace` / `participates in check pipeline`

**TDD / contract 入口：**

1. 创建 `package.json`（`name`、`exports`、`types`、`build`/`typecheck`/`test` scripts、`peerDependencies.react`）。
2. `tsconfig.json` / `tsconfig.test.json`；接入 turbo（继承 workspace `packages/*` 模式）。
3. 添加 `.changeset/add-react-shell.md`。
4. 运行 `pnpm build` + `pnpm typecheck`（filter react）→ PASS；`pnpm check` 尚未全绿（实现未完成）可接受。

**产出：** workspace 可 build/typecheck 的空壳 package；Task 01 的 types/index 纳入编译图。

**Depends On Task 01**（export 名称与 types 已定稿）。

### Phase 3: Foundation modules — GateLock + hook（Tasks 03–04，wave-2 并行，文件 disjoint）

**Task 03 — GateLock 纯函数**

- 映射：`react-shell` → `Shell GateLock prevents redundant document resets`
- 失败测试：`shouldApplyControlledValue('a','a')` → `false`；`'a','b'` → `true`；`undefined` 初始 → 允许首次 apply
- 文件：**仅** `gate-lock.ts`、`gate-lock.test.ts`

**Task 04 — useAetherEditor hook**

- 映射：`react-shell` → `useAetherEditor exposes bridged markdown state`；`editor-orchestration` MODIFIED → `React Shell bridges change without Core store`
- 失败测试：mock context + mock `AetherEditor`，simulate `change` → `markdown`/`doc` 更新；无 Provider → **throw**
- 文件：**仅** `context.tsx`、`use-aether-editor.ts`、`use-aether-editor.test.ts`
- **MUST NOT** 编辑 `gate-lock.ts` 或 `aether-editor-root.tsx`（Root 在 Task 06 接线 GateLock）

**产出：** 可单测的 GateLock 与 hook；尚无完整 Root/Content。

### Phase 4: ProseMirror view bridge（Task 05）

**映射：**

- `react-shell` → `ProseMirror view mounting uses plugin-prosemirror view bridge`
- design Decision #2：`createProseMirrorView` additive export

**TDD / contract 入口：**

1. `plugin-prosemirror/package.json` 添加 `prosemirror-view` dependency。
2. 失败测试：`createProseMirrorView({ session, dom })` 创建 view；`apply` 后 DOM/文档与 `getDocument()` 一致；`destroy()` 可重复调用。
3. 失败测试：`dispatchInput` 回调被触发时 **不** 直接 mutate doc（由调用方 `dispatch`）。
4. `index.ts` export；`pnpm --filter @aether-md/plugin-prosemirror test` → PASS。

**产出：** React Content 可消费的公开 bridge；**不**暴露 `sessions` Map。

### Phase 5: React Shell components（Task 06）

**映射：**

- `react-shell` → Root creates/disposes；Content mounts editable view
- `react-shell` → `DOM input is bridged through editor dispatch`
- design Decision #6/#7：Root + Content 分离；`core:replaceText` 最小路径

**TDD / contract 入口：**

1. `AetherEditorRoot`：`useEffect` async `createEditor`；`ready` 后填充初始 state；unmount `dispose()`；受控 prop 经 Task 03 GateLock。
2. `AetherEditorContent`：`createProseMirrorView`；`dispatchInput` → `editor.dispatch({ command: 'core:replaceText', ... })`。
3. 组件级 smoke（可选轻量 test 或留给 Task 07）：Root+Content 可 render。
4. 更新 `index.ts` 导出真实实现，移除 stub throw。

**产出：** 可挂载的最小 React Shell（集成测试在 Phase 6）。

### Phase 6: Integration + smoke + boundary（Tasks 07–09，wave-4）

**Task 07 — mount / type / change / dispose**

- 映射：`react-shell` → `mount type change dispose integration test`；`typing emits change through dispatch path`；`onChange callback`
- 配置 `test-setup.ts` happy-dom。
- 失败测试：`react-shell.integration.test.tsx` 完整主路径。
- **独占文件：** `test-setup.ts`、`react-shell.integration.test.tsx`（及可选 `test-helpers.ts`）

**Task 08 — GateLock 集成（ci-checklist #41）**

- 映射：`equal controlled value does not reset document`；`GateLock integration test is present`
- 失败测试：受控 `value` 相同 re-render → `createEditor` 调用次数不增加 / `getMarkdown()` 不变。
- **独占文件：** `gate-lock.integration.test.tsx`
- **Depends On 06, 07**（复用 Task 07 `test-setup.ts`；**不**与 07 并行）

**Task 09 — GFM smoke + boundary 强化**

- 映射：`GFM preset React smoke`；package boundary scenarios
- 失败测试：`gfm-react-smoke.test.tsx` paragraph、strong、list。
- 强化 `package-boundary.test.ts`；跑 Core + React guard scripts。
- **独占文件：** `gfm-react-smoke.test.tsx`、`package-boundary.test.ts`（强化）
- 若需编辑 `test-helpers.ts` 且 Task 07 已创建 → **串行于 07 之后**

**产出：** M5 测试矩阵绿；CI checklist GateLock 可勾选。

### Phase 7: Full validation（Task 10 — Barrier）

**映射：** 全 change 验收；`pnpm check`；`openspec validate --strict`

```bash
pnpm check
openspec validate add-react-shell --strict
```

**产出：** implementation complete 门禁。

## Dependency Order

```
01 define-react-public-api-boundary-tests
        │
        ▼
02 scaffold-react-package-workspace
        │
        ├────────────────┐
        ▼                ▼
03 implement-      04 implement-use-
   gate-lock-         aether-editor-
   utility            hook-bridge
        │                │
        └────────┬───────┘
                 ▼
05 implement-plugin-prosemirror-view-bridge
                 │
                 ▼
06 implement-aether-editor-root-and-content
                 │
        ┌────────┼────────┐
        ▼        │        ▼
07 react-        │   09 gfm-react-
   shell         │      smoke-boundary
 integration     │   (Depends On 07 若共享 helper)
        │        │
        ▼        │
08 gate-lock     │
 integration     │
 (Depends On 07) │
        │        │
        └────────┴────────┘
                 ▼
10 run-full-validation  [BARRIER]
```

跨阶段约束：

- M4.5 `createEditor` / `AetherEditor` **MUST NOT** breaking change
- Phase 0 三项决策 **MUST NOT** deviation
- OpenSpec 与 Docs 冲突 → 暂停更新 OpenSpec，禁止 silent 偏离
- wave-2：**03** 与 **04** allowed files **MUST** be disjoint（见 Task Breakdown）
- wave-4：**07** 先行（`test-setup.ts`）；**08 Depends On 07**（复用 happy-dom 注册，**不**并行）；**09** 若共享 `test-helpers.ts` → **Depends On 07**；**09** 可与 **08** 并行（文件 disjoint）

## Task Breakdown

| Task                                                    | Outcome                                                           | Allowed Area                                                                             | Validation                                                                            | Version Impact                    | Depends On                    | Parallel Group          | Barrier |
| ------------------------------------------------------- | ----------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- | --------------------------------- | ----------------------------- | ----------------------- | ------- |
| **01** `define-react-public-api-boundary-tests`         | 公开类型 + boundary 测试定义 M5 export                            | `packages/react/src/types.ts`、`index.ts`（stub）、`package-boundary.test.ts`            | `pnpm --filter @aether-md/react exec tsc --noEmit`（若 02 未完成则仅 types 语法检查） | react types additive              | —                             | **wave-1**              | no      |
| **02** `scaffold-react-package-workspace`               | workspace / turbo / changeset 脚手架                              | `packages/react/package.json`、`tsconfig*.json`、`.changeset/*`；**不**改 03–06 实现文件 | `pnpm --filter @aether-md/react build`；`typecheck`                                   | 新 package lockfile               | 01                            | **wave-1**              | no      |
| **03** `implement-gate-lock-utility`                    | Markdown GateLock 纯函数 + 单测                                   | **仅** `gate-lock.ts`、`gate-lock.test.ts`                                               | `pnpm --filter @aether-md/react test`                                                 | none                              | 02                            | **wave-2**              | no      |
| **04** `implement-use-aether-editor-hook`               | context + hook；`change`→state；无 Provider throw                 | **仅** `context.tsx`、`use-aether-editor.ts`、`use-aether-editor.test.ts`                | `pnpm --filter @aether-md/react test`                                                 | none                              | 02                            | **wave-2**              | no      |
| **05** `implement-plugin-prosemirror-view-bridge`       | `createProseMirrorView` additive + contract tests                 | `plugin-prosemirror/src/view-bridge.ts`、`*test.ts`、`index.ts`、`package.json`          | `pnpm --filter @aether-md/plugin-prosemirror test`                                    | plugin-prosemirror minor additive | 02                            | **wave-3**              | no      |
| **06** `implement-aether-editor-root-and-content`       | Root 生命周期 + GateLock 接线 + Content view 挂载 + dispatch 桥接 | `aether-editor-root.tsx`、`aether-editor-content.tsx`、`index.ts`（实装导出）            | `pnpm --filter @aether-md/react test`                                                 | react public API                  | 03, 04, 05                    | **wave-3**              | no      |
| **07** `add-react-shell-integration-tests`              | happy-dom setup；mount→type→onChange→dispose                      | **仅** `test-setup.ts`、`react-shell.integration.test.tsx`、`test-helpers.ts`（若新建）  | `pnpm --filter @aether-md/react test`                                                 | none                              | 06                            | **wave-4**              | no      |
| **08** `add-gate-lock-integration-tests`                | ci-checklist #41；相同受控 value 不重设文档                       | **仅** `gate-lock.integration.test.tsx`                                                  | `pnpm --filter @aether-md/react test`                                                 | none                              | 06, 07                        | **wave-4**（串行于 07） | no      |
| **09** `add-gfm-react-smoke-and-boundary-reinforcement` | GFM smoke + package boundary 强化 + guard scripts                 | `gfm-react-smoke.test.tsx`、`package-boundary.test.ts`；**不**改 07/08 测试文件          | `pnpm --filter @aether-md/react test` + `rg` guards                                   | none                              | 06, 07（若共享 test-helpers） | **wave-4**              | no      |
| **10** `run-full-validation`                            | 全 workspace 绿 + openspec strict                                 | 全 change scope                                                                          | `pnpm check`；`openspec validate add-react-shell --strict`                            | 确认 lockfile                     | 07, 08, 09                    | **barrier**             | **yes** |

**Parallel execution notes：**

- **wave-1：** 02 **Depends On** 01；01 定稿 export 名称后 02 可立即开工。
- **wave-2（03 ∥ 04）：** **强制 disjoint allowed files** — 03 不得编辑 `context.tsx` / `use-aether-editor*`；04 不得编辑 `gate-lock*` / `aether-editor-root.tsx`。合并前各自 `pnpm --filter @aether-md/react test` 绿。
- **wave-3：** 05 可与 03/04 收尾重叠，但 **06 Depends On 05**（Content 需要 bridge）。建议 05 在 06 之前 merge。
- **wave-4：** **07** 创建 `test-setup.ts` 后 **08** 开工（**Depends On 07**，不并行）。**09** 与 **07** 若共享 `test-helpers.ts` → **Depends On 07**；**09** 可与 **08** 并行（文件 disjoint）。
- **barrier（10）：** 唯一 **Barrier** task；必须 serial 最后执行；失败则不得标记 change implementation complete。

## Validation Matrix

| Phase / Task | OpenSpec Requirement（引用 capability）          | Validation 入口                                    | Intuitive Verification       | Notes            |
| ------------ | ------------------------------------------------ | -------------------------------------------------- | ---------------------------- | ---------------- |
| 01           | `react-shell` public adapter exports             | tsc / boundary test                                | exports 存在                 | types + stub OK  |
| 02           | `react-shell` check pipeline participation       | `pnpm --filter @aether-md/react build`             | workspace 可编译             | turbo 接入       |
| 03           | `react-shell` GateLock prevents redundant resets | `pnpm --filter @aether-md/react test`              | 纯函数 equal→skip            | 单元级           |
| 04           | `useAetherEditor` bridged markdown/doc           | 同上                                               | mock change 更新 state       | 无 Core store    |
| 04           | `editor-orchestration` MODIFIED React bridge     | 同上                                               | hook 不调用 subscribe API    | Core 无变更      |
| 05           | `react-shell` plugin-prosemirror view bridge     | `pnpm --filter @aether-md/plugin-prosemirror test` | 无 prosemirror-view 在 react | bridge 在 plugin |
| 05           | view destroy on unmount                          | plugin view-bridge test                            | destroy 可重复               |                  |
| 06           | Root create/dispose `AetherEditor`               | `pnpm --filter @aether-md/react test`              | createEditor + dispose       |                  |
| 06           | Content editable view + dispatch path            | 同上                                               | dispatchInput→dispatch       | 非 PM 直写       |
| 06           | no Shell Adapter                                 | boundary + code review                             | 无第二协议                   |                  |
| 07           | happy-dom integration mount/type/change/dispose  | `pnpm --filter @aether-md/react test`              | 无 Playwright                |                  |
| 07           | onChange receives markdown                       | integration test                                   | callback assert              |                  |
| 08           | equal controlled value no reset                  | `gate-lock.integration.test.tsx`                   | createEditor 调用计数        | ci-checklist #41 |
| 08           | GateLock integration in CI                       | `pnpm check`                                       | 随全量 test 跑               |                  |
| 09           | GFM paragraph/strong/list smoke                  | `gfm-react-smoke.test.tsx`                         | 与 M4.5 headless 区分        | React 路径       |
| 09           | Core no react/pm/remark runtime                  | `rg` guard                                         | core deps 不变               |                  |
| 09           | React no direct prosemirror-view                 | `rg` guard                                         | react 生产无直 import        |                  |
| 10           | 全 change 验收                                   | `pnpm check`                                       | workspace 绿                 | barrier          |
| 10           | OpenSpec strict                                  | `openspec validate add-react-shell --strict`       | pass                         | barrier          |

**汇总命令映射：**

| 命令                                               | 覆盖                                                                 |
| -------------------------------------------------- | -------------------------------------------------------------------- |
| `pnpm --filter @aether-md/react test`              | Tasks 03–09；React contract + integration                            |
| `pnpm --filter @aether-md/plugin-prosemirror test` | Task 05 view-bridge                                                  |
| `pnpm --filter @aether-md/react build`             | Task 02+                                                             |
| `pnpm check`                                       | Task 10 全 workspace gate（build + typecheck + test + skills check） |
| `openspec validate add-react-shell --strict`       | Task 10 OpenSpec barrier                                             |

**Integration test 聚焦命令（Task 07 本地迭代）：**

```bash
pnpm --filter @aether-md/react build && pnpm --filter @aether-md/react exec node --test dist/react-shell.integration.test.js
```

（具体 dist 路径以 `tsconfig.test.json` 编译输出为准；task 文件内写死实际 path。）

## Boundary Risks

| 风险                            | 触发点                                           | 处理方式                                                         |
| ------------------------------- | ------------------------------------------------ | ---------------------------------------------------------------- |
| React 直接依赖 prosemirror-view | Content 实现省事                                 | 强制经 plugin bridge；Task 09 `rg` guard                         |
| Shell 直写 PM state             | 输入桥接                                         | `dispatchInput`→`AetherEditor.dispatch` only；integration assert |
| Core runtime 污染               | 误改 core                                        | 本 change 禁止 core 生产 edits；Task 09 guard                    |
| GateLock 反馈环                 | 受控 `onChange` 回传                             | `prevValue === nextValue` string 比较；Task 08 集成              |
| happy-dom 输入事件差异          | PM key handling                                  | Task 07 主路径；失败记 OpenSpec deviation，不引入 Playwright     |
| view-bridge / session 双轨      | apply 后 view 不同步                             | Task 05 contract test；apply 后 refresh view                     |
| React Strict Mode 双 mount      | dev 双 invoke effect                             | dispose 幂等；Task 08 断言相同 value 不二次 parse                |
| wave-2 文件冲突                 | 03/04 同文件                                     | 严格执行 disjoint allowed files                                  |
| wave-4 文件冲突                 | 07/09 同 integration 文件；08/07 共享 test-setup | 拆分文件；08 **Depends On 07**；09 串行于 07                     |
| plugin-prosemirror 扩大 surface | export sessions                                  | 仅 export factory；boundary test                                 |
| 无关文件 commit                 | openspec only dirty                              | Code-Management 区                                               |

## Review Focus

- 每个改动文件映射到 Task 01–10。
- 每个 Task 映射到 OpenSpec `react-shell` / `editor-orchestration` delta scenario；**不得**发明 requirement 外行为。
- `@aether-md/core` **dependencies** 无 react/prosemirror/remark 新增；生产代码无变更。
- `@aether-md/react` 生产代码无 `prosemirror-view` 直接 import；无 ShellAdapter。
- Package Boundary Guard 表全部满足。
- Phase 0 #2 #3 无 deviation：`change` 事件桥接、无 Core store、无 Shell Adapter。
- M1–M4.5 测试绿；headless GFM integration 无回归。
- 用户输入经 `dispatch` 到达 `EngineAdapter.apply`。
- GateLock 集成测试覆盖 `ci-checklist.md` #41。
- GFM React smoke 与 M4.5 headless 测试路径区分（import `@aether-md/react`）。
- `pnpm-lock.yaml` 变更合理（react package、happy-dom、prosemirror-view on plugin only）。
- 说明性正文中文；代码标识 English。

## Open Questions

| 问题                                               | Plan 阶段处理                                      | 阻塞？ |
| -------------------------------------------------- | -------------------------------------------------- | ------ |
| `useAetherEditor` missing Provider throw vs null   | design 冻结 **throw**；Task 04 单测 assert         | 否     |
| M5 输入桥接仅 `core:replaceText` vs 更细 command   | Task 06 最小 `replaceText` 可测即可；扩展留 M6     | 否     |
| happy-dom vs jsdom fallback                        | design 默认 **happy-dom**；阻塞时记录 deviation    | 否     |
| 受控 prop 不等时 remount vs dispatch 增量          | Task 06 优先避免 remount；GateLock 仅管 equal case | 否     |
| `toExtensionPlugin(createGfmPreset())` helper 位置 | Task 07 `test-helpers.ts`；09 复用                 | 否     |
| `createProseMirrorView` 命名                       | Task 05 采用 design 示例名；别名须更新 spec 引用   | 否     |

实现中若需偏离 OpenSpec `design.md` 或 Phase 0，**MUST** 先更新 OpenSpec change 记录 deviation，再改代码。

## Version Impact / Branch / Commit 策略

**Version impact（来自 proposal）：**

- `@aether-md/react`：新 package；Changeset minor `0.1.0` 或 workspace private `0.0.0` 直至发布审查。
- `@aether-md/core`：无 breaking；semver / exports / runtime deps 不变。
- `@aether-md/plugin-prosemirror`：可能 minor additive（`createProseMirrorView` + `prosemirror-view`）。
- `@aether-md/preset-gfm`：消费方不变；React smoke dev/test only。
- `manifestVersion`：不变（`[1]`）。
- `pnpm-lock.yaml`：react、happy-dom、prosemirror-view（plugin only）。

**Branch：** `feat/add-react-shell`

**Commit 策略：**

| 类型                       | scope 示例                   | Task           |
| -------------------------- | ---------------------------- | -------------- |
| `docs(openspec)`           | OpenSpec artifacts           | 已完成         |
| `feat(react)`              | components、hook、gate-lock  | 03, 04, 06     |
| `feat(plugin-prosemirror)` | view-bridge                  | 05             |
| `test(react)`              | boundary、integration、smoke | 01, 07, 08, 09 |
| `chore(react)`             | package scaffold、changeset  | 02             |

- 推荐 **一 Superpowers task 一 commit**。
- Archive 前 `aether-workflow-update-docs-spec` sync `react-shell` main spec、`editor-orchestration` delta、`docs/engineering/test-strategy.md` M5 基线、`docs/architecture/ci-checklist.md` GateLock 勾选。

## Recommended Next Skill

`aether-workflow-create-task` — 将本 plan 拆成 `.superpowers/tasks/add-react-shell/01-define-react-public-api-boundary-tests.md` … `10-run-full-validation.md`（每 task 含 TDD 步骤、Allowed files、OpenSpec scenario 引用、`Depends On` / `Parallel Group` / `Barrier` 元数据、validation 命令、wave-2 disjoint / wave-4 串行规则）。
