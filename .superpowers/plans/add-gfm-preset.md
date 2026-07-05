# add-gfm-preset Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use Superpowers task execution (`aether-workflow-create-task` → `aether-workflow-implement-task` / `aether-workflow-execute-task-loop`) to implement this plan task-by-task. Do not redefine OpenSpec requirements in code.

**Goal:** 建立 M4 GFM Preset——扩展 `@aether-md/plugin-remark` / `@aether-md/plugin-prosemirror` 支持六类 GFM 语法 structured round-trip，新建 `@aether-md/preset-gfm` 承载 Manifest/factory 与 integration tests，闭合 `SerializationError` 占位符策略，且不引入 `createEditor`、React Shell 或 Command Bus 深度集成。

**Architecture:** `@aether-md/core` 类型面预期不变（M3 已 export `ListBlock` / `LinkInline` / `MarkedInline`）；GFM 语义落在 adapter plugin 实现与 preset 编排层。Round-trip 由显式 wiring（parse → `EngineAdapter.apply` → serialize）验证；Serializer 输出固定 golden strings（`**`、`*`、`-`/`1.`、`[text](href)`）。Core **MUST NOT** 直接依赖 Remark/ProseMirror/React。

**Tech Stack:** TypeScript、Node built-in test runner、pnpm workspace、Turborepo `pnpm check`；`plugin-remark` 引入 `remark-gfm`（或等价）；`plugin-prosemirror` 扩展 PM schema/conversion；`@aether-md/preset-gfm` 聚合 Manifest + factory + integration tests。

---

## Change

| 字段 | 值 |
| --- | --- |
| OpenSpec change | `add-gfm-preset` |
| Branch | `feat/add-gfm-preset`（从 `main` 创建；plan 时工作树仅含 OpenSpec artifacts） |
| OpenSpec status | **complete**（4/4 artifacts：`proposal` / `design` / `specs` / `tasks`）；`openspec validate add-gfm-preset --strict` 待 implementation 后确认 |
| Apply readiness | `isComplete: true`；OpenSpec high-level tasks 0/31 complete |
| Version impact | `@aether-md/core` **无 breaking change**（类型面 additive-only 或不变）；新建 `@aether-md/preset-gfm`（`0.0.0`）；`@aether-md/plugin-remark` / `@aether-md/plugin-prosemirror` **minor-level behavior extension**；`SUPPORTED_MANIFEST_VERSIONS` / `manifestVersion` **不变**（`[1]`）；`pnpm-lock.yaml` **预期变更**（`remark-gfm`、preset workspace 链接） |
| Expected commit scope | `feat(preset-gfm)`、`feat(plugin-remark)`、`feat(plugin-prosemirror)`、`test(...)`、`chore(core)`（boundary）；OpenSpec 产物 `docs(openspec)` |
| Commit strategy | 每个 Superpowers task 可单独 commit（Conventional Commits）；PR body 须追踪 OpenSpec change id 与 task id；whole-change squash 留 PR merge 时决定 |

范围边界：

- **包含：** GFM 六类语法 parse/serialize/engine conversion、M3 paragraph/heading round-trip 保持、SerializationError/占位符、`@aether-md/preset-gfm` package、core package-boundary 更新、cross-package integration tests。
- **排除：** `createEditor` / `AetherEditor` / React Shell、`bootstrapCore` Adapter 加载、Command Bus 自动 rollback、`CustomBlock` round-trip、嵌套列表/表格/代码块/图片/任务列表/删除线、compile-layer、长期 Docs 大改（archive 后 sync）。
- **文档语言：** 说明性正文中文；API 名称、包名、路径与 OpenSpec 结构关键词 English。

## Source Artifacts

OpenSpec artifacts：

- `openspec/changes/add-gfm-preset/proposal.md`
- `openspec/changes/add-gfm-preset/design.md`
- `openspec/changes/add-gfm-preset/specs/gfm-preset/spec.md`
- `openspec/changes/add-gfm-preset/specs/document-model/spec.md`
- `openspec/changes/add-gfm-preset/specs/adapter-base/spec.md`
- `openspec/changes/add-gfm-preset/specs/core-bootstrap/spec.md`
- `openspec/changes/add-gfm-preset/tasks.md`

长期 source docs / ADRs：

