# Task 07: `createEditor` 启动中止集成回归测试

Change:

- `add-validation-suite`

Branch:

- `feat/add-validation-suite`

Spec Requirement:

- `validation-suite` / ADDED `Editor startup abort paths are covered by integration regression tests`（Scenario: Unsupported manifest version aborts createEditor；Scenario: Duplicate plugin name aborts createEditor；Scenario: Default resolver aborts schema conflicts at unit level）

OpenSpec Tasks:

- `openspec/changes/add-validation-suite/tasks.md` §5.1、§5.2、§5.3

Source Docs:

- `.superpowers/plans/add-validation-suite.md`
- `openspec/changes/add-validation-suite/specs/validation-suite/spec.md`
- `docs/sdk/conflict-resolution.md`
- `docs/architecture/ci-checklist.md`
- `packages/core/src/editor/conflict-resolver.test.ts`（已有，保持绿）
- `packages/core/src/editor/editor-orchestration.test.ts`（已有 unsupported version case）

## 目标

新增或整合 `createEditor` 启动中止集成测试：duplicate `metadata.name` → `CoreError` / `PLUGIN_NAME_DUPLICATE`；确认 unsupported `manifestVersion` 覆盖；保持 `conflict-resolver.test.ts` schema abort 单元测试绿。**不**实现 compile-layer schema merge。

## 范围

**已有覆盖（保持，不删）：**

- `conflict-resolver.test.ts`：`type: "schema"` → `strategy: "abort"`
- `editor-orchestration.test.ts`：`createEditor` + `manifestVersion: 99` → `MANIFEST_VERSION_UNSUPPORTED`
- `bootstrap.test.ts`：`bootstrapCore` duplicate name → `PLUGIN_NAME_DUPLICATE`

**新增/整合（M6 交付物）：**

`packages/core/src/editor/startup-abort.integration.test.ts`：

- `createEditor` + 两 plugin 相同 `metadata.name` → `CoreError` / `PLUGIN_NAME_DUPLICATE`
- 若 `editor-orchestration.test.ts` 已含等价 case，可合并至单一文件并在 validation 记录注明；**不得** silent 删除要求

Depends On:

- none

Parallel Group:

- wave-c

Barrier:

- false

Allowed Files:

- `packages/core/src/editor/startup-abort.integration.test.ts`（或整合进 `editor-orchestration.test.ts`）
- `packages/core/src/editor/editor-orchestration.test.ts`（仅合并/搬迁测试，非生产语义）
- `packages/core/tsconfig.test.json`（若需）

Forbidden Files:

- `packages/core/src/editor/conflict-resolver.ts`（生产语义）
- compile-layer merge 新模块
- `EditorConfig` 新公开字段
- `packages/core/src/editor/conflict-resolver.test.ts` 删除或削弱
- `examples/react-basic/**`
- `npm publish`、`NPM_TOKEN`、`.github/workflows/**` release job
- 无关 package 运行时语义变更

Implementation Notes:

- compile-layer schema merge **不在 scope**（design Decision 6）。
- 单元 schema abort + `createEditor` fatal startup 满足 M6 要求。
- 若合并测试文件，须在 Deviation 记录合并理由与覆盖映射。

TDD Notes:

- **单元（已有 Green）：** `conflict-resolver.test.ts` schema → `abort` 保持绿。
- **集成 Red：** 先写 failing test — `createEditor` + duplicate `metadata.name` 两 plugin → `CoreError` / `PLUGIN_NAME_DUPLICATE`。
- **集成 Green：** 实现/确认测试 PASS。
- unsupported `manifestVersion`：确认 `editor-orchestration.test.ts` 已有 case；缺失则补充。

Validation:

```bash
pnpm --filter @aether-md/core test -- --test-name-pattern="startup-abort|createEditor orchestration|createDefaultConflictResolver"
```

或完整 core test：

```bash
pnpm --filter @aether-md/core test
```

预期：startup abort + conflict resolver tests **PASS**。

Intuitive Verification:

- 阅读 `startup-abort.integration.test.ts`：duplicate name 与 unsupported version 场景均有 `assert.rejects` + `CoreError` code 断言。
- 确认 `conflict-resolver.test.ts` 未删改 schema abort case。

Review Checklist:

- [ ] duplicate `metadata.name` via `createEditor` 有集成覆盖。
- [ ] unsupported `manifestVersion` 有覆盖（新文件或 orchestration test）。
- [ ] `conflict-resolver.test.ts` schema abort 保持绿、未删。
- [ ] 未实现 compile-layer schema merge。
- [ ] 未改 `conflict-resolver.ts` 生产语义。
- [ ] 合并测试时 Deviation 有记录。

Rollback Notes:

- 删除 `startup-abort.integration.test.ts`；恢复 `editor-orchestration.test.ts` 至合并前（若搬迁）。

Version Impact:

- none（仅测试）；**无** public API 变更

Commit Scope:

- `test(core): add createEditor startup abort integration tests`

Status:

- done

Run Log:

- 2026-07-05: Added `packages/core/src/editor/startup-abort.integration.test.ts` with two `createEditor` integration cases for duplicate `metadata.name` → `CoreError` / `PLUGIN_NAME_DUPLICATE` (including pre-lifecycle abort assertion). Confirmed unsupported `manifestVersion` already covered in `editor-orchestration.test.ts` (`MANIFEST_VERSION_UNSUPPORTED`). Left `conflict-resolver.test.ts` unchanged.
- Validation: `pnpm --filter @aether-md/core test -- --test-name-pattern="startup-abort|createEditor orchestration|createDefaultConflictResolver"` → 22 pass, 0 fail (includes startup-abort 2, orchestration 10, conflict-resolver 2).

Deviation:

- Unsupported `manifestVersion` case not duplicated in new file; existing coverage retained in `editor-orchestration.test.ts` (`rejects unsupported manifest version with CoreError`). Cross-reference comment added at bottom of `startup-abort.integration.test.ts`.
