# add-editor-orchestration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use Superpowers task execution (`aether-workflow-create-task` → `aether-workflow-implement-task` / `aether-workflow-execute-task-loop`) to implement this plan task-by-task. Do not redefine OpenSpec requirements in code.

**Goal:** 在 `@aether-md/core` 实现 M4.5 编辑器编排层（`createEditor` / `AetherEditor`），将 M1 bootstrap、M2 Command/Event、M3/M4 Adapter 与 preset 显式 wiring 为 headless 可运行宿主入口，满足 Phase 0 冻结决策与 OpenSpec `editor-orchestration` capability，为 M5 React Shell 提供 Core API smoke path。

**Architecture:** 编排层位于 `packages/core/src/editor/**`（或等价模块划分）：`createEditor` 走 Validate → Adapter resolve → `createDefaultConflictResolver()`（仅 runtime command）→ `bootstrapCore` → editor-scoped Command/Event → Engine session → `ready`。Adapter 来自 plugin/preset factory，**不**修改 `bootstrapCore` silent-provide 规则。`AetherEditor.dispatch` 在 editor 层做 engine-bound apply + 快照 rollback；standalone `createCommandEventRuntime` 语义不变。

**Tech Stack:** TypeScript、Node built-in test runner、pnpm workspace、Turborepo `pnpm check`；integration tests 通过 **devDependencies** 引用 `@aether-md/preset-gfm`、`@aether-md/plugin-remark`、`@aether-md/plugin-prosemirror`；Core 生产代码 **零** remark/prosemirror/react 依赖。

---

## Change

| 字段 | 值 |
| --- | --- |
| OpenSpec change | `add-editor-orchestration` |
| Branch | `feat/add-editor-orchestration` |
| OpenSpec status | **complete**（4/4 artifacts）；`openspec validate add-editor-orchestration --strict` **pass**（plan 创建时） |
| Apply readiness | `isComplete: true`；OpenSpec high-level tasks 0/20 complete |
| Version impact | `@aether-md/core` **minor-level additive**（`createEditor`、`AetherEditor`、`EditorConfig`、`EditorContext`、`EditorStateSnapshot` 等）；M1–M4 行为 **无 breaking change**；`@aether-md/preset-gfm` / plugin packages export **不变**；`manifestVersion` / `SUPPORTED_MANIFEST_VERSIONS` **不变**（`[1]`）；`pnpm-lock.yaml` **预期变更**（core **devDependencies** workspace 链接） |
| Expected commit scope | `feat(core)`、`test(core)`；OpenSpec 产物 `docs(openspec)` |
| Commit strategy | 每个 Superpowers task 可单独 commit；PR body 须追踪 OpenSpec change id 与 task id |

范围边界：

- **包含：** `createEditor` / `AetherEditor`、显式 Adapter wiring、最小编排 rollback、`ready` / `change` / `transactionFailed` / `disposed`、宿主 `getMarkdown` / `getDocument`、EditorContext 最小面 + stub services、headless GFM integration test、package-boundary 翻转（允许 editor export）。
- **排除：** React/Vue Shell、GateLock、Shell Adapter、sync `createEditor`、`Core store`、`bootstrapCore` silent provide、完整 Guard 链、compile-layer / 宿主 ConflictResolver、History/Selection/Clipboard 完整语义、Worker/Queue/Permission/Telemetry、长期 Docs 大改。
- **Phase 0 硬约束：** async-only `createEditor`；只读 `state` + Event 观察；React 直接消费 `AetherEditor`（M5 实现，本 change 仅 headless 验证）。

## Source Artifacts

OpenSpec artifacts：

- `openspec/changes/add-editor-orchestration/proposal.md`
- `openspec/changes/add-editor-orchestration/design.md`
- `openspec/changes/add-editor-orchestration/specs/editor-orchestration/spec.md`
- `openspec/changes/add-editor-orchestration/specs/core-bootstrap/spec.md`
- `openspec/changes/add-editor-orchestration/specs/command-event-runtime/spec.md`
- `openspec/changes/add-editor-orchestration/specs/adapter-base/spec.md`
- `openspec/changes/add-editor-orchestration/tasks.md`

