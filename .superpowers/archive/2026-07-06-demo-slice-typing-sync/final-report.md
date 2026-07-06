# Final Report: demo-slice-typing-sync (Spec Change)

## Change

- **Path:** Spec Change
- **OpenSpec change:** `demo-slice-typing-sync`
- **Archive path:** `openspec/changes/archive/2026-07-06-demo-slice-typing-sync/`
- **Branch:** `feat/demo-slice-typing-sync`
- **Final status:** completed
- **Version impact:** none

## Source Docs

- `docs/engineering/demo-slice-delivery-program.md`
- `openspec/changes/archive/2026-07-06-demo-slice-react-basic-pr0/baseline-record.md`
- `openspec/specs/validation-suite/spec.md`
- `openspec/specs/react-shell/spec.md`

## Specs Updated

- `openspec/specs/validation-suite/spec.md` — ProseMirror user input path vs dispatch path; browser sign-off documented (non-CI gate)

## Task Completed

| Task | Status | Validation | Deviation |
| --- | --- | --- | --- |
| `01-implement-pm-typing-sync` | completed | PASS (see `validation.md`) | List index in `text` + `children`; mark assertion structural only |

## Files Changed

| File | Task / Reason |
| --- | --- |
| `packages/react/src/demo-slice-typing-sync.integration.test.tsx` | PM `insertText` CI acceptance |
| `packages/react/src/aether-editor-content.tsx` | Dual-field dispatch payload for list sync |
| `packages/plugins/plugin-prosemirror/src/view-bridge.ts` | List item resolution + test helpers |
| `packages/plugins/plugin-prosemirror/src/engine.ts` | List item paragraph replace |
| `packages/plugins/plugin-prosemirror/src/*.test.ts`, `index.ts` | Unit coverage + exports |
| `openspec/specs/validation-suite/spec.md` | Main spec sync |
| `openspec/changes/archive/.../baseline-record.md` | Typing scenario CI pass |
| `docs/engineering/demo-slice-delivery-program.md` | Progress log |
| `examples/react-basic/README.md` | Browser sign-off checklist |

## Validation Results

- `pnpm --filter @aether-md/plugin-prosemirror test` — 25/25 pass
- `pnpm --filter @aether-md/react test` — 23/23 pass
- `pnpm check` — 21/21 tasks pass
- Browser `pnpm dev` smoke — **未做** (non-blocking; documented in README)

## Deviations

1. List `listItemIndex` encoded as numeric string in `ReplaceTextCommand.text` with `children` (no `adapter-types` / `engine-dispatch` change).
2. Mark regression tests assert structural stability, not exact non-inclusive mark placement.
3. Test helpers exported from `@aether-md/plugin-prosemirror` for integration tests.

## Docs / Spec / ADR Updates

- `validation-suite` main spec synced
- `baseline-record.md` typing gaps closed for CI
- `demo-slice-delivery-program.md` progress updated on archive
- No ADR changes

## Remaining Follow-ups

1. **Maintainer browser sign-off** — `pnpm --filter @aether-md/example-react-basic dev` per README before M7 demo claim.
2. **Next backlog slice** — History / Selection / Clipboard (independent Spec or Full Change per scope).
3. Optional: formal `listItemIndex` on `ReplaceTextCommand` if list sync expands (Full Change).

## Spec Change Notes

- Plan file: not used
- Task loop: not used
- `change-brief.md` preserved in OpenSpec archive
- Superpowers retention: `tasks/`, `validation.md`, `review.md` under `.superpowers/archive/2026-07-06-demo-slice-typing-sync/`
