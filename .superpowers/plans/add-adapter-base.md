# add-adapter-base Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use Superpowers task execution (`aether-workflow-create-task` → `aether-workflow-implement-task` / `aether-workflow-execute-task-loop`) to implement this plan task-by-task. Do not redefine OpenSpec requirements in code.

**Goal:** 建立 M3 Adapter 基座——在 `@aether-md/core` 导出框架无关 `AetherDoc` / `AetherSchema` 与三类 Adapter 协议，新建 `@aether-md/plugin-remark` 与 `@aether-md/plugin-prosemirror`，验证最小 Markdown parse → edit → serialize round-trip，且不引入 `createEditor`、React Shell 或 Command Bus 深度集成。

**Architecture:** 公开契约集中在 `@aether-md/core`；Remark / ProseMirror 重型依赖隔离在 `packages/plugins/*`。Round-trip 由 plugin package integration tests 显式 wiring，不实现 `createEditor`。`EngineAdapter.apply` 失败时 session 内 `getDocument` 保持 apply 前快照；M2 `createCommandEventRuntime` 保持独立，不自动 rollback 或 emit `transactionFailed`。

**Tech Stack:** TypeScript、Node built-in test runner、pnpm workspace、Turborepo `pnpm check`；`plugin-remark` 使用 Remark 生态；`plugin-prosemirror` 使用 ProseMirror。

---

## Change

| 字段 | 值 |
| --- | --- |
| OpenSpec change | `add-adapter-base` |
| Branch | `feat/add-adapter-base` |
| OpenSpec status | **complete**（4/4 artifacts：`proposal` / `design` / `specs` / `tasks`）；`openspec validate add-adapter-base --strict` 已通过 |
| Apply readiness | `state: ready`；implementation tasks 0/31 complete（OpenSpec high-level tasks，非 Superpowers task 文件） |
| Version impact | `@aether-md/core` **minor-level additive** public exports；新建 `@aether-md/plugin-remark`、`@aether-md/plugin-prosemirror`（`0.0.0`）；`SUPPORTED_MANIFEST_VERSIONS` / `manifestVersion` **不变**；`pnpm-lock.yaml` **预期变更** |
| Expected commit scope | `feat(core)`、`feat(plugin-remark)`、`feat(plugin-prosemirror)`；OpenSpec 产物 `docs(openspec)` |
| Commit strategy | 每个 Superpowers task 可单独 commit；PR body 须追踪 OpenSpec change id 与 task id |

范围边界：

- **包含：** `AetherDoc` / `AetherSchema` 最小类型、Adapter 协议与错误类、两个 plugin package、M3 最小 round-trip、core package-boundary 更新、Adapter contract tests。
- **排除：** GFM preset、React/Vue Shell、`createEditor` / `AetherEditor` / `EditorContext`、`bootstrapCore` Adapter 加载、`core:engine` / `core:parser` silent provide、Command Bus 自动 rollback、compile-layer ConflictResolver、Permission 沙盒、M1 follow-up、长期 Docs 大改。
- **文档语言：** 说明性正文中文；API 名称、包名、路径与 OpenSpec 结构关键词 English。

## Source Artifacts

OpenSpec artifacts：

- `openspec/changes/add-adapter-base/proposal.md`
- `openspec/changes/add-adapter-base/design.md`
- `openspec/changes/add-adapter-base/specs/document-model/spec.md`
- `openspec/changes/add-adapter-base/specs/adapter-base/spec.md`
- `openspec/changes/add-adapter-base/specs/core-bootstrap/spec.md`
- `openspec/changes/add-adapter-base/tasks.md`

长期 source docs / ADRs：

- `docs/engineering/mvp-implementation-plan.md`
- `docs/architecture/document-model.md`
- `docs/engineering/adapter-protocol.md`
- `docs/architecture/core-api.md`
- `docs/architecture/principles.md`
- `docs/architecture/package-layout.md`
- `docs/architecture/compatibility.md`
- `docs/engineering/error-model.md`
- `docs/engineering/test-strategy.md`
- `docs/engineering/data-flow.md`
- `docs/glossary.md`
- `docs/adr/003-remark-prosemirror-dual-track.md`
- `openspec/specs/core-bootstrap/spec.md`
- `openspec/specs/command-event-runtime/spec.md`