长期 source docs / ADRs：

- `docs/architecture/core-api.md`（Phase 0 冻结决策）
- `docs/architecture/package-layout.md`
- `docs/architecture/compatibility.md`
- `docs/engineering/mvp-implementation-plan.md`
- `docs/engineering/adapter-protocol.md`
- `docs/engineering/data-flow.md`
- `docs/engineering/conflict-resolver.md`
- `docs/engineering/test-strategy.md`
- `docs/sdk/editor-context.md`
- `docs/sdk/command-event-protocol.md`
- `docs/adr/001-microkernel-architecture.md`
- `docs/adr/003-remark-prosemirror-dual-track.md`

## Code-Management

创建 plan 时 `git status --short`：

```
 M docs/architecture/core-api.md
?? openspec/changes/add-editor-orchestration/
```

当前分支：`feat/add-editor-orchestration`

- **允许修改区：** `packages/core/**`（含 src、tests、`package.json` devDependencies）、本 change 的 OpenSpec / Superpowers 产物、`pnpm-lock.yaml`（devDeps only）、`docs/architecture/core-api.md`（Phase 0，同源分支）。
- **禁止纳入本 change：** 无关 dirty 文件、`packages/react` / `packages/vue`、plugin/preset **生产 API** 变更（除非 integration 所需且 additive-only）、长期 Docs 大改、workflow skill mirrors。
- **禁止新建：** React Shell、GateLock、`bootstrapCore` Adapter 自动加载逻辑。
- **Core 依赖 guard：** `packages/core/package.json` **dependencies** **MUST NOT** 新增 `remark`、`prosemirror*`、`react`、`vue`；preset/plugins **仅** 允许出现在 **devDependencies**。

## File Map

| 路径 | 职责 |
| --- | --- |
| `packages/core/src/editor/types.ts` | `EditorConfig`、`AetherEditor` 接口、`EditorStateSnapshot`、`EditorSecurityConfig`；**不**含 store API |
| `packages/core/src/editor/context.ts` | `EditorContext` 最小实现；`services.engine` / `services.parser` wired；history/selection/clipboard/assets/telemetry **stub** |
| `packages/core/src/editor/conflict-resolver.ts` | `createDefaultConflictResolver()`、`ConflictResolver` 类型（对齐 `docs/engineering/conflict-resolver.md`）；**仅** runtime command 注册使用 |
| `packages/core/src/editor/adapter-wiring.ts` | 从 `ExtensionPlugin` + preset-shaped bundle 解析 Parser / Serializer / Engine；Capability 校验辅助 |
| `packages/core/src/editor/create-editor.ts` | `createEditor()` 编排流水线：validate → resolve → conflict merge → bootstrap → runtime → session → `ready` |
| `packages/core/src/editor/aether-editor.ts` | `AetherEditor` 实现：`state`、`dispatch`、`on`、`getMarkdown`、`getDocument`、`dispose` |
| `packages/core/src/editor/engine-dispatch.ts` | engine-bound command 路由、快照 save/restore、`change` / `transactionFailed` emit |
| `packages/core/src/editor/editor-orchestration.test.ts` | contract tests：startup 失败、dispose fail-closed、rollback、M2 独立性 smoke |
| `packages/core/src/editor/create-editor-gfm.integration.test.ts` | headless `createEditor` + `createGfmPreset()` GFM round-trip（无 React） |
| `packages/core/src/package-boundary.test.ts` | **翻转**：允许 `createEditor` export；继续 forbid Shell / GFM preset re-export / engine runtime deps |
| `packages/core/src/index.ts` | 新增 editor orchestration public exports |
| `packages/core/package.json` | **devDependencies**：`@aether-md/preset-gfm`、`@aether-md/plugin-remark`、`@aether-md/plugin-prosemirror`（workspace:`*`） |
| `packages/core/tsconfig.test.json` | 若需引用 devDependency 类型，确认 test 编译包含 integration 文件 |