- `docs/engineering/mvp-implementation-plan.md`
- `docs/architecture/document-model.md`
- `docs/engineering/adapter-protocol.md`
- `docs/engineering/error-model.md`
- `docs/engineering/test-strategy.md`
- `docs/architecture/package-layout.md`
- `docs/adr/003-remark-prosemirror-dual-track.md`
- `openspec/specs/document-model/spec.md`
- `openspec/specs/adapter-base/spec.md`
- `openspec/specs/core-bootstrap/spec.md`

## Code-Management

创建 plan 时 `git status --short`：

```
?? openspec/changes/add-gfm-preset/
```

当前分支：`feat/add-gfm-preset`

- **允许修改区：** `packages/core/**`（boundary tests only，预期无生产类型变更）、`packages/plugins/plugin-remark/**`、`packages/plugins/plugin-prosemirror/**`、新建 `packages/preset-gfm/**`、本 change 的 OpenSpec / Superpowers 产物、`pnpm-lock.yaml`。
- **禁止纳入本 change：** 无关 dirty 文件、长期 Docs 大改、`AGENTS.md` / workflow skill mirrors（除非单独 workflow PR）。
- **禁止新建：** `packages/react`、`packages/vue`、`createEditor` 模块、Command Bus ↔ Adapter 编排代码。
- **Core 依赖 guard：** `packages/core/package.json` **MUST NOT** 新增 `remark`、`prosemirror*`、`react`、`vue` runtime dependencies。

## File Map

| 路径 | 职责 |
| --- | --- |
| `packages/core/src/document-model.ts` | 已有 `ListBlock` / `LinkInline` / `MarkedInline` / `CustomBlock`；M4 **不修改** public shape（仅必要时补 contract tests） |
| `packages/core/src/document-model.test.ts` | 可选：GFM 类型 shape smoke tests（JSON 可序列化） |
| `packages/core/src/package-boundary.test.ts` | 确认 preset 不在 core exports；workspace 允许 preset package |
| `packages/plugins/plugin-remark/src/parser.ts` | GFM parse：`list` / `link` / `strong` / `emphasis` → structured `AetherDoc` |
| `packages/plugins/plugin-remark/src/serializer.ts` | GFM serialize + golden strings + `SerializationError`/占位符 |
| `packages/plugins/plugin-remark/src/parser.test.ts` | 更新 list 结构化 parse；保留非 GFM 语法降级 |
| `packages/plugins/plugin-remark/src/serializer.test.ts` | GFM 六类 + CustomBlock 占位符 + unsupported rejection |
| `packages/plugins/plugin-prosemirror/src/conversion.ts` | `aetherDocToPm` / `pmToAetherDoc` GFM 结构往返 |
| `packages/plugins/plugin-prosemirror/src/engine.ts` | PM schema 扩展（list nodes、link/strong/emphasis marks） |
| `packages/plugins/plugin-prosemirror/src/engine.test.ts` | apply 成功/失败时 GFM 快照保留 |
| `packages/plugins/plugin-prosemirror/src/round-trip.test.ts` | M3 paragraph/heading round-trip 保持 green |
| `packages/preset-gfm/package.json` | 新 workspace package、`exports`、scripts |
| `packages/preset-gfm/src/manifest.ts` | GFM preset Manifest（`manifestVersion: 1`，`metadata.name: gfm`） |
| `packages/preset-gfm/src/index.ts` | 公开 factory（如 `createGfmPreset()`） |
| `packages/preset-gfm/src/round-trip.test.ts` | 六类 GFM integration matrix（parse → apply → serialize） |

不得出现在 `@aether-md/core` 生产代码：`remark`、`prosemirror*`、`createEditor`、`presetGfm`、GFM 实现逻辑。

## Package Boundary Guard（全程强制）

每个 Phase / Task 结束前，实现者 **MUST** 确认：

| 禁止项 | Guard |
| --- | --- |
| Core → Remark | `packages/core/package.json` 与 `packages/core/src/**` 无 `remark` import/dependency |
| Core → ProseMirror | 同上，无 `prosemirror*` import/dependency |
| Core → React / Vue | 无 UI 框架依赖或 import |
| Core → GFM preset | 无 `@aether-md/preset-gfm` re-export 或 GFM 实现 |
| Editor 入口 | `@aether-md/core` exports 不含 `createEditor`、`AetherEditor`、`EditorContext` |
| bootstrap Adapter 加载 | `bootstrap.ts` / `capabilities.ts` 不 silent provide `core:engine` / `core:parser` |
| Command Bus 集成 | `command-event-runtime.ts` 不调用 Adapter、不 emit 自动 `transactionFailed` |

