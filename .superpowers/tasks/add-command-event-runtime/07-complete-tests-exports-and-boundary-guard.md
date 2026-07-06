# Task 07: 补齐 tests、exports 与 package boundary guard

Change:

- `add-command-event-runtime`

Spec Requirement:

- `M2 package boundary excludes later milestones`
- `core-bootstrap` MODIFIED package surface scenarios
- OpenSpec tasks §6：M1 follow-ups remain out of scope（记录 only）
- 覆盖 `command-event-runtime` 全部 ADDED requirements 的最终验证矩阵

Source Docs:

- `.superpowers/plans/add-command-event-runtime.md`
- `openspec/changes/add-command-event-runtime/tasks.md`
- `openspec/changes/add-command-event-runtime/specs/command-event-runtime/spec.md`
- `openspec/changes/add-command-event-runtime/specs/core-bootstrap/spec.md`
- `docs/engineering/test-strategy.md`

## 目标

补齐契约测试与 package boundary guard，跑通全量验证，并确认 M1 follow-up 未混入本 change。

## 范围

- 补齐遗漏的 contract/unit tests（对照 Validation Matrix）。
- 强化 `package-boundary.test.ts`：
  - **允许：** `createCommandEventRuntime`
  - **禁止导出：** `createEditor`、`parseMarkdown`、`serializeMarkdown`、`getMarkdown`、`getDocument`、Adapter 工厂、React/Remark/ProseMirror/GFM 相关 export
- 运行 scope guard `rg`。
- 运行 `pnpm check`（或等价 core build/typecheck/test）。
- 在 Run Log 记录：未实现 duplicate `metadata.name`、partial startup cleanup、`bootstrapCore` dispose public contract。
- **不**新增 runtime 功能，除非测试暴露明确缺口且仍在 OpenSpec 内。

Allowed Files:

- `packages/core/src/**/*.test.ts`
- `packages/core/src/index.ts`（仅 export 微调）
- `packages/core/src/command-event-runtime.ts`（仅修复测试暴露的 spec 缺口）
- `packages/core/src/command-event-types.ts` / `errors.ts`（仅缺口修复）
- `.superpowers/runs/add-command-event-runtime/validation.md`（可选，记录验证草稿）

Forbidden Files:

- `packages/core/src/bootstrap.ts`（禁止借机做 M1 follow-up）
- 新建 `packages/react/**`、`packages/preset-gfm/**`、`packages/plugin-*`
- `docs/**`、`openspec/**`（本任务不改长期 docs/spec）
- `AGENTS.md` 及其他无关脏文件

## TDD 入口

1. 列出 Validation Matrix 中尚未覆盖的 scenario，为每个缺口写失败测试。
2. 若 boundary guard 未禁止全部后续里程碑 export 名，先写失败断言。
3. 运行 `pnpm --filter @aether-md/core test` → 对缺口 FAIL → 最小修复 → PASS。
4. 若无缺口，以全绿 `pnpm check` + `rg` guard 作为验证入口，并在 Deviation 写明「无新增失败测试，因 Task 01–06 已覆盖」。

TDD Notes:

- 优先补测试，不借机扩 scope。
- 任何 runtime 修改必须映射到已有 OpenSpec requirement。

## 实现步骤

1. 对照 specs 检查：types、factory、Event Hub、register/dispatch、`CommandResult`、error isolation、dispose、boundary、M1 follow-up out-of-scope。
2. 补齐缺失 tests。
3. 强化 package boundary 与 `rg` guard。
4. 运行全量验证命令。
5. 在 Run Log 写明 M1 follow-up 三项仍为 deferred。
6. 确认未暂存 `AGENTS.md`。

Implementation Notes:

- Package boundary guard 六项：禁止 Adapter、React、Remark、ProseMirror、GFM、Markdown parse/serialize。
- 不把事务回滚、Markdown round-trip、Permission 路径加入本 change 验收。

## 验证命令

```bash
pnpm --filter @aether-md/core test
pnpm --filter @aether-md/core exec tsc --noEmit
pnpm --filter @aether-md/core build
pnpm check
rg -i "react|prosemirror|remark|gfm|createEditor|parseMarkdown|serializeMarkdown|getMarkdown|getDocument|Adapter" packages/core/src packages/core/package.json
```

预期：全部通过；`rg` 无后续里程碑实现命中（测试中禁止导出名字符串除外）。

Intuitive Verification:

- 人工扫一眼 `packages/core/src/index.ts` export 列表，确认无后续里程碑符号。

Review Checklist:

- [x] 全部 `command-event-runtime` requirements 有测试或明确验证记录。
- [x] package boundary 允许 M2、禁止六类后续里程碑。
- [x] `pnpm check` 通过。
- [x] M1 follow-up 三项未实现且已记录。
- [x] 未修改 `bootstrapCore` public contract。
- [x] 无关文件未纳入变更。

## 回滚提示

Rollback Notes:

- 回滚本任务新增/修改的测试与边界断言。
- 若为修缺口改了 runtime，仅回滚缺口修复提交，不回滚 Task 01–06 主行为（除非无法分离）。

Version Impact:

- none（除非为修 export 微调 public surface，记入 Run Log）

Commit Scope:

- `test(core): complete command-event contract and boundary guards`

Status:

- completed

Run Log:

- Task 01–06 已覆盖全部 command-event-runtime scenarios；本任务无新增失败测试（Deviation：无缺口）。
- `pnpm --filter @aether-md/core test` pass（38 tests）。
- `pnpm --filter @aether-md/core exec tsc --noEmit` pass。
- `pnpm --filter @aether-md/core build` pass。
- `pnpm check` pass。
- package boundary 允许 `createCommandEventRuntime` / `PluginError`，禁止 createEditor / Markdown / Adapter / React / Remark / ProseMirror / GFM exports。
- M1 follow-up 仍 deferred：duplicate `metadata.name`、partial startup cleanup、`bootstrapCore` dispose public contract。
- 未修改 `bootstrap.ts`；未暂存 `AGENTS.md`。
- Version impact：none（本任务仅验证）。

Deviation:

- 无新增失败测试：Task 01–06 已覆盖 Validation Matrix；以全绿 `pnpm check` 与 boundary guard 作为验证入口。