**不修改（除非 regression）：** `packages/core/src/bootstrap.ts`、`capabilities.ts`（**不** silent provide adapter）、`command-event-runtime.ts`（M2 语义不变）。

**Preset 消费约定（Task 03 定稿，不修改 preset public API）：** `createGfmPreset()` 返回 `{ manifest, parser, serializer, engine }`；编排层接受 `ExtensionPlugin` 扩展形状或 wrapper 将 `GfmPreset` 转为 `{ manifest, adapters: { parser, serializer, engine } }`。

不得出现在 `@aether-md/core` **生产**代码：`remark`、`prosemirror*`、`react`、`vue`、`createGfmPreset` re-export。

## Package Boundary Guard（全程强制）

每个 Phase / Task 结束前，实现者 **MUST** 确认：

| 禁止项 | Guard |
| --- | --- |
| Core → Remark（runtime） | `packages/core/package.json` `dependencies` 与 `packages/core/src/**` 生产代码无 `remark` import |
| Core → ProseMirror（runtime） | 同上，无 `prosemirror*` import |
| Core → React / Vue | 无 UI 框架 runtime 依赖或 import |
| Core → GFM preset 实现 | 无 `@aether-md/preset-gfm` **re-export**；integration test 仅 devDependency import |
| Shell / GateLock | 无 `@aether-md/react`、DOM、GateLock 代码 |
| bootstrap silent provide | `bootstrap.ts` / `capabilities.ts` **不**新增 `core:engine` / `core:parser` silent provide |
| M2 语义污染 | `createCommandEventRuntime` 测试不 require adapter；raw `dispatch` 不 rollback / 不 emit `transactionFailed` |
| Core store | 无 `subscribe` / observable store export |
| sync createEditor | 无 `createEditorSync` export |

**Core package guard（Task 09 / 10 必跑）：**

```bash
rg -i "from ['\"]remark|from ['\"]prosemirror|from ['\"]react|from ['\"]@aether-md/preset-gfm|from ['\"]@aether-md/plugin-" packages/core/src --glob '!**/*.test.ts' --glob '!**/*.integration.test.ts'
```

预期：生产 `.ts` 无命中（测试文件允许 devDependency import）。

**dependencies vs devDependencies：**

```bash
node -e "const p=require('./packages/core/package.json'); const d=Object.keys(p.dependencies||{}); console.log(d.filter(x=>/remark|prosemirror|react|vue|preset-gfm|plugin-/.test(x)))"
```

预期：空数组。

## Implementation Phases

每个 Phase 遵循 **TDD / contract-first**：先写失败测试 → 最小实现 → 测试通过 → 再进入下一阶段。

### Phase 1: Public API boundary + types（Task 01）

**映射 OpenSpec（引用，不重新定义）：**

- `editor-orchestration` → `createEditor public entry is exported from core`
- `editor-orchestration` → `EditorStateSnapshot is read-only without Core store`
- `core-bootstrap` → `Minimal Core package exists`（MODIFIED）

**TDD / contract 入口：**

1. 新增 `editor/types.ts`：`EditorConfig`、`AetherEditor`、`EditorStateSnapshot`（`doc` + `readOnly`）。
2. 更新 `package-boundary.test.ts`：**失败测试**期望 `createEditor` **存在**（当前 assert false → 改为 true）；继续 assert **无** `createGfmPreset` / React / Shell exports。
3. 更新 `index.ts` export 类型面（可先 stub `createEditor` throw / 未实现）。
4. 运行 `pnpm core:test` → FAIL（无实现）→ 最小 export stub → boundary 相关 PASS。

**产出：** 公开类型与 boundary 测试定义 M4.5 export 契约。

### Phase 2: Foundation modules（Tasks 02–04，可并行）

**Task 02 — ConflictResolver**