**Core package guard（Phase 7 / Task 07 必跑）：**

```bash
rg -i "remark|prosemirror|react|vue|gfm|createEditor|AetherEditor|EditorContext|preset-gfm" packages/core/package.json packages/core/src
```

预期：无生产代码命中（`package-boundary.test.ts` 中对禁止导出名的字符串断言除外）。

## Implementation Phases

每个 Phase 遵循 **TDD / contract-first**：先写失败测试 → 最小实现 → 测试通过 → 再进入下一阶段。

### Phase 1: Document-model types contract（Task 01）

**映射 requirements：**

- `GFM built-in types have structured round-trip coverage`（类型前提）
- `Extended document types are exported without M3 round-trip coverage`（MODIFIED）
- `CustomBlock remains outside M4 GFM round-trip matrix`

**TDD / contract 入口：**

1. 确认 `@aether-md/core` 已 export `ListBlock`、`LinkInline`、`MarkedInline`（`mark: 'strong' | 'emphasis'`）、`CustomBlock`。
2. 在 `document-model.test.ts` 补失败测试（若缺失）：样例 GFM `AetherDoc` JSON fixture 可 `JSON.stringify`，不含 function/DOM。
3. 断言 `CustomBlock` 类型可构造但 **不** 纳入 GFM round-trip matrix（测试注释/document fixture 分离）。
4. 运行 `pnpm core:test` → PASS（无生产代码变更或仅测试增补）。

**产出：** GFM 类型 contract 就绪；M4 **不**修改 `AetherDoc` public shape。

### Phase 2: plugin-remark GFM parse/serialize（Task 02）

**映射 requirements：**

- `Remark adapters support GFM subset parse and serialize`
- `Remark plugin package provides Parser and Serializer adapters`（MODIFIED）

**TDD / contract 入口：**

1. 引入 GFM 解析能力（如 `remark-gfm`）到 `plugin-remark`。
2. 失败测试：`parse("- item\n")` → `ListBlock`（`ordered: false`）；`parse("1. item\n")` → `ListBlock`（`ordered: true`）。
3. 失败测试：`parse("**bold**")` / `parse("*italic*")` → `MarkedInline` with `mark: 'strong' | 'emphasis'`。
4. 失败测试：`parse("[label](https://example.com)")` → `LinkInline` with matching `href`。
5. 失败测试：serializer 输出 golden strings（`**`、`*`、`-`/`1.`、`[text](href)`）；paragraph/heading 兼容 M3。
6. 更新 `parser.test.ts`：将「list 降级为 paragraph text」改为 structured `ListBlock`；保留未知非 GFM 语法降级场景。
7. 运行 `pnpm --filter @aether-md/plugin-remark test` FAIL → 实现 → PASS。

**产出：** Remark GFM parse/serialize unit tests 绿；M3 paragraph/heading 行为保持。

### Phase 3: plugin-prosemirror GFM engine（Task 03）

**映射 requirements：**

- `ProseMirror engine preserves GFM structures through edit leg`

**TDD / contract 入口：**

1. 扩展 PM schema：`bullet_list` / `ordered_list` / `list_item`；marks `strong` / `emphasis` / `link`（`href` attr）。
2. 失败测试：GFM fixture `AetherDoc` → `create` → 成功 `apply`（`replaceText`）→ `getDocument` 在未编辑块保留 list/link/mark。
3. 失败测试：失败 `apply` → `getDocument` 为 apply 前快照；GFM 结构不被污染。
4. 失败测试：`aetherDocToPm` / `pmToAetherDoc` 往返 GFM fixture 结构。
5. 运行 `pnpm --filter @aether-md/plugin-prosemirror test` FAIL → 实现 → PASS。

**产出：** Engine GFM conversion + apply contract tests 绿。

### Phase 4: preset-gfm package skeleton（Task 04）

**映射 requirements：**

- `GFM preset package exists in workspace`
- `GFM preset exposes Manifest and public factory entry`
- `Workspace includes GFM preset package without core re-export`

**TDD / contract 入口：**

