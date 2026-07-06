# Baseline record: demo-slice-react-basic-pr0

> Recorded: 2026-07-06  
> Change: `demo-slice-react-basic-pr0`  
> Method: automated `typecheck` + code/test inventory; **browser dev smoke not run in this session** (maintainer MUST confirm `pnpm dev` before PR A merge).

## Automated checks

| Check                                                    | Result      | Notes                                                  |
| -------------------------------------------------------- | ----------- | ------------------------------------------------------ |
| `pnpm --filter @aether-md/example-react-basic typecheck` | **pass**    | G6 gate green                                          |
| `openspec validate demo-slice-react-basic-pr0`           | **skipped** | CLI did not register active change in this environment |

## Delta scenario mapping

| Scenario                                        | Status        | Evidence / gap                                                                                     |
| ----------------------------------------------- | ------------- | -------------------------------------------------------------------------------------------------- |
| Maintainer can start browser demo               | **pass**      | `pnpm dev` documented; manual browser walk recommended                                             |
| Continuous plain paragraphs                     | **pass (CI)** | `demo-slice-typing-sync.integration.test.tsx` — ProseMirror `insertText`                           |
| Frozen GFM subset (heading, strong, list, link) | **pass (CI)** | Typing tests cover heading, list item, strong/link mark stability; browser sign-off still required |
| GateLock on parent rerender                     | **pass (CI)** | `demo-slice-pr0-acceptance` + GateLock integration tests                                           |
| PR A excludes deferred chrome                   | **pass**      | Boundary frozen in change-brief and delta; no implementation in this change                        |
| PR A allowed surface bounded                    | **pass**      | Documented in change-brief; no `packages/**` changes in PR0                                        |

## Code inventory (PR A starting point)

- `examples/react-basic/src/App.tsx`: controlled `value`/`onChange`, GateLock demo button, `MarkdownPreview` via `useAetherEditor().markdown`
- `packages/react/src/gfm-react-smoke.test.tsx`: dispatch-based edit path for paragraph; render fixtures for strong, list
- `packages/react/src/gate-lock.integration.test.tsx`: GateLock CI coverage

## PR A implied work (from gaps)

1. ~~Browser smoke~~ — **deferred to follow-up change `demo-slice-typing-sync`**
2. ~~**List / list_item typing**~~ — **addressed in `demo-slice-typing-sync`** (`view-bridge` list item index + `engine` list replace)
3. ~~**User typing path**~~ — **addressed in `demo-slice-typing-sync`** (`demo-slice-typing-sync.integration.test.tsx`)
4. Follow-up Spec Change: view-bridge + engine sync + PM input integration tests — **complete (`demo-slice-typing-sync`)**

## Maintainer sign-off

- [x] CI acceptance tests pass (`demo-slice-pr0-acceptance`)
- [ ] **Browser editing meets PR0 intent** — CI typing path green; **maintainer MUST confirm** `pnpm dev` per `examples/react-basic/README.md` before M7 demo sign-off
- [x] PR A boundary accepted as frozen in `change-brief.md`