- 映射：`editor-orchestration` → `Runtime command conflicts use default ConflictResolver only`
- 失败测试：`createDefaultConflictResolver()` + duplicate `command` id → `last-wins`
- 失败测试：传入 `schema` context → `abort`（**不**在 createEditor 调用 compile merge）
- 文件：`editor/conflict-resolver.ts` + `editor/conflict-resolver.test.ts`

**Task 03 — Adapter wiring from preset**

- 映射：`editor-orchestration` → `Editor orchestration wires adapters explicitly`
- 失败测试：给定 `{ manifest, parser, serializer, engine }` bundle → resolve 三者；missing engine → throw `CoreError`
- 失败测试：resolve 路径 **不**调用 bootstrap silent provide
- 文件：`editor/adapter-wiring.ts` + `editor/adapter-wiring.test.ts`

**Task 04 — EditorContext stubs**

- 映射：`editor-orchestration` → `EditorContext exposes minimal orchestration services`
- 失败测试：`EditorContext` 暴露 `commands`、`events`、`services.engine`、`services.parser`；stub services 存在且 documented no-op/throw
- 文件：`editor/context.ts` + `editor/context.test.ts`

**产出：** 编排流水线可组合的独立模块；**无**完整 `createEditor`  yet。

### Phase 3: createEditor orchestration（Task 05）

**映射：**

- `createEditor public entry` / `Markdown initialValue uses Parser adapter` / `ready event fires after startup`
- `core-bootstrap` boundary（editor export 允许）

**TDD / contract 入口：**

1. 失败测试：`createEditor({ plugins: [mockPluginWithAdapters] })` resolve `AetherEditor`；emit `ready`
2. 失败测试：unsupported manifest → reject `CoreError`
3. 失败测试：`initialValue: string` 调用 Parser；`initialValue: AetherDoc` 跳过 Parser
4. 集成 `bootstrapCore` + adapter wiring + conflict resolver；**不**改 bootstrap silent provide
5. `pnpm core:test` FAIL → implement → PASS（不含 dispatch/GFM integration）

**产出：** headless 可创建 editor 实例；`getMarkdown`/`dispatch` 可 stub 至 Phase 4–5。

### Phase 4: Document host APIs（Task 06）

**映射：**

- `AetherEditor exposes host document and lifecycle APIs` → `getDocument` / `getMarkdown`

**TDD / contract 入口：**

1. 失败测试：running editor `getDocument()` 返回当前 `AetherDoc` 快照
2. 失败测试：`getMarkdown()` lazy serialize（**不在**每次 change eager serialize，见 Open Questions）
3. 失败测试：`getDocument()` ≠ `EngineAdapter.getDocument(session)` 语义混用（宿主快照）
4. 运行 `pnpm core:test` → PASS

**产出：** 宿主文档读取 API 可用。

### Phase 5: Dispatch + events（Task 07）

**映射：**

- `Editor dispatch orchestrates engine apply with minimal rollback`
- `command-event-runtime` → `Editor integrated dispatch extends Command Event semantics`（ADDED）
- `adapter-base` → `Orchestrated apply failure preserves core-visible snapshot`（ADDED）

**TDD / contract 入口：**

1. 失败测试：engine-bound `dispatch`（如 `core:replaceText`）成功 → `change` with `{ doc }`；`getDocument` 更新
2. 失败测试：apply 失败 → 快照恢复 + `transactionFailed` + `{ ok: false }`
3. 失败测试：plugin command throw → `pluginError`（M2 隔离），**不**走 adapter rollback
4. 失败测试：`dispose()` 后 `dispatch` fail-closed + `disposed` event
5. 失败测试：standalone `createCommandEventRuntime` 仍无 rollback（M2 regression 在同一文件或既有 test 文件）
6. `pnpm core:test` → PASS

**Engine-bound command id（Task 07 内冻结）：** 使用 `core:replaceText`（与 M3 `ReplaceTextCommand` 对齐），在 `engine-dispatch.ts` 与 tests 一致。

**产出：** 完整 `AetherEditor` 运行时语义（除 integration 矩阵）。

### Phase 6: Headless GFM integration（Task 08）

**映射：**