1. 建立 `packages/preset-gfm`（`package.json`、`tsconfig`、scripts：`build` / `typecheck` / `test`）。
2. 失败测试：`createGfmPreset()`（或等价 factory）返回 Manifest with `manifestVersion: 1`、`metadata.name: gfm`。
3. 失败测试：factory 可暴露 wired adapter references 或 schema bundle，**不** require `createEditor` / `bootstrapCore`。
4. 失败测试：preset `package.json` dependencies 不含 Remark/PM 复制实现（语法逻辑仍在 plugin packages）。
5. 确认 workspace `pnpm-workspace.yaml` 已覆盖 `packages/*`（preset 路径 `packages/preset-gfm`）。
6. 运行 `pnpm --filter @aether-md/preset-gfm test` FAIL → scaffold → PASS（factory/Manifest tests）。

**产出：** `@aether-md/preset-gfm` 可 build/typecheck/test；Core 不 re-export preset。

### Phase 5: Cross-package GFM round-trip integration tests（Task 05）

**映射 requirements：**

- `GFM preset owns GFM round-trip integration test matrix`
- `GFM Markdown round-trip is verified across adapter packages`
- `M3 minimal Markdown round-trip is verified`（MODIFIED）

**TDD / contract 入口：**

1. 在 `@aether-md/preset-gfm`（或 preset 协调的 cross-package 模块）添加六类语法 integration tests：
   - paragraph、heading、strong、emphasis、unordered list、ordered list、link
2. 每样例：`parse` → `EngineAdapter.apply`（`replaceText` 最小编辑）→ `serialize` → 断言 golden Markdown。
3. 确认 M3 `plugin-prosemirror/src/round-trip.test.ts` paragraph/heading 样例仍 pass。
4. 断言 tests **不** import `createEditor`、`bootstrapCore` adapter wiring、`@aether-md/react`。
5. 运行 `pnpm test` FAIL → wiring → PASS。

**GFM golden strings（design Decision 3，integration 断言以此为准）：**

| 结构 | Serializer 输出 |
| --- | --- |
| Strong | `**text**` |
| Emphasis | `*text*` |
| Unordered list | `- item\n`（单层，item 内单 paragraph） |
| Ordered list | `1. item\n`（建议至少 2 items single-level） |
| Link | `[text](href)`（`title` 为空时 omit） |
| Heading | M3：`#` repeat + space + text |
| Paragraph | M3：text + `\n`，块间 `\n\n` |

**产出：** 六类 GFM round-trip + M3 regression 绿。

### Phase 6: SerializationError placeholder strategy（Task 06）

**映射 requirements：**

- `SerializationError and placeholder strategy is implemented for Serializer paths`

**TDD / contract 入口：**

1. 失败测试：`CustomBlock` with `name: 'diagram'` → serialize resolves `[unsupported:block:diagram]\n`（不 throw）。
2. 失败测试：unsupported block/inline type → `Promise` rejected with `SerializationError`（`code: 'UNSUPPORTED_NODE'`, `source: 'serialization'`, `severity: 'degraded'`）。
3. 失败测试：GFM 六类 + paragraph/heading 仍 resolve 确定性 Markdown。
4. 运行 `pnpm --filter @aether-md/plugin-remark test` FAIL → 实现 serializer 分支 → PASS。

**产出：** Serializer 错误/占位符路径与 GFM 成功路径分离覆盖。

### Phase 7: Core package-boundary guards + full verification（Task 07）

**映射 requirements：**

- `Workspace includes GFM preset package without core re-export`
- `M1 excludes later milestone behavior`（MODIFIED）
- OpenSpec tasks §6–§8 verification / non-goals guard

**TDD / contract 入口：**

1. 更新/确认 `package-boundary.test.ts`：继续禁止 `createEditor`、`AetherEditor`、`presetGfm` 等；允许 M3 document-model + adapter-base exports。
2. 断言 `@aether-md/core` 无 remark/prosemirror/react/vue runtime dependencies。
3. 运行 Core guard `rg`（见 Package Boundary Guard）。
4. 运行 `pnpm check`（build + typecheck + test，含 core、plugins、preset-gfm）。
5. 运行 `openspec validate add-gfm-preset --strict`。
6. 确认 non-goals checklist（§7 Explicit non-goals guard）。
7. 记录 validation evidence 供 `.superpowers/runs/add-gfm-preset/validation.md`（validate-task 阶段填写）。

