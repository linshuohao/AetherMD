# Task 07: Scaffold @aether-md/preset-gfm package

Change:

- `add-gfm-preset`

Branch:

- `feat/add-gfm-preset`

Spec Requirement:

- `gfm-preset` / ADDED `GFM preset package exists in workspace`
- `gfm-preset` / ADDED `GFM preset exposes Manifest and public factory entry`
- `core-bootstrap` / ADDED `Workspace includes GFM preset package without core re-export`

OpenSpec Tasks:

- `openspec/changes/add-gfm-preset/tasks.md` §1.1–1.3、§1.4、§5.2–5.3

Source Docs:

- `.superpowers/plans/add-gfm-preset.md`
- `openspec/changes/add-gfm-preset/specs/gfm-preset/spec.md`
- `openspec/changes/add-gfm-preset/specs/core-bootstrap/spec.md`
- `docs/architecture/package-layout.md`
- `docs/sdk/manifest.md`
- `docs/engineering/mvp-implementation-plan.md`

## 目标

建立 `packages/preset-gfm` workspace package：Manifest（`manifestVersion: 1`，`metadata.name: gfm`）、公开 factory（如 `createGfmPreset()`）、build/typecheck/test scripts；factory 可暴露 wired adapter references，**不** require `createEditor` / `bootstrapCore`。

## 范围

- 新建 `packages/preset-gfm/`：`package.json`、`tsconfig.json`、`src/index.ts`、`src/manifest.ts`。
- 依赖：`@aether-md/core`、workspace 链接 `@aether-md/plugin-remark`、`@aether-md/plugin-prosemirror`（wiring 用；语法逻辑仍在 plugin packages）。
- Factory/Manifest contract tests（**不含**六类 round-trip integration，留 Task 08）。
- 确认 `pnpm-workspace.yaml` 已覆盖 `packages/*`（通常无需改）。
- **不**在 `@aether-md/core` re-export preset；**不**修改 `package-boundary.test.ts`（Task 10）。

Allowed Files:

- `packages/preset-gfm/**`
- `pnpm-lock.yaml`（workspace 链接）

Forbidden Files:

- `packages/core/src/**`（本 task 不改 Core）
- `packages/plugins/plugin-remark/src/**`、`packages/plugins/plugin-prosemirror/src/**`（除非 factory wiring 需最小 export，优先 preset 内 import）
- `packages/react/**`
- `docs/**`、`openspec/**`
- `AGENTS.md` 及其他无关脏文件

## TDD 入口

1. 建立 package 骨架后，写失败 test：`createGfmPreset()` 返回 Manifest with `manifestVersion: 1`、`metadata.name: gfm`。
2. 失败 test：factory 暴露 adapter references / schema bundle，import 路径 **不** 含 `createEditor`。
3. 失败 test：`package.json` dependencies 不内联复制 Remark/PM 语法实现（依赖 plugin packages）。
4. `pnpm --filter @aether-md/preset-gfm test` → **FAIL** → scaffold + 实现 → **PASS**。

TDD Notes:

- red-green：Manifest/factory contract tests 先于完整 integration matrix。

Validation:

```bash
pnpm --filter @aether-md/preset-gfm test
pnpm --filter @aether-md/preset-gfm exec tsc --noEmit
pnpm --filter @aether-md/preset-gfm run build
rg "remark|prosemirror|react|vue|gfm|createEditor|preset-gfm" packages/core/package.json packages/core/src
```

预期：preset build/typecheck/test **PASS**；Core 无 preset re-export 或新引擎依赖。

Intuitive Verification:

- 阅读 `manifest.ts`：`metadata.name` 与 `manifestVersion` 符合 SDK contract。

Review Checklist:

- [ ] `@aether-md/preset-gfm` 参与 workspace scripts。
- [ ] Factory importable 且无 `createEditor` 要求。
- [ ] 语法实现未复制进 preset（仅 wiring）。
- [ ] Core exports 未变。

Rollback Notes:

- 删除 `packages/preset-gfm/` 目录。
- 回滚 `pnpm-lock.yaml` preset 链接条目。

Version Impact:

- 新建 `@aether-md/preset-gfm`：**`0.0.0`**
- `pnpm-lock.yaml`：预期变更（workspace 链接）
- `manifestVersion` / `SUPPORTED_MANIFEST_VERSIONS`：**不变**（`[1]`）

Commit Scope:

- `feat(preset-gfm): scaffold GFM preset package with Manifest and factory`

Status:

- complete

Run Log:

- 2026-07-05: Task started; scaffolding preset-gfm package with TDD.
- 2026-07-05: Created package skeleton, manifest, createGfmPreset factory, preset.test.ts.
- 2026-07-05: Validation — preset test/build pass; Core boundary rg clean.

Deviation:

- none