## Code-Management

创建 plan 时 `git status --short`：

```
?? openspec/changes/add-adapter-base/
```

- **允许修改区：** `packages/core/**`、`packages/plugins/plugin-remark/**`、`packages/plugins/plugin-prosemirror/**`、本 change 的 OpenSpec / Superpowers 产物、`pnpm-lock.yaml`（Remark/PM 依赖）。
- **禁止纳入本 change：** 无关 dirty 文件、长期 Docs 大改（Step 8）、`AGENTS.md` / workflow skill mirrors（除非单独 workflow PR）。
- **禁止新建：** `packages/preset-gfm`、`packages/react`、`packages/vue`、`createEditor` 模块、Command Bus ↔ Adapter 编排代码。
- **Core 依赖 guard：** `packages/core/package.json` **MUST NOT** 新增 `remark`、`prosemirror*`、`react`、`vue` runtime dependencies。

## File Map

| 路径 | 职责 |
| --- | --- |
| `packages/core/src/document-model.ts` | `AetherDoc`、`AetherBlock`、`AetherInline`、`ParagraphBlock`、`HeadingBlock`、`TextInline`、扩展类型（`ListBlock` 等）、`AetherSchema` |
| `packages/core/src/document-model.test.ts` | JSON 可序列化、M3 最小 shape contract tests |
| `packages/core/src/adapter-types.ts` | `ParserAdapter`、`SerializerAdapter`、`EngineAdapter`、`EngineSession`、`AdapterCommandRequest`、`AdapterTransactionResult`、`AdapterEvent` |
| `packages/core/src/errors.ts` | 扩展 `AdapterError`、`SerializationError`（与现有 `CoreError` / `PluginError` 并列） |
| `packages/core/src/adapter-types.test.ts` | 协议类型与错误 shape smoke tests（无 Remark/PM） |
| `packages/core/src/index.ts` | 导出 document-model + adapter-base public surface |
| `packages/core/src/package-boundary.test.ts` | 更新 M3 允许面；继续禁止 M4/M5 |
| `packages/plugins/plugin-remark/package.json` | workspace package、`exports`、Remark 依赖 |
| `packages/plugins/plugin-remark/src/*` | `ParserAdapter` / `SerializerAdapter` 实现与 factory |
| `packages/plugins/plugin-remark/src/*.test.ts` | parse / serialize contract tests |
| `packages/plugins/plugin-prosemirror/package.json` | workspace package、`exports`、ProseMirror 依赖 |
| `packages/plugins/plugin-prosemirror/src/*` | `EngineAdapter` 实现与 factory |
| `packages/plugins/plugin-prosemirror/src/*.test.ts` | create / apply / failure / dispose + round-trip integration tests |

不得出现在 `@aether-md/core` 生产代码：`remark`、`prosemirror*`、`createEditor`、`getMarkdown` / `getDocument` 宿主 API、React Shell。

## Package Boundary Guard（全程强制）

每个 Phase / Task 结束前，实现者 **MUST** 确认：

| 禁止项 | Guard |
| --- | --- |
| Core → Remark | `packages/core/package.json` 与 `packages/core/src/**` 无 `remark` import/dependency |
| Core → ProseMirror | 同上，无 `prosemirror*` import/dependency |
| Core → React / Vue | 无 UI 框架依赖或 import |
| Core → GFM preset | 无 `@aether-md/preset-gfm` 或 GFM 实现 |
| Editor 入口 | `@aether-md/core` exports 不含 `createEditor`、`AetherEditor`、`EditorContext` |
| 宿主文档 API | exports 不含 `getMarkdown` / `getDocument` 作为 Core 宿主入口（Adapter 协议内 `EngineAdapter.getDocument(session)` 允许） |
| Command Bus 集成 | `command-event-runtime.ts` 不调用 Adapter、不 emit 自动 `transactionFailed` |
| bootstrap Adapter 加载 | `bootstrap.ts` / `capabilities.ts` 不 silent provide `core:engine` / `core:parser` |

