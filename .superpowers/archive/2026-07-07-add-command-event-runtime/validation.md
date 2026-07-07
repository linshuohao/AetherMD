# Validation Record: add-command-event-runtime

## Scope

- Change: `add-command-event-runtime`
- Tasks: `01`–`07`（全部 completed）
- Requirement: `command-event-runtime` ADDED + `core-bootstrap` MODIFIED package boundary
- Version impact: `@aether-md/core` public exports 增量（types、`PluginError`、`createCommandEventRuntime`）；不改 `manifestVersion` / lockfiles

## Commands

| Command                                                                                                             | Purpose                | Result | Notes                                |
| ------------------------------------------------------------------------------------------------------------------- | ---------------------- | ------ | ------------------------------------ |
| `pnpm --filter @aether-md/core test`                                                                                | unit/contract tests    | pass   | 38 tests                             |
| `pnpm --filter @aether-md/core exec tsc --noEmit`                                                                   | typecheck              | pass   | per-task                             |
| `pnpm --filter @aether-md/core build`                                                                               | build                  | pass   | Task 07                              |
| `pnpm check`                                                                                                        | full workspace check   | pass   | Task 07 / post-loop                  |
| `rg -i "react\|prosemirror\|remark\|gfm\|createEditor\|parseMarkdown\|serializeMarkdown\|getMarkdown\|getDocument"` | package boundary guard | pass   | 仅 boundary 测试禁止导出名字符串命中 |

## TDD Integrity

| Task | Red signal                                                  | Green result                                  |
| ---- | ----------------------------------------------------------- | --------------------------------------------- |
| 01   | missing `createCommandEventRuntime` / `PluginError` exports | types + factory stub + boundary tests         |
| 02   | Event Hub delivery / unsubscribe / JSON payload fail        | `on` / `emit` / `Unsubscribe`                 |
| 03   | handler not invoked                                         | registry `Map`                                |
| 04   | CommandResult mapping fail                                  | success / `false` / unknown / ignore priority |
| 05   | throw escapes / no pluginError                              | PluginError + emit                            |
| 06   | dispose still accepts dispatch/emit                         | disposed fail-closed                          |
| 07   | no new red (matrix covered)                                 | `pnpm check` + guard                          |

## Intuitive Verification

- Method: 人工确认 `index.ts` export 列表无后续里程碑符号
- Result: pass
- Notes: 无 demo script

## Changed-file Check

Implementation files（按 task 归属）：

| Task  | Files                                                                                                                                                       |
| ----- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 01    | `command-event-types.ts`, `errors.ts`, `command-event-runtime.ts` (stub), `index.ts`, `package-boundary.test.ts`, `command-event-runtime.test.ts` (surface) |
| 02–06 | `command-event-runtime.ts`, `command-event-runtime.test.ts`                                                                                                 |
| 07    | validation record only（无 runtime 缺口修复）                                                                                                               |

- Boundary result: 未修改 `bootstrap.ts`；未引入 Adapter/React/Remark/ProseMirror/GFM/Markdown
- Unrelated files: `AGENTS.md` 仍为无关脏文件，未纳入本 change 实现

## Failures And Deviations

- Task 07 Deviation：无新增失败测试，因 Task 01–06 已覆盖 Validation Matrix。
- M1 follow-ups（duplicate `metadata.name`、partial startup cleanup、`bootstrapCore` dispose public contract）明确未实现，仍为后续 change。

## Ready for compliance review

- Yes：全部 tasks completed，`pnpm check` pass，无阻塞 deviation。