- `Headless GFM preset integration is verified through createEditor`
- `adapter-base` → `GFM round-trip can run through createEditor`（ADDED）

**TDD / contract 入口：**

1. 添加 `package.json` devDependencies（workspace preset + plugins）
2. 失败测试：`createEditor({ plugins: [toExtensionPlugin(createGfmPreset())], initialValue: '**bold**\n' })` → dispatch edit → `getMarkdown()` golden assert
3. 至少 3 fixtures：**paragraph**、**strong**、**unordered list**（design 建议最小子集；可扩展至六语法）
4. 断言 test 文件 **不** import `react` / `@aether-md/react`
5. 运行：

```bash
pnpm --filter @aether-md/core test
```

**产出：** headless smoke path 绿；满足 `docs/architecture/package-layout.md` Core API 验证条件。

### Phase 7: Boundary reinforcement + full validation（Tasks 09–10）

**Task 09：** 强化 boundary + non-goals checklist  
**Task 10：** `pnpm check` + `openspec validate` barrier

## Dependency Order

```
01 define-editor-public-api-boundary-tests
        │
        ├──────────────┬──────────────┐
        ▼              ▼              ▼
02 conflict-    03 adapter-    04 editor-context-
   resolver        factory         stub-services
        │              │              │
        └──────────────┴──────────────┘
                       │
                       ▼
05 implement-create-editor-orchestration
                       │
              ┌────────┴────────┐
              ▼                 ▼
06 get-markdown-      07 editor-dispatch-
   get-document           change-events
              │                 │
              └────────┬────────┘
                       ▼
08 add-create-editor-gfm-integration-tests
                       │
                       ▼
09 reinforce-package-boundary-and-non-goals
                       │
                       ▼
10 run-full-validation  [BARRIER]
```

跨阶段约束：

- M1 bootstrap / M2 Command/Event / M3–M4 Adapter **MUST NOT** breaking change
- Phase 0 三项决策 **MUST NOT** deviation
- OpenSpec 与 Docs 冲突 → 暂停更新 OpenSpec，禁止 silent 偏离

## Task Breakdown

| Task | Outcome | Allowed Area | Validation | Version Impact | Depends On | Parallel Group | Barrier |
| --- | --- | --- | --- | --- | --- | --- | --- |
| **01** `define-editor-public-api-boundary-tests` | 公开类型 + boundary 测试定义 M4.5 export | `editor/types.ts`、`index.ts`、`package-boundary.test.ts` | `pnpm core:test` | core additive types | — | **G0** | no |
| **02** `implement-default-conflict-resolver` | `createDefaultConflictResolver()` 仅 command 注册 | `editor/conflict-resolver.ts`、`*test.ts` | `pnpm core:test` | none | 01 | **G1** | no |
| **03** `implement-adapter-factory-from-preset` | preset-shaped bundle → wired adapters | `editor/adapter-wiring.ts`、`*test.ts` | `pnpm core:test` | none | 01 | **G1** | no |
| **04** `implement-editor-context-stub-services` | EditorContext 最小面 + stubs | `editor/context.ts`、`*test.ts` | `pnpm core:test` | none | 01 | **G1** | no |
| **05** `implement-create-editor-orchestration` | `createEditor` 流水线 + `ready` + startup 失败 | `editor/create-editor.ts`、`aether-editor.ts`（skeleton） | `pnpm core:test` | `createEditor` export | 02, 03, 04 | **G2** | no |
| **06** `implement-get-markdown-and-get-document` | 宿主 `getDocument` / lazy `getMarkdown` | `editor/aether-editor.ts` | `pnpm core:test` | none | 05 | **G3** | no |
| **07** `implement-editor-dispatch-and-change-events` | `dispatch`、rollback、`change`/`transactionFailed`/`disposed` | `editor/engine-dispatch.ts`、`aether-editor.ts` | `pnpm core:test` | none | 05, 06 | **G3** | no |
| **08** `add-create-editor-gfm-integration-tests` | headless GFM integration | `create-editor-gfm.integration.test.ts`、`package.json` devDeps | `pnpm --filter @aether-md/core test` | lockfile devDeps | 05, 06, 07 | **G4** | no |
| **09** `reinforce-package-boundary-and-non-goals` | boundary 翻转确认 + non-goals checklist + M2 regression | `package-boundary.test.ts`、`rg` guard | `pnpm core:test` + guard scripts | none | 08 | **G5** | no |
| **10** `run-full-validation` | 全 workspace 绿 + openspec strict | 全 change scope | `pnpm check`；`openspec validate add-editor-orchestration --strict` | 确认 lockfile | 09 | **G6** | **yes** |