**Core package guard（Phase 6 / Task 06 必跑）：**

```bash
rg -i "remark|prosemirror|react|vue|gfm|createEditor|AetherEditor|EditorContext" packages/core/package.json packages/core/src
```

预期：无生产代码命中（`package-boundary.test.ts` 中对禁止导出名的字符串断言除外）。

**全仓库 scope guard（Task 07 必跑）：**

```bash
rg "createEditor|AetherEditor|EditorContext|preset-gfm|packages/react" packages/core packages/plugins
```

预期：无实现命中（测试禁止断言字符串除外）。

**Adapter 隔离 guard：**

```bash
rg "from '@aether-md/core'" packages/plugins/plugin-remark packages/plugins/plugin-prosemirror
rg "from 'remark|from 'prosemirror" packages/core
```

预期：plugin → core 单向；core 不 import 引擎。

## Implementation Phases

每个 Phase 遵循 **TDD / contract-first**：先写失败测试 → 最小实现 → 测试通过 → 再进入下一阶段。

### Phase 1: Document model public types（Task 01）

**映射 requirements：**

- `AetherDoc public types are exported from core`
- `Minimal AetherSchema type is exported`
- `Extended document types are exported without M3 round-trip coverage`

**TDD / contract 入口：**

1. 在 `document-model.test.ts` 写失败测试：可从 `@aether-md/core` 导入 `AetherDoc`、`ParagraphBlock`、`HeadingBlock`、`TextInline`、`AetherSchema`。
2. 失败测试：样例 `AetherDoc` 可 `JSON.stringify`，结果不含 function/DOM。
3. 失败测试：`AetherSchema` 接受 `{ version: 1 }`。
4. 运行 `pnpm --filter @aether-md/core test` → FAIL。
5. 实现 `document-model.ts` + `index.ts` exports → PASS。

**产出：** M3 最小 document types；扩展类型可导出但不必有 adapter round-trip 测试。

### Phase 2: Adapter protocol types and errors in core（Task 02）

**映射 requirements：**

- `Adapter protocol types are exported from core`
- `AdapterError and SerializationError are exported`

**TDD / contract 入口：**

1. 在 `adapter-types.test.ts` 写失败测试：导入 `ParserAdapter`、`SerializerAdapter`、`EngineAdapter` 及相关 supporting types。
2. 失败测试：`new AdapterError(...)` → `source === 'adapter'`、`severity === 'recoverable'`；`SerializationError` → `source === 'serialization'`。
3. 失败测试：`packages/core/package.json` dependencies 仍无 remark/prosemirror/react。
4. FAIL → 实现 `adapter-types.ts`、扩展 `errors.ts`、`index.ts` exports → PASS。

**产出：** Core 侧 Adapter 契约面；仍无引擎实现。

### Phase 3: plugin-remark package（Task 03）

**映射 requirements：**

- `Remark plugin package provides Parser and Serializer adapters`
- `Adapter packages participate in workspace verification`

**TDD / contract 入口：**

1. 建立 `packages/plugins/plugin-remark`（`package.json`、`tsconfig`、scripts）。
2. 失败测试：`ParserAdapter.parse("Hello world\n", schema)` → `AetherDoc` with paragraph/text。
3. 失败测试：`parse("## Title\n\nBody\n")` → heading + paragraph blocks。
4. 失败测试：`SerializerAdapter.serialize(doc, schema)` → 确定性 Markdown（paragraph / heading 样例）。
5. 失败测试：未知语法不静默丢失（降级为 paragraph/text）。
6. `pnpm --filter @aether-md/plugin-remark test` FAIL → 实现 → PASS。

**产出：** `@aether-md/plugin-remark` 可独立 build/typecheck/test。

### Phase 4: plugin-prosemirror package（Task 04）

**映射 requirements：**

- `ProseMirror plugin package provides Engine adapter`

**TDD / contract 入口：**

