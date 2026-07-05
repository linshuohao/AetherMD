# Task 07: React Shell 集成测试（mount / type / change / dispose）

Change:

- `add-react-shell`

Branch:

- `feat/add-react-shell`

Spec Requirement:

- `react-shell` / ADDED `React Shell integration tests use happy-dom`（Scenario: mount type change dispose integration test passes；Scenario: dispose integration test leaves no active editor）
- `react-shell` / ADDED `DOM input is bridged through editor dispatch`（Scenario: typing emits change through dispatch path；Scenario: onChange callback receives updated markdown）

OpenSpec Tasks:

- `openspec/changes/add-react-shell/tasks.md` §5.1–5.2

Source Docs:

- `.superpowers/plans/add-react-shell.md`
- `openspec/changes/add-react-shell/design.md`（Decision #3 happy-dom）
- `docs/engineering/test-strategy.md`
- `docs/engineering/mvp-implementation-plan.md`（M5）

## 目标

配置 happy-dom 作为 `@aether-md/react` 测试 DOM 运行时；实现主路径集成测试：mount → simulate input → `onChange` → unmount → `dispose()`；验证输入经 dispatch 路径、**不**使用 Playwright。

## 范围

- 新增 `packages/react/src/test-setup.ts`：happy-dom 全局注册（`GlobalRegistrator` 或等价）
- 新增 `packages/react/src/react-shell.integration.test.tsx`：完整 happy-dom 主路径
- 可选新增 `packages/react/src/test-helpers.ts`：`toExtensionPlugin(createGfmPreset())` 等共享 helper（Task 09 可 import，**不**重复编辑本 integration 文件）
- **独占**上述文件；**不**编辑 `gate-lock.integration.test.tsx`（Task 08）

Allowed Files:

- `packages/react/src/test-setup.ts`
- `packages/react/src/react-shell.integration.test.tsx`
- `packages/react/src/test-helpers.ts`（若新建）

Forbidden Files:

- `packages/react/src/gate-lock.integration.test.tsx`（Task 08）
- `packages/react/src/gfm-react-smoke.test.tsx`（Task 09）
- `packages/react/src/package-boundary.test.ts`（Task 09 强化）
- `packages/core/**`
- `packages/plugins/plugin-prosemirror/src/view-bridge.ts`（除非 regression fix）

## TDD 入口（Red → Green → Refactor）

**Red**

1. 配置 test-setup；写 failing integration test：
   - mount `AetherEditorRoot` + `AetherEditorContent`
   - simulate user input
   - assert `onChange` called with updated markdown
   - unmount → assert `dispose()` invoked / subsequent dispatch fails closed
2. `pnpm --filter @aether-md/react test` → **FAIL**。

**Green**

3. 实现/修复 Root+Content 直至 integration **PASS**（若失败在组件层，最小回溯 Task 06）。
4. happy-dom input 事件与 PM 兼容。

**Refactor**

5. 提取 `test-helpers.ts` 供 Task 09 复用；integration test 聚焦主路径。

TDD Notes:

- **不**引入 Playwright 或 browser CI。
- 使用 GFM preset devDeps（`@aether-md/preset-gfm` + plugins）— 仅测试路径。

Validation:

```bash
pnpm --filter @aether-md/react build
pnpm --filter @aether-md/react test
# 聚焦 integration（dist 路径以 tsconfig.test.json 为准）：
pnpm --filter @aether-md/react exec node --test dist/react-shell.integration.test.js
```

预期：integration test **PASS** in Node；mount/type/change/dispose 主路径绿。

Intuitive Verification:

- 测试 trace：`onChange` markdown 与 `getMarkdown()` 一致；unmount 后 editor disposed。

Review Checklist:

- [ ] happy-dom configured；无 Playwright import。
- [ ] 输入经 dispatch 路径（非 PM 直写）。
- [ ] `dispose()` on unmount。
- [ ] 仅修改 Allowed Files（与 Task 08 disjoint）。
- [ ] `test-helpers.ts` 若创建，供 Task 09 import only。

Rollback Notes:

- 删除 test-setup、integration test、test-helpers。

Version Impact:

- none（test-only + devDeps 已在 Task 02）

Commit Scope:

- `test(react): add happy-dom mount type change dispose integration test`

Depends On:

- 06

Parallel Group:

- wave-4

Barrier:

- false

Status:

- completed

Run Log:

- 2026-07-05: Added `test-setup.ts`, `test-helpers.ts`, `react-shell.integration.test.tsx`.
- Validation: integration test PASS (mount/dispatch/onChange/dispose).

Deviation:

- Integration test asserts dispatch→`onChange` path (Node-stable) rather than raw keyboard DOM events.

Rollback:

- 见 Rollback Notes
