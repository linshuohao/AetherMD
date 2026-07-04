# add-command-event-runtime Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use Superpowers task execution (`aether-workflow-create-task` → `aether-workflow-implement-task` / `aether-workflow-execute-task-loop`) to implement this plan task-by-task. Do not redefine OpenSpec requirements in code.

**Goal:** 在 `@aether-md/core` 中实现最小可测的 Command Bus 与 Event Hub 运行时（M2），不引入后续里程碑能力。

**Architecture:** 独立 `createCommandEventRuntime()` factory，与 `bootstrapCore` 解耦。同步 `register` / `dispatch`，Event Hub 提供 `on` / `emit` / `Unsubscribe`。Pipeline 仅含错误边界；handler 抛错映射为 `PluginError` 形状失败结果并 emit `pluginError`，不做 Adapter 事务回滚。

**Tech Stack:** TypeScript、Node built-in test runner、现有 `packages/core` 构建脚本（`tsc` + `node --test`）。

---

## Change

| 字段 | 值 |
| --- | --- |
| OpenSpec change | `add-command-event-runtime` |
| Status | OpenSpec artifacts complete（proposal / design / specs / tasks）；plan ready |
| Version impact | `@aether-md/core` public exports 增量（minor-level，包未发布）；不改 `SUPPORTED_MANIFEST_VERSIONS` / `manifestVersion` / lockfiles |
| Expected commit scope | `feat(core)`；OpenSpec 产物可用 `docs(openspec)` 或同 PR body 追踪 change id |
| Commit strategy | 每个 Superpowers task 可单独 commit；PR 合入前可 squash，但 body 须保留 task / requirement 追踪 |

范围边界：

- **包含：** Command/Event public types、`createCommandEventRuntime`、同步 handler 注册与派发、`CommandResult`、Event Hub、handler 错误隔离、package boundary tests。
- **排除：** Adapter、React、Remark、ProseMirror、GFM、Markdown parse/serialize、Command Queue priority/coalescing、Worker Thread、完整权限沙盒、完整 `createEditor`、事务回滚、M1 follow-up（duplicate `metadata.name`、partial startup cleanup、`bootstrapCore` dispose public contract）。
- **文档语言：** 说明性正文使用中文；代码标识、API 名称、包名、路径与 OpenSpec 结构关键词保持英文。

## Source Artifacts

OpenSpec artifacts：

- `openspec/changes/add-command-event-runtime/proposal.md`
- `openspec/changes/add-command-event-runtime/design.md`
- `openspec/changes/add-command-event-runtime/specs/command-event-runtime/spec.md`
- `openspec/changes/add-command-event-runtime/specs/core-bootstrap/spec.md`
- `openspec/changes/add-command-event-runtime/tasks.md`

长期 source docs：

- `docs/engineering/mvp-implementation-plan.md`
- `docs/architecture/core-api.md`
- `docs/architecture/principles.md`
- `docs/sdk/command-event-protocol.md`
- `docs/sdk/commands.md`
- `docs/sdk/lifecycle.md`
- `docs/engineering/error-model.md`
- `docs/engineering/test-strategy.md`

Code-management：

- 创建 plan 前无关脏文件：`M AGENTS.md`（禁止纳入本 change commit）。
- 允许修改区：`packages/core/**`、本 change 的 OpenSpec / Superpowers 产物。
- 禁止新建：`packages/react`、`packages/plugin-*`、`packages/preset-*` 或任何 Adapter / Markdown / Shell 包。

## File Map

| 路径 | 职责 |
| --- | --- |
| `packages/core/src/command-event-types.ts` | Command/Event public types（`CommandId`、`CommandRequest`、`CommandResult`、`EventEnvelope` 等） |
| `packages/core/src/plugin-error.ts` 或扩展 `errors.ts` | `PluginError`（`source: 'plugin'`，`severity: 'recoverable'`）与 runtime core 失败码 |
| `packages/core/src/command-event-runtime.ts` | `createCommandEventRuntime`、`CommandEventRuntime`（Event Hub + Command Bus） |
| `packages/core/src/command-event-runtime.test.ts` | Command/Event contract tests |
| `packages/core/src/package-boundary.test.ts` | 更新 M2 允许面与后续里程碑禁止面 |
| `packages/core/src/index.ts` | public exports |