1. 建立 `packages/plugins/plugin-prosemirror` workspace package。
2. 失败测试：`EngineAdapter.create(initialDoc)` → session；`getDocument(session)` 等价初始快照。
3. 失败测试：成功 `apply`（M3 最小编辑命令，如 `replaceText`）→ `ok: true` + 更新后 `doc`。
4. 失败测试：失败 `apply` → `ok: false` + `AdapterError`；`getDocument(session)` 仍为 apply 前快照。
5. 失败测试：`dispose` + 重复 dispose 行为可测。
6. Adapter 内部 throw → 转换为 `AdapterError`，不向测试 harness 抛出。
7. FAIL → 实现 → PASS。

**产出：** `@aether-md/plugin-prosemirror` engine contract tests 绿。

### Phase 5: Cross-package round-trip integration（Task 05）

**映射 requirements：**

- `M3 minimal Markdown round-trip is verified`

**TDD / contract 入口：**

1. 在 `plugin-prosemirror`（devDependency `@aether-md/plugin-remark`）添加 integration test：
   - 样例 1：`"Hello world\n"` → parse → apply(edit) → serialize → 可预测 Markdown。
   - 样例 2：`"## Title\n\nBody\n"` → 同上。
2. 断言 pipeline **不** import `createEditor`、`bootstrapCore` adapter wiring、React。
3. FAIL → wiring + 最小 edit 命令对齐 → PASS。

**产出：** 跨包 round-trip 绿；满足 MVP M3 验收语义。

### Phase 6: Core package boundary update（Task 06）

**映射 requirements：**

- `core-bootstrap` MODIFIED：`Minimal Core package exists`
- `core-bootstrap` MODIFIED：`M1 excludes later milestone behavior`
- `Core package boundary excludes editor and shell entrypoints`

**TDD / contract 入口：**

1. 更新 `package-boundary.test.ts`：
   - **允许：** `AetherDoc`、`AetherSchema`、`ParserAdapter`、`SerializerAdapter`、`EngineAdapter`、`AdapterError`、`SerializationError` 等 M3 exports。
   - **继续允许：** M2 `createCommandEventRuntime` 与 Command/Event types。
   - **禁止：** `createEditor`、`AetherEditor`、`EditorContext`、Shell、GFM preset、Remark/PM 实现 re-export。
2. 断言 `packages/core/package.json` 无 remark/prosemirror/react/vue dependencies。
3. 运行 core boundary tests + Core guard `rg` → PASS。

**产出：** M3 与 M2 边界共存；M1 bootstrap 测试不因 adapter 默认被拉入（除非 intentional）。

### Phase 7: Full verification and non-goals guard（Task 07）

**映射 requirements：**

- `Adapter packages participate in workspace verification`
- `M3 does not integrate Command Bus automatic rollback`
- OpenSpec tasks §8 Explicit non-goals guard

**TDD / contract 入口：**

1. 运行 `pnpm check`（build + typecheck + test，含三个 packages）。
2. 运行 `openspec validate add-adapter-base --strict`。
3. 运行 Core + 全仓库 scope guard `rg`（见 Package Boundary Guard）。
4. 确认 M2 `command-event-runtime.test.ts` 仍绿且 **不** 新增 Adapter 依赖。
5. Review checklist：未实现 GFM preset、Shell、`createEditor`、bootstrap Adapter 加载、Command Bus rollback、M1 follow-up。
6. 记录 validation evidence 供 `.superpowers/runs/add-adapter-base/validation.md`（Step 5/6 填写）。

**产出：** 全量绿 + non-goals 护栏 documented。

## Dependency Order

1. **Phase 1（Task 01）** → 固定 `AetherDoc` / `AetherSchema`；plugin 与 core adapter types 均依赖。
2. **Phase 2（Task 02）** → Adapter 协议与错误类；plugin package 实现依赖。
3. **Phase 3（Task 03）** → remark parse/serialize；可与 Phase 4 并行，但 round-trip 需两者皆完成。
4. **Phase 4（Task 04）** → prosemirror engine；round-trip 依赖 Phase 3 + 4。
5. **Phase 5（Task 05）** → 依赖 Phase 3 + 4 的 factory 与 M3 edit 命令。
6. **Phase 6（Task 06）** → 依赖 Phase 1–2 exports 稳定；宜在 round-trip 前更新 boundary，或在 Phase 7 前完成。
7. **Phase 7（Task 07）** → 汇总验证；必须最后执行。

