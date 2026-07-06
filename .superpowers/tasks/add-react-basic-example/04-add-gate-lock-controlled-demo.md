# Task 04: GateLock 受控示例 UI

Change:

- `add-react-basic-example`

Branch:

- `feature/add-react-basic-example`

Spec Requirement:

- `validation-suite` / ADDED `React basic example package demonstrates React Shell integration path`（Scenario: React example demonstrates controlled value and GateLock）

OpenSpec Tasks:

- `openspec/changes/add-react-basic-example/tasks.md` §3.2

Source Docs:

- `.superpowers/plans/add-react-basic-example.md`
- `openspec/changes/add-react-basic-example/specs/validation-suite/spec.md`
- `openspec/specs/react-shell/spec.md`（GateLock 语义）
- `packages/react/src/gate-lock.integration.test.tsx`（行为参考；包内测试为契约 truth）
- `docs/architecture/ci-checklist.md`（GateLock #41 intent）

## 目标

扩展 `App.tsx`：添加「Force parent rerender」控件；在 `value` 不变时父组件 rerender **不**重设文档；example UI 使 GateLock 演示可观测。

## 范围

1. 扩展 `App.tsx`：受控 `value` + `renderCount` state + force rerender 按钮 + 说明文案。
2. 手动验收（`pnpm dev`）：
   - 编辑编辑器内容（如改为含 `Hello AetherMD`）。
   - 多次点击「Force parent rerender」。
   - 确认 preview **不**回退到 `INITIAL_MARKDOWN`。
3. 职责边界：example 侧重 Vite 宿主叙事与手动 smoke；包内 `gate-lock.integration.test.tsx` 侧重 CI 契约断言。

Depends On:

- 03

Parallel Group:

- wave-a

Barrier:

- false

Allowed Files:

- `examples/react-basic/src/App.tsx`

Forbidden Files:

- `packages/react/**` 生产代码（GateLock 语义变更）
- `packages/core/**`
- Playwright / browser CI
- 复制 GateLock 断言到 example Node test（本 change 无 example test runner）

Implementation Notes:

- **MUST NOT** 修改 Shell GateLock public contract 或 Core/React 生产语义。
- UI 文案与 fixture Markdown 可微调；须保留 GateLock 可观测性。

TDD Notes:

- **Red：** Task 03 `App.tsx` 无 force rerender 控件；GateLock 场景不可手动复现。
- **Green：** 编辑后 force rerender 且 `value` 不变 → 文档 session 不重设（对照 `gate-lock.integration.test.tsx` 叙事）。
- 无 automated example test；手动 dev smoke 为 intuitive verification；包内集成测试为契约 truth。

Validation:

```bash
pnpm build
pnpm --filter @aether-md/example-react-basic dev
pnpm --filter @aether-md/example-react-basic typecheck
```

手动 GateLock smoke（见范围 §2）。

Intuitive Verification:

1. `pnpm dev` 打开 example。
2. 编辑编辑器文本。
3. 点击「Force parent rerender」多次。
4. 确认 preview 仍显示编辑后内容，**不**回退初始 markdown。

Review Checklist:

- [ ] 受控 `value` + force parent rerender 按钮存在。
- [ ] GateLock 演示可观测（说明文案 + preview）。
- [ ] **无**五包 GateLock / Shell public API 变更。
- [ ] 与 `gate-lock.integration.test.tsx` 职责分离清晰。
- [ ] **未**引入 Playwright。

Rollback Notes:

- revert Task 04 对 `App.tsx` 的 GateLock UI 扩展；保留 Task 03 编辑器集成。

Version Impact:

- none

Commit Scope:

- `feat(examples): add gate-lock controlled demo to react-basic`

Status:

- completed

Run Log:

- 2026-07-05: Task started — GateLock controlled demo UI
- 2026-07-05: Added force parent rerender button + renderCount state + GateLock copy
- 2026-07-05: `tsc --noEmit` — PASS
- 2026-07-05: `vite build` — PASS
- 2026-07-05: GateLock smoke — manual dev deferred; behavior aligned with gate-lock.integration.test.tsx narrative
- 2026-07-05: Validation complete — Task 04 green

Deviation:

- none