**Parallel execution notes：**

- **G1（02/03/04）** 可在 Task 01 merge 后并行；合并前须各自 `pnpm core:test` 绿。
- **G3（06/07）** 均依赖 05；建议 **06 先于 07**（dispatch 测试常断言 post-edit `getDocument`），若 07 先开工则 06 仅实现 read API 不含 dispatch 断言。
- **G6（10）** 为唯一 **Barrier** task：必须 serial 最后执行；失败则不得标记 change implementation complete。

## Validation Matrix

| Phase / Task | OpenSpec Requirement（引用 capability） | Validation 入口 | Intuitive Verification | Notes |
| --- | --- | --- | --- | --- |
| 01 | `editor-orchestration` createEditor export；EditorStateSnapshot | `pnpm core:test` | boundary 期望 `createEditor` 存在 | types-only stub OK |
| 01 | `core-bootstrap` Minimal Core package (MODIFIED) | `pnpm core:test` | 仍 forbid Shell/GFM re-export | |
| 02 | `editor-orchestration` ConflictResolver only | `pnpm core:test` | command last-wins unit test | 不调用 schema merge |
| 03 | `editor-orchestration` explicit adapter wiring | `pnpm core:test` | resolve parser/serializer/engine | no silent provide |
| 04 | `editor-orchestration` EditorContext minimal | `pnpm core:test` | commands/events/engine/parser | stubs documented |
| 05 | createEditor resolve / CoreError / ready / Markdown init | `pnpm core:test` | orchestration.test startup paths | 无 React |
| 06 | host getDocument / getMarkdown | `pnpm core:test` | lazy serialize test | |
| 07 | dispatch rollback / change / transactionFailed / disposed | `pnpm core:test` | engine-dispatch tests | M2 standalone unchanged |
| 07 | `command-event-runtime` standalone independence (ADDED) | `pnpm core:test` | 既有 `command-event-runtime.test.ts` 绿 | |
| 08 | headless GFM through createEditor | `pnpm --filter @aether-md/core test` | integration test ≥3 fixtures | devDeps only |
| 08 | `adapter-base` createEditor round-trip (ADDED) | 同上 | 经 createEditor 非 harness | |
| 09 | package boundary / non-goals | `pnpm core:test` + `rg` guard | checklist § Package Boundary Guard | |
| 10 | 全 change 验收 | `pnpm check` | workspace build/typecheck/test 绿 | barrier |
| 10 | OpenSpec strict | `openspec validate add-editor-orchestration --strict` | pass | barrier |

**汇总命令映射：**

| 命令 | 覆盖 |
| --- | --- |
| `pnpm core:test` | Tasks 01–09；M1–M4 regression；editor contract + integration |
| `pnpm --filter @aether-md/core test` | Task 08 integration（同 core:test，可单独跑 editor 目录） |
| `pnpm check` | Task 10 全 workspace gate（build + typecheck + test + skills check） |
| `openspec validate add-editor-orchestration --strict` | Task 10 OpenSpec barrier |

**Integration test 聚焦命令（Task 08 本地迭代）：**

```bash
pnpm --filter @aether-md/core exec node --test dist/editor/create-editor-gfm.integration.test.js
```

（具体 dist 路径以 `tsconfig.test.json` 编译输出为准；task 文件内写死实际 path。）

## Boundary Risks