不得新增依赖或引用：`react`、`prosemirror`、`remark`、`gfm`、Adapter、Markdown parse/serialize 模块。

## Package Boundary Guard（全程强制）

每个阶段结束前，实现者 **MUST** 确认：

| 禁止项 | Guard |
| --- | --- |
| Adapter | 无 Adapter 类型/工厂/依赖；exports 不含 Adapter API |
| React | 无 `react` / `@aether-md/react` 依赖或 import |
| Remark | 无 `remark` 依赖或 import |
| ProseMirror | 无 `prosemirror*` 依赖或 import |
| GFM | 无 GFM preset 包或 import |
| Markdown parse/serialize | 无 `parseMarkdown` / `serializeMarkdown` / `getMarkdown` / `getDocument` public API |

建议 guard 命令（Phase 6 必跑，中间阶段可抽查）：

```bash
rg -i "react|prosemirror|remark|gfm|createEditor|parseMarkdown|serializeMarkdown|getMarkdown|getDocument|Adapter" packages/core/src packages/core/package.json
```

预期：无后续里程碑实现命中（测试里对 **禁止导出名** 的字符串断言除外）。

## Implementation Phases

每个阶段遵循 **TDD / contract-first**：先写失败测试 → 最小实现 → 测试通过 → 再进入下一阶段。

### Phase 1: Public types 与 factory 表面

**映射 requirements：**

- `Command and Event public types are exported`
- `CommandEventRuntime public API is exported`（factory 与方法表面；行为可先 stub）

**TDD / contract 入口：**

1. 在 `command-event-runtime.test.ts` 写失败测试：可从 `@aether-md/core`（或 `./index.js`）导入 `createCommandEventRuntime`，返回对象含 `register` / `dispatch` / `on` / `emit` / `dispose`。
2. 在 `package-boundary.test.ts` 写失败断言：exports 包含 `createCommandEventRuntime`（同时保留对 `createEditor` 等的禁止）。
3. 运行：`pnpm --filter @aether-md/core test`（预期 FAIL：缺少 export / factory）。
4. 最小实现 types + factory stub（`dispatch` 可先返回未知命令失败；`on`/`emit` 可先空实现）。
5. 再跑测试至 PASS。

**产出：** `command-event-types.ts`、`PluginError` / core runtime error 形状、`createCommandEventRuntime` 导出。

### Phase 2: Event Hub（`on` / `emit` / unsubscribe）

**映射 requirements：**

- `Event Hub supports subscribe emit and unsubscribe`

**TDD / contract 入口：**

1. 失败测试：`on('change', listener)` 后 `emit({ name: 'change', source: 'core', timestamp })` 调用 listener，且 envelope 含 `name` / `source` / `timestamp`。
2. 失败测试：`Unsubscribe()` 后不再投递。
3. 失败测试：`pluginError` 事件可投递；payload 可 `JSON.stringify`。
4. 运行测试 FAIL → 实现 Event Hub → PASS。

**产出：** 完整 Event Hub；不依赖 document model。

### Phase 3: 同步 Command Bus（成功 / `false` / 未知命令 / priority 忽略）

**映射 requirements：**

- `Synchronous command handlers can be registered and dispatched`
- `CommandResult reports success and failure`

**TDD / contract 入口：**

1. 失败测试：`register('demo:ping', () => ({ value: 1 }))` 后 `dispatch({ id: 'demo:ping' })` → `{ ok: true, value: 1 }`。
2. 失败测试：handler 返回 `false` → `{ ok: false }`，不抛异常。
3. 失败测试：未知 `CommandId` → `{ ok: false, error.source === 'core' }`，不抛异常。
4. 失败测试：带 `meta.priority: 'high'` 与 `'normal'` 的两次 `dispatch` 不改变注册顺序语义（无队列重排）。
5. FAIL → 实现同步 register/dispatch（仅错误边界 Middleware）→ PASS。

**产出：** 同步 Command Bus；忽略 `priority`。

### Phase 4: Handler 错误隔离与 `pluginError`

**映射 requirements：**

- `Handler errors become reviewable failure results`

**TDD / contract 入口：**

