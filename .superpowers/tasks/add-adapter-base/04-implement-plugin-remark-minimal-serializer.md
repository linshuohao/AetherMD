# Task 04: 实现 plugin-remark 最小 SerializerAdapter

Change:

- `add-adapter-base`

Spec Requirement:

- `Remark plugin package provides Parser and Serializer adapters`（本 task 仅 **Serializer** 路径）
- `Remark serializer produces deterministic Markdown for M3 subset`

Source Docs:

- `.superpowers/plans/add-adapter-base.md`
- `openspec/changes/add-adapter-base/specs/adapter-base/spec.md`
- `docs/engineering/adapter-protocol.md`
- `docs/engineering/error-model.md`

## 目标

在 `@aether-md/plugin-remark` 实现 `SerializerAdapter.serialize`，对 M3 `AetherDoc` 子集（paragraph、heading）产出**确定性** Markdown；Serializer 失败路径使用 `SerializationError` 形状（若本 task 触发）。

## 范围

- 实现 `SerializerAdapter` factory 与 `serialize(doc, schema)`。
- 新增 serializer contract tests：
  - paragraph-only `AetherDoc` → 稳定 Markdown 字符串。
  - heading + paragraph `AetherDoc` → 稳定 Markdown（如 `## Title\n\nBody\n` 等价形式）。
  - 同输入多次 serialize 结果一致（确定性）。
- **不**扩展 M4 GFM 语法（list/link/mark）。
- **不**建立 `plugin-prosemirror` 或 round-trip（Task 05–06）。

Allowed Files:

- `packages/plugins/plugin-remark/src/**`（serializer 实现与 tests）
- `packages/plugins/plugin-remark/package.json`（仅 export 微调）
- `pnpm-lock.yaml`（仅 serializer 相关依赖变更）

Forbidden Files:

- `packages/core/src/**`
- `packages/plugins/plugin-prosemirror/**`
- `packages/react/**`、`packages/preset-gfm/**`
- `docs/**`、`openspec/**`
- `AGENTS.md` 及其他无关脏文件

## TDD 入口

1. 在 `serializer.test.ts` 写失败测试：构造 paragraph `AetherDoc`，`serialize(doc, { version: 1 })` 返回预期 Markdown。
2. 失败测试：heading + paragraph doc → 确定性 Markdown。
3. 失败测试：同一 doc 连续 serialize 两次，输出字符串相等。
4. 运行 `pnpm --filter @aether-md/plugin-remark test` → FAIL → 实现 → PASS。

TDD Notes:

- red-green：serializer tests 独立于 parser；可使用 hand-built `AetherDoc` fixture。
- 可选：parser → serialize 烟雾测试，但 **不**替代 Task 06 round-trip。

Implementation Notes:

- 对齐 `adapter-protocol.md`：内置结构稳定输出；M3 不要求 `[unsupported:block]` 占位符（留 M4）。
- 保持 Task 03 parser tests 仍绿。

## 验证命令

```bash
pnpm --filter @aether-md/plugin-remark test
pnpm --filter @aether-md/plugin-remark exec tsc --noEmit
pnpm --filter @aether-md/plugin-remark build
```

预期：plugin-remark 全 suite 通过（parser + serializer）。

Intuitive Verification:

- 无（确定性断言已在 automated tests 中）。

Review Checklist:

- [ ] `SerializerAdapter.serialize` 对 M3 子集确定性输出。
- [ ] 未扩展 list/link/mark round-trip。
- [ ] Task 03 parser tests 仍通过。
- [ ] Core 仍无 remark 依赖。

Rollback Notes:

- 回滚 serializer 源文件与 tests；保留 Task 03 parser 产物。

Version Impact:

- `@aether-md/plugin-remark` public exports 可能增量（serializer factory）；lockfile 可能微调；Core 不变。

Commit Scope:

- `feat(plugin-remark): add minimal SerializerAdapter`

Status:

- complete

Run Log:

- 2026-07-05: serializer.test.ts red→green; plugin-remark full suite 7/7 PASS.

Deviation:

- none
