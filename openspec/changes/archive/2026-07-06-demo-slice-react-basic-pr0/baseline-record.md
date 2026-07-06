# Baseline record: demo-slice-react-basic-pr0

> Recorded: 2026-07-06  
> Change: `demo-slice-react-basic-pr0`  
> Method: automated `typecheck` + code/test inventory; **browser dev smoke not run in this session** (maintainer MUST confirm `pnpm dev` before PR A merge).

## Automated checks

| Check | Result | Notes |
| --- | --- | --- |
| `pnpm --filter @aether-md/example-react-basic typecheck` | **pass** | G6 gate green |
| `openspec validate demo-slice-react-basic-pr0` | **skipped** | CLI did not register active change in this environment |

## Delta scenario mapping

| Scenario | Status | Evidence / gap |
| --- | --- | --- |
| Maintainer can start browser demo | **pass** | `pnpm dev` documented; manual browser walk recommended |
| Continuous plain paragraphs | **gap (browser)** | CI passes via `dispatch` only; **keyboard typing** in `AetherEditorContent` not verified in CI |
| Frozen GFM subset (heading, strong, list, link) | **gap (browser)** | Initial fixture renders; **in-editor typing** in list/link blocks not synced (`view-bridge` + `engine` limit to paragraph/heading) |
| GateLock on parent rerender | **partial** | CI covers controlled Shell; browser UX may still diverge from PM local state |
| PR A excludes deferred chrome | **pass** | Boundary frozen in change-brief and delta; no implementation in this change |
| PR A allowed surface bounded | **pass** | Documented in change-brief; no `packages/**` changes in PR0 |

## Code inventory (PR A starting point)

- `examples/react-basic/src/App.tsx`: controlled `value`/`onChange`, GateLock demo button, `MarkdownPreview` via `useAetherEditor().markdown`
- `packages/react/src/gfm-react-smoke.test.tsx`: dispatch-based edit path for paragraph; render fixtures for strong, list
- `packages/react/src/gate-lock.integration.test.tsx`: GateLock CI coverage

## PR A implied work (from gaps)

1. ~~Browser smoke~~ — **deferred to follow-up change `demo-slice-typing-sync`**
2. **List / list_item typing** — `view-bridge` ignores non-paragraph/heading blocks; `engine.replaceText` same
3. **User typing path** — CI uses `dispatch`; real ProseMirror `insertText` in mounted Shell not in acceptance test
4. Follow-up Spec Change: view-bridge + engine sync + PM input integration tests

## Maintainer sign-off

- [x] CI acceptance tests pass (`demo-slice-pr0-acceptance`)
- [ ] **Browser editing meets PR0 intent** — **not yet**; merge program PR; fix in next slice
- [x] PR A boundary accepted as frozen in `change-brief.md`
