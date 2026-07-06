# Final Report: serializer-mdast-convergence (Spec Change)

## Change

- Path: Spec Change
- OpenSpec change: `serializer-mdast-convergence`
- Archive path: `openspec/changes/archive/2026-07-06-serializer-mdast-convergence/`
- Final status: Archived
- Version impact: None

## Source Docs

- `docs/architecture/architecture-optimization-principles.md` (Phase 1)
- `docs/adr/003-remark-prosemirror-dual-track.md`
- `docs/engineering/adapter-protocol.md`

## Specs Updated

- `openspec/specs/adapter-base/spec.md` — MDAST serializer pipeline scenarios

## Task Completed

| Task | Status | Validation | Deviation |
| --- | --- | --- | --- |
| 01-implement-mdast-serializer-convergence | Complete | `pnpm check` green | CustomBlock uses MDAST `html` node for placeholder |

## Files Changed

| File | Reason |
| --- | --- |
| `packages/plugins/plugin-remark/src/mdast-mapping.ts` | Shared bidirectional MDAST mapping + stringify |
| `packages/plugins/plugin-remark/src/parser.ts` | Use shared mapping |
| `packages/plugins/plugin-remark/src/serializer.ts` | MDAST stringifier pipeline |
| `packages/plugins/plugin-remark/src/index.ts` | Export mapping helpers |
| `packages/plugins/plugin-remark/package.json` | `remark-stringify` dependency |
| `packages/preset-gfm/src/gfm-inline-morphing.ts` | Re-export from plugin-remark |
| `pnpm-lock.yaml` | Lockfile update |
| `openspec/specs/adapter-base/spec.md` | Main spec sync |

## Validation Results

- `pnpm --filter @aether-md/plugin-remark test`: 21 pass
- `pnpm --filter @aether-md/preset-gfm test`: pass
- `pnpm check`: 24 tasks green

## Deviations

- `CustomBlock` serializes via MDAST `html` node to preserve `[unsupported:block:name]` without bracket escaping.

## Docs / Spec / ADR Updates

- Main spec `adapter-base` synced; no ADR change.

## Remaining Follow-ups

- Phase 2: Preset block source/render strategies
- Phase 3: Block source preservation metadata

## Spec Change Notes

- Plan file: not required
- Task loop: not used
- change-brief.md preserved in archive
