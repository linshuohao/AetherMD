# Validation: block-morphing-slice-c

## Commands

| Command                                                     | Result                |
| ----------------------------------------------------------- | --------------------- |
| `openspec validate block-morphing-slice-c --strict`         | ✅ pass               |
| `pnpm check`                                                | ✅ pass (24/24 tasks) |
| `pnpm --filter @aether-md/react test`                       | ✅ 30/30 tests        |
| `pnpm --filter @aether-md/example-block-morphing typecheck` | ✅ pass               |

## Scenario coverage

| Scenario                      | Test                                                                                    |
| ----------------------------- | --------------------------------------------------------------------------------------- |
| A — focus shows source        | `scenario A: focused block shows Markdown source with ** sigils`                        |
| B — blur shows rendered       | `scenario B: blurred block shows rendered typography and consistent serialization`      |
| C — only focused block source | `scenario C: only focused block B is in source state`                                   |
| Focus switch A→B              | `focus switch: block A returns to rendered when block B is focused`                     |
| Edit B does not reset A       | `editing block B does not reset block A content`                                        |
| Zero remount (A + C)          | `does not remount editor on consecutive edits or parent rerender` + multi-block variant |

## Notes

- Rendered MVP uses `renderParagraphInline(paragraphSourceFromBlock(block))` for textarea-edited plain text with `**` sigils.
- No Core API changes; no M7 publish actions.