跨阶段约束：

- Core **MUST NOT** 直接依赖 Remark/ProseMirror。
- **MUST NOT** 修改 M2 Command/Event 语义来集成 Adapter。
- **MUST NOT** 扩展 M3 Markdown 测试矩阵到 M4 GFM 全覆盖。
- 若 OpenSpec 与 Docs/ADR 冲突，暂停并更新 OpenSpec change，禁止 silent 偏离。

## Boundary Risks

| 风险 | 触发点 | 处理方式 |
| --- | --- | --- |
| Core 直接依赖 Remark/PM | 在 core 内 parse/serialize 图省事 | 仅 plugin package 引入引擎；Task 02/06 guard |
| M3 膨胀到 M4 GFM | round-trip 测试覆盖 list/link/mark | 仅 paragraph + heading 样例；design Decision 3/4 |
| 误实现 `createEditor` | 为 round-trip 加宿主入口 | integration test 显式 wiring；boundary 禁止 export |
| Command Bus 自动 rollback | 照搬 `data-flow.md` 全链路 | spec 明确 M3 不测 Bus；Task 07 checklist |
| bootstrap silent provide | 顺便让 M1 测试过 `core:engine` | 不修改 `M1_CORE_CAPABILITIES`；Task 07 §8.3 |
| `AetherSchema` 过度设计 | 提前做 compile-layer merge | M3 仅 `{ version: 1 }` |
| lockfile/依赖污染 Core | workspace hoisting 误配 | 检查 `packages/core/package.json` dependencies |
| plugin 循环依赖 | remark 依赖 prosemirror 或反之 | remark 仅 core；prosemirror 可 devDep remark 仅用于 integration test |
| M1 follow-up 混入 | 改 bootstrap dispose 合同 | Task 07 §8.4；仅记录 |
| 无关文件 commit | OpenSpec 与实现混 unrelated dirty | Code-Management 区 |

## Validation Matrix

| Phase | OpenSpec Requirement | Validation 入口 | 预期 |
| --- | --- | --- | --- |
| 1 | AetherDoc public types are exported from core | import + `document-model.test.ts` | types 可导入；JSON 纯净 |
| 1 | Minimal AetherSchema type is exported | schema `{ version: 1 }` test | 占位 schema 可用 |
| 1 | Extended document types exported without M3 round-trip | types export smoke；adapter tests 不要求 list/link | 类型可选测 |
| 2 | Adapter protocol types are exported from core | `adapter-types.test.ts` | 三类 Adapter 接口存在 |
| 2 | AdapterError and SerializationError are exported | error instance tests | 正确 `source` / `severity` |
| 3 | Remark plugin provides Parser and Serializer | `plugin-remark` parse/serialize tests | paragraph/heading；不丢语法 |
| 4 | ProseMirror plugin provides Engine adapter | create/apply/failure/dispose tests | 快照与 `AdapterError` |
| 5 | M3 minimal Markdown round-trip is verified | cross-package integration tests | 两样例 round-trip 绿 |
| 5 | Paragraph / heading round-trip scenarios | integration assertions | 可预测 Markdown |
| 6 | core-bootstrap MODIFIED package surface | `package-boundary.test.ts` | 允许 M3；禁止 M4/M5 |
| 6 | Core package boundary excludes editor entrypoints | boundary + core `rg` guard | 无 editor/shell exports |
| 7 | Adapter packages in workspace verification | `pnpm check` | 三 packages 绿 |
| 7 | M3 does not integrate Command Bus rollback | M2 tests unchanged + review checklist | Bus 独立 |
| 7 | Non-goals guard | Task 07 checklist §8 | 无 scope creep |

## Task Breakdown

高层 Task（Step 4 将拆为 `.superpowers/tasks/add-adapter-base/*.md`；每 task **MUST** 以失败测试开头）：