| 风险 | 触发点 | 处理方式 |
| --- | --- | --- |
| Core runtime 依赖 preset/plugins | 为省事加入 dependencies | 仅 devDependencies；Task 09 guard |
| bootstrap silent provide | createEditor 内补 engine/parser | 显式 wiring only；capabilities.test 不变 |
| M2 语义回归 | editor 修改 command-event-runtime.ts | 最小 internal reuse；M2 tests 独立文件 |
| store API creep | Shell 便利 | Phase 0 禁止；EditorStateSnapshot 仅 doc+readOnly |
| sync createEditor | 测试简单 | boundary forbid |
| integration 与 M4 harness 重复 | 复制 round-trip 逻辑 | 断言 import path 经 `createEditor` |
| ExtensionPlugin shape 与 GfmPreset 不匹配 | Task 03/05 | `toExtensionPlugin(createGfmPreset())` helper |
| getMarkdown eager serialize 性能 | change 热路径 | lazy on call（design 建议） |
| 无关文件 commit | core-api + openspec + impl | Code-Management 区 |

## Review Focus

- 每个改动文件映射到 Task 01–10。
- 每个 Task 映射到 OpenSpec delta spec scenario；**不得**发明 requirement 外行为。
- `@aether-md/core` **dependencies** 无 remark/prosemirror/react/vue/preset-gfm。
- Package Boundary Guard 表全部满足。
- Phase 0 三项决策无 deviation。
- M1–M4 测试绿；M2 `createCommandEventRuntime` 无 adapter rollback。
- `bootstrapCore` 无 silent provide adapter。
- integration test 无 React/DOM；经 `createEditor` 路径。
- `pnpm-lock.yaml` 变更仅 devDependencies workspace links。
- 说明性正文中文；代码标识 English。

## Open Questions

| 问题 | Plan 阶段处理 | 阻塞？ |
| --- | --- | --- |
| `ExtensionPlugin` 是否扩展 `adapters` 字段 vs wrapper helper | Task 03/05 定稿 `toExtensionPlugin(GfmPreset)`；须通过 wiring tests | 否 |
| Engine-bound command id 命名空间 | Task 07 冻结 `core:replaceText` | 否 |
| GFM integration 六语法全量 vs 最小子集 | Task 08 最少 paragraph + strong + list；扩展留 task 内 optional | 否 |
| `getMarkdown()` lazy vs eager | Task 06 lazy on call；integration 显式调用 `getMarkdown()` | 否 |
| stub History API 行为 throw vs no-op | Task 04 选 no-op + `Symbol`/`undefined` return；document in context.ts | 否 |

实现中若需偏离 OpenSpec `design.md` 或 Phase 0，**MUST** 先更新 OpenSpec change 记录 deviation，再改代码。

## Version Impact / Branch / Commit 策略

**Version impact（来自 proposal）：**

- `@aether-md/core`：minor-level additive exports；M1–M4 无 breaking。
- `@aether-md/preset-gfm` / plugins：export 不变；integration 消费 only。
- `manifestVersion`：不变（`[1]`）。
- `pnpm-lock.yaml`：core devDependencies workspace 链接。

**Branch：** `feat/add-editor-orchestration`

**Commit 策略：**

| 类型 | scope 示例 | Task |
| --- | --- | --- |
| `docs(openspec)` | OpenSpec artifacts | 已完成 |
| `feat(core)` | editor modules | 02–07 |
| `test(core)` | boundary、integration、contract | 01, 08, 09 |
| `chore(core)` | devDependencies | 08 |

- 推荐 **一 Superpowers task 一 commit**。
- Archive 前 `aether-workflow-update-docs-spec` sync main specs + `docs/architecture/compatibility.md`。

## Recommended Next Skill

`aether-workflow-create-task` — 将本 plan 拆成 `.superpowers/tasks/add-editor-orchestration/01-define-editor-public-api-boundary-tests.md` … `10-run-full-validation.md`（每 task 含 TDD 步骤、Allowed files、OpenSpec scenario 引用、`Depends On` / `Parallel Group` / `Barrier` 元数据、validation 命令）。