**产出：** 全量绿 + boundary/non-goals 护栏 documented。

## Dependency Order

1. **Phase 1（Task 01）** → 确认 GFM 类型 contract；adapter 实现与 integration tests 均依赖 `AetherDoc` 既有 shape。
2. **Phase 2（Task 02）** → remark parse/serialize GFM；integration 与 SerializationError 测试依赖 serializer/parser。
3. **Phase 3（Task 03）** → prosemirror engine/conversion；round-trip 依赖 Phase 2 + 3 均完成。
4. **Phase 4（Task 04）** → preset package scaffold；integration tests 归属 preset，但可并行于 Phase 2–3 的后期（factory 需 adapter factories 可用）。
5. **Phase 5（Task 05）** → 依赖 Phase 2 + 3 + 4（wired adapters + factory）。
6. **Phase 6（Task 06）** → serializer 占位符/错误；宜在 Phase 2 serializer 基线后完成，integration 前或后与 Phase 5 交错（Task 06 须在 `pnpm check` 前绿）。
7. **Phase 7（Task 07）** → boundary + 全量验证；必须最后执行。

跨阶段约束：

- Core **MUST NOT** 直接依赖 Remark/ProseMirror/React。
- **MUST NOT** 修改 M2 Command/Event 语义来集成 Adapter。
- **MUST NOT** 实现 `createEditor`、Shell、`bootstrapCore` Adapter 加载。
- Parser 宽容（accept `*`/`_` variants）；Serializer 固定 golden strings。
- 若 OpenSpec 与 Docs/ADR 冲突，暂停并更新 OpenSpec change，禁止 silent 偏离。

## Boundary Risks

| 风险 | 触发点 | 处理方式 |
| --- | --- | --- |
| Core 直接依赖 Remark/PM | 在 core 内 parse/serialize 图省事 | 仅 plugin package 引入引擎；Phase 7 guard |
| 误实现 `createEditor` | 为 round-trip 加宿主入口 | integration test 显式 wiring；boundary 禁止 export |
| GFM 变体 vs golden string 争议 | Parser/Serializer 不一致 | design Decision 3：Parser 宽容、Serializer 固定；测试 assert golden |
| Engine schema 映射不一致 | list/link/mark 编辑后丢失 | 共享 GFM fixture `AetherDoc` JSON 作 contract 中间断言 |
| M3 list 降级测试与 M4 冲突 | 保留旧 parser test | Phase 2 更新 list test；M3 paragraph/heading 保持 |
| SerializationError rejection vs 占位符混淆 | 同一 serializer 路径 | Phase 6 分场景测试；CustomBlock 不 throw，unknown reject |
| preset 复制 Remark/PM 逻辑 | factory 内联 parse | preset 仅 Manifest + wiring；语法在 plugin packages |
| scope creep 到 M5/M6 | compile-layer、Command rollback | Phase 7 non-goals checklist |
| lockfile/依赖污染 Core | workspace hoisting 误配 | 检查 `packages/core/package.json` dependencies |
| 无关文件 commit | OpenSpec 与实现混 unrelated dirty | Code-Management 区 |

## Validation Matrix

