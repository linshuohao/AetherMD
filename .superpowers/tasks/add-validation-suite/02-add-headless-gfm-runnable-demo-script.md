# Task 02: headless-gfm 可运行脚本与 smoke 验证

Change:

- `add-validation-suite`

Branch:

- `feat/add-validation-suite`

Spec Requirement:

- `validation-suite` / ADDED `Headless GFM example package demonstrates integration path`（Scenario: Headless example runs from workspace）

OpenSpec Tasks:

- `openspec/changes/add-validation-suite/tasks.md` §3.2、§3.4

Source Docs:

- `.superpowers/plans/add-validation-suite.md`
- `openspec/changes/add-validation-suite/specs/validation-suite/spec.md`
- `packages/core/src/editor/create-editor-gfm.integration.test.ts`（wiring 模式参考）
- `docs/engineering/mvp-implementation-plan.md`

## 目标

实现 `examples/headless-gfm/src/run.ts`：Node 可运行 headless GFM 集成演示（`createEditor` + `createGfmPreset()` + 显式 adapter stubs），stdout 输出 round-trip 或成功日志；更新 scripts 使 `pnpm build && pnpm --filter @aether-md/example-headless-gfm start` 通过。

## 范围

1. 创建 `examples/headless-gfm/src/run.ts`：
   - 复用 `create-editor-gfm.integration.test.ts` 的 plugin stub 模式（bootstrap stub、remark/prosemirror name stubs、`createGfmPreset()` + `toExtensionPluginFromPreset`）。
   - `createEditor({ plugins, initialValue })` → `dispatch` replaceText 或 `getMarkdown()` → stdout 打印结果。
   - `main()` 用 fixture Markdown（如 `**bold**\n`）；进程 exit 0。
2. 更新 `package.json` scripts：`build`: `tsc -p tsconfig.json`；`start`: `node dist/run.js`。
3. Smoke：`pnpm build && pnpm --filter @aether-md/example-headless-gfm start`。

Depends On:

- 01

Parallel Group:

- wave-a

Barrier:

- false

Allowed Files:

- `examples/headless-gfm/src/run.ts`
- `examples/headless-gfm/package.json`（scripts：`build`/`start`/`typecheck`/`check`）
- `examples/headless-gfm/tsconfig.json`
- `pnpm-lock.yaml`（仅依赖脚本变更导致）

Forbidden Files:

- `packages/core/src/**`（生产代码）
- `packages/react/**`
- React/DOM 依赖
- `examples/react-basic/**`
- `.github/workflows/**`
- `npm publish`、`NPM_TOKEN`
- 无关 package 运行时语义变更

Implementation Notes:

- Example 侧重**可运行叙事**与文档引用；**不**复制 `create-editor-gfm.integration.test.ts` 的 CI 断言职责。
- 遵循仓库惯例：`tsc` + `node`（非 `tsx`）。
- **不**依赖 React/DOM。

TDD Notes:

- **Red：** 参照 `create-editor-gfm.integration.test.ts` wiring，先确认 `pnpm build && pnpm --filter @aether-md/example-headless-gfm start` 在无 `run.ts` 时 FAIL。
- **Red：** 实现前 smoke 预期 exit non-zero 或 module not found。
- **Green：** 实现 `run.ts` 后 `start` exit 0；stdout 含 round-trip 或成功输出。
- **Green：** `pnpm --filter @aether-md/example-headless-gfm typecheck` PASS。

Validation:

```bash
pnpm build
pnpm --filter @aether-md/example-headless-gfm start
pnpm --filter @aether-md/example-headless-gfm typecheck
```

预期：三项均 **PASS**；`start` stdout 可见 GFM 处理结果。

Intuitive Verification:

```bash
pnpm build && pnpm --filter @aether-md/example-headless-gfm start
```

人工确认 stdout trace：无 React/DOM 错误；可见 `**bold**` 或等价 round-trip 输出；进程 exit 0。

Review Checklist:

- [ ] `run.ts` 使用 `createEditor` + `createGfmPreset()` + adapter wiring。
- [ ] 无 React/DOM 依赖。
- [ ] 未修改 Core 生产代码。
- [ ] 与 `create-editor-gfm.integration.test.ts` 职责分离（example = 叙事，test = 断言）。
- [ ] `private: true` 保持。

Rollback Notes:

- 删除 `examples/headless-gfm/src/run.ts`；回滚 `package.json` scripts 至 Task 01 占位状态。

Version Impact:

- none（private example package；无 public API 变更）

Commit Scope:

- `chore(examples): add headless-gfm runnable demo script`

Status:

- completed

Run Log:

- **TDD Red (no run.ts):** `pnpm build` → exit 2 (`TS18003: No inputs were found`); `pnpm --filter @aether-md/example-headless-gfm start` → exit 1 (`Cannot find module dist/run.js`).
- **Implementation:** Added `examples/headless-gfm/src/run.ts` (`createEditor` + `createGfmPreset()` + bootstrap/remark/prosemirror stubs + local `toExtensionPluginFromPreset`); updated `package.json` with `check` script; added `"types": ["node"]` to `tsconfig.json` for `process` typings.
- **TDD Green:** `pnpm build` → exit 0; `pnpm --filter @aether-md/example-headless-gfm start` → exit 0, stdout `**bold**\n` round-trip + edited output; `pnpm --filter @aether-md/example-headless-gfm typecheck` → exit 0.

Validation commands:

```text
pnpm build → exit 0
pnpm --filter @aether-md/example-headless-gfm start → exit 0 (stdout: **bold** / **bold** edited)
pnpm --filter @aether-md/example-headless-gfm typecheck → exit 0
```

Deviation:

- `toExtensionPluginFromPreset` and `ENGINE_REPLACE_TEXT_COMMAND` inlined locally (not exported from `@aether-md/core` public API); local `ExtensionPluginWithAdapters` interface mirrors `packages/core/src/editor/adapter-wiring.ts`.
- `tsconfig.json`: added `"types": ["node"]` (allowed file) so `process` resolves under strict TS.
