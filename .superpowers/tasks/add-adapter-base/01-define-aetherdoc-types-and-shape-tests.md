# Task 01: 定义 AetherDoc / AetherSchema public types 与形状测试

Change:

- `add-adapter-base`

Spec Requirement:

- `AetherDoc public types are exported from core`
- `Minimal AetherSchema type is exported`
- `Extended document types are exported without M3 round-trip coverage`（类型 export smoke；不要求 adapter round-trip）

Source Docs:

- `.superpowers/plans/add-adapter-base.md`
- `openspec/changes/add-adapter-base/design.md`
- `openspec/changes/add-adapter-base/specs/document-model/spec.md`
- `docs/architecture/document-model.md`
- `docs/glossary.md`

## 目标

在 `@aether-md/core` 导出 M3 最小 `AetherDoc` / block / inline / `AetherSchema` 类型，并用 contract tests 验证 JSON 可序列化与 M3 占位 schema。

## 范围

- 新增 `document-model.ts`：`AetherDoc`、`ParagraphBlock`、`HeadingBlock`（level 1–6 类型面）、`TextInline`、`AetherSchema`（`version: 1`）。
- **MAY** 导出 `ListBlock`、`LinkInline`、`MarkedInline`、`CustomBlock` 等扩展类型；本 task **不**要求 adapter round-trip。
- 从 `index.ts` 导出上述 types。
- **不**实现 Adapter 协议、Remark/ProseMirror、package-boundary 更新（Task 02）。

Allowed Files:

- `packages/core/src/document-model.ts`
- `packages/core/src/document-model.test.ts`
- `packages/core/src/index.ts`（仅 document-model exports）

Forbidden Files:

- `packages/core/src/adapter-types.ts`
- `packages/core/src/errors.ts`（除只读参考，不修改 Adapter 错误）
- `packages/core/src/package-boundary.test.ts`
- `packages/plugins/**`
- `packages/react/**`、`packages/preset-gfm/**`
- `docs/**`、`openspec/**`
- `AGENTS.md` 及其他无关脏文件

## TDD 入口

1. 在 `document-model.test.ts` 写失败测试：从 `@aether-md/core`（或 package entry）导入 `AetherDoc`、`ParagraphBlock`、`HeadingBlock`、`TextInline`、`AetherSchema`。
2. 失败测试：构造样例 `AetherDoc`，`JSON.stringify` 成功且不包含 function。
3. 失败测试：`AetherSchema` 接受 `{ version: 1 }`。
4. 运行 `pnpm --filter @aether-md/core test` → 预期 FAIL（缺少 types / exports）。
5. 实现 `document-model.ts` + exports → PASS。

TDD Notes:

- red-green：先失败 import/shape 测试，再最小类型定义。
- 本 task 不涉及 Remark/ProseMirror 或 Adapter 接口。

Implementation Notes:

- 对齐 `docs/architecture/document-model.md` v1.0 内置块命名；M3 测试矩阵仅 paragraph/heading/text。
- `AetherSchema` M3 仅 `{ version: 1 }`，不做 compile-layer merge。
- 注释仅用于非 obvious 边界（如扩展类型 M3 不测 round-trip）。

## 验证命令

```bash
pnpm --filter @aether-md/core test
pnpm --filter @aether-md/core exec tsc --noEmit
rg -i "remark|prosemirror|react|vue|gfm" packages/core/package.json packages/core/src
```

预期：core tests / typecheck 通过；Core 无 remark/prosemirror/react 依赖或 import。

Intuitive Verification:

- 无（以自动化 shape / export 测试为准）。

Review Checklist:

- [ ] `AetherDoc` / M3 block-inline types / `AetherSchema` 已从 `@aether-md/core` 导出。
- [ ] 样例文档可 `JSON.stringify`，无引擎私有类型。
- [ ] 未引入 Adapter 协议或 plugin package。
- [ ] 未修改 `package-boundary.test.ts`。
- [ ] Core `package.json` 无新增重型依赖。

Rollback Notes:

- 删除 `document-model.ts`、`document-model.test.ts`。
- 恢复 `index.ts` 中本 task 新增的 exports。

Version Impact:

- `@aether-md/core` public exports 增量（document-model types）；不改 `manifestVersion` / lockfiles。

Commit Scope:

- `feat(core): add AetherDoc and AetherSchema public types`

Status:

- complete

Run Log:

- 2026-07-05: Task loop started on branch `feat/add-adapter-base`; TDD red phase — added `document-model.test.ts` failing imports.
- 2026-07-05: Implemented `document-model.ts` + index exports; `pnpm --filter @aether-md/core test` PASS (41/41); typecheck PASS; rg guard PASS.

Deviation:

- none