| Phase | OpenSpec Requirement | Validation 入口 | Intuitive Verification | Notes |
| --- | --- | --- | --- | --- |
| 1 | GFM built-in types have structured round-trip coverage | `pnpm core:test` | `document-model.test.ts` GFM fixture JSON 纯净 | 类型前提；round-trip 在 Phase 5 |
| 1 | Extended document types exported without M3 round-trip coverage (MODIFIED) | `pnpm core:test` | M3 tests 不要求 extended types round-trip | export smoke |
| 1 | CustomBlock remains outside M4 GFM round-trip matrix | `pnpm core:test` + review | GFM integration 不含 CustomBlock structured round-trip | 占位符在 Phase 6 |
| 2 | Remark adapters support GFM subset parse and serialize | `pnpm --filter @aether-md/plugin-remark test` | parser/serializer GFM unit tests | golden strings |
| 2 | Remark plugin provides Parser and Serializer adapters (MODIFIED) | `pnpm --filter @aether-md/plugin-remark test` | M3 + GFM samples；非 GFM 不静默丢失 | 更新 list test |
| 3 | ProseMirror engine preserves GFM structures through edit leg | `pnpm --filter @aether-md/plugin-prosemirror test` | apply 成功/失败 GFM snapshot tests | conversion + engine |
| 4 | GFM preset package exists in workspace | `pnpm check` | preset build/typecheck/test scripts 执行 | workspace 图含 preset |
| 4 | GFM preset exposes Manifest and public factory entry | `pnpm --filter @aether-md/preset-gfm test` | Manifest `manifestVersion: 1`, `name: gfm` | 无 createEditor |
| 4 | Workspace includes GFM preset without core re-export | `pnpm core:test` | `package-boundary.test.ts` 无 presetGfm export | Core 无新引擎依赖 |
| 5 | GFM preset owns GFM round-trip integration test matrix | `pnpm test` | preset `round-trip.test.ts` 六类语法 | parse → apply → serialize |
| 5 | GFM Markdown round-trip verified across adapter packages | `pnpm test` | cross-package integration 绿 | 无 createEditor/Shell |
| 5 | M3 minimal Markdown round-trip is verified (MODIFIED) | `pnpm test` | `round-trip.test.ts` paragraph/heading 仍 pass | regression |
| 6 | SerializationError and placeholder strategy (Serializer paths) | `pnpm --filter @aether-md/plugin-remark test` | CustomBlock 占位符 + unsupported rejection | `SerializationError` shape |
| 7 | M1 excludes later milestone behavior (MODIFIED) | `pnpm core:test` | M1 bootstrap tests 不被 GFM 默认拉入 | intentional only |
| 7 | Core package boundary excludes editor and GFM preset in core | `pnpm core:test` + `rg` guard | 无 createEditor/presetGfm/remark in core | Phase 7 checklist |
| 7 | Adapter packages + preset in workspace verification | `pnpm check` | 全 workspace build/typecheck/test 绿 | 汇总 gate |
| 7 | Non-goals guard | review + `openspec validate add-gfm-preset --strict` | §7 Explicit non-goals | 无 scope creep |

**汇总命令映射：**

| 命令 | 覆盖 |
| --- | --- |
| `pnpm core:test` | Phase 1 document-model；Phase 4/7 core boundary；M1/M2 回归 |
| `pnpm test` | Phase 2–6 plugin + preset unit/integration；Phase 5 cross-package |
| `pnpm check` | Phase 4–7 全 workspace gate（build + typecheck + test + skills check） |

## Task Breakdown

高层 Task（Step 4 `aether-workflow-create-task` 将拆为 `.superpowers/tasks/add-gfm-preset/*.md`；每 task **MUST** 以失败测试开头）：

| Task | Outcome | Allowed Area | Maps to OpenSpec tasks | Version Impact |
| --- | --- | --- | --- | --- |
| **01** Document-model contract | GFM 类型 export 确认 + optional contract tests | `packages/core/src/document-model*.ts` | §1（types 前提） | core 无 breaking |
| **02** plugin-remark GFM | GFM parse/serialize + parser test 迁移 | `packages/plugins/plugin-remark/**` | §2.1–2.2, 2.4 | remark minor + lockfile |
| **03** plugin-prosemirror GFM | PM schema/conversion + engine contract tests | `packages/plugins/plugin-prosemirror/**` | §3.1–3.5 | prosemirror minor |
| **04** preset-gfm scaffold | workspace package + Manifest + factory | `packages/preset-gfm/**` | §1.1–1.3 | 新 package `0.0.0` |
| **05** GFM round-trip integration | 六类语法 matrix + M3 regression | `packages/preset-gfm/src/round-trip.test.ts`；确认 M3 `round-trip.test.ts` | §4.1–4.4 | 无新 public API beyond factory |
| **06** SerializationError / placeholder | CustomBlock 占位符 + unsupported rejection | `packages/plugins/plugin-remark/src/serializer*.ts` | §2.3, 2.5 | 使用已有 `SerializationError` class |
| **07** Boundary + full verification | core boundary + `pnpm check` + openspec validate + non-goals | `packages/core/src/package-boundary.test.ts`；全 change | §5–§7, §8 | 确认 lockfile；manifestVersion 不变 |

**M4 GFM 六类语法测试矩阵（implementation task 内固定）：**

