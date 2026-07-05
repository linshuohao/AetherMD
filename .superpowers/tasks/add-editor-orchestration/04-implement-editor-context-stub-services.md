# Task 04: 实现 EditorContext 最小面与 stub services

Change:

- `add-editor-orchestration`

Branch:

- `feat/add-editor-orchestration`

Spec Requirement:

- `editor-orchestration` / ADDED `EditorContext exposes minimal orchestration services`（Scenario: context exposes command and event services）

OpenSpec Tasks:

- `openspec/changes/add-editor-orchestration/tasks.md` §3.4

Source Docs:

- `.superpowers/plans/add-editor-orchestration.md`
- `openspec/changes/add-editor-orchestration/design.md`（Decision 7）
- `docs/sdk/editor-context.md`

## 目标

实现 `EditorContext` 最小公开面：`commands`、`events`、`logger`、`grantedPermissions`、`services.engine`、`services.parser`；`history` / `selection` / `clipboard` / `assets` / `telemetry` 为 **no-op stub**（documented）；**不**注册自定义业务服务。

## 范围

- 新增 `editor/context.ts`：`EditorContext` class 或 factory `createEditorContext(...)`。
- Stub services：方法存在但 no-op 或返回安全默认值（design 建议 no-op；在文件头注释 M5 前不可用）。
- 新增 `editor/context.test.ts`：
  - `commands` / `events` 可访问（可注入 mock CommandEventRuntime facade）。
  - `services.engine` / `services.parser` 持有 wired adapter 引用。
  - stub services 存在且调用不 throw（或 documented throw — 选定一种并测试）。
- **不**实现完整 History/Selection/Clipboard 语义。
- **不**实现 `createEditor`（Task 05 组装 context）。

Allowed Files:

- `packages/core/src/editor/context.ts`
- `packages/core/src/editor/context.test.ts`

Forbidden Files:

- `packages/core/src/editor/create-editor.ts`
- `packages/core/src/bootstrap.ts`
- `packages/core/src/command-event-runtime.ts`（可 import 类型，不改实现）
- `packages/plugins/**`
- `packages/react/**`
- `docs/**`、`openspec/**`

## TDD 入口（Red → Green → Refactor）

**Red**

1. 写 failing test：`createEditorContext({ engine, parser, runtime })` → `context.commands` / `context.events` defined。
2. 写 failing test：`context.services.history` 存在且 no-op（或 documented behavior）。
3. `pnpm core:test` → **FAIL**。

**Green**

4. 实现最小 `EditorContext` + stubs。
5. `pnpm core:test` → **PASS**。

**Refactor**

6. 提取 stub service 工厂；避免 context 文件过大。

TDD Notes:

- 使用 mock runtime / mock adapters；不依赖 preset package。

Validation:

```bash
pnpm core:test
pnpm --filter @aether-md/core exec tsc --noEmit
```

预期：context tests **PASS**。

Intuitive Verification:

- 阅读 `context.ts` 顶部注释：stub services M4.5 行为说明。

Review Checklist:

- [ ] 仅修改 Allowed Files。
- [ ] commands/events/engine/parser 可访问。
- [ ] stub services 行为与 tests 一致。
- [ ] 无自定义业务 service 注册 API。
- [ ] 未实现 History 完整语义。

Rollback Notes:

- 删除 `context.ts` 与 `context.test.ts`。

Version Impact:

- none（EditorContext 公开 export 可在 Task 05 一并暴露）

Commit Scope:

- `feat(core): add EditorContext with stub services for M4.5`

Depends On:

- 01

Parallel Group:

- G1

Barrier:

- false

Status:

- completed

Run Log:

- Red: EditorContext service shape test
- Green: `context.ts` + `context.test.ts` PASS
- Validation: `pnpm core:test` PASS

Deviation:

- none

Rollback:

- 见 Rollback Notes