| Task | Outcome | Allowed Area | Maps to OpenSpec tasks | Version Impact |
| --- | --- | --- | --- | --- |
| **01** Document model types | `AetherDoc` / `AetherSchema` + tests + exports | `packages/core/src/document-model*.ts`, `index.ts` | §1.1–1.3 | core public exports + |
| **02** Adapter protocol + errors | Adapter interfaces + `AdapterError` / `SerializationError` | `packages/core/src/adapter-types*.ts`, `errors.ts`, `index.ts` | §2.1–2.3 | core public exports + |
| **03** plugin-remark | workspace package + Parser/Serializer + contract tests | `packages/plugins/plugin-remark/**` | §3.1–3.4 | 新 package + lockfile |
| **04** plugin-prosemirror engine | workspace package + EngineAdapter + contract tests | `packages/plugins/plugin-prosemirror/**`（不含 round-trip） | §4.1–4.5 | 新 package + lockfile |
| **05** Cross-package round-trip | integration tests（paragraph + heading） | `plugin-prosemirror` tests（devDep remark） | §5.1–5.3 | 无新 public API |
| **06** Core package boundary | 更新 boundary tests + core guard | `packages/core/src/package-boundary.test.ts` | §6.1–6.3 | 测试面调整 |
| **07** Full verification | `pnpm check`、`openspec validate`、non-goals 护栏 | 全 change scope；validation 记录 | §7–§9 | 确认 lockfile；无 manifestVersion 变更 |

**M3 最小 Markdown 测试矩阵（implementation 不得扩大）：**

| 样例 | Markdown | 必测 |
| --- | --- | --- |
| Paragraph | `"Hello world\n"` | parse → apply → serialize |
| Heading + paragraph | `"## Title\n\nBody\n"` | parse → apply → serialize |

**M3 最小编辑命令（implementation task 内固定名称，OpenSpec 不要求具体字段名）：**

- 至少一种 `AdapterCommandRequest` 使 `EngineAdapter.apply` 改变文档文本并返回新 `AetherDoc`。

## Review Focus

- 每个改动文件映射到 Task 01–07。
- 每个 Task 映射到 OpenSpec requirement / `tasks.md` 条目；不得发明 requirement 外行为。
- `@aether-md/core` **无** remark/prosemirror/react/vue runtime dependency。
- Package Boundary Guard 表全部满足。
- Round-trip **不**依赖 `createEditor`、`bootstrapCore` Adapter 加载、React Shell。
- M2 Command/Event tests 仍独立；无自动 `transactionFailed`。
- M1 bootstrap 与 M1 follow-up 未被偷偷修改。
- M3 测试矩阵未扩展到 M4 GFM 全覆盖。
- `pnpm-lock.yaml` 变更仅来自 plugin packages；Core 保持轻量。
- 说明性正文中文；代码标识 English。
- 无关 dirty 文件未纳入 commit。

## Open Questions

无阻塞项。OpenSpec design 已关闭的项：

| 问题 | M3 处理 |
| --- | --- |
| 节点稳定 `id` | 不引入 |
| 自定义块 Markdown fallback | 不测 `CustomBlock` round-trip |
| `meta` 插件命名空间 | 类型保留；测试不写入 |
| Adapter 能力矩阵 / `SelectionAdapter` / 调试快照 | 不实现 |
| `AdapterCommandRequest` 完整 vocabulary | Task 04/05 固定最小编辑命令一种 |
| Shared contract test package | 默认 plugin 内 integration test |

**Follow-up changes（implementation 中若发现必需，应暂停并拆分）：**

- `add-editor-bootstrap` — bootstrap + Adapter plugin 加载 + capability provides
- `add-command-adapter-integration` — Command Bus ↔ EngineAdapter + `transactionFailed`
- `add-gfm-preset` — M4 语法 round-trip

实现中若需偏离 OpenSpec design 决定，**MUST** 先更新 OpenSpec change，再改代码。

## Recommended Next Skill

`aether-workflow-create-task` — 将本 plan 拆成 `.superpowers/tasks/add-adapter-base/01-*.md` … `07-*.md`（中文说明 + English 标识；每 task 含 TDD 步骤与 validation 命令）。