| 样例 | Markdown fixture | 必测 |
| --- | --- | --- |
| Paragraph | `"Hello world\n"` | parse → apply → serialize（M3 regression） |
| Heading + paragraph | `"## Title\n\nBody\n"` | 同上（M3 regression） |
| Strong | `"**bold**\n"` | structured round-trip |
| Emphasis | `"*italic*\n"` | structured round-trip |
| Unordered list | `"- item one\n- item two\n"` | `ListBlock` round-trip |
| Ordered list | `"1. first\n2. second\n"` | `ListBlock` ordered round-trip |
| Link | `"[label](https://example.com)\n"` | `LinkInline` round-trip |

## Review Focus

- 每个改动文件映射到 Task 01–07。
- 每个 Task 映射到 OpenSpec requirement / `tasks.md` 条目；不得发明 requirement 外行为。
- `@aether-md/core` **无** remark/prosemirror/react/vue runtime dependency；**无** GFM 实现 re-export。
- Package Boundary Guard 表全部满足。
- Round-trip **不**依赖 `createEditor`、`bootstrapCore` Adapter 加载、React Shell。
- M2 Command/Event tests 仍独立；无自动 `transactionFailed`。
- M3 paragraph/heading round-trip 仍绿；list 测试已迁移为 structured parse。
- Serializer golden strings 与 design Decision 3 一致；Parser 变体输入不导致 round-trip 断言失败（以 Serializer 输出为准）。
- `CustomBlock` 仅占位符 serialize，不要求 structured round-trip。
- `pnpm-lock.yaml` 变更来自 plugin-remark（`remark-gfm`）与 preset workspace；Core 保持轻量。
- 说明性正文中文；代码标识 English。
- 无关 dirty 文件未纳入 commit。

## Open Questions

| 问题 | Plan 阶段处理 | 阻塞？ |
| --- | --- | --- |
| `createGfmPreset()` 精确 API（仅 manifest vs bundled adapters） | Task 04 在 preset package 内定稿；须满足 boundary tests 与 integration wiring | 否 |
| Ordered list 多 item 最小矩阵 | Task 05 建议至少 2 items single-level（design 建议） | 否 |
| `LinkInline.title` 非空时 Serializer 行为 | M4 round-trip 矩阵 omit title；title parse-only | 否 |
| `remark-gfm` vs 手写 mdast 映射 | Task 02 优先 `remark-gfm`；体积监控 principles Gzip budget | 否 |
| Shared contract test package | 默认 preset 内 integration test（与 M3 模式一致） | 否 |

实现中若需偏离 OpenSpec design 决定，**MUST** 先更新 OpenSpec change，再改代码。

## Version Impact / Branch / Commit 策略

**Version impact（来自 proposal）：**

- `@aether-md/core`：无 breaking change；public types additive-only 或不变。
- `@aether-md/preset-gfm`：新包 `0.0.0`。
- `@aether-md/plugin-remark` / `@aether-md/plugin-prosemirror`：minor-level behavior extension（GFM 子集）。
- `manifestVersion` / `SUPPORTED_MANIFEST_VERSIONS`：不变（`[1]`）。
- `pnpm-lock.yaml`：预期变更（`remark-gfm`、preset 链接）。

**Branch：**

- 当前：`feat/add-gfm-preset`
- 自 `main` 创建；implementation 全程保持单 change scope。

**Commit 策略：**

| 类型 | scope 示例 | 时机 |
| --- | --- | --- |
| `docs(openspec)` | OpenSpec artifacts | 已完成 |
| `feat(preset-gfm)` | Manifest、factory、integration tests | Task 04–05 |
| `feat(plugin-remark)` | GFM parse/serialize、SerializationError | Task 02, 06 |
| `feat(plugin-prosemirror)` | PM schema/conversion | Task 03 |
| `test(core)` | boundary / document-model contract | Task 01, 07 |
| `chore(core)` | boundary-only 微调 | Task 07 |

- 推荐 **一 Superpowers task 一 commit**；PR 描述链接 OpenSpec change id 与各 task id。
- Archive 前使用 `aether-workflow-update-docs-spec` sync main specs（`gfm-preset`、`document-model`、`adapter-base`、`core-bootstrap`）。

## Recommended Next Skill

`aether-workflow-create-task` — 将本 plan 拆成 `.superpowers/tasks/add-gfm-preset/01-*.md` … `07-*.md`（中文说明 + English 标识；每 task 含 TDD 步骤、`pnpm core:test` / `pnpm test` / `pnpm check` validation 命令与 OpenSpec requirement 引用）。
