# Task 10: 强化 package boundary 与非目标护栏

Change:

- `add-gfm-preset`

Branch:

- `feat/add-gfm-preset`

Spec Requirement:

- `core-bootstrap` / ADDED `Workspace includes GFM preset package without core re-export`
- `core-bootstrap` / MODIFIED `M1 excludes later milestone behavior`
- OpenSpec `tasks.md` §5 Core package boundary、§7 Explicit non-goals guard

Source Docs:

- `.superpowers/plans/add-gfm-preset.md`
- `openspec/changes/add-gfm-preset/specs/core-bootstrap/spec.md`
- `openspec/changes/add-gfm-preset/tasks.md`（§5.1–5.3、§7.1–7.4）
- `docs/architecture/package-layout.md`
- `docs/engineering/mvp-implementation-plan.md`

## 目标

更新/确认 `@aether-md/core` package-boundary tests 与 scope guards：禁止 `createEditor`、`AetherEditor`、`EditorContext`、`presetGfm` export；允许 workspace 含 `@aether-md/preset-gfm`；确认 Core 无 remark/prosemirror/react/vue runtime 依赖；non-goals checklist 通过。

## 范围

- `package-boundary.test.ts`：确认 M4 boundary 断言（preset 不在 core exports；M3 document-model + adapter-base exports 仍允许）。
- 运行 plan Package Boundary Guard `rg` 命令。
- Non-goals 静态审查（**不**改 Command Bus / bootstrap 生产代码，仅确认未混入）：
  - 无 `createEditor` / React Shell / Vue Shell。
  - 无 `createCommandEventRuntime` Adapter 自动 rollback / `transactionFailed` auto emit。
  - 无 `bootstrapCore` silent provide `core:engine` / `core:parser`。
  - 无 compile-layer、`CustomBlock` round-trip、嵌套列表/表格等 scope creep。
- **不**跑全量 `pnpm check`（Task 11）；**不** sync 长期 Docs。

Allowed Files:

- `packages/core/src/package-boundary.test.ts`
- `packages/core/package.json`（仅确认无非法 dependency 添加——预期无 diff）

Forbidden Files:

- `packages/core/src/bootstrap.ts`、`command-event-runtime.ts`（non-goals 仅审查，不改语义）
- `packages/plugins/**`（除非 boundary test 需字符串 fixture）
- `packages/preset-gfm/src/**`（implementation 不在此 task）
- `docs/**`、`openspec/specs/**`
- 任何 `createEditor` 实现
- `AGENTS.md` 及其他无关 dirty 文件

## TDD 入口

1. 若 boundary tests 缺 M4 断言：写 failing test（如 export 列表不含 `presetGfm` / `createGfmPreset`）→ 实现断言 → **PASS**。
2. 运行 Core guard：
   ```bash
   rg -i "remark|prosemirror|react|vue|gfm|createEditor|AetherEditor|EditorContext|preset-gfm" packages/core/package.json packages/core/src
   ```
   预期：无生产代码违规命中（boundary test 字符串断言除外）。
3. 运行 non-goals `rg` checks（见 Validation）→ 记录结果。

TDD Notes:

- 以 boundary tests + rg guards 为验证入口；生产代码变更预期最小（仅 test 增补）。

Validation:

```bash
pnpm core:test
pnpm --filter @aether-md/core exec tsc --noEmit
rg -i "remark|prosemirror|react|vue|gfm|createEditor|AetherEditor|EditorContext|preset-gfm" packages/core/package.json packages/core/src
rg "createEditor|AetherEditor|EditorContext|preset-gfm|packages/react" packages/core packages/plugins packages/preset-gfm
rg "transactionFailed" packages/core/src/command-event-runtime.ts
rg "core:engine|core:parser" packages/core/src/bootstrap.ts packages/core/src/capabilities.ts
```

预期：core tests **PASS**；rg guards 无违规实现；Command runtime 无 Adapter rollback 集成。

Intuitive Verification:

- 人工核对 non-goals checklist（plan §7）全部勾选。

Review Checklist:

- [ ] `package-boundary.test.ts` 覆盖 M4 preset/core 分离。
- [ ] Core `package.json` 无 remark/prosemirror/react/vue runtime deps。
- [ ] workspace 允许 preset package 存在。
- [ ] non-goals 未混入（editor、Command rollback、bootstrap adapter loading）。
- [ ] 未修改 M2 Command/Event 生产语义。

Rollback Notes:

- 回滚 `package-boundary.test.ts` 本 task 改动。

Version Impact:

- `@aether-md/core`：**无 breaking change**；boundary tests only
- `manifestVersion` / `SUPPORTED_MANIFEST_VERSIONS`：**不变**

Commit Scope:

- `test(core): reinforce M4 package boundary and non-goals guards`

Status:

- complete

Run Log:

- 2026-07-05: Task started; reinforcing core package boundary tests.
- 2026-07-05: Added createGfmPreset export guard and workspace preset package existence test.
- 2026-07-05: Validation — core 61/61 pass; rg guards clean (no transactionFailed in command-event-runtime; no core:engine/parser in bootstrap/capabilities production).

Deviation:

- none