1. 失败测试：handler `throw new Error('boom')` → `dispatch` 返回 `{ ok: false, error.source === 'plugin', error.severity === 'recoverable' }`，且 `dispatch` 本身不抛。
2. 失败测试：订阅 `pluginError` 后，上述 `dispatch` 触发一次 `pluginError` envelope，payload 含可审查 `error`。
3. 明确 **不** 断言事务回滚或文档快照保留。
4. FAIL → 实现 try/catch 映射与 emit → PASS。

**产出：** `PluginError` 路径；无 Adapter 回滚。

### Phase 5: Dispose 失败关闭

**映射 requirements：**

- `Disposed runtime rejects further command dispatch`

**TDD / contract 入口：**

1. 失败测试：`dispose()` 后 `dispatch` → `{ ok: false, error.source === 'core' }`，handler 不被调用。
2. 失败测试：`dispose()` 后 `emit` 不投递已订阅 listener。
3. 失败测试：重复 `dispose()` 不抛。
4. FAIL → 实现 disposed 标志 → PASS。

**产出：** runtime-level dispose 语义；**不**修改 `bootstrapCore` dispose public contract，**不**实现 M1 follow-up。

### Phase 6: Package boundary、全量验证与 M1 follow-up 护栏

**映射 requirements：**

- `M2 package boundary excludes later milestones`
- `core-bootstrap` MODIFIED：允许 Command/Event，禁止后续里程碑
- OpenSpec tasks §6 Deferred M1 follow-ups（记录 only）

**TDD / contract 入口：**

1. 更新 `package-boundary.test.ts`：
   - **允许：** `createCommandEventRuntime`、Command/Event 相关 type exports（若可运行时检测）。
   - **禁止导出：** `createEditor`、`parseMarkdown`、`serializeMarkdown`、`getMarkdown`、`getDocument`、Adapter 工厂名、React/Remark/ProseMirror/GFM 相关 export。
2. 运行 package boundary tests + `command-event-runtime.test.ts`。
3. 运行 scope guard `rg`（见上表）。
4. 运行 `pnpm check`（或至少 `pnpm --filter @aether-md/core test` + `typecheck` + `build`）。
5. Review checklist：实现与 tests **未**把 duplicate `metadata.name`、partial startup cleanup、`bootstrapCore` dispose public contract 当作本 change 验收条件。

**产出：** 边界测试与全量绿；M1 follow-up 仅记录在 validation/review。

## Dependency Order

1. Phase 1 → 固定 public types 与 factory 表面，后续测试依赖稳定 import。
2. Phase 2 → Event Hub 可被 Phase 4 的 `pluginError` 复用。
3. Phase 3 → Command Bus 成功路径，为 Phase 4/5 提供 `register`/`dispatch`。
4. Phase 4 → 依赖 Phase 2 emit 与 Phase 3 dispatch。
5. Phase 5 → 依赖完整 runtime 行为。
6. Phase 6 → 汇总边界与全量验证，不得提前扩大范围。

跨阶段约束：

- 不得在任一阶段引入 Adapter / React / Remark / ProseMirror / GFM / Markdown parse/serialize。
- 不得实现完整 Middleware Guard 链或 Command Queue。
- 不得把 Command/Event API 挂到 `CoreBootstrapRuntime`（保持独立 factory）。
- 若发现 OpenSpec 与 Docs/ADR 冲突，暂停并更新 OpenSpec change，禁止 silent 偏离。

## Boundary Risks

| 风险 | 触发点 | 处理方式 |
| --- | --- | --- |
| M2 膨胀到 M3 | 为 `change` payload 引入假文档或 Adapter | 只测 `emit('change')` 与 JSON payload，不发明 `AetherDoc` |
| 误实现事务回滚 | 照搬 test-strategy 全文 | 只断言 `PluginError` 隔离；不写 rollback 测试 |
| 破坏 M1 边界测试 | `package-boundary.test.ts` 仍禁止所有 Command/Event | Phase 6 明确允许 `createCommandEventRuntime`，继续禁止后续里程碑 |
| 耦合 `bootstrapCore` | 把 Bus/Hub 塞进 bootstrap runtime | design Decision 1：独立 factory |
| 偷偷做 M1 follow-up | 改 dependency 同名检测或 bootstrap dispose 文档合同 | Phase 6 checklist；tasks §6 仅记录 |
| 无关文件污染 | 提交 `AGENTS.md` | code-management：排除无关脏文件 |
| Promise vs sync 漂移 | 实现 `async dispatch` | 保持同步 `CommandResult`；Promise 留给后续 `AetherEditor` |

