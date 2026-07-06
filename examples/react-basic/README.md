# @aether-md/example-react-basic

Workspace-private Vite + React demo for `@aether-md/react` with GFM preset wiring and GateLock controlled `value` / `onChange`.

## PR A acceptance checklist (frozen in PR0)

North star and boundaries: [Demo Slice 交付计划](../../docs/engineering/demo-slice-delivery-program.md) · [PR0 baseline record (archived)](../../openspec/changes/archive/2026-07-06-demo-slice-react-basic-pr0/baseline-record.md).

After `pnpm install` and `pnpm build` at repo root:

1. `pnpm --filter @aether-md/example-react-basic dev` — editor loads in browser
2. Continuous plain paragraph typing — no reset or bounce
3. Edit GFM subset in session: heading, **bold**, list, link (at least one each)
4. Markdown preview (`data-testid="markdown-preview"`) reflects edits
5. **Force parent rerender** — document must not reset when `value` unchanged

Out of scope for PR A: History, Selection, Clipboard, full toolbar, publish, workflow main-spec changes.

## Maintainer browser sign-off (`demo-slice-typing-sync`)

CI covers ProseMirror `insertText` and programmatic `dispatch` paths. Before M7 demo sign-off, confirm in a real browser:

1. `pnpm --filter @aether-md/example-react-basic dev`
2. Type continuously in a plain paragraph — preview tracks each keystroke without GateLock reset
3. Edit the heading text — preview shows updated title
4. Type inside a list item — preview updates the list item text
5. Type adjacent to **bold** and a link — marks remain structurally valid in preview
6. Click **Force parent rerender** (if shown) — edited content is preserved when `value` is unchanged
7. Record any remaining browser-only gaps in [baseline-record.md](../../openspec/changes/archive/2026-07-06-demo-slice-react-basic-pr0/baseline-record.md)

## Scripts

- `pnpm dev` — local Vite dev server
- `pnpm typecheck` — `tsc --noEmit` (G6 CI gate)
- `pnpm build:app` — optional Vite production build (not in `pnpm check`)

## Not published

This package is `private: true` and excluded from the npm release matrix.
