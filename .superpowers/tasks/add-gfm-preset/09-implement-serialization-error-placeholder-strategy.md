# Task 09: 实现 SerializationError 与 CustomBlock 占位符策略

Change:

- `add-gfm-preset`

Branch:

- `feat/add-gfm-preset`

Spec Requirement:

- `adapter-base` / ADDED `SerializationError and placeholder strategy is implemented for Serializer paths`
- `document-model` / ADDED `CustomBlock remains outside M4 GFM round-trip matrix`（占位符 serialize，非 structured round-trip）

OpenSpec Tasks:

- `openspec/changes/add-gfm-preset/tasks.md` §2.3、§2.5

Source Docs:

- `.superpowers/plans/add-gfm-preset.md`
- `openspec/changes/add-gfm-preset/specs/adapter-base/spec.md`
- `docs/engineering/error-model.md`
- `docs/engineering/adapter-protocol.md`

## 目标

在 `@aether-md/plugin-remark` Serializer 实现 deferred failure strategy：`CustomBlock` → `[unsupported:block:<name>]\n`（不 throw）；unsupported node → reject `SerializationError`（`code: 'UNSUPPORTED_NODE'`, `source: 'serialization'`, `severity: 'degraded'`）；GFM 六类 + M3 成功路径不受影响。

## 范围

- 先写 failing tests（若 Task 03 未含），再实现 `serializer.ts` 分支。
- `serializer.test.ts`：
  - `CustomBlock` with `name: 'diagram'` → `[unsupported:block:diagram]\n`。
  - unsupported block/inline type → Promise rejected with `SerializationError` shape。
  - GFM 六类 + paragraph/heading 仍 resolve 确定性 Markdown。
- 使用 `@aether-md/core` 已有 `SerializationError` class（不重新定义）。
- **不**修改 parser；**不**扩展 GFM parse matrix。

Allowed Files:

- `packages/plugins/plugin-remark/src/serializer.ts`
- `packages/plugins/plugin-remark/src/serializer.test.ts`
- `packages/plugins/plugin-remark/src/index.ts`（仅若需 export 调整，通常不需要）

Forbidden Files:

- `packages/plugins/plugin-remark/src/parser.ts`
- `packages/core/src/**`（除只读 `SerializationError` import）
- `packages/plugins/plugin-prosemirror/**`
- `packages/preset-gfm/**`
- `docs/**`、`openspec/**`
- `AGENTS.md` 及其他无关脏文件

## TDD 入口

1. 添加 CustomBlock 占位符 failing test → **FAIL**（throw 或 wrong output）。
2. 添加 unsupported node rejection failing test → **FAIL**。
3. 实现 serializer 分支 → `pnpm --filter @aether-md/plugin-remark test` **PASS**（含 Task 04 GFM tests）。

TDD Notes:

- red-green：占位符与 rejection 分场景测试，避免与 GFM 成功路径混淆。
- CustomBlock **不** require structured round-trip（integration matrix 仍不含 CustomBlock）。

Validation:

```bash
pnpm --filter @aether-md/plugin-remark test
pnpm --filter @aether-md/plugin-prosemirror test
pnpm --filter @aether-md/preset-gfm test
```

预期：remark serializer tests **PASS**；GFM integration（Task 08）仍 **PASS**；无 CustomBlock 在 GFM matrix。

Intuitive Verification:

- 对比 `serialize(customBlockDoc)` resolve 值与 `serialize(unsupportedDoc)` rejection 类型。

Review Checklist:

- [ ] CustomBlock 占位符不 throw。
- [ ] unsupported node reject `SerializationError` with required fields。
- [ ] GFM + M3 serialize 路径不退化。
- [ ] 未修改 Core error class 定义。

Rollback Notes:

- 回滚 `serializer.ts` 与本 task 新增 tests。

Version Impact:

- `@aether-md/plugin-remark`：behavior extension（error/placeholder paths）；使用已有 `SerializationError` public type
- Core / `manifestVersion`：**不变**

Commit Scope:

- `feat(plugin-remark): implement SerializationError and CustomBlock placeholder strategy`

Status:

- complete

Run Log:

- 2026-07-05: Task started; adding SerializationError and CustomBlock placeholder tests.
- 2026-07-05: Implemented placeholder and UNSUPPORTED_NODE rejection in serializer.ts.
- 2026-07-05: Validation — remark 21/21 pass; preset 12/12 pass.

Deviation:

- none