## Validation Matrix

| Phase | OpenSpec Requirement | Validation 入口 | 预期 |
| --- | --- | --- | --- |
| 1 | Command and Event public types are exported | import types / compile + export smoke | types 可从 package entry 导入 |
| 1 | CommandEventRuntime public API is exported | `typeof createCommandEventRuntime === 'function'`；runtime 含五方法 | factory 与方法表面存在 |
| 2 | Event Hub supports subscribe emit and unsubscribe | `on` / `emit` / `Unsubscribe` / JSON payload / `change`+`pluginError` tests | 订阅投递与取消正确 |
| 3 | Synchronous command handlers can be registered and dispatched | register + dispatch success / unknown / priority tests | 同步路径与 core 失败 |
| 3 | CommandResult reports success and failure | success `ok: true`；`false` → `ok: false` | 结果形状正确 |
| 4 | Handler errors become reviewable failure results | throw → PluginError；emit `pluginError`；无 rollback 断言 | 错误隔离 |
| 5 | Disposed runtime rejects further command dispatch | dispose 后 dispatch/emit/重复 dispose | 失败关闭 |
| 6 | M2 package boundary excludes later milestones | package-boundary tests + `rg` guard + `pnpm check` | 允许 M2，禁止 Adapter/React/Remark/ProseMirror/GFM/Markdown |
| 6 | core-bootstrap MODIFIED package surface | boundary tests 仍暴露 M1 bootstrap API | M1 行为保持 |
| 6 | M1 follow-ups remain out of this capability | review checklist | 未实现三条 follow-up |

## Task Breakdown

| Task | Outcome | Allowed Area | Validation | Version Impact |
| --- | --- | --- | --- | --- |
| 01 Public types + factory surface | types、`PluginError`、`createCommandEventRuntime` stub 导出 | `packages/core/src/{command-event-types,errors or plugin-error,command-event-runtime,index}.ts` + 初始 tests | Phase 1 TDD | public exports 增量 |
| 02 Event Hub | `on` / `emit` / `Unsubscribe` | `command-event-runtime.ts` + tests | Phase 2 TDD | 无额外 SemVer 面（方法已在 factory 表面） |
| 03 Sync Command Bus | register/dispatch 成功、`false`、未知命令、忽略 priority | 同上 | Phase 3 TDD | 无 |
| 04 Handler error isolation | PluginError 结果 + `pluginError` 事件 | 同上 | Phase 4 TDD | 导出 `PluginError` |
| 05 Dispose fail-closed | dispose 后 dispatch/emit/重复 dispose | 同上 | Phase 5 TDD | 无 |
| 06 Package boundary + full check | 更新 boundary tests、scope guard、`pnpm check`、M1 follow-up 护栏记录 | `package-boundary.test.ts`、validation notes | Phase 6 | 确认无 lockfile / manifestVersion 变更 |

详细 Superpowers task 文件由 `aether-workflow-create-task` 从本 plan 拆出；每个 task **MUST** 以失败测试开头。

## Review Focus

- 每个改动文件映射到上表 Task。
- 每个 Task 映射到 OpenSpec requirement（不得发明 requirement 外行为）。
- Public contract 名称与 design 一致：`createCommandEventRuntime`、`register`、`dispatch`、`on`、`emit`、`dispose`。
- Package boundary guard 六项全部满足。
- 无事务回滚、无 `createEditor`、无 Markdown/Shell/Adapter。
- M1 follow-up 仅记录，未实现。
- 无关文件（如 `AGENTS.md`）未纳入 commit。
- 说明性正文为中文；代码标识为英文。

## Open Questions

无阻塞项。已在 OpenSpec design 关闭：

- 独立 factory（不挂 `bootstrapCore`）。
- dispose 后 `dispatch` 失败结果、`emit` no-op。
- 未知命令 `error.source === 'core'`。
- 无 Adapter 事务回滚。
- M1 follow-up 延后到独立 change。

实现中若需偏离上述决定，**MUST** 先更新 OpenSpec change，再改代码。

## Recommended Next Skill

`aether-workflow-create-task` — 将本 plan 拆成 `.superpowers/tasks/add-command-event-runtime/*.md`。
